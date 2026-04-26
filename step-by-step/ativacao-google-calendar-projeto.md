# Ativação do Google Calendar no projeto

## Objetivo
Colocar a integração do Google Calendar para funcionar de fato no fluxo principal do sistema.

## Etapa 1 — Diagnóstico inicial
- Mapeado o módulo em rotas API, serviço, repositório, DataService e página de configuração.
- Confirmado que a sincronização automática estava desativada por `return` antecipado e blocos comentados.
- Confirmado que a página `configuracoes/calendario` estava em modo desabilitado.

## Etapa 2 — Reativação da sincronização no backend
### Arquivo: `src/lib/services/google-calendar-sync-service.ts`
- Reativados os métodos:
  - `syncAfterCreate`
  - `syncAfterUpdate`
  - `syncAfterDelete`
- Removidos `return` antecipados e blocos comentados, mantendo a lógica já existente.

### Função/utilidade do arquivo
- Orquestrar sincronização entre eventos internos e Google Calendar sem bloquear o fluxo principal.

## Etapa 3 — Reativação da chamada de sync no fluxo de eventos
### Arquivo: `src/lib/data-service.ts`
- Reativadas chamadas de sincronização após:
  - criação de evento
  - atualização de evento
  - exclusão (arquivamento)
  - desarquivamento
- Mantida a estratégia de importação dinâmica server-side com tratamento silencioso de falha para não quebrar a operação principal.

### Função/utilidade do arquivo
- Fachada principal de operações de dados do sistema, incluindo ciclo de vida de eventos.

## Etapa 4 — Reativação da interface de configuração
### Arquivo: `src/app/configuracoes/calendario/page.tsx`
- Substituída a tela desabilitada por UI funcional com:
  - carregamento de status (`/api/google-calendar/status`)
  - ação de conectar (`/api/google-calendar/auth`)
  - ação de ativar/desativar sincronização (`/api/google-calendar/toggle-sync`)
  - ação de desconectar (`/api/google-calendar/disconnect`)
  - feedback por toast e atualização de estado na tela

### Função/utilidade do arquivo
- Permitir ao usuário gerenciar o estado da integração Google Calendar na aplicação.

## Próximos passos recomendados
- Validar o fluxo completo em ambiente de desenvolvimento com conta real Google.
- Revisar segurança de token (criptografia forte) e restringir endpoint de debug.

---

## Correção complementar — sincronização não disparava ao criar evento

### Problema identificado
- Mesmo com status "conectado", a criação de evento pela interface não aparecia no Google Calendar.
- Causa raiz: `EventoForm` estava usando `dataService` direto no client, e a sincronização com Google roda no fluxo server-side.

### Ajustes aplicados
#### Arquivo: `src/app/api/eventos/route.ts` (novo)
- Criado endpoint `POST /api/eventos` que usa `dataService.createEvento(...)` no servidor.

#### Arquivo: `src/app/api/eventos/[id]/route.ts`
- Adicionado endpoint `PUT /api/eventos/[id]` para atualização server-side usando `dataService.updateEvento(...)`.

#### Arquivo: `src/components/forms/EventoForm.tsx`
- Alterado salvamento de evento:
  - criação agora via `fetch('/api/eventos', { method: 'POST' })`
  - atualização agora via `fetch('/api/eventos/:id', { method: 'PUT' })`
- Com isso, o fluxo passa necessariamente pelo backend onde a sincronização Google é executada.

---

## Correção complementar — validação de plano bloqueando Premium indevidamente

### Problema identificado
- Após salvar evento, o status em configurações passou a indicar desconectado e a tentativa de reconexão retornava erro de plano.
- Causa raiz: `verificarAcessoGoogleCalendar` dependia apenas de `assinatura.planoCodigoHotmart` no documento de usuário (cache), sem fallback para `planoId`.

### Ajuste aplicado
#### Arquivo: `src/lib/utils/google-calendar-auth.ts`
- Fortalecida a validação de acesso:
  - exige status de assinatura `ATIVA` ou `TRIAL`;
  - aceita código de plano com normalização (maiúsculas/variações);
  - faz fallback por `planoId` consultando coleção de planos;
  - fallback final por `planoNome` para cenários legados.

### Resultado esperado
- Usuários com plano Profissional/Premium válido deixam de ser bloqueados por inconsistência de cache no campo `planoCodigoHotmart`.

---

## Correção complementar — erro 500 por permissão no Firestore

### Problema identificado
- Logs apontaram `Missing or insufficient permissions` durante `GET /api/google-calendar/status`.
- Causa raiz: fallback da validação de plano estava consultando coleção de planos no Firestore em um contexto sem permissão.

