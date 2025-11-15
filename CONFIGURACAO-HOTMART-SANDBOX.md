# 🧪 Configuração do Webhook Hotmart Sandbox

## 📋 Objetivo
Implementar ambiente de testes (sandbox) do Hotmart para testar webhooks sem afetar dados reais ou gerar cobranças.

---

## 🔗 Endpoints Disponíveis

### **1. Endpoint Real (Produção)**
```
https://clicksehub.com/api/webhooks/hotmart
```
- **Uso:** Webhooks reais de assinaturas em produção
- **Validação HMAC:** Obrigatória em produção
- **Variável de ambiente:** `HOTMART_WEBHOOK_SECRET`

### **2. Endpoint Sandbox (Testes)**
```
https://clicksehub.com/api/webhooks/hotmart/sandbox
```
- **Uso:** Webhooks de teste do ambiente sandbox do Hotmart
- **Validação HMAC:** Opcional (configurável via `HOTMART_VALIDATE_HMAC_SANDBOX`)
- **Variável de ambiente:** `HOTMART_WEBHOOK_SECRET_SANDBOX` (opcional, usa `HOTMART_WEBHOOK_SECRET` como fallback)

---

## 🔧 Configuração no Hotmart Sandbox

### **Passos para Configurar:**

1. **Acesse o Ambiente Sandbox do Hotmart:**
   - Acesse: https://developers.hotmart.com/
   - Faça login com sua conta Hotmart
   - Navegue até o ambiente de Sandbox/Testes

2. **Configure o Webhook:**
   - URL do Webhook: `https://clicksehub.com/api/webhooks/hotmart/sandbox`
   - Método: POST
   - Eventos a ativar:
     - ✅ `SUBSCRIPTION_PURCHASE` - Nova compra de assinatura
     - ✅ `SUBSCRIPTION_ACTIVATED` - Assinatura ativada (após trial)
     - ✅ `SUBSCRIPTION_RENEWED` - Renovação da assinatura
     - ✅ `SUBSCRIPTION_CANCELLED` - Cancelamento da assinatura
     - ✅ `SUBSCRIPTION_EXPIRED` - Expiração da assinatura
     - ✅ `SUBSCRIPTION_SUSPENDED` - Suspensão da assinatura

3. **Copie a Secret Key (se houver):**
   - No ambiente sandbox, copie a Secret Key do webhook
   - Use para configurar `HOTMART_WEBHOOK_SECRET_SANDBOX` (opcional)

---

## ⚙️ Variáveis de Ambiente

### **Para Sandbox (Opcional):**

```env
# Secret Key específica do sandbox (opcional, usa HOTMART_WEBHOOK_SECRET como fallback)
HOTMART_WEBHOOK_SECRET_SANDBOX=sua_secret_key_sandbox_aqui

# Habilitar validação HMAC no sandbox (default: false, para facilitar testes)
HOTMART_VALIDATE_HMAC_SANDBOX=false
```

**Importante:**
- Se `HOTMART_WEBHOOK_SECRET_SANDBOX` não estiver configurado, usa `HOTMART_WEBHOOK_SECRET`
- Por padrão, validação HMAC está **desabilitada** no sandbox para facilitar testes locais
- Em produção, sempre habilite a validação HMAC

---

## 🧪 Testes

### **1. Teste via GET (Mockado)**

Teste rápido sem precisar do Hotmart:

```
GET /api/webhooks/hotmart/sandbox?email=teste@exemplo.com&plano=BASICO_MENSAL&evento=SUBSCRIPTION_PURCHASE
```

**Parâmetros:**
- `email` (obrigatório): Email do usuário a vincular
- `plano` (opcional): Código do plano (default: `BASICO_MENSAL`)
- `evento` (opcional): Evento a simular (default: `SUBSCRIPTION_PURCHASE`)

**Eventos disponíveis:**
- `SUBSCRIPTION_PURCHASE`
- `SUBSCRIPTION_ACTIVATED`
- `SUBSCRIPTION_RENEWED`
- `SUBSCRIPTION_CANCELLED`
- `SUBSCRIPTION_EXPIRED`
- `SUBSCRIPTION_SUSPENDED`

### **2. Teste via POST (Hotmart Sandbox Real)**

Quando configurar o webhook no Hotmart Sandbox, o Hotmart enviará webhooks reais para:
```
POST https://clicksehub.com/api/webhooks/hotmart/sandbox
```

---

## 📊 Logs e Identificação

### **Logs com Prefixo [SANDBOX]**

