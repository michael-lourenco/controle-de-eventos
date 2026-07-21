# Spec — Filtros de CUSTOS FIXOS

**Página:** `/custos-fixos`  
**Princípio:** robusto e simples — filtragem no client sobre a lista já carregada; reutilizar `DateRangeFilter`.

---

## Problema

A listagem só tem busca textual. O usuário precisa filtrar por **tipo** e **período de pagamento** para localizar despesas e conferir totais do mês.

## Solução

Barra de filtros única com:

| Filtro | UI | Comportamento |
|--------|-----|----------------|
| Busca | Input | Descrição ou nome do tipo (case-insensitive) |
| Tipo | `<select>` | `todos` ou `tipoCustoFixoId` específico |
| Período | `DateRangeFilter` | Default: **mês atual** (`thisMonth`); filtra `dataPagamento` |
| Limpar | Botão **abaixo** do período | Volta ao padrão (mês atual, sem busca/tipo) |

## Regras

1. Filtros combinados com **AND**
2. Total e contagem refletem só os itens filtrados
3. Padrão inicial = mês atual (não “todos os períodos”)
4. Sem round-trip API (volume típico cabe em memória); se no futuro a lista crescer muito, mover filtros para query params na API
5. Mensagem vazia distingue “sem dados” vs “nenhum resultado para os filtros”
6. Select de tipo usa `SelectWithSearch` (busca no dropdown)
7. Estado local React (sem URL params na v1)

## Fora de escopo

- Persistência em localStorage/URL
- Filtro server-side
- Ordenação avançada (mantém `data_pagamento` DESC do repo)

## Aceite

- [ ] Em `/tipos-custos-fixos`, só esse item do menu fica ativo (não “Tipos de Custo”)
- [ ] Filtrar por tipo reduz a lista e o total
- [ ] Filtrar por período (rápido ou custom) respeita `dataPagamento`
- [ ] Busca + tipo + período juntos
- [ ] Limpar restaura lista completa
- [ ] Empty state adequado com filtros ativos
