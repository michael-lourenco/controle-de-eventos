## Correção: userId obrigatório na criação de Cliente/Evento

### O que foi ajustado

- `EventoForm` agora usa `useCurrentUser()` para obter `userId` e impede o submit enquanto `isLoading` ou sem autenticação.
- Passamos `userId` para `dataService.createCliente` e `dataService.createEvento`.
- `DataService` passou a montar `userId` e timestamps internamente e utilizar `repository.create(...)` (removendo dependência de `createWithUserId`).

### Arquivos alterados

- `src/components/forms/EventoForm.tsx`
- `src/lib/data-service.ts`

### Motivo

Erros do tipo "userId é obrigatório para criar cliente/evento" ocorriam porque o `userId` não estava sendo enviado pelos formulários; além disso, os repositórios expõem `create(...)` genérico, então o service agora adiciona `userId` e datas antes da criação.

### Impacto

- Criação de clientes e eventos agora é sempre vinculada ao usuário autenticado.
- Evita submits enquanto a sessão não está resolvida.

### Próximos passos sugeridos

- Garantir o mesmo padrão em outros formulários (pagamentos, custos, tipos de custo).
- Extrair um helper no `DataService` para anexar metadados (`userId`, `dataCadastro`, `dataAtualizacao`) e reduzir repetição.

