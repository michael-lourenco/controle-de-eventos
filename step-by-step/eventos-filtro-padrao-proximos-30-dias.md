# Página `/eventos` — filtro padrão “Próximos 30 dias”

## Objetivo

Ao abrir a lista de eventos, priorizar a visão de **ativos**, **status todos** e **período próximos 30 dias**. O usuário remove o período (limpar filtro no componente de datas) para ver eventos antigos ou toda a linha do tempo.

## Alterações

| Arquivo | Descrição |
|---------|-----------|
| `src/components/filters/DateRangeFilter.tsx` | Exporta `obterIntervaloFiltroRapido`, `criarDateFilterPeriodoRapido`, `obterRotuloFiltroRapido`. Prop opcional `valorSincronizado` + `useEffect` para alinhar o estado visual do painel ao valor controlado pelo pai. |
| `src/app/eventos/page.tsx` | Estado inicial de `dateFilter` = `criarDateFilterPeriodoRapido('next30Days')`. Aba **Ativos** reaplica esse padrão; **Arquivados** e **Pré-cadastros** limpam o período (`null`). `DateRangeFilter` recebe `valorSincronizado={dateFilter}`. Resumo de filtros exibe rótulo legível do período rápido. |

## Comportamento das abas

- **Ativos:** período volta para “Próximos 30 dias” ao selecionar a aba (incluindo ao retornar de Arquivados ou Pré-cadastros).
- **Arquivados / Pré-cadastros:** período removido para não esconder registros antigos na aba de arquivo.

## Como ver todos os períodos (ativos)

Em **Filtrar por período** → **Limpar filtro** (ou escolher outro intervalo).
