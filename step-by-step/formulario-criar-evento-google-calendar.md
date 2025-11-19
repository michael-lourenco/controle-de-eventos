# 📝 Formulário para Criar Eventos no Google Calendar

## 📋 Sumário Executivo

Este documento descreve a implementação de um formulário na página de configurações do Google Calendar que permite criar eventos diretamente na agenda sincronizada, além de verificar que o token utilizado é do Google Calendar OAuth2 e não da autenticação do sistema.

**Data de Implementação:** 2025-01-XX  
**Status:** ✅ Concluído  
**Prioridade:** Média

---

## 🎯 Objetivos

1. **Formulário de Criação de Eventos**: Adicionar um formulário na página de configurações do Google Calendar para criar eventos diretamente na agenda sincronizada
2. **Verificação de Token**: Confirmar que o token usado é do Google Calendar OAuth2, não da autenticação do sistema
3. **Interface Intuitiva**: Formulário simples e fácil de usar, visível apenas quando a sincronização está ativa

---

## 🔍 Análise do Token

### Verificação Realizada

Após análise do código, foi confirmado que:

1. **Token de Autenticação do Sistema** (`getServerSession`):
   - Usado apenas para identificar o usuário (`userId`)
   - Não é usado para acessar a API do Google Calendar

2. **Token do Google Calendar OAuth2**:
   - Armazenado no repositório `GoogleCalendarTokenRepository`
   - Contém `accessToken` e `refreshToken` específicos do Google Calendar
   - Obtido através do fluxo OAuth2 do Google
   - Usado exclusivamente para acessar a API do Google Calendar

### Fluxo de Autenticação

```
1. Usuário faz login no sistema → getServerSession identifica userId
2. Usuário conecta Google Calendar → OAuth2 flow obtém tokens do Google
3. Tokens são armazenados em GoogleCalendarTokenRepository (criptografados)
4. Ao criar evento → GoogleCalendarService.getAccessToken(userId) busca token do Google Calendar
5. Token do Google Calendar é usado para autenticar requisições à API do Google
```

**Conclusão:** ✅ O token usado é corretamente do Google Calendar OAuth2, não da autenticação do sistema.

---

## 📁 Arquivos Criados/Modificados

### 1. Nova API Route: `/api/google-calendar/events`

**Arquivo:** `src/app/api/google-calendar/events/route.ts`

**Função:** Criar eventos diretamente no Google Calendar via API

**Características:**
- Valida autenticação do usuário (getServerSession)
- Verifica se usuário tem plano permitido
- Valida dados do formulário (título obrigatório, data/hora início obrigatória)
- Cria evento usando `GoogleCalendarService.createEventDirectly()`
- Retorna ID do evento criado

**Campos aceitos:**
- `summary` (obrigatório): Título do evento
- `description` (opcional): Descrição do evento
- `startDateTime` (obrigatório): Data/hora de início (ISO string)
- `endDateTime` (opcional): Data/hora de término (ISO string)
- `location` (opcional): Localização do evento
- `timeZone` (opcional): Fuso horário (padrão: 'America/Sao_Paulo')

### 2. Novo Método no Serviço: `createEventDirectly`

**Arquivo:** `src/lib/services/google-calendar-service.ts`

**Método:** `createEventDirectly(userId: string, googleEvent: GoogleCalendarEvent): Promise<string>`

**Função:** Criar evento diretamente no Google Calendar sem precisar de um Evento do sistema

**Diferença do método `createEvent`:**
- `createEvent`: Recebe um `Evento` do sistema e converte para `GoogleCalendarEvent`
- `createEventDirectly`: Recebe diretamente um `GoogleCalendarEvent` já formatado

**Uso do Token:**
- Usa `getAccessToken(userId)` que busca o token do Google Calendar OAuth2
- Token é obtido do repositório `GoogleCalendarTokenRepository`
- Não usa token de autenticação do sistema

### 3. Formulário na Página de Configurações

**Arquivo:** `src/app/configuracoes/calendario/page.tsx`

**Modificações:**
- Adicionado estado para controlar exibição do formulário
- Adicionado estado para dados do formulário
- Adicionado função `handleCreateEvent` para submeter formulário
- Adicionado Card com formulário que aparece quando sincronização está ativa

**Campos do Formulário:**
- Título do Evento (obrigatório)
- Descrição (opcional, textarea)
- Data/Hora de Início (obrigatório, datetime-local)
- Data/Hora de Término (opcional, datetime-local)
- Localização (opcional)

**Comportamento:**
- Formulário só aparece quando `status.connected && status.syncEnabled`
- Botão "Novo Evento" aparece quando formulário está oculto
- Botão "Cancelar" limpa e oculta formulário
- Validações no frontend antes de enviar
- Feedback visual durante criação (loading state)

---

## 🔄 Fluxo de Criação de Evento

```
1. Usuário acessa /configuracoes/calendario
2. Se sincronização ativa → Botão "Novo Evento" aparece
3. Usuário clica em "Novo Evento" → Formulário é exibido
4. Usuário preenche campos e submete
5. Frontend valida campos obrigatórios
6. POST /api/google-calendar/events com dados do formulário
7. API valida autenticação e plano do usuário
8. API valida dados do evento
9. API chama GoogleCalendarService.createEventDirectly()
10. Serviço busca token do Google Calendar OAuth2
11. Serviço cria evento na API do Google Calendar
12. Retorna ID do evento criado
13. Frontend exibe mensagem de sucesso
14. Formulário é limpo e ocultado
```

---

## 🎨 Interface do Usuário

### Localização
- Página: `/configuracoes/calendario`
- Posição: Card abaixo do card de status da conexão
- Visibilidade: Apenas quando sincronização está ativa e conectada

