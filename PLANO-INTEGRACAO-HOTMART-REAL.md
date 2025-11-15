# 📋 Plano de Integração Real com Hotmart Webhook

## 🎯 Objetivo
Implementar integração real com webhooks do Hotmart para gerenciar assinaturas automaticamente quando clientes compram, renovam, cancelam ou expiram planos.

---

## 📊 Status da Estrutura Atual

### ✅ **JÁ IMPLEMENTADO (Mockado)**

1. **Endpoint Webhook:** `/api/webhooks/hotmart`
   - ✅ Rota POST para receber webhooks
   - ✅ Rota GET para testes (mockado)
   - ❌ Validação HMAC ainda mockada (sempre retorna `true`)

2. **Serviço de Webhook:** `HotmartWebhookService`
   - ✅ Processamento de todos os eventos de assinatura
   - ✅ Mapeamento de planos por código Hotmart
   - ✅ Atualização de usuários e assinaturas
   - ❌ Validação HMAC mockada

3. **Estrutura de Dados:**
   - ✅ Collection `assinaturas` com `hotmartSubscriptionId`
   - ✅ Collection `planos` com `codigoHotmart`
   - ✅ User com campos de plano e assinatura
   - ✅ Validação de email para vincular usuário

4. **Repositórios:**
   - ✅ `PlanoRepository.findByCodigoHotmart()`
   - ✅ `UserRepository.findByEmail()`
   - ✅ `AssinaturaRepository.findByHotmartId()`

---

## 🔧 O QUE PRECISA SER IMPLEMENTADO

### **FASE 1: Configuração no Hotmart** ⚙️

#### 1.1 **Configurar Webhook no Painel Hotmart**

**Passos no Hotmart:**

1. Acesse: **Painel Hotmart** → **Meus Produtos** → Seu produto de subscription
2. Vá em **Configurações** → **Webhooks** ou **Integrações**
3. Configure o endpoint:
   ```
   URL: https://clicksehub.com/api/webhooks/hotmart
   ```
4. Ative os seguintes eventos:
   - ✅ `SUBSCRIPTION_PURCHASE` - Nova compra de assinatura
   - ✅ `SUBSCRIPTION_ACTIVATED` - Assinatura ativada (após trial)
   - ✅ `SUBSCRIPTION_RENEWED` - Renovação da assinatura
   - ✅ `SUBSCRIPTION_CANCELLED` - Cancelamento da assinatura
   - ✅ `SUBSCRIPTION_EXPIRED` - Expiração da assinatura
   - ✅ `SUBSCRIPTION_SUSPENDED` - Suspensão da assinatura

5. **Copiar Secret Key do Webhook:**
   - Na configuração do webhook, copie a **Secret Key** ou **Token de Segurança**
   - Essa chave será usada para validar a autenticidade dos webhooks

#### 1.2 **Verificar Código do Plano no Hotmart**

1. No Hotmart, vá em **Meus Produtos** → Seu produto subscription
2. Na seção **Detalhes do Plano**, verifique o **Código do Produto** ou **Product Code**
3. **IMPORTANTE:** Confirme que o código no Hotmart corresponde ao `codigoHotmart` no seu banco:
   - Se no Hotmart o código é `BASICO_MENSAL` ou `BASICO_MONTHLY`, certifique-se que no banco está igual
   - Ajuste no seed ou manualmente se necessário

---

### **FASE 2: Configuração no Sistema (Backend)** 🔒

#### 2.1 **Adicionar Variável de Ambiente**

**Arquivo:** `.env.local` (desenvolvimento) e variáveis de ambiente na Vercel (produção)

```env
# Hotmart Webhook Secret Key
HOTMART_WEBHOOK_SECRET=seu_secret_key_aqui

# Modo de validação (development sempre false para testes)
HOTMART_VALIDATE_HMAC=true
```

#### 2.2 **Implementar Validação HMAC Real**

**Arquivo:** `src/lib/services/hotmart-webhook-service.ts`

```typescript
import crypto from 'crypto';

validarAssinatura(payload: any, signature: string, secret: string): boolean {
  try {
    // Converter payload para string JSON (ordem de chaves preservada)
    const payloadString = JSON.stringify(payload);
    
    // Criar HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadString);
    const expectedSignature = hmac.digest('hex');
    
    // Comparar assinaturas (comparação segura contra timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Erro ao validar assinatura HMAC:', error);
    return false;
  }
}
```

