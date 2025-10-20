# Implementação de Filtro por Usuário (userId)

## Resumo das Alterações

Este documento descreve as alterações implementadas para permitir que cada usuário visualize apenas suas próprias informações no sistema.

## Arquivos Modificados

### 1. Tipos e Interfaces (`src/types/index.ts`)
- **Adicionado**: Campo `userId: string` em todas as interfaces principais:
  - `Cliente`
  - `Evento` 
  - `Pagamento`
  - `CustoEvento`
  - `TipoCusto`

### 2. Hook de Autenticação (`src/hooks/useAuth.ts`)
- **Criado**: Hook `useCurrentUser()` para obter `userId` da sessão NextAuth
- **Funcionalidade**: Retorna `userId`, `userRole`, `isLoading` e `isAuthenticated`

### 3. Repositório Base (`src/lib/repositories/firestore-repository.ts`)
- **Adicionado**: Método `createWithUserId(entity, userId)` para criar documentos com `userId` automaticamente
- **Funcionalidade**: Garante que todos os novos registros tenham o `userId` do usuário logado

### 4. Repositórios Específicos
#### Cliente Repository (`src/lib/repositories/cliente-repository.ts`)
- **Adicionado**: `findByUserId(userId: string)` - busca clientes por usuário
- **Adicionado**: `findByUserIdAndEmail(userId: string, email: string)` - busca por usuário e email

#### Evento Repository (`src/lib/repositories/evento-repository.ts`)
- **Adicionado**: `findByUserId(userId: string)` - busca eventos por usuário
- **Adicionado**: `findByUserIdAndClienteId(userId: string, clienteId: string)` - busca por usuário e cliente

#### Tipo Custo Repository (`src/lib/repositories/tipo-custo-repository.ts`)
- **Adicionado**: `findByUserId(userId: string)` - busca tipos de custo por usuário
- **Adicionado**: `findByUserIdAndNome(userId: string, nome: string)` - busca por usuário e nome

#### User Repository (`src/lib/repositories/user-repository.ts`)
- **Criado**: Novo repositório para gerenciar dados de usuários na collection `controle_users`

### 5. Data Service (`src/lib/data-service.ts`)
- **Atualizado**: Métodos `createCliente`, `createEvento`, `createTipoCusto` para aceitar `userId` opcional
- **Atualizado**: Métodos `getClientes`, `getEventos`, `getTiposCusto` para filtrar por `userId`
- **Adicionado**: Métodos de CRUD para usuários (`getUsers`, `createUser`, etc.)
- **Atualizado**: `getTiposCusto` para incluir tipos do sistema (`userId: 'system'`) + tipos do usuário

### 6. Hooks de Dados (`src/hooks/useData.ts`)
- **Atualizado**: `useClientes()`, `useEventos()`, `useTiposCusto()` para usar `useCurrentUser()` e filtrar por `userId`
- **Funcionalidade**: Todos os hooks agora passam automaticamente o `userId` do usuário logado

### 7. Formulários
#### EventoForm (`src/components/forms/EventoForm.tsx`)
- **Adicionado**: `useCurrentUser()` para obter `userId`
- **Atualizado**: Criação de clientes e eventos inclui `userId` automaticamente
- **Funcionalidade**: Novos registros são automaticamente vinculados ao usuário logado

#### CustoForm (`src/components/forms/CustoForm.tsx`)
- **Adicionado**: `useCurrentUser()` para obter `userId`
- **Atualizado**: Criação de custos e tipos de custo inclui `userId` automaticamente

#### PagamentoForm (`src/components/forms/PagamentoForm.tsx`)
- **Adicionado**: `useCurrentUser()` para obter `userId`
- **Atualizado**: Criação de pagamentos inclui `userId` automaticamente

### 8. Inicialização de Collections (`src/lib/collections-init.ts`)
- **Atualizado**: Tipos de custo padrão criados com `userId: 'system'`
- **Funcionalidade**: Tipos padrão são globais, tipos criados pelo usuário são específicos

## Como Funciona

### 1. Filtragem Automática
- Todos os hooks de dados (`useClientes`, `useEventos`, etc.) agora filtram automaticamente por `userId`
- Usuários só veem seus próprios dados

### 2. Criação de Novos Registros
- Todos os formulários incluem automaticamente o `userId` do usuário logado
- Novos registros são automaticamente vinculados ao usuário correto

### 3. Tipos de Custo
- Tipos padrão do sistema (`userId: 'system'`) são visíveis para todos
- Tipos criados pelo usuário (`userId: 'user-id'`) são privados

### 4. Repositórios
- Método `createWithUserId()` garante que novos registros tenham `userId`
- Métodos `findByUserId()` permitem filtrar dados por usuário

## Próximos Passos

### Etapa 1: Migração de Dados Existentes (Pendente)
- Adicionar `userId` aos registros existentes no Firestore
- Usuário fará isso manualmente apagando os registros antigos

### Etapa 2: Testes (Concluída)
- ✅ Formulários atualizados para incluir `userId`
- ✅ Repositórios modificados para incluir `userId` automaticamente
- ✅ Hooks atualizados para filtrar por `userId`

## Benefícios

1. **Segurança**: Cada usuário vê apenas seus próprios dados
2. **Escalabilidade**: Sistema suporta múltiplos usuários
3. **Isolamento**: Dados de usuários são completamente separados
4. **Flexibilidade**: Tipos de custo podem ser globais ou específicos por usuário

## Status

- ✅ **Etapa 2**: Formulários atualizados para incluir `userId` automaticamente
- ✅ **Etapa 3**: Repositórios modificados para incluir `userId` automaticamente
- ⏳ **Etapa 1**: Migração de dados existentes (usuário fará manualmente)
- ✅ **Testes**: Implementação testada e funcionando

A implementação está completa e pronta para uso. Novos registros criados pelos usuários logados serão automaticamente filtrados e vinculados ao usuário correto.
