# Step-by-step — Specs / Agents / Skills / Rules: CUSTOS FIXOS

**Data:** 2026-07-21  
**Objetivo:** Preparar o projeto para implementar a feature CUSTOS FIXOS mantendo o padrão existente (sem código de feature ainda).

---

## O que foi feito

### Specs (`.cursor/specs/custos-fixos/`)

| Arquivo | Função |
|---------|--------|
| `SPEC.md` | Spec de produto/técnica: problema, escopo, schema, types, APIs, UI, planos, aceite, ordem de implementação |
| `SCHEMA.md` | SQL alvo das tabelas `tipo_custos_fixos`, `custos_fixos`, `anexos_custo_fixo` |
| `CHECKLIST.md` | Checklist por fases para implementação e QA |

### Agents (`AGENTS.md` na raiz)

| Seção | Função |
|-------|--------|
| Agent `custos-fixos` | Ativa ao implementar/corrigir a feature; lista leituras obrigatórias e DoD |
| Agent `feature-crud-supabase` | Padrão genérico de CRUD multi-tenant |
| Agent `planos-funcionalidades` | Seed/gates `CUSTOS_FIXOS` e `ANEXOS_CUSTO_FIXO` |

### Skills (`.cursor/skills/`)

| Skill | Função |
|-------|--------|
| `implementar-custos-fixos/SKILL.md` | Workflow passo a passo + anti-padrões + arquivos a espelhar |
| `revisar-custos-fixos/SKILL.md` | Checklist de review de PR/diff da feature |

### Rules (`.cursor/rules/`)

| Arquivo | Função |
|---------|--------|
| `custos-fixos.mdc` | Rule focada (globs da feature): separação de domínio, campos, soft delete, S3, menu |
| `architecture.mdc` | Atualizado: repos de custos fixos / anexos |
| `database-supabase.mdc` | Atualizado: tabelas novas documentadas |
| `project-context.mdc` | Atualizado: pastas App Router |
| `react-components.mdc` | Atualizado: `CustoFixoForm` e aviso de separação |

---

## Decisões de desenho registradas

1. **Tabelas novas** — não reutilizar `custos` com `evento_id` nullable.
2. **Tipos próprios** (`tipo_custos_fixos`) — “mundo à parte” vs tipos de custo de evento.
3. **Campos do lançamento:** data de pagamento, valor, quantidade (default 1), tipo, descrição, anexo.
4. **Menu:** `/custos-fixos` e `/tipos-custos-fixos`.
5. **Feature flags:** `CUSTOS_FIXOS`, `ANEXOS_CUSTO_FIXO`.
6. **Espelho de UI:** tipos ← `/tipos-custos`; lista ← `/pagamentos`; form/anexos ← `CustoForm`.

---

## Ainda não implementado (código)

- Migration aplicada no Supabase
- Repos / APIs / páginas / seed de funcionalidades

Para implementar: acionar a skill `implementar-custos-fixos` ou o agent `custos-fixos` em `AGENTS.md`.

---

## Atualização 2026-07-21 — campo `quantidade`

Incluído `quantidade INTEGER NOT NULL DEFAULT 1` em `custos_fixos`, alinhado a `custos` de evento. Spec, schema, skill, rules e review checklist atualizados antes da implementação.

---

## Manutenibilidade

Os artefatos ficam versionados no repo (`.cursor/` + `AGENTS.md`), alinhados às rules já usadas pelo time. A SPEC é a fonte de verdade da feature; a skill evita drift ao apontar arquivos concretos a clonar. Próximo passo natural: executar a Fase 1 (schema) e seguir o checklist sem reinterpretar o domínio.