#### 2.3 **Atualizar Endpoint para Validar HMAC**

**Arquivo:** `src/app/api/webhooks/hotmart/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const service = new HotmartWebhookService();

    // Obter assinatura HMAC do header
    const signature = request.headers.get('x-hotmart-hmac-sha256') || 
                     request.headers.get('hotmart-hmac-sha256') || 
                     '';
    
    // Obter secret da variável de ambiente
    const secret = process.env.HOTMART_WEBHOOK_SECRET || '';
    const validateHmac = process.env.HOTMART_VALIDATE_HMAC !== 'false';

    // Validar HMAC se estiver habilitado
    if (validateHmac && secret) {
      const isValid = service.validarAssinatura(payload, signature, secret);
      
      if (!isValid) {
        console.error('Webhook HMAC inválido:', { signature, hasSecret: !!secret });
        return NextResponse.json(
          { error: 'Assinatura inválida' },
          { status: 401 }
        );
      }
    } else {
      console.warn('⚠️ Validação HMAC desabilitada ou secret não configurado');
    }

    // Processar webhook
    const result = await service.processarWebhook(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
```

---

### **FASE 3: Ajustes no Processamento de Webhook** 🔄

#### 3.1 **Atualizar Interface do Payload Real do Hotmart**

**Arquivo:** `src/lib/services/hotmart-webhook-service.ts`

A estrutura real do webhook do Hotmart pode variar. Ajustar conforme necessário:

```typescript
export interface HotmartWebhookPayload {
  event: string;
  data: {
    subscription?: {
      subscription_code: string;  // Pode ser 'code' ou 'subscription_code'
      plan?: {
        plan_code?: string;       // Pode ser 'code' ou 'plan_code'
        name?: string;
      };
      buyer?: {
        email: string;
        name?: string;
      };
      subscriber?: {               // Alternativa para 'buyer'
        email: string;
        name?: string;
      };
      status: string;              // 'TRIAL', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED'
      trial?: {
        end_date?: string;         // Pode ser 'trial_period_end' ou dentro de 'trial'
      };
      trial_period_end?: string;
      date_next_charge?: string;
      next_charge_date?: string;   // Alternativa
      cancellation_date?: string;
      expiration_date?: string;
    };
  };
}
```

#### 3.2 **Ajustar Processamento para Estrutura Real**

**Arquivo:** `src/lib/services/hotmart-webhook-service.ts`

Atualizar `processarWebhook()` para suportar diferentes formatos:

```typescript
async processarWebhook(payload: any): Promise<{ success: boolean; message: string }> {
  try {
    // Normalizar estrutura do payload (suportar diferentes formatos)
    const subscription = payload.data?.subscription || payload.subscription;
    if (!subscription) {
      return { success: false, message: 'Payload inválido: subscription não encontrado' };
    }

    // Extrair dados normalizados
    const hotmartSubscriptionId = subscription.subscription_code || subscription.code;
    const codigoPlano = subscription.plan?.plan_code || subscription.plan?.code;
    const email = subscription.buyer?.email || subscription.subscriber?.email;
    const status = subscription.status;

    if (!hotmartSubscriptionId || !codigoPlano || !email) {
      return { 
        success: false, 
        message: `Dados incompletos: subscriptionId=${hotmartSubscriptionId}, plano=${codigoPlano}, email=${email}` 
      };
    }

    // Buscar usuário por email
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      console.warn(`⚠️ Usuário não encontrado para email: ${email}`);
      // TODO: Decidir se deve criar usuário automaticamente ou apenas logar
      return { 
        success: false, 
        message: `Usuário não encontrado: ${email}. Verifique se o email está cadastrado no sistema.` 
      };
    }

    // Buscar plano pelo código Hotmart
    const plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
    if (!plano) {
      console.error(`❌ Plano não encontrado: ${codigoPlano}`);
      return { 
        success: false, 
        message: `Plano não encontrado: ${codigoPlano}. Verifique se o código do plano está correto no banco de dados.` 
      };
    }

    // Processar evento
    switch (payload.event) {
      case 'SUBSCRIPTION_PURCHASE':
        return await this.processarCompra(
          user.id, 
          plano.id, 
          hotmartSubscriptionId, 
          subscription
        );
      
      case 'SUBSCRIPTION_ACTIVATED':
        return await this.processarAtivacao(hotmartSubscriptionId, subscription);
      
      // ... outros eventos
    }
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return { success: false, message: error.message || 'Erro ao processar webhook' };
  }
}
```

