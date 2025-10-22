# Correção: Inicialização Automática de Subcollections

## Problema Identificado

O sistema estava falhando ao tentar criar novos tipos de serviço porque a subcollection `tipo_servicos` não existia ainda para o usuário. O Firestore não cria subcollections automaticamente - elas só são criadas quando o primeiro documento é adicionado.

## Solução Implementada

### 1. Adicionado Método de Inicialização

Criado o método `ensureSubcollectionExists()` nos repositórios `TipoServicoRepository` e `TipoCustoRepository` que:

- Verifica se a subcollection existe fazendo uma query simples
- Se não existir, cria um documento temporário para inicializar a subcollection
- Remove imediatamente o documento temporário
- Garante que a subcollection esteja disponível para operações futuras

### 2. Integração em Todos os Métodos

Todos os métodos dos repositórios agora chamam `ensureSubcollectionExists()` antes de executar operações:

- `findByNome()`
- `getAtivos()`
- `searchByName()`
- `createTipoServico()`
- `updateTipoServico()`
- `deleteTipoServico()`
- `getTipoServicoById()`

### 3. Arquivos Modificados

- `src/lib/repositories/servico-repository.ts`
- `src/lib/repositories/custo-repository.ts`

### 4. Imports Adicionados

- `limit` do Firebase Firestore para fazer queries de teste

## Benefícios

1. **Robustez**: O sistema agora funciona mesmo quando o usuário nunca criou tipos de serviço/custo antes
2. **Transparência**: A inicialização é automática e transparente para o usuário
3. **Consistência**: Ambos os repositórios (serviços e custos) têm o mesmo comportamento
4. **Performance**: A verificação é feita apenas quando necessário

## Como Funciona

1. Usuário tenta criar um novo tipo de serviço
2. Sistema verifica se a subcollection `tipo_servicos` existe
3. Se não existir, cria um documento temporário para inicializá-la
4. Remove o documento temporário
5. Continua com a operação normal de criação

## Teste

Para testar a correção:

1. Acesse um evento existente
2. Vá para a seção "Serviços"
3. Clique em "Novo Serviço"
4. No dropdown "Tipo de Serviço", digite um nome que não existe
5. Clique em "Criar novo tipo"
6. O sistema deve criar o tipo automaticamente e selecioná-lo no dropdown

A correção garante que o sistema funcione corretamente mesmo para usuários novos que nunca criaram tipos de serviço ou custo antes.
