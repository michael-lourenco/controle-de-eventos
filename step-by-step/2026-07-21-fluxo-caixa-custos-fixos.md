# Step-by-step — Custos fixos no Fluxo de Caixa

**Data:** 2026-07-21

## Objetivo

Incluir despesas de custos fixos no Relatório de Fluxo de Caixa e exibir coluna **Tipo de Custo** (`fixo` | `variável`) em DESPESAS POR CATEGORIA.

## Alterações

| Arquivo | Mudança |
|---------|---------|
| `fluxo-caixa-despesas.ts` | Helpers de agregação por categoria + tipo |
| `FluxoCaixaReport.tsx` | Prop `custosFixos`; filtra por `dataPagamento`; tabela + CSV + pie |
| `relatorios/page.tsx` | Carrega e passa custos fixos |
| `relatorios-report-service.ts` | Cache diário inclui fixos |
| `relatorio-cache-service.ts` | Snapshot mensal inclui fixos + detalhe |
| `types` | `tipoCusto` em `despesasPorCategoria`; detalhe no mensal |

## Regras de negócio

- **Variável:** custos de evento no período (`dataCadastro`)
- **Fixo:** custos fixos no período (`dataPagamento`)
- Mesma categoria com tipos diferentes = linhas separadas
- Percentual sobre o total (fixo + variável)
