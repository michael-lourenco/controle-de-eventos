# Implementação de Canais de Entrada

## Data: 23 de outubro de 2025

## Objetivo
Implementar sistema de canais de entrada para rastrear como os clientes chegam ao negócio, substituindo o campo "Como nos encontrou?" por um sistema estruturado.

## Alterações Realizadas

### 1. **Tipos e Interfaces (`src/types/index.ts`)**
- ✅ Criado interface `CanalEntrada` com campos: id, nome, descricao, ativo, dataCadastro
- ✅ Atualizado interface `Cliente`:
  - Removido campo `comoConheceu`
  - Adicionado `canalEntradaId?: string`
  - Adicionado `canalEntrada?: CanalEntrada`

### 2. **Collections Firestore (`src/lib/firestore/collections.ts`)**
- ✅ Adicionado `CANAIS_ENTRADA: 'canais_entrada'` nas collections
- ✅ Criado schema para `CANAIS_ENTRADA` com campos: id, nome, descricao, ativo, dataCadastro
- ✅ Atualizado schema de `CLIENTES`:
  - Removido `comoConheceu: 'string?'`
  - Adicionado `canalEntradaId: 'string?'`

### 3. **Repositório (`src/lib/repositories/canal-entrada-repository.ts`)**
- ✅ Criado `CanalEntradaRepository` baseado em `TipoServicoRepository`
- ✅ Implementado métodos:
  - `findByNome`, `getAtivos`, `searchByName`
  - `createCanalEntrada`, `updateCanalEntrada`, `deleteCanalEntrada`
  - `getCanalEntradaById`
  - `ensureSubcollectionExists` para inicializar subcollection

### 4. **Repository Factory (`src/lib/repositories/repository-factory.ts`)**
- ✅ Adicionado import de `CanalEntradaRepository`
- ✅ Adicionado propriedade `canalEntradaRepository`
- ✅ Inicializado no constructor
- ✅ Criado método `getCanalEntradaRepository()`

### 5. **Data Service (`src/lib/data-service.ts`)**
- ✅ Adicionado import de `CanalEntrada`
- ✅ Adicionado `canalEntradaRepo` como propriedade
- ✅ Implementado métodos:
  - `getCanaisEntrada`, `getCanaisEntradaAtivos`
  - `getCanalEntradaById`, `createCanalEntrada`
  - `updateCanalEntrada`, `deleteCanalEntrada`
  - `searchCanaisEntrada`

### 6. **Hooks (`src/hooks/useData.ts`)**
- ✅ Adicionado import de `CanalEntrada`
- ✅ Criado hook `useCanaisEntrada()` que retorna canais ativos

### 7. **Formulário de Evento (`src/components/forms/EventoForm.tsx`)**
- ✅ Adicionado imports de `CanalEntrada` e `useCanaisEntrada`
- ✅ Adicionado import de `SelectWithSearch`
- ✅ Atualizado `FormData.novoCliente`:
  - Removido `comoConheceu?: string`
  - Adicionado `canalEntradaId?: string`
- ✅ Atualizado estado inicial e carregamento de evento
- ✅ Substituído campo "Como nos encontrou?" por `SelectWithSearch` para canais de entrada
- ✅ Implementado `handleCreateCanalEntrada()` para criar novos canais
- ✅ Configurado `SelectWithSearch` com:
  - Opções dos canais existentes
  - Funcionalidade de criar novo canal
  - Integração com `formData.novoCliente.canalEntradaId`

### 8. **Página de Gerenciamento (`src/app/canais-entrada/page.tsx`)**
- ✅ Criada página completa baseada em `tipos-servicos/page.tsx`
- ✅ Funcionalidades implementadas:
  - Listagem de canais com busca
  - Criação de novos canais
  - Edição de canais existentes
  - Exclusão com confirmação
  - Status ativo/inativo
  - Validação de formulário

### 9. **Navegação (`src/components/Layout.tsx`)**
- ✅ Adicionado link "Canais de Entrada" na navegação administrativa

### 10. **Cliente Repository (`src/lib/repositories/cliente-repository.ts`)**
- ✅ Atualizado `getClienteById()` para carregar canal de entrada quando disponível
- ✅ Implementado carregamento lazy do `CanalEntrada` object

## Funcionalidades Implementadas

### **Para Usuários:**
- ✅ Seleção de canal de entrada no cadastro de clientes
- ✅ Criação de novos canais diretamente no formulário
- ✅ Gerenciamento completo de canais de entrada
- ✅ Busca e filtros na listagem

### **Para Administradores:**
- ✅ Página dedicada para gerenciar canais de entrada
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Controle de status ativo/inativo
- ✅ Validação de dados

## Estrutura de Dados

### **CanalEntrada:**
```typescript
{
  id: string;
  nome: string;        // Ex: "Instagram", "Boca a boca"
  descricao: string;   // Descrição opcional
  ativo: boolean;      // Status do canal
  dataCadastro: Date;  // Data de criação
}
```

### **Cliente (atualizado):**
```typescript
{
  // ... outros campos
  canalEntradaId?: string;     // ID do canal de entrada
  canalEntrada?: CanalEntrada; // Objeto completo (carregado quando necessário)
}
```

## Migração de Dados
- ✅ Campo `comoConheceu` removido do schema
- ✅ Campo `canalEntradaId` adicionado como opcional
- ✅ Dados existentes não são afetados (campo opcional)

## Próximos Passos Sugeridos
1. Migrar dados existentes de `comoConheceu` para canais de entrada
2. Adicionar relatórios por canal de entrada
3. Implementar analytics de conversão por canal
4. Adicionar validação de canais únicos por nome