### Ajuste aplicado
#### Arquivo: `src/lib/utils/google-calendar-auth.ts`
- Removida a consulta direta ao `PlanoRepository` no fallback de autorização do Google Calendar.
- Mantido fallback seguro usando dados já consolidados no documento do usuário (`planoCodigoHotmart` e `planoNome`), com validação de status da assinatura.

### Resultado esperado
- `GET /api/google-calendar/status` deixa de quebrar com 500 por permissão.
- Validação de acesso volta a funcionar sem depender de leitura adicional sensível no Firestore.

---

## Correção complementar — falso bloqueio por variação de status/plano

### Problema identificado
- Mesmo sem erro 500, a API ainda podia retornar:
  - `Esta funcionalidade está disponível apenas para planos Profissional e Premium.`
- Causa raiz: validação rígida para status e código do plano.

### Ajuste aplicado
#### Arquivo: `src/lib/utils/google-calendar-auth.ts`
- Validação de status agora aceita também formato legado: `ACTIVE`.
- Validação de plano passou a aceitar qualquer código que contenha chave `PROFISSIONAL` ou `PREMIUM` (ex.: mensal/anual/sandbox).

### Resultado esperado
- Reduz falsos negativos em ambientes com variações de nomenclatura de plano/assinatura.

---

## Ajuste temporário solicitado — ignorar plano na autenticação Google

### Objetivo
- Permitir autenticação OAuth do Google Calendar mesmo sem validação de plano.

### Alterações aplicadas
#### Arquivo: `src/app/api/google-calendar/auth/route.ts`
- Removida validação de plano (`verificarAcessoGoogleCalendar`) para iniciar fluxo OAuth sem bloqueio.

#### Arquivo: `src/app/api/google-calendar/callback/route.ts`
- Removida validação de plano no callback para concluir salvamento do token sem bloqueio de plano.

### Observação
- Ajuste intencionalmente temporário para destravar autenticação.

---

## Correção de build — assinatura de método `update`

### Problema identificado
- Erro de compilação TypeScript em `google-calendar-sync-service`:
  - `Expected 2 arguments, but got 3.`

### Ajuste aplicado
#### Arquivo: `src/lib/services/google-calendar-sync-service.ts`
- Corrigidas chamadas de `eventoRepo.update(...)` removendo o terceiro argumento `userId`.
- Mantido contrato compatível com `BaseRepository.update(id, entity)`.

### Resultado esperado
- Build volta a compilar nessa etapa de checagem de tipos.

---

## Correção complementar — erro 401 "Login Required" no Google Calendar

### Problema identificado
- Logs mostraram falha de autenticação na leitura do calendário (`calendars.get`) com `401 UNAUTHENTICATED`.

### Ajuste aplicado
#### Arquivo: `src/lib/services/google-calendar-service.ts`
- Reforçado `getCalendarClient` para resolver explicitamente token válido via `oauth2Client.getAccessToken()` antes de chamadas à API.
- `getCalendarInfo(userId)` passou a reutilizar `getCalendarClient(userId)` (mesmo fluxo de refresh/autenticação dos demais métodos).
- No caminho de recuperação após 401, retry também reutiliza `getCalendarClient(userId)` para padronizar comportamento.

### Resultado esperado
- Redução de erros intermitentes de credencial ausente/inválida ao consultar informações do calendário.

---

## Correção complementar — permissão Firestore no callback OAuth

### Problema identificado
- Callback do Google concluía troca de código por token, mas falhava ao persistir token com:
  - `FirebaseError: Missing or insufficient permissions`
- Causa: repositório de token do Google Calendar usava client SDK (`FirestoreRepository`) mesmo em fluxo server-side.

### Ajustes aplicados
#### Arquivo: `src/lib/repositories/google-calendar-token-repository.ts`
- Migrado para `AdminFirestoreRepository`, passando a usar Firebase Admin SDK no backend.
- Objetivo: bypass de regras do Firestore para operações internas do servidor.

#### Arquivo: `src/lib/utils/google-calendar-auth.ts`
- Mantido bypass temporário da validação de plano (`verificarAcessoGoogleCalendar` retorna `true`) para não bloquear autenticação/sincronização.

### Resultado esperado
- Callback OAuth consegue salvar/atualizar token sem erro de permissão.
- Logs de `Erro ao verificar acesso Google Calendar: Missing or insufficient permissions` deixam de ocorrer nesse fluxo.

---

## Correção emergencial — exceção client-side nas páginas

