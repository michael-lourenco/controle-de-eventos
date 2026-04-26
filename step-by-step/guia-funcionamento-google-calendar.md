# Guia de funcionamento — Google Calendar (Clickse)

## Objetivo
Registrar exatamente o que foi necessário para a integração com Google Calendar funcionar com sucesso:
- autenticar conta Google;
- ler eventos;
- criar eventos diretamente no Google Calendar;
- sincronizar eventos do sistema para o Google Calendar.

---

## Estado final que funcionou

### 1) Fluxo OAuth funcionando
- `GET /api/google-calendar/auth` inicia consentimento Google.
- `GET /api/google-calendar/callback` recebe `code/state`, troca por tokens e salva no Firestore.

### 2) Persistência de token no backend
- Tokens são salvos em `google_calendar_tokens`.
- Para rotas/serviços server-side do Google Calendar, foi criado repositório admin dedicado:
  - `src/lib/repositories/admin-google-calendar-token-repository.ts`
- Esse repositório usa `AdminFirestoreRepository` para evitar bloqueio por regras do Firestore em produção.

### 3) Leitura de eventos do Google
- Método de listagem no serviço:
  - `GoogleCalendarService.listEvents(...)`
- Endpoint:
  - `GET /api/google-calendar/list-events`
- Tela de visualização:
  - `src/app/configuracoes/calendario/eventos/page.tsx`

### 4) Criação direta de evento no Google (sem base interna)
- Endpoint já existente usado:
  - `POST /api/google-calendar/events`
- Formulário simples adicionado em:
  - `src/app/configuracoes/calendario/eventos/page.tsx`
- Campos mínimos:
  - título, início, fim opcional, local opcional

### 5) Sincronização automática após criar/editar/arquivar evento interno
- Reativada no `DataService`:
  - `syncAfterCreate`
  - `syncAfterUpdate`
  - `syncAfterDelete`
  - `syncAfterUpdate` no desarquivar
- Serviço de sync:
  - `src/lib/services/google-calendar-sync-service.ts`

### 6) Fluxo `/eventos` forçado via backend para disparar sync
- Alguns pontos de `/eventos` ainda atualizavam por `dataService` no client, o que podia pular a sincronização server-side.
- Ajuste aplicado:
  - `src/app/eventos/page.tsx`: arquivar, desarquivar e alterar status via API (`/api/eventos/:id`).
  - `src/app/eventos/[id]/page.tsx`: arquivar e atualizar campos (status/impressoes) via API.
  - `src/app/api/eventos/[id]/route.ts`: adicionados `DELETE` (arquivar) e `PATCH` com `action=desarquivar`.
- Resultado: mudanças em `/eventos` passam pelo backend e disparam integração Google.

### 7) Indicador visual de sync no detalhe do evento
- Em `src/app/eventos/[id]/page.tsx` foi adicionada seção:
  - sincronizado (sim/não)
  - id do evento no Google
  - data/hora da última sincronização

---

## Principais problemas encontrados e como foram resolvidos

### Problema A — 403 de plano bloqueando acesso
- Erro: "Esta funcionalidade está disponível apenas para planos..."
- Ação aplicada: bypass temporário em `verificarAcessoGoogleCalendar(...)` para destravar integração/testes.
- Arquivo:
  - `src/lib/utils/google-calendar-auth.ts`

### Problema B — erro client-side ao abrir páginas
- Causa: uso de Admin SDK em repositório compartilhado com bundle client.
- Correção:
  - manter `google-calendar-token-repository` client-safe;
  - usar `admin-google-calendar-token-repository` apenas no backend Google Calendar.

### Problema C — `Missing or insufficient permissions` no callback/status
- Causa: leitura/escrita de token por SDK client em fluxo server.
- Correção: rotas/serviços Google Calendar migrados para repositório admin server-only.

### Problema D — 401 `Login Required` na leitura/criação
- Correções aplicadas:
  1. reforço de token válido em `getCalendarClient`;
  2. retry com renovação forçada (`expiresAt = new Date(0)`);
  3. fallback REST com `Authorization: Bearer <token>` para:
     - listagem de eventos;
     - criação de eventos.

---

## Arquivos-chave da integração

- Serviço principal:
  - `src/lib/services/google-calendar-service.ts`
- Sync automático:
  - `src/lib/services/google-calendar-sync-service.ts`
- Repositórios:
  - `src/lib/repositories/google-calendar-token-repository.ts` (client-safe)
  - `src/lib/repositories/admin-google-calendar-token-repository.ts` (server-only)
- Rotas API Google Calendar:
  - `src/app/api/google-calendar/auth/route.ts`
  - `src/app/api/google-calendar/callback/route.ts`
  - `src/app/api/google-calendar/status/route.ts`
  - `src/app/api/google-calendar/events/route.ts`
  - `src/app/api/google-calendar/list-events/route.ts`
  - `src/app/api/google-calendar/toggle-sync/route.ts`
  - `src/app/api/google-calendar/disconnect/route.ts`
  - `src/app/api/google-calendar/refresh-token/route.ts`
  - `src/app/api/google-calendar/detailed-status/route.ts`
  - `src/app/api/google-calendar/debug/route.ts`
- Telas:
  - `src/app/configuracoes/calendario/page.tsx`
  - `src/app/configuracoes/calendario/eventos/page.tsx`

---

## Checklist para funcionar em outro ambiente

1. Configurar variáveis de ambiente Google OAuth:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (ou `GOOGLE_REDIRECT_URI_PROD`)
2. Configurar chave de criptografia:
   - `ENCRYPTION_KEY`
3. Configurar Firebase Admin para backend:
   - `FIREBASE_ADMIN_SDK_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY` ou `GOOGLE_CREDENTIALS_*`
4. Garantir API Google Calendar habilitada no projeto GCP.
5. Confirmar URL de callback cadastrada no OAuth Client do Google.
6. Conectar conta em `/configuracoes/calendario`.
7. Validar leitura em `/configuracoes/calendario/eventos`.
8. Criar evento direto na mesma tela para validar escrita.
9. Criar evento interno no sistema para validar sync automático.

---

## Observações de manutenção

- O bypass de plano em `google-calendar-auth.ts` está temporário para testes.
- Após estabilização, reativar validação de plano com fallback seguro.
- O endpoint de debug expõe dados sensíveis (tokens) e deve ser restringido/removido em produção.
- Criptografia atual de token usa base64 (não criptografia forte); ideal migrar para criptografia real.