---

### **FASE 4: Vincular Cliente Hotmart com Sistema** 🔗

#### 4.1 **Como Funciona a Vinculação**

**Método:** **Email** (recomendado e já implementado)

1. Cliente compra no Hotmart usando um email
2. Hotmart envia webhook com `buyer.email` ou `subscriber.email`
3. Sistema busca usuário no banco pelo email: `UserRepository.findByEmail(email)`
4. Se encontrado, vincula a assinatura ao usuário
5. Se **não encontrado**, retorna erro (ver opções abaixo)

#### 4.2 **Opções se Usuário Não Encontrado**

**Opção A: Retornar Erro (Atual - Recomendado)**
- Cliente deve se cadastrar primeiro no sistema
- Depois compra o plano no Hotmart
- Mais seguro e controlado

**Opção B: Criar Usuário Automaticamente** (Implementar se necessário)
```typescript
if (!user) {
  // Criar usuário automaticamente
  const novoUser = await this.userRepo.create({
    email: email,
    nome: subscription.buyer?.name || subscription.subscriber?.name || 'Novo Cliente',
    role: 'user',
    ativo: true,
    dataCadastro: new Date(),
    dataAtualizacao: new Date()
  });
  user = novoUser;
}
```

#### 4.3 **Garantir Email Único no Cadastro**

**Arquivo:** `src/lib/repositories/user-repository.ts`

Certificar que `findByEmail()` funciona corretamente:

```typescript
async findByEmail(email: string): Promise<User | null> {
  const users = await this.findWhere('email', '==', email.toLowerCase().trim());
  return users.length > 0 ? users[0] : null;
}
```

---

### **FASE 5: Mapeamento de Códigos de Planos** 📝

#### 5.1 **Verificar Códigos no Banco de Dados**

Execute o seed para garantir que os planos estão cadastrados:

```bash
# Via Postman ou curl
POST /api/seed/funcionalidades-planos?reset=true
Headers: x-api-key: dev-seed-key-2024
```

#### 5.2 **Confirmar Código do Plano Básico**

No banco de dados, verifique a collection `planos`:

- ✅ `codigoHotmart: "BASICO_MENSAL"` (ou o código exato do Hotmart)

**IMPORTANTE:** O código no banco DEVE ser EXATAMENTE igual ao código do produto no Hotmart.

#### 5.3 **Testar Mapeamento**

1. No Hotmart, copie o código exato do produto
2. Verifique no banco: `planos` → campo `codigoHotmart`
3. Se diferente, atualize manualmente ou ajuste o seed

---

### **FASE 6: Logs e Monitoramento** 📊

#### 6.1 **Adicionar Logs Detalhados**

**Arquivo:** `src/lib/services/hotmart-webhook-service.ts`

```typescript
async processarWebhook(payload: any): Promise<{ success: boolean; message: string }> {
  const event = payload.event;
  console.log(`📥 Webhook recebido: ${event}`, {
    timestamp: new Date().toISOString(),
    payload: JSON.stringify(payload, null, 2)
  });

  try {
    // ... processamento
    
    console.log(`✅ Webhook processado com sucesso: ${event}`, {
      userId: user.id,
      email: email,
      planoId: plano.id,
      hotmartSubscriptionId
    });

    return { success: true, message: 'Webhook processado com sucesso' };
  } catch (error: any) {
    console.error(`❌ Erro ao processar webhook ${event}:`, error);
    // ... erro
  }
}
```

#### 6.2 **Histórico de Webhooks Recebidos**

Considere criar uma collection `webhook_logs` para auditoria:

```typescript
{
  id: string;
  event: string;
  payload: any;
  status: 'success' | 'error';
  message: string;
  processedAt: Date;
  userId?: string;
}
```

---

## 🔐 SEGURANÇA

### **Validação HMAC**

A validação HMAC garante que o webhook realmente veio do Hotmart:

1. Hotmart calcula HMAC SHA256 do payload usando a Secret Key
2. Envia no header `x-hotmart-hmac-sha256`
3. Sistema recalcula e compara
4. Se diferente, rejeita o webhook

