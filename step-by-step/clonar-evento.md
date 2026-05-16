# Clonar evento

## Objetivo

Permitir duplicar um evento com novo ID e título com sufixo ` (clone)`, sem copiar pagamentos, custos, contratos ou vínculo Google Calendar.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `src/lib/utils/evento-clone.ts` | `montarTituloEventoClonado`, `montarPayloadEventoClonado` (regras puras). |
| `src/lib/services/evento-clone-service.ts` | Orquestra busca, validação de plano, criação, cópia de serviços e sync Google Calendar. |
| `src/lib/data-service.ts` | Método `clonarEvento` (fachada). |
| `src/app/api/eventos/[id]/clonar/route.ts` | `POST` autenticado que retorna o evento clonado (201). |
| `src/app/eventos/page.tsx` | Botão clonar na lista (aba Ativos). |
| `src/app/eventos/[id]/page.tsx` | Botão clonar na visualização do evento. |

## O que é copiado

- Dados do evento (local, horários, cliente, valores, status, etc.).
- Serviços do evento ativos (`servicos_evento` não removidos).

## O que não é copiado

- Pagamentos, custos, contratos, anexos.
- `google_calendar_event_id` (novo evento pode sincronizar de novo se habilitado).

## API

`POST /api/eventos/{id}/clonar` — respeita limite de eventos do plano (mesma regra de criação).
