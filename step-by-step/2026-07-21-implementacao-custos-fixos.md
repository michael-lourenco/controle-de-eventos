# Step-by-step — Implementação CUSTOS FIXOS

**Data:** 2026-07-21  
**Spec:** `.cursor/specs/custos-fixos/SPEC.md`

## O que foi implementado

### Schema
- `supabase/schema.sql` — tabelas `tipo_custos_fixos`, `custos_fixos`, `anexos_custo_fixo` + trigger `data_atualizacao`
- `supabase/migrations/add_custos_fixos.sql` — migration dedicada
- `supabase/policies-rls.sql` — policies permissivas (padrão do projeto)

### Backend
| Arquivo | Função |
|---------|--------|
| `src/types/index.ts` | `TipoCustoFixo`, `CustoFixo`, `AnexoCustoFixo` |
| `*-custo-fixo-*-supabase-repository.ts` | Repos Supabase |
| `repository-factory.ts` | Getters dos 3 repos |
| `data-service.ts` | CRUD tipos + custos fixos |
| `s3-service.ts` | `uploadFileCustoFixo` path `users/.../custos-fixos/...` |
| `api/tipos-custo-fixo/create` | Criar tipo (gate `CUSTOS_FIXOS`) |
| `api/custos-fixos` + `create` + `[id]` | List/create/update/delete |
| `api/upload-anexo-custo-fixo` | Upload (gate `ANEXOS_CUSTO_FIXO`) |
| `api/anexos-custo-fixo` | List/delete anexos |

### Frontend
| Arquivo | Função |
|---------|--------|
| `/tipos-custos-fixos` | CRUD tipos (abas ativos/inativos) |
| `/custos-fixos` | Lista + dialog form |
| `CustoFixoForm.tsx` | data, valor, qtd, tipo, descrição, anexos |
| `Layout.tsx` | Itens de menu |

### Planos
- Flags `CUSTOS_FIXOS` (Basico+) e `ANEXOS_CUSTO_FIXO` (Premium)
- Seed: `api/seed/funcionalidades-planos` + `scripts/executar-seed.ts`

## Pós-deploy obrigatório

1. **Rodar a migration** no Supabase (`add_custos_fixos.sql`)
2. **Rodar seed** de funcionalidades/planos
3. **Sincronizar assinaturas** dos usuários ativos (para receber `CUSTOS_FIXOS` no cache)

Sem o passo 2–3, as APIs retornam 403 “plano não permite”.

## Escalabilidade / próximos passos

Domínio isolado evita acoplamento com custos de evento e permite índices/relatórios próprios. Melhorias: incluir custos fixos no fluxo de caixa; recorrência mensal; endpoint admin para backfill de `CUSTOS_FIXOS` nas assinaturas existentes sem re-seed completo.
