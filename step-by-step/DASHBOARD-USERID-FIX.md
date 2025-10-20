## Correção: userId obrigatório no Dashboard

### O que foi ajustado

- Hook `useDashboardData` agora injeta `userId` via `useCurrentUser` e passa para `dataService.getDashboardData(userId)`.
- Hook `useTiposCusto` deixou de usar `userId || undefined` e agora valida autenticação antes de chamar `dataService.getTiposCusto(userId)`.

### Arquivos alterados

- `src/hooks/useData.ts`

### Motivo

`DataService.getDashboardData` e `getTiposCusto` exigem `userId` obrigatório. Chamadas sem `userId` geravam o erro: "userId é obrigatório para buscar dados do dashboard".

### Impacto

- Evita chamadas inválidas quando a sessão ainda não está resolvida.
- Mensagem de erro amigável em hooks quando o usuário não está autenticado.

### Próximos passos sugeridos

- Padronizar todos os hooks que dependem de `userId` para validarem autenticação antes de chamar o serviço.
- Considerar um HOC/Provider para bloquear render até `useSession` sair do estado `loading` nas páginas privadas.