### Componentes Utilizados
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Input` (para campos de texto e datetime-local)
- `Textarea` (para descrição)
- `Button` (para ações)

### Estados Visuais
- **Formulário oculto**: Botão "Novo Evento" visível
- **Formulário visível**: Campos do formulário e botões "Cancelar" e "Criar Evento"
- **Criando evento**: Botão "Criar Evento" mostra spinner e texto "Criando..."

---

## 🔐 Segurança

### Validações Implementadas

1. **Autenticação:**
   - Verifica se usuário está autenticado (getServerSession)
   - Retorna 401 se não autenticado

2. **Autorização:**
   - Verifica se usuário tem plano permitido (verificarAcessoGoogleCalendar)
   - Retorna 403 se não tiver acesso

3. **Validação de Dados:**
   - Título obrigatório (frontend e backend)
   - Data/hora de início obrigatória (frontend e backend)
   - Se data/hora de término não fornecida, usa a mesma de início

4. **Token:**
   - Token do Google Calendar é buscado do repositório específico
   - Token é descriptografado antes de usar
   - Token é renovado automaticamente se expirado

---

## 📝 Exemplo de Uso

### Requisição API

```typescript
POST /api/google-calendar/events
Content-Type: application/json

{
  "summary": "Reunião com cliente",
  "description": "Discussão sobre novo projeto",
  "startDateTime": "2025-01-20T14:00:00",
  "endDateTime": "2025-01-20T15:30:00",
  "location": "Rua das Flores, 123 - São Paulo, SP",
  "timeZone": "America/Sao_Paulo"
}
```

### Resposta de Sucesso

```json
{
  "success": true,
  "eventId": "abc123xyz",
  "message": "Evento criado com sucesso no Google Calendar"
}
```

### Resposta de Erro

```json
{
  "error": "Erro ao criar evento",
  "message": "Token não encontrado. Conecte sua conta do Google Calendar primeiro."
}
```

---

## ✅ Checklist de Implementação

- [x] Criar API route `/api/google-calendar/events`
- [x] Adicionar método `createEventDirectly` no `GoogleCalendarService`
- [x] Adicionar formulário na página de configurações
- [x] Implementar validações no frontend
- [x] Implementar validações no backend
- [x] Adicionar feedback visual (loading, sucesso, erro)
- [x] Verificar uso correto do token do Google Calendar OAuth2
- [x] Documentar alterações

---

## 🐛 Tratamento de Erros

### Erros Tratados

1. **Usuário não autenticado:**
   - Status: 401
   - Mensagem: "Não autenticado"

2. **Usuário sem plano permitido:**
   - Status: 403
   - Mensagem: "Acesso negado. Esta funcionalidade está disponível apenas para planos Profissional e Enterprise."

3. **Token não encontrado:**
   - Status: 500
   - Mensagem: "Token não encontrado. Conecte sua conta do Google Calendar primeiro."

4. **Campos obrigatórios faltando:**
   - Status: 400
   - Mensagem: "Título do evento é obrigatório" ou "Data/hora de início é obrigatória"

5. **Erro na API do Google:**
   - Status: 500
   - Mensagem: Erro retornado pela API do Google Calendar

---

## 📊 Testes Recomendados

### Testes Manuais

1. **Cenário 1: Criar evento com todos os campos**
   - Preencher todos os campos
   - Submeter formulário
   - Verificar se evento aparece no Google Calendar

2. **Cenário 2: Criar evento apenas com campos obrigatórios**
   - Preencher apenas título e data/hora início
   - Submeter formulário
   - Verificar se evento é criado com sucesso

3. **Cenário 3: Tentar criar evento sem sincronização ativa**
   - Desativar sincronização
   - Verificar se formulário não aparece

4. **Cenário 4: Tentar criar evento sem estar conectado**
   - Desconectar Google Calendar
   - Verificar se formulário não aparece

5. **Cenário 5: Validação de campos obrigatórios**
   - Tentar submeter sem título
   - Verificar mensagem de erro
   - Tentar submeter sem data/hora início
   - Verificar mensagem de erro

---

## 🔄 Próximos Passos (Opcional)

1. **Melhorias de UX:**
   - Adicionar preview do evento antes de criar
   - Permitir editar evento criado diretamente do formulário
   - Adicionar sugestões de localização baseadas em eventos anteriores

2. **Funcionalidades Adicionais:**
   - Permitir criar eventos recorrentes
   - Adicionar convidados ao evento
   - Adicionar lembretes/notificações

3. **Integração:**
   - Sincronizar eventos criados diretamente no Google Calendar de volta para o sistema
   - Mostrar eventos do Google Calendar na lista de eventos do sistema

---

## 📚 Referências

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0 for Google APIs](https://developers.google.com/identity/protocols/oauth2)
- Documentação da integração: `step-by-step/integracao-google-calendar.md`

---

## 📝 Notas Técnicas

### Token do Google Calendar vs Token de Autenticação

**IMPORTANTE:** O sistema usa dois tipos de tokens diferentes:

1. **Token de Autenticação do Sistema:**
   - Obtido via `getServerSession(authOptions)`
   - Usado para identificar o usuário (`userId`)
   - Não é usado para acessar APIs externas

2. **Token do Google Calendar OAuth2:**
   - Obtido via fluxo OAuth2 do Google
   - Armazenado em `GoogleCalendarTokenRepository`
   - Contém `accessToken` e `refreshToken`
   - Usado exclusivamente para acessar a API do Google Calendar
   - É renovado automaticamente quando expira

**Conclusão:** ✅ O token usado para criar eventos no Google Calendar é corretamente o token OAuth2 do Google, não o token de autenticação do sistema.

---

**Data de Conclusão:** 2025-01-XX  
**Desenvolvedor:** Auto (Cursor AI)  
**Revisão:** Pendente

