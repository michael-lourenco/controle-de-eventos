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
