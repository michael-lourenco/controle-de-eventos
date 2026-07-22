# Liberar custos fixos para todos (bypass temporário de plano)

**Data:** 2026-07-21  
**Objetivo:** Comentar o bloqueio por tipo de plano e liberar `CUSTOS_FIXOS` / `ANEXOS_CUSTO_FIXO` para todos os usuários autenticados, sem alterar o seed das flags.

## O que foi feito

1. **APIs** — funções `assertCustosFixos` / `assertAnexosCustoFixo` passam a retornar `null` (sem 403). Código de verificação de permissão permanece comentado com `TODO: reativar`.
   - `src/app/api/custos-fixos/create/route.ts`
   - `src/app/api/custos-fixos/route.ts`
   - `src/app/api/custos-fixos/[id]/route.ts`
   - `src/app/api/tipos-custo-fixo/create/route.ts`
   - `src/app/api/anexos-custo-fixo/route.ts`
   - `src/app/api/upload-anexo-custo-fixo/route.ts`

2. **Imports de plano** nas mesmas APIs comentados para não gerar lint de unused (`FuncionalidadeService`, repos admin).

3. **UI** — `CustoFixoForm.tsx`: anexos liberados com `setTemAnexos(true)`; `usePlano` / `temPermissao('ANEXOS_CUSTO_FIXO')` comentados.

4. **Rule** — `.cursor/rules/custos-fixos.mdc` documenta o bypass temporário.

## O que NÃO mudou

- Seed em `funcionalidades-planos` continua cadastrando as flags e associações (pronto para reativar o gate).
- Menu, páginas e CRUD seguem exigindo autenticação + filtro `user_id`.

## Como reativar

Descomentar os blocos `TODO: reativar` nas APIs e no `CustoFixoForm`, e restaurar os imports.

## Função dos arquivos tocados

| Arquivo | Função |
|---------|--------|
| APIs `custos-fixos*` / `tipos-custo-fixo` / anexos | Gate de feature por plano (agora no-op) |
| `CustoFixoForm.tsx` | Formulário; seção de anexos liberada para todos |
| `custos-fixos.mdc` | Regra do agente sobre o bypass |
