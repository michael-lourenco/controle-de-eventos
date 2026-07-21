# Checklist de implementação — CUSTOS FIXOS

Espelhar padrões de `tipo_custos` / `custos` / `anexos_custo` / `/tipos-custos` / `/pagamentos`.

## Fase 0 — Contexto
- [x] Ler `.cursor/specs/custos-fixos/SPEC.md`
- [x] Ler skill `.cursor/skills/implementar-custos-fixos/SKILL.md`
- [x] Ler rules: `architecture`, `database-supabase`, `api-routes`, `services-repositories`, `custos-fixos`

## Fase 1 — Schema
- [x] Migration SQL: `tipo_custos_fixos`, `custos_fixos`, `anexos_custo_fixo`
- [x] Atualizar `supabase/schema.sql`
- [x] Índices + UNIQUE `(user_id, nome)` em tipos
- [x] RLS alinhado ao padrão das tabelas existentes (se aplicável)
- [ ] **Aplicar migration no projeto Supabase** (pendente no ambiente)

## Fase 2 — Types + Repos
- [x] `TipoCustoFixo`, `CustoFixo`, `AnexoCustoFixo` em `src/types/index.ts`
- [x] Repos Supabase (convertFrom/ToSupabase)
- [x] Registrar em `repository-factory.ts`
- [x] Métodos DataService

## Fase 3 — APIs
- [x] Tipos: create (+ update/delete via DataService)
- [x] Custos fixos: create, list, update, soft delete
- [x] Anexos: upload, list, delete
- [x] Auth + multi-tenant + plano validation

## Fase 4 — S3
- [x] Método upload em `S3Service` para path `users/{userId}/custos-fixos/...`
- [x] Tipos de arquivo e limite iguais a anexos de custo (JPG/PNG/PDF/DOC/DOCX/TXT, 5MB)

## Fase 5 — UI
- [x] `/tipos-custos-fixos` (espelho tipos-custos)
- [x] `/custos-fixos` + `CustoFixoForm`
- [x] Menu em `Layout.tsx` (mobile + desktop + collapsed tooltips)
- [x] PlanOverlay / permissões anexos

## Fase 6 — Planos
- [x] Seed `CUSTOS_FIXOS` e `ANEXOS_CUSTO_FIXO`
- [x] Associar aos planos desejados
- [ ] **Executar seed + sincronizar assinaturas** (pendente no ambiente)

## Fase 7 — Validação
- [ ] Critérios de aceite da SPEC (após migration + seed)
- [x] Sem regressão em custos de evento (código isolado)
- [x] step-by-step da sessão atualizado
