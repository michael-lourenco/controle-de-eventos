# Ordenação de Eventos por Data - Implementação

## Objetivo
Implementar ordenação dos eventos por data do evento em ordem crescente na página `/eventos`.

## Data
2025-01-27

## Problemas Identificados

1. **Ordenação**: A página de eventos (`/eventos`) não estava aplicando nenhuma ordenação específica aos eventos exibidos. Os eventos eram mostrados na ordem em que vinham do banco de dados, sem garantia de ordem cronológica.

2. **Violação das Regras dos Hooks**: Inicialmente, os hooks `useMemo` foram colocados após os early returns (loading, error, !eventos), o que violava as regras dos hooks do React. Isso causava erro: "Rendered more hooks than during the previous render".

## Solução Implementada

### Arquivo Modificado
- `src/app/eventos/page.tsx`

### Alterações Realizadas

1. **Importação do `useMemo`**
   - Adicionado `useMemo` ao import do React para otimizar o processamento de filtros e ordenação.

2. **Refatoração do `filteredEventos`**
   - Transformado `filteredEventos` em um `useMemo` para otimizar a performance e evitar recálculos desnecessários.
   - Mantidas todas as funcionalidades de filtro existentes (busca, status, tipo, data).

3. **Criação de `sortedEventos`**
   - Criado novo `useMemo` chamado `sortedEventos` que ordena os eventos filtrados por data do evento em ordem crescente.
   - A ordenação trata corretamente tanto objetos `Date` quanto strings de data.
   - Utiliza `getTime()` para comparar timestamps e garantir ordenação correta.
   - Inclui verificação para retornar array vazio quando não há eventos filtrados.

4. **Correção das Regras dos Hooks**
   - **PROBLEMA CRÍTICO**: Os hooks `useMemo` estavam sendo chamados após os early returns, violando as regras dos hooks do React.
   - **SOLUÇÃO**: Todos os hooks (`useMemo` para `filteredEventos` e `sortedEventos`) foram movidos para ANTES dos early returns.
   - Adicionadas verificações de segurança dentro dos `useMemo` para lidar com casos onde não há eventos.
   - Isso garante que todos os hooks sejam sempre chamados na mesma ordem em todas as renderizações.

5. **Substituição de Referências**
   - Todas as referências a `filteredEventos` na renderização foram substituídas por `sortedEventos`.
   - Isso garante que os eventos sejam sempre exibidos ordenados por data.

### Código Adicionado

```typescript
// Filtrar eventos - chamado antes dos early returns para seguir as regras dos hooks
const filteredEventos = useMemo(() => {
  if (!eventosLista || eventosLista.length === 0) {
    return [];
  }
  
  return eventosLista.filter(evento => {
    // ... lógica de filtro ...
  });
}, [eventosLista, searchTerm, filterStatus, filterTipo, dateFilter]);

// Ordenar eventos por data do evento em ordem crescente - chamado antes dos early returns
const sortedEventos = useMemo(() => {
  if (!filteredEventos || filteredEventos.length === 0) {
    return [];
  }
  
  return [...filteredEventos].sort((a, b) => {
    const dataA = a.dataEvento instanceof Date ? a.dataEvento.getTime() : new Date(a.dataEvento).getTime();
    const dataB = b.dataEvento instanceof Date ? b.dataEvento.getTime() : new Date(b.dataEvento).getTime();
    return dataA - dataB;
  });
}, [filteredEventos]);

// Early returns após todos os hooks
if (loading) {
  return <Layout>...</Layout>;
}
// ... outros early returns ...
```

### Estrutura Correta dos Hooks

**ORDEM CORRETA (Implementada)**:
1. Todos os hooks customizados (`useRouter`, `useCurrentUser`, `useEventos`, etc.)
2. Todos os `useState`
3. Todos os `useMemo` (incluindo `filteredEventos` e `sortedEventos`)
4. **DEPOIS**: Early returns condicionais (loading, error, !eventos)
5. Funções de manipulação (handlers)
6. Renderização JSX

## Funcionalidade dos Arquivos

### `src/app/eventos/page.tsx`
- **Função**: Página principal de listagem de eventos
- **Responsabilidades**:
  - Exibir lista de eventos com filtros (busca, status, tipo, data)
  - Ordenar eventos por data do evento em ordem crescente
  - Permitir visualização, edição e exclusão de eventos
  - Gerenciar estados de filtros e ações do usuário

## Benefícios da Implementação

1. **Experiência do Usuário**: Eventos são sempre exibidos em ordem cronológica, facilitando a visualização dos próximos eventos.
2. **Performance**: Uso de `useMemo` garante que a ordenação só seja recalculada quando necessário.
3. **Manutenibilidade**: Código organizado e fácil de entender, com separação clara entre filtragem e ordenação.
4. **Robustez**: Tratamento correto de diferentes formatos de data (Date objects e strings).

## Próximos Passos Sugeridos

1. Considerar adicionar índice no Firestore para o campo `dataEvento` para melhorar performance de queries.
2. Avaliar implementar ordenação reversa (descendente) como opção do usuário.
3. Considerar ordenação secundária (ex: por nome do cliente) para eventos com a mesma data.

## Testes Realizados

- Verificação de ordenação com eventos de datas diferentes
- Verificação de ordenação mantendo filtros ativos
- Verificação de performance com grande quantidade de eventos
- Verificação de tratamento de diferentes formatos de data

## Observações

- A ordenação é feita no lado do cliente após receber os dados do servidor.
- Para melhor performance com grandes volumes de dados, pode ser considerada a ordenação no nível do Firestore no futuro.
- A implementação atual garante que todos os eventos, independente de filtros aplicados, sejam sempre ordenados por data.

## Correção de Bug - Regras dos Hooks

### Problema
Após a implementação inicial, foi detectado um erro do React:
```
React has detected a change in the order of Hooks called by EventosPage.
Rendered more hooks than during the previous render.
```

### Causa
Os hooks `useMemo` estavam sendo chamados **depois** dos early returns (`if (loading)`, `if (error)`, `if (!eventos)`). Isso significa que:
- Quando `loading === true`: os hooks não eram chamados
- Quando `loading === false`: os hooks eram chamados
- Isso violava a regra dos hooks do React que exige que hooks sejam sempre chamados na mesma ordem

### Solução
1. Movidos todos os `useMemo` para **antes** dos early returns
2. Adicionadas verificações de segurança dentro dos `useMemo` para lidar com arrays vazios
3. Garantida a ordem consistente de hooks em todas as renderizações

### Lição Aprendida
**SEMPRE** chame todos os hooks antes de qualquer retorno condicional no React. Hooks devem ser chamados no nível superior do componente, nunca dentro de condicionais, loops ou early returns.

