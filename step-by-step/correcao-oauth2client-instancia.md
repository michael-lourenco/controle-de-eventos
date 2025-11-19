# 🔧 Correção: OAuth2Client - Nova Instância por Requisição

## 📋 Problema Identificado

Mesmo com `client_id` correto, estava ocorrendo erro "Login Required" ao usar o token na API do Google Calendar.

## 🔍 Causa Raiz

O problema estava na forma como o `OAuth2Client` estava sendo gerenciado:

**Antes:**
```typescript
private oauth2Client: OAuth2Client | null = null;

private getOAuth2Client(): OAuth2Client {
  if (!this.oauth2Client) {
    this.oauth2Client = new OAuth2Client(...);
  }
  return this.oauth2Client;
}
```

**Problema**: Uma única instância compartilhada do `OAuth2Client` pode causar problemas quando:
- Múltiplas requisições acontecem simultaneamente
- Tokens de diferentes usuários são usados
- O estado do OAuth2Client é modificado entre requisições

## ✅ Solução Implementada

**Agora:**
```typescript
private getOAuth2Client(): OAuth2Client {
  // Sempre criar nova instância para evitar problemas de estado compartilhado
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD;
  
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados');
  }
  
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}
```

**Benefícios**:
- ✅ Cada requisição tem sua própria instância do OAuth2Client
- ✅ Evita problemas de estado compartilhado
- ✅ Mais seguro para requisições simultâneas
- ✅ Garante que as credenciais estão sempre corretas

## 🎯 Por Que Isso Resolve o Problema

1. **Estado Isolado**: Cada requisição tem seu próprio OAuth2Client, evitando conflitos
2. **Credenciais Sempre Corretas**: A cada requisição, as credenciais são lidas novamente do ambiente
3. **Thread-Safe**: Não há risco de uma requisição interferir em outra

## 📝 Arquivo Modificado

- `src/lib/services/google-calendar-service.ts`
  - Removida variável `private oauth2Client`
  - Modificado `getOAuth2Client()` para sempre criar nova instância
  - Adicionada validação de credenciais

---

**Data de Correção**: 2025-01-XX  
**Autor**: Auto (Cursor AI)

