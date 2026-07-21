---
name: implementar-custos-fixos
description: >-
  Implementa a feature CUSTOS FIXOS (tipos + lançamentos + anexos) no Click-se,
  espelhando custos de evento e páginas tipos-custos/pagamentos, sem vínculo com
  eventos. Use when the user asks to implement, complete, or fix custos fixos,
  tipos de custo fixo, anexos de custo fixo, or files under custos-fixos /
  tipos-custos-fixos / tipo_custos_fixos.
---

# Implementar CUSTOS FIXOS

## Obrigatório antes de codar

1. Ler [SPEC](../../specs/custos-fixos/SPEC.md)
2. Ler [SCHEMA](../../specs/custos-fixos/SCHEMA.md)
3. Ler [CHECKLIST](../../specs/custos-fixos/CHECKLIST.md)
4. Ler rule `.cursor/rules/custos-fixos.mdc`
5. Abrir referências:
   - `src/lib/repositories/supabase/custo-supabase-repository.ts`
   - `src/lib/repositories/supabase/tipo-custo-supabase-repository.ts`
   - `src/lib/repositories/supabase/anexo-custo-supabase-repository.ts`
   - `src/app/tipos-custos/page.tsx`
   - `src/app/pagamentos/page.tsx`
   - `src/components/forms/CustoForm.tsx`
   - `src/components/Layout.tsx` (array `navigation`)

## Princípios

- **Mundo à parte:** não alterar `custos` / `tipo_custos` / `anexos_custo` para aceitar custo sem evento.
- Tabelas novas: `tipo_custos_fixos`, `custos_fixos`, `anexos_custo_fixo`.
- Camadas: Page → API → DataService → Repository → Supabase.
- Multi-tenant: toda query com `user_id` da sessão.
- Idioma: pt-BR em código e UI.
- Sem Prisma. Sem Firestore para dados desta feature (só feature flags em planos).

## Workflow (copiar e marcar)

```
Progresso CUSTOS FIXOS:
- [ ] 1. Schema + migration
- [ ] 2. Types TS
- [ ] 3. Repositories + factory
- [ ] 4. DataService
- [ ] 5. APIs CRUD + anexos
- [ ] 6. S3 upload path
- [ ] 7. Página tipos-custos-fixos
- [ ] 8. Página custos-fixos + CustoFixoForm
- [ ] 9. Menu Layout
- [ ] 10. Feature flags CUSTOS_FIXOS / ANEXOS_CUSTO_FIXO
- [ ] 11. Aceite + step-by-step
```

### 1. Schema
Aplicar SQL de `SCHEMA.md`. Atualizar `supabase/schema.sql`. Criar arquivo em `supabase/migrations/` se o projeto usar migrations dedicadas.

### 2. Types
Adicionar `TipoCustoFixo`, `CustoFixo`, `AnexoCustoFixo` em `src/types/index.ts` (ver SPEC).

### 3. Repositories
Criar três repos em `src/lib/repositories/supabase/`:
- `tipo-custo-fixo-supabase-repository.ts` — espelho `TipoCustoSupabaseRepository`
- `custo-fixo-supabase-repository.ts` — `findAll(userId)`, `create`, `update`, soft delete; join `tipo_custos_fixos(*)`
- `anexo-custo-fixo-supabase-repository.ts` — `findByCustoFixoId`, `createAnexo`, `deleteAnexo`

Registrar getters no `repository-factory.ts`.

### 4. DataService
Métodos espelhando tipos/custos: get/create/update/delete/reativar tipos; get/create/update/delete custos fixos. No client, create via `fetch` para API (padrão `createCustoEvento` / `createTipoCusto`).

### 5. APIs
Usar `route-helpers`. Paths na SPEC. Validar `CUSTOS_FIXOS` em writes; `ANEXOS_CUSTO_FIXO` em anexos.

### 6. S3
Novo helper no `S3Service` (ou reutilizar upload genérico) com key:
`users/{userId}/custos-fixos/{custoFixoId}/anexos/{timestamp}_{filename}`

### 7–8. UI
- Tipos: clonar fluxo de `tipos-custos/page.tsx`
- Lista: padrão `pagamentos/page.tsx`
- Form campos: `dataPagamento`, `valor`, `quantidade` (default 1), `tipoCustoFixoId`, `descricao`, anexos

### 9. Menu
Inserir em `navigation` (Layout) — desktop, mobile e tooltips do sidebar colapsado:
- Custos Fixos → `/custos-fixos` (após Pagamentos)
- Tipos de Custo Fixo → `/tipos-custos-fixos` (junto aos outros “Tipos”)

### 10. Planos
Seed códigos `CUSTOS_FIXOS` e `ANEXOS_CUSTO_FIXO`; vincular aos planos acordados (mínimo: mesmos que têm financeiro básico).

### 11. Fechamento
Validar checklist de aceite da SPEC. Atualizar `step-by-step/`. Atualizar rules `architecture.mdc` e `database-supabase.mdc` se ainda não listarem as tabelas.

## Anti-padrões

```typescript
// ❌ BAD — misturar domínio
await supabase.from('custos').insert({ evento_id: null, ... })

// ✅ GOOD — tabela própria
await supabase.from('custos_fixos').insert({ user_id, tipo_custo_fixo_id, valor, quantidade: quantidade ?? 1, data_pagamento, descricao })
```

```typescript
// ❌ BAD — query sem user
.from('custos_fixos').select('*')

// ✅ GOOD
.from('custos_fixos').select('*, tipo_custos_fixos(*)').eq('user_id', userId).eq('removido', false)
```

## Arquivos de referência da feature

| Destino | Espelhar |
|---------|----------|
| `.cursor/specs/custos-fixos/*` | esta skill |
| Repos novos | `*-custo-*-supabase-repository.ts` |
| UI tipos | `src/app/tipos-custos/page.tsx` |
| UI lista | `src/app/pagamentos/page.tsx` |
| Form | `src/components/forms/CustoForm.tsx` |
