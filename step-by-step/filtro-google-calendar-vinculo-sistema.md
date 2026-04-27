# Filtro de listagem Google Calendar — apenas eventos vinculados ao Clicksehub

## Objetivo

A rota `GET /api/google-calendar/list-events` e a página de configurações devem retornar/exibir somente eventos do Google Calendar cujo `id` coincide com `google_calendar_event_id` de um registro na tabela `eventos` do mesmo `user_id` (opção 4 acordada).

## Arquivos alterados ou criados

| Arquivo | Função |
|---------|--------|
| `src/lib/utils/google-calendar-vinculo.ts` | **Novo.** Função pura `filtrarEventosGoogleCalendarVinculadosAoSistema` — recebe a lista da API Google e um `Set` de IDs permitidos; facilita teste e mantém a regra de negócio isolada do I/O. |
| `src/lib/repositories/supabase/evento-supabase-repository.ts` | Método `listarGoogleCalendarEventIdsPorUsuario(userId)` — consulta leve (`select` só da coluna) com `user_id` e `google_calendar_event_id` não nulo. |
| `src/lib/services/google-calendar-service.ts` | `EventoSupabaseRepository` injetado no construtor (DIP). Novo método `listarEventosGoogleCalendarVinculadosAoSistema` — `Promise.all` entre listagem Google e IDs no banco, depois aplica o filtro utilitário. `listEvents` permanece para uso interno ou futuro “listar tudo”. |
| `src/lib/factories/service-factory.ts` | Instancia `GoogleCalendarService` com `repoFactory.getEventoRepository()`. |
| `src/lib/services/google-calendar-sync-service.ts` | Passa o repositório de eventos ao construir `GoogleCalendarService` (reutiliza `eventoRepo` onde já existia). |
| `src/app/api/google-calendar/list-events/route.ts` | Passa a chamar `listarEventosGoogleCalendarVinculadosAoSistema` em vez de `listEvents`. |
| `src/app/configuracoes/calendario/eventos/page.tsx` | Texto de apoio explicando que só aparecem compromissos vinculados ao Clicksehub. |

## Fluxo

1. Cliente chama `list-events` autenticado.
2. Serviço busca eventos no Google (como antes) e, em paralelo, os IDs salvos no Supabase para aquele usuário.
3. Filtra localmente por interseção de `event.id`.

## Manutenibilidade

- Regra de filtro em função pura; acesso a dados no repositório; orquestração no serviço de calendário — alinhado a camadas do projeto.
- Se no futuro for necessário listar “tudo do Google”, a rota pode ganhar query `escopo=todos` e chamar `listEvents` sem quebrar o comportamento padrão atual.
