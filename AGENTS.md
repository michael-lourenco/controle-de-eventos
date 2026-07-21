# AGENTS — Click-se Sistema

Instruções para agentes Cursor neste repositório. Sempre responder em **pt-BR**. Código em **português brasileiro**.

## Contexto do produto

SaaS de gestão de eventos (fotografia/cerimonial). Stack: Next.js 15 App Router, React 19, TypeScript, Supabase (domínio), Firestore (users/planos), NextAuth, S3, Tailwind.

Camadas:
```
Pages/Components → API Routes → DataService/Services → Repositories → Supabase/Firestore
```

Antes de implementar features grandes: ler `.cursor/rules/*` e a SPEC em `.cursor/specs/<feature>/`.

---

## Agent: custos-fixos

**Quando ativar:** usuário pede para implementar, completar, corrigir ou estender **Custos Fixos**, **Tipos de Custo Fixo**, anexos de custo fixo, ou arquivos sob `custos-fixos` / `tipos-custos-fixos` / `tipo_custos_fixos`.

**Obrigatório ler primeiro:**
1. `.cursor/specs/custos-fixos/SPEC.md`
2. `.cursor/specs/custos-fixos/CHECKLIST.md`
3. `.cursor/specs/custos-fixos/SCHEMA.md`
4. `.cursor/skills/implementar-custos-fixos/SKILL.md`
5. `.cursor/rules/custos-fixos.mdc`

**Espelhar (não reinventar):**
- Tipos: `src/app/tipos-custos/page.tsx` + `TipoCustoSupabaseRepository`
- Custos de evento: `CustoForm`, `CustoSupabaseRepository`, APIs `/api/custos/*`, anexos
- Lista financeira standalone: `src/app/pagamentos/page.tsx`

**Regras rígidas deste agent:**
- Domínio **separado** de custos de evento — tabelas e tipos próprios
- Sempre filtrar por `user_id`
- Soft delete: tipos com `ativo=false`; **custos fixos: hard delete** (sem vínculo a eventos)
- Sem Prisma; sem Firestore para esta feature
- Atualizar `step-by-step/` ao final da sessão de implementação
- Não criar docs extras além do pedido / step-by-step

**Ordem de trabalho:** Schema → Types → Repos → Factory → DataService → APIs → S3 → UI → Menu → Feature flags → Aceite.

**Definition of done:** checklist da SPEC 100% + zero regressão em `/eventos/[id]` custos.

---

## Agent: feature-crud-supabase (genérico)

**Quando ativar:** nova entidade multi-tenant no Supabase (CRUD + página + menu).

**Padrão:**
1. Schema em `supabase/schema.sql` + migration
2. Interface TS em `src/types`
3. `*SupabaseRepository` herdando `BaseSupabaseRepository`
4. `repositoryFactory.getXxxRepository()`
5. Métodos no `dataService`
6. Route handlers com `route-helpers`
7. Page client com `<Layout>` + `PlanOverlay`
8. Item em `Layout.tsx` navigation

Ver rules: `architecture.mdc`, `database-supabase.mdc`, `api-routes.mdc`, `services-repositories.mdc`.

---

## Agent: planos-funcionalidades

**Quando ativar:** novas feature flags, gates de plano, seed de funcionalidades.

**Padrão:** código em Firestore `funcionalidades`, vincular IDs nos `planos`, validar com `FuncionalidadeService` / `withPlanoValidation` / `usePlano().temPermissao`.

Para CUSTOS FIXOS: códigos `CUSTOS_FIXOS` e `ANEXOS_CUSTO_FIXO`.
