---
name: revisar-custos-fixos
description: >-
  Revisa PRs ou diffs da feature CUSTOS FIXOS contra a SPEC e os padrões do
  projeto (multi-tenant, soft delete, tabelas separadas de custos de evento).
  Use when reviewing changes to custos fixos, tipos-custos-fixos, or related APIs.
---

# Revisar CUSTOS FIXOS

## Checklist de review

1. **Separação de domínio**
   - [ ] Não altera `custos` / `tipo_custos` / `anexos_custo` para cobrir custo fixo
   - [ ] Usa `custos_fixos`, `tipo_custos_fixos`, `anexos_custo_fixo`

2. **Segurança multi-tenant**
   - [ ] Todas as queries filtram `user_id`
   - [ ] APIs usam `getAuthenticatedUser` e não aceitam `userId` do body para ownership

3. **Camadas**
   - [ ] Sem query Supabase solta em page/component
   - [ ] Factory + DataService ou API route

4. **Produto**
   - [ ] Form tem data pagamento, valor, quantidade, tipo, descrição, anexo
   - [ ] Menu presente
   - [ ] Soft delete correto

5. **Planos**
   - [ ] Gates `CUSTOS_FIXOS` / `ANEXOS_CUSTO_FIXO` onde couber

6. **Schema**
   - [ ] `supabase/schema.sql` sincronizado

## Severidade

- 🔴 Misturar com `evento_id` / vazamento cross-tenant
- 🟡 Falta feature flag ou menu incompleto
- 🟢 Naming / copy UI

Referência: `.cursor/specs/custos-fixos/SPEC.md`
