# Step-by-step — Menu ativo + filtros custos fixos

**Data:** 2026-07-21

## 1. Menu selecionado incorreto

**Causa:** `isActive` usava `pathname.startsWith(href)`, então `/tipos-custos-fixos` ativava também `/tipos-custos`.

**Correção:** em `Layout.tsx`, ativo se `pathname === href` ou `pathname.startsWith(href + '/')`.

## 2. Filtros em `/custos-fixos`

**Spec:** `.cursor/specs/custos-fixos/FILTROS.md`

**Arquivos:**
- `src/components/filters/CustosFixosFiltros.tsx` — busca + tipo + limpar + contador
- Reuso de `DateRangeFilter` / `isDateInFilter` para período por `dataPagamento`
- `src/app/custos-fixos/page.tsx` — AND entre filtros; empty state diferenciado

## Atualização — exclusão permanente

Custo fixo passou de soft delete para **hard delete** (repo `.delete()` + limpeza de anexos S3 na API). Dialog sem texto de restauração via suporte.

1. Default = mês atual (`criarFiltrosPadrao` / `thisMonth`)
2. Tipo = `SelectWithSearch`
3. “Limpar filtros” abaixo do `DateRangeFilter` (restaura mês atual)
