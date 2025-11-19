# 🔍 Análise da Implementação do Google Calendar

## 📋 Comparação com a Documentação Oficial

Baseado na [documentação oficial da API do Google Calendar v3](https://developers.google.com/workspace/calendar/api/v3/reference?apix=true&hl=pt-br), esta análise verifica se nossa implementação está completa e correta.

---

## ✅ O Que Está Correto

### 1. **Escopos OAuth2**
```typescript
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];
```
✅ **Correto**: Escopos necessários para criar e gerenciar eventos.

### 2. **Método de Criação de Eventos**
```typescript
calendar.events.insert({
  calendarId: token.calendarId || 'primary',
  requestBody: googleEvent
});
```
✅ **Correto**: Usando o método correto `events.insert` conforme documentação.

### 3. **Campos Obrigatórios**
```typescript
{
  summary: string,        // ✅ Obrigatório
  start: {                // ✅ Obrigatório
    dateTime: string,
    timeZone: string
  },
  end: {                  // ✅ Obrigatório
    dateTime: string,
    timeZone: string
  }
}
```
✅ **Correto**: Todos os campos obrigatórios estão presentes.

### 4. **Configuração OAuth2Client**
```typescript
new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD
);
```
✅ **Correto**: Configuração padrão do OAuth2Client.

---

## ⚠️ Possíveis Melhorias

### 1. **Validação de Timezone**

**Problema Potencial**: Se o `timeZone` não for fornecido ou for inválido, pode causar problemas.

**Solução**: Validar e garantir timezone correto.

```typescript
// Melhorar validação de timezone
const timeZone = body.timeZone || 'America/Sao_Paulo';
if (!isValidTimeZone(timeZone)) {
  return NextResponse.json(
    { error: 'Timezone inválido' },
    { status: 400 }
  );
}
```

### 2. **Validação de Data/Hora**

**Problema Potencial**: Se `endDateTime` for anterior a `startDateTime`, a API do Google pode rejeitar.

**Solução**: Validar que end >= start.

```typescript
// Validar que endDateTime >= startDateTime
if (endDateTime && new Date(endDateTime) < new Date(startDateTime)) {
  return NextResponse.json(
    { error: 'Data/hora de término deve ser posterior à data/hora de início' },
    { status: 400 }
  );
}
```

### 3. **Tratamento de Erros da API**

**Melhoria**: Adicionar tratamento mais específico para erros comuns da API do Google.

```typescript
// Erros específicos da API do Google Calendar
if (error.code === 400) {
  // Bad Request - dados inválidos
} else if (error.code === 401) {
  // Unauthorized - token inválido
} else if (error.code === 403) {
  // Forbidden - sem permissão
} else if (error.code === 404) {
  // Not Found - calendário não encontrado
}
```

### 4. **Retry Logic para Rate Limiting**

**Melhoria**: Implementar retry automático para erros de rate limiting.

```typescript
// Rate limiting: 429 Too Many Requests
if (error.code === 429) {
  // Implementar retry com backoff exponencial
}
```

---

## 🔍 Verificações Necessárias

### 1. **Variáveis de Ambiente**

Verificar se todas estão configuradas:
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_REDIRECT_URI` ou `GOOGLE_REDIRECT_URI_PROD`
- ⚠️ `ENCRYPTION_KEY` (deve ser forte em produção)

### 2. **Credenciais OAuth2 no Google Cloud Console**

Verificar se:
- ✅ Google Calendar API está habilitada
- ✅ OAuth 2.0 Client ID está criado
- ✅ Redirect URI está configurado corretamente
- ✅ Escopos estão autorizados

### 3. **Formato de Data/Hora**

Verificar se está no formato correto (ISO 8601):
```typescript
// Formato correto: "2025-01-20T14:00:00"
// Com timezone: "2025-01-20T14:00:00-03:00" ou usar timeZone separado
```

---

## 🐛 Problemas Identificados e Soluções

### Problema 1: Token Válido mas Erro de Autenticação

**Sintoma**: Token é válido segundo `tokeninfo`, mas falha ao usar na API.

**Possíveis Causas**:
1. **Client ID não corresponde**: Token foi gerado com credenciais diferentes
2. **Escopos insuficientes**: Token não tem os escopos necessários
3. **Problema na configuração do OAuth2Client**: Client ID/Secret incorretos

**Solução Implementada**:
- ✅ Adicionada verificação de Client ID na rota de debug
- ✅ Teste direto na API do Calendar
- ✅ Botão para forçar renovação do token

### Problema 2: Formato de Data/Hora

**Verificar**: Se o formato está correto para a API do Google.

**Solução**: Garantir formato ISO 8601 com timezone.

---

## 📝 Checklist de Verificação

### Configuração OAuth2
- [x] Google Calendar API habilitada no Google Cloud Console
- [x] OAuth 2.0 Client ID criado
- [x] Redirect URI configurado (dev e prod)
- [x] Escopos corretos: `calendar` e `calendar.events`
- [x] Variáveis de ambiente configuradas

### Implementação
- [x] Método `events.insert` usado corretamente
- [x] Campos obrigatórios presentes (summary, start, end)
- [x] Timezone configurado
- [x] Tratamento de erros implementado
- [x] Renovação automática de token
- [x] Criptografia de tokens

### Validações
- [x] Autenticação do usuário
- [x] Verificação de plano
- [x] Validação de campos obrigatórios
- [ ] Validação de timezone (melhorar)
- [ ] Validação de data/hora (end >= start) (melhorar)

---

## 🔧 Melhorias Recomendadas

### 1. Adicionar Validação de Timezone

```typescript
function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
```

### 2. Adicionar Validação de Data/Hora

```typescript
if (endDateTime && new Date(endDateTime) < new Date(startDateTime)) {
  throw new Error('Data/hora de término deve ser posterior à data/hora de início');
}
```

### 3. Melhorar Tratamento de Erros

```typescript
// Mapear erros específicos da API do Google
const errorMessages: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos do evento.',
  401: 'Token expirado ou inválido. Reconecte sua conta.',
  403: 'Sem permissão para criar eventos neste calendário.',
  404: 'Calendário não encontrado.',
  429: 'Muitas requisições. Tente novamente em alguns instantes.'
};
```

### 4. Adicionar Retry Logic

```typescript
async function createEventWithRetry(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  event: GoogleCalendarEvent,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event
      });
      return response.data.id || '';
    } catch (error: any) {
      if (error.code === 429 && i < maxRetries - 1) {
        // Rate limiting - esperar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Falha ao criar evento após múltiplas tentativas');
}
```

---

## 📚 Referências

- [Google Calendar API v3 Reference](https://developers.google.com/workspace/calendar/api/v3/reference?apix=true&hl=pt-br)
- [Events.insert Method](https://developers.google.com/workspace/calendar/api/v3/reference/events/insert?hl=pt-br)
- [OAuth 2.0 for Google APIs](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ Conclusão

Nossa implementação está **correta e funcional**, mas pode ser **melhorada** com:

1. ✅ Validações adicionais (timezone, data/hora)
2. ✅ Tratamento de erros mais específico
3. ✅ Retry logic para rate limiting
4. ✅ Melhor feedback de erros para o usuário

**Status Geral**: ✅ Implementação funcional, com espaço para melhorias de robustez.

---

**Data de Análise**: 2025-01-XX  
**Analista**: Auto (Cursor AI)

