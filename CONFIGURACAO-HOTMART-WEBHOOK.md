# 🔐 Configuração do Webhook Hotmart

## ✅ Implementação Real Concluída

A integração real com o webhook do Hotmart foi implementada com:
- ✅ Validação HMAC SHA256 real
- ✅ Suporte a diferentes formatos de payload do Hotmart
- ✅ Logs detalhados para debugging
- ✅ Modo desenvolvimento (HMAC desabilitado) vs Produção (HMAC habilitado)

---

## 📝 Variáveis de Ambiente Necessárias

### **No Vercel (Produção):**

1. Acesse: **Dashboard Vercel** → Seu projeto → **Settings** → **Environment Variables**

2. Adicione as seguintes variáveis:

```env
HOTMART_WEBHOOK_SECRET=sua_secret_key_do_hotmart_aqui
HOTMART_VALIDATE_HMAC=true
```

### **No Desenvolvimento Local:**

1. Crie ou edite o arquivo `.env.local` na raiz do projeto:

```env
# Hotmart Webhook Configuration
HOTMART_WEBHOOK_SECRET=sua_secret_key_do_hotmart_aqui
HOTMART_VALIDATE_HMAC=true
```

⚠️ **IMPORTANTE:** 
- Em desenvolvimento, a validação HMAC é automaticamente desabilitada mesmo que `HOTMART_VALIDATE_HMAC=true`
- Em produção, sempre mantenha `HOTMART_VALIDATE_HMAC=true` para segurança

---

## 🔑 Como Obter a Secret Key

1. Acesse o **Painel Hotmart**
2. Vá em **Meus Produtos** → Seu produto subscription
3. Acesse **Configurações** → **Webhooks** ou **Integrações**
4. Na configuração do webhook, copie a **Secret Key** ou **Token de Segurança**
5. Cole no campo `HOTMART_WEBHOOK_SECRET`

---

## 🔗 Endpoint para Configurar no Hotmart

```
https://clicksehub.com/api/webhooks/hotmart
```

**Método:** POST

**Eventos a ativar:**
- ✅ `SUBSCRIPTION_PURCHASE` - Nova compra de assinatura
- ✅ `SUBSCRIPTION_ACTIVATED` - Assinatura ativada (após trial)
- ✅ `SUBSCRIPTION_RENEWED` - Renovação da assinatura
- ✅ `SUBSCRIPTION_CANCELLED` - Cancelamento da assinatura
- ✅ `SUBSCRIPTION_EXPIRED` - Expiração da assinatura
- ✅ `SUBSCRIPTION_SUSPENDED` - Suspensão da assinatura

---

## 🧪 Testes

### **Modo Desenvolvimento:**

O endpoint GET ainda está disponível para testes mockados:

```
GET /api/webhooks/hotmart?email=usuario@exemplo.com&plano=BASICO_MENSAL&evento=SUBSCRIPTION_PURCHASE
```

### **Modo Produção:**

Após configurar o webhook no Hotmart, o Hotmart testará automaticamente o endpoint. Os logs estarão disponíveis em:

- **Vercel:** Dashboard → Logs
- **Firebase:** Console → Functions → Logs (se aplicável)

---

## 📊 Logs e Debugging

O sistema agora possui logs detalhados para facilitar o debugging:

- 📥 **Webhook recebido:** Mostra o evento e timestamp
- 🔐 **Validação HMAC:** Mostra status da validação
- 🔍 **Processando webhook:** Mostra dados extraídos
- ✅ **Sucesso:** Confirma processamento bem-sucedido
- ❌ **Erros:** Mostra detalhes dos erros

---

## 🔒 Segurança

### **Validação HMAC:**

- Em **produção**, o HMAC é sempre validado se `HOTMART_WEBHOOK_SECRET` estiver configurado
- Em **desenvolvimento**, o HMAC é desabilitado automaticamente
- O HMAC valida que o webhook realmente veio do Hotmart usando SHA256

### **Headers Suportados:**

O sistema verifica os seguintes headers para encontrar a assinatura HMAC:
- `x-hotmart-hmac-sha256` (padrão)
- `hotmart-hmac-sha256`
- `x-hmac-sha256`

---

## ✅ Checklist de Configuração

### **No Sistema:**
- [x] Validação HMAC implementada
- [x] Suporte a diferentes formatos de payload
- [x] Logs detalhados implementados
- [x] Endpoint pronto para receber webhooks

### **No Hotmart:**
- [ ] Webhook configurado: `https://clicksehub.com/api/webhooks/hotmart`
- [ ] Eventos ativados (todos os 6 eventos)
- [ ] Secret Key copiada e salva

### **No Vercel:**
- [ ] Variável `HOTMART_WEBHOOK_SECRET` configurada
- [ ] Variável `HOTMART_VALIDATE_HMAC=true` configurada
- [ ] Deploy realizado

---

## 🚨 Troubleshooting

### **Erro: "Assinatura HMAC inválida"**

**Causa:** Secret Key incorreta ou header não enviado

**Solução:**
1. Verifique se `HOTMART_WEBHOOK_SECRET` está correto no Vercel
2. Verifique os logs para ver qual header está sendo enviado
3. Confirme que o Secret Key no Vercel é o mesmo do Hotmart

### **Erro: "Usuário não encontrado"**

**Causa:** Email usado no Hotmart não está cadastrado no sistema

**Solução:**
- Cliente deve se cadastrar primeiro no sistema (https://clicksehub.com/register)
- Depois pode comprar o plano no Hotmart
- Ou implementar criação automática de usuário (opcional)

### **Erro: "Plano não encontrado"**

**Causa:** Código do plano no Hotmart não corresponde ao `codigoHotmart` no banco

**Solução:**
1. Verifique o código do produto no Hotmart
2. Verifique no banco: collection `planos` → campo `codigoHotmart`
3. Execute o seed novamente ou ajuste manualmente

### **Webhook não chega**

**Causa:** URL incorreta ou firewall bloqueando

**Solução:**
1. Verifique a URL no Hotmart: `https://clicksehub.com/api/webhooks/hotmart`
2. Verifique logs do Vercel para ver se há tentativas de acesso
3. Teste o endpoint manualmente com GET (modo desenvolvimento)

---

## 📞 Suporte

Para mais informações, consulte:
- Documentação Hotmart: https://developers.hotmart.com/docs/webhooks/
- Plano completo: `PLANO-INTEGRACAO-HOTMART-REAL.md`