Todos os logs do sandbox têm o prefixo `[SANDBOX]` para fácil identificação:

```
🧪 [SANDBOX] Webhook recebido: SUBSCRIPTION_PURCHASE
🔍 [SANDBOX] Processando webhook: ...
✅ [SANDBOX] Dados validados: ...
✅ [SANDBOX] Webhook processado com sucesso
```

### **Diferenciação no Banco de Dados**

Os webhooks do sandbox processam dados normalmente, mas você pode identificar pelas assinaturas com prefixo `SUB-SANDBOX-` nos logs.

---

## ✅ Checklist de Configuração

### **No Sistema:**
- [x] Endpoint sandbox criado: `/api/webhooks/hotmart/sandbox`
- [x] Suporte a modo sandbox no serviço
- [x] Logs diferenciados com prefixo `[SANDBOX]`
- [x] Validação HMAC opcional no sandbox

### **No Hotmart Sandbox:**
- [ ] Ambiente sandbox acessado
- [ ] Webhook configurado: `https://clicksehub.com/api/webhooks/hotmart/sandbox`
- [ ] Eventos ativados (todos os 6 eventos)
- [ ] Secret Key copiada (se disponível)

### **No Vercel (Opcional para Sandbox):**
- [ ] Variável `HOTMART_WEBHOOK_SECRET_SANDBOX` configurada (opcional)
- [ ] Variável `HOTMART_VALIDATE_HMAC_SANDBOX=false` configurada (recomendado para testes)

---

## 🔄 Fluxo de Teste Recomendado

1. **Teste Local (GET):**
   ```bash
   curl "http://localhost:3000/api/webhooks/hotmart/sandbox?email=teste@exemplo.com&plano=BASICO_MENSAL&evento=SUBSCRIPTION_PURCHASE"
   ```

2. **Teste em Produção (GET):**
   ```bash
   curl "https://clicksehub.com/api/webhooks/hotmart/sandbox?email=teste@exemplo.com&plano=BASICO_MENSAL&evento=SUBSCRIPTION_PURCHASE"
   ```

3. **Configurar no Hotmart Sandbox:**
   - Configurar webhook no painel sandbox do Hotmart
   - Realizar compras de teste no sandbox
   - Verificar logs no Vercel

4. **Validar Funcionamento:**
   - Verificar logs com prefixo `[SANDBOX]`
   - Confirmar que assinaturas foram criadas
   - Confirmar que planos foram aplicados
   - Validar que usuários foram atualizados

5. **Migrar para Produção:**
   - Após validar tudo no sandbox, configurar webhook real
   - Usar endpoint: `https://clicksehub.com/api/webhooks/hotmart`
   - Ativar validação HMAC obrigatória

---

## 🚨 Troubleshooting Sandbox

### **Erro: "Usuário não encontrado"**

**Causa:** Email usado no teste não está cadastrado

**Solução:**
- Certifique-se que o email está cadastrado no sistema
- Ou crie o usuário primeiro antes de testar

### **Erro: "Plano não encontrado"**

**Causa:** Código do plano no teste não corresponde ao banco

**Solução:**
- Verifique o código do plano no banco: `planos` → `codigoHotmart`
- Use um código existente no teste

### **Webhook Sandbox não chega**

**Causa:** URL incorreta ou não configurado no Hotmart Sandbox

**Solução:**
- Verifique a URL no Hotmart Sandbox
- Certifique-se que está apontando para `/sandbox`
- Verifique logs do Vercel

---

## 📌 Diferenças: Sandbox vs Produção

| Característica | Sandbox | Produção |
|----------------|---------|----------|
| **Endpoint** | `/api/webhooks/hotmart/sandbox` | `/api/webhooks/hotmart` |
| **Validação HMAC** | Opcional (default: false) | Obrigatória |
| **Logs** | Prefixo `[SANDBOX]` | Prefixo normal |
| **Secret Key** | `HOTMART_WEBHOOK_SECRET_SANDBOX` (opcional) | `HOTMART_WEBHOOK_SECRET` |
| **Uso** | Testes e desenvolvimento | Dados reais |
| **Cobranças** | Não gera cobranças | Gera cobranças reais |

---

## 📚 Documentação Relacionada

- **Hotmart Sandbox:** https://developers.hotmart.com/docs/pt-BR/start/sandbox
- **Webhook Subscriptions:** https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/
- **Configuração Produção:** `CONFIGURACAO-HOTMART-WEBHOOK.md`

---

**Status:** ✅ Implementado e pronto para testes