**⚠️ IMPORTANTE:** 
- NUNCA compartilhe a Secret Key publicamente
- Use variáveis de ambiente
- Em produção, sempre valide HMAC

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **No Hotmart:**
- [ ] Produto subscription criado
- [ ] Webhook configurado: `https://clicksehub.com/api/webhooks/hotmart`
- [ ] Eventos ativados: PURCHASE, ACTIVATED, RENEWED, CANCELLED, EXPIRED, SUSPENDED
- [ ] Secret Key copiada e salva com segurança
- [ ] Código do produto anotado (ex: `BASICO_MENSAL`)

### **No Sistema:**
- [ ] Variável `HOTMART_WEBHOOK_SECRET` configurada (Vercel)
- [ ] Variável `HOTMART_VALIDATE_HMAC=true` (produção)
- [ ] Validação HMAC implementada
- [ ] Endpoint atualizado para validar HMAC
- [ ] Interface do payload ajustada (se necessário)
- [ ] Processamento de webhook testado
- [ ] Logs implementados
- [ ] Código do plano confirmado no banco

### **Testes:**
- [ ] Testar webhook de compra (SUBSCRIPTION_PURCHASE)
- [ ] Testar ativação (SUBSCRIPTION_ACTIVATED)
- [ ] Testar renovação (SUBSCRIPTION_RENEWED)
- [ ] Testar cancelamento (SUBSCRIPTION_CANCELLED)
- [ ] Testar expiração (SUBSCRIPTION_EXPIRED)
- [ ] Testar suspensão (SUBSCRIPTION_SUSPENDED)
- [ ] Validar vinculação de usuário por email
- [ ] Validar atualização de plano no sistema

---

## 🧪 TESTES

### **Teste Manual via Hotmart Sandbox**

1. No Hotmart, use o ambiente de sandbox/testes (se disponível)
2. Faça uma compra de teste
3. Verifique logs no sistema
4. Confirme que a assinatura foi criada/atualizada

### **Teste com Webhook Real**

Após configurar no Hotmart:

1. Faça uma compra real (ou use ambiente de testes)
2. Monitore logs: `https://vercel.com/seu-projeto/logs`
3. Verifique no banco: collection `assinaturas`
4. Verifique no banco: collection `controle_users` (campo `assinaturaId`)

---

## 🚨 TROUBLESHOOTING

### **Erro: "Usuário não encontrado"**
- **Causa:** Email usado no Hotmart não está cadastrado no sistema
- **Solução:** Cliente deve se cadastrar primeiro ou implementar criação automática

### **Erro: "Plano não encontrado"**
- **Causa:** Código do plano no Hotmart não corresponde ao `codigoHotmart` no banco
- **Solução:** Verificar e ajustar código no banco ou no Hotmart

### **Erro: "Assinatura inválida" (HMAC)**
- **Causa:** Secret Key incorreta ou header não enviado
- **Solução:** Verificar variável `HOTMART_WEBHOOK_SECRET` e headers do webhook

### **Webhook não chega**
- **Causa:** URL incorreta ou firewall bloqueando
- **Solução:** Verificar URL no Hotmart e logs do servidor

---

## 📞 SUPORTE

### **Documentação Hotmart:**
- https://developers.hotmart.com/docs/webhooks/

### **Logs do Sistema:**
- Vercel: Dashboard → Logs
- Firebase: Console → Functions → Logs

---

## ✅ PRÓXIMOS PASSOS APÓS IMPLEMENTAÇÃO

1. **Monitorar primeiros webhooks** em produção
2. **Criar dashboard de monitoramento** (opcional)
3. **Configurar alertas** para erros (opcional)
4. **Documentar casos especiais** que surgirem
5. **Implementar retry logic** se necessário (opcional)

---

## 📌 NOTAS IMPORTANTES

1. **Afiliados:** O sistema de afiliados do Hotmart não afeta tecnicamente o webhook. O webhook sempre virá com os dados do comprador (buyer), independente de quem vendeu.

2. **Email como Chave:** Email é a forma mais confiável de vincular, pois:
   - É único por usuário
   - É fornecido pelo Hotmart
   - Já está cadastrado no sistema

3. **Código do Plano:** Deve ser EXATO entre Hotmart e banco de dados. Diferencia maiúsculas/minúsculas.

4. **Status da Assinatura:** Hotmart pode usar diferentes formatos (ex: `ACTIVE`, `active`, `Active`). Normalizar no processamento.

---

**Status:** 🟡 Aguardando implementação das Fases 2-3