### Problema identificado
- Após alteração do repositório de token para Admin SDK, o sistema passou a exibir:
  - `Application error: a client-side exception has occurred...`
- Causa raiz: import de código server-only (Admin Firestore) em cadeia compartilhada com bundle client.

### Ajuste aplicado
#### Arquivo: `src/lib/repositories/google-calendar-token-repository.ts`
- Revertido para `FirestoreRepository` (client SDK) para remover dependência de Admin SDK do bundle compartilhado e restaurar carregamento das páginas.

### Resultado esperado
- Páginas voltam a abrir normalmente sem exceção client-side.

---

## Correção definitiva — token Google com Admin SDK apenas no servidor

### Problema identificado
- Em produção, callback OAuth e status do Google Calendar falhavam com:
  - `Missing or insufficient permissions`
- A tentativa anterior de usar Admin SDK no repositório compartilhado quebrou páginas client (bundle).

### Solução implementada
- Criado repositório server-only dedicado para tokens:
  - `src/lib/repositories/admin-google-calendar-token-repository.ts`
  - Baseado em `AdminFirestoreRepository`.
- Mantido repositório compartilhado original (`google-calendar-token-repository`) com client SDK para evitar vazamento server-only no client bundle.

### Arquivos ajustados para usar o repositório admin (somente backend)
- `src/lib/services/google-calendar-service.ts`
- `src/lib/services/google-calendar-sync-service.ts`
- `src/app/api/google-calendar/callback/route.ts`
- `src/app/api/google-calendar/status/route.ts`
- `src/app/api/google-calendar/disconnect/route.ts`
- `src/app/api/google-calendar/toggle-sync/route.ts`
- `src/app/api/google-calendar/refresh-token/route.ts`
- `src/app/api/google-calendar/detailed-status/route.ts`
- `src/app/api/google-calendar/debug/route.ts`

### Resultado esperado
- Rotas `/api/google-calendar/*` executam com privilégios de servidor para ler/escrever `google_calendar_tokens`.
- Sem regressão de exceção client-side nas páginas.

---

## Correção complementar — falso "sem plano" ao criar evento

### Problema identificado
- Usuário com assinatura válida era bloqueado na criação de evento com mensagem de ausência de plano.
- Causa técnica provável: falha de leitura da coleção `assinaturas` em alguns fluxos, com retorno silencioso `false` na validação de permissão.

### Ajuste aplicado
#### Arquivo: `src/lib/services/funcionalidade-service.ts`
- `verificarPermissao(...)` agora tem fallback para usar `user.assinatura.funcionalidadesHabilitadas` (cache consolidado no documento do usuário) quando a leitura da assinatura falhar.
- `obterFuncionalidadesHabilitadas(...)` também ganhou fallback equivalente.
- `obterLimitesUsuario(...)` passou a retornar uso atual mesmo em cenário de falha de leitura de assinatura/plano, evitando bloqueio indevido por erro de infraestrutura/regras.

### Resultado esperado
- Redução de bloqueios falsos de plano ao criar evento, mesmo com inconsistência temporária de leitura na coleção `assinaturas`.

---

## Correção complementar — assinatura não exibida para usuário admin

### Problema identificado
- Na página `/assinatura`, usuários com `role=admin` não viam a própria assinatura.
- Causa: `GET /api/assinaturas` retornava payload diferente para admin (`{ assinaturas }`), enquanto a página espera `{ assinatura, todasAssinaturas }`.

### Ajuste aplicado
#### Arquivo: `src/app/api/assinaturas/route.ts`
- Mantido comportamento admin por query (`?userId=...`) para inspeção de outros usuários.
- Ajustado comportamento padrão de admin sem query para retornar a própria assinatura no mesmo formato da página:
  - `assinatura`
  - `todasAssinaturas`

### Resultado esperado
- Usuário admin volta a visualizar sua assinatura normalmente em `/assinatura`.

---

## Correção complementar — bloqueio indevido ao criar evento (403 plano)

### Problema identificado
- API de criação de evento retornava:
  - `Seu plano não permite criar eventos` (403)
- Em parte dos cenários, isso ocorria por falha técnica de leitura de assinatura/funcionalidades e não por ausência real de plano.

### Ajuste aplicado
#### Arquivo: `src/lib/services/funcionalidade-service.ts`
- Em `verificarPermissao(...)`, quando a checagem de `EVENTOS_LIMITADOS` ou `CLIENTES_LIMITADOS` cai no `catch` (erro de leitura/permissão), retorna `true` para evitar bloqueio falso.

### Resultado esperado
- Criação de evento deixa de ser bloqueada por falhas transitórias de leitura de plano/funcionalidade.
