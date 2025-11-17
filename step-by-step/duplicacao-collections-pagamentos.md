# Duplicação de Collections de Pagamentos

## 📋 Resumo da Implementação

Esta implementação cria uma segunda collection de pagamentos para otimizar consultas e relatórios, mantendo os dados sincronizados entre ambas as collections.

## 🎯 Objetivo

Criar uma estrutura duplicada de pagamentos para permitir:
- **Collection 1 (existente)**: `users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}` - Usada para consultas por evento
- **Collection 2 (nova)**: `users/{userId}/pagamentos/{pagamentoId}{eventoId}` - Usada para consultas gerais e relatórios

## 📁 Arquivos Criados

### 1. `src/lib/repositories/pagamento-global-repository.ts`

**Função**: Repository para gerenciar a collection global de pagamentos.

**Principais métodos**:
- `createPagamento()`: Cria um pagamento na collection global
- `updatePagamento()`: Atualiza um pagamento na collection global
- `deletePagamento()`: Marca um pagamento como cancelado na collection global
- `findAll()`: Busca todos os pagamentos de um usuário
- `findByEventoId()`: Busca pagamentos por evento
- `findByStatus()`: Busca pagamentos por status
- `findByDataPagamento()`: Busca pagamentos por período

**Estrutura do ID do documento**: `{pagamentoId}{eventoId}` - concatenação dos IDs para garantir unicidade.

**Campos armazenados**: Além dos dados do pagamento, armazena `pagamentoId`, `eventoId` e `userId` para facilitar recuperação e consultas.

## 📝 Arquivos Modificados

### 2. `src/lib/repositories/pagamento-repository.ts`

**Alterações**:
- Adicionada instância de `PagamentoGlobalRepository`
- Modificado `createPagamento()` para sincronizar com collection global após criar na collection principal
- Modificado `updatePagamento()` para sincronizar com collection global após atualizar na collection principal
- Modificado `deletePagamento()` para sincronizar com collection global após cancelar na collection principal

**Estratégia de sincronização**: 
- A sincronização é feita em try-catch para não quebrar o fluxo principal caso haja erro na collection global
- Erros são logados mas não interrompem a operação principal

### 3. `src/app/api/pagamentos/atualiza-pagamento/route.ts` (NOVO)

**Função**: Endpoint POST para normalizar pagamentos existentes.

**Como funciona**:
1. Busca todos os eventos do usuário autenticado
2. Para cada evento, busca todos os pagamentos
3. Para cada pagamento, verifica se já existe na collection global
4. Se não existir, cria na collection global
5. Retorna estatísticas do processo

**Resposta**:
```json
{
  "success": true,
  "message": "Normalização de pagamentos concluída",
  "estatisticas": {
    "totalProcessados": 100,
    "totalCriados": 50,
    "totalErros": 0,
    "totalEventos": 10
  },
  "erros": []
}
```

**Uso**: 
- Chamar via POST para `/api/pagamentos/atualiza-pagamento`
- Requer autenticação
- Pode ser executado múltiplas vezes (idempotente)

## 🔄 Fluxo de Sincronização

### Criação de Pagamento
```
1. Usuário cria pagamento
2. PagamentoRepository.createPagamento()
   ├─ Cria na collection: users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
   └─ Sincroniza com: users/{userId}/pagamentos/{pagamentoId}{eventoId}
```

### Atualização de Pagamento
```
1. Usuário atualiza pagamento
2. PagamentoRepository.updatePagamento()
   ├─ Atualiza na collection: users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
   └─ Sincroniza com: users/{userId}/pagamentos/{pagamentoId}{eventoId}
```

### Cancelamento de Pagamento
```
1. Usuário cancela pagamento
2. PagamentoRepository.deletePagamento()
   ├─ Marca como cancelado em: users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
   └─ Sincroniza com: users/{userId}/pagamentos/{pagamentoId}{eventoId}
```

## 🎨 Estrutura de Dados

### Collection Principal (Eventos)
```
users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
```

### Collection Global (Pagamentos)
```
users/{userId}/pagamentos/{pagamentoId}{eventoId}
```

**Campos do documento na collection global**:
- Todos os campos do pagamento original
- `pagamentoId`: ID original do pagamento (para facilitar recuperação)
- `eventoId`: ID do evento (para consultas e filtros)
- `userId`: ID do usuário (para segurança e consultas)

## 🔍 Consultas Otimizadas

### Por Evento (Collection Principal)
```typescript
// Usa: users/{userId}/eventos/{eventoId}/pagamentos
const pagamentos = await pagamentoRepo.findByEventoId(userId, eventoId);
```

### Todos os Pagamentos (Collection Global)
```typescript
// Usa: users/{userId}/pagamentos
const todosPagamentos = await pagamentoGlobalRepo.findAll(userId);
```

### Por Status (Collection Global)
```typescript
// Usa: users/{userId}/pagamentos com filtro de status
const pagamentosPagos = await pagamentoGlobalRepo.findByStatus(userId, 'Pago');
```

### Por Período (Collection Global)
```typescript
// Usa: users/{userId}/pagamentos com filtro de data
const pagamentos = await pagamentoGlobalRepo.findByDataPagamento(
  userId, 
  dataInicio, 
  dataFim
);
```

## ✅ Implementações Concluídas

### 1. Repository Factory
- Adicionado `PagamentoGlobalRepository` ao `RepositoryFactory`
- Método `getPagamentoGlobalRepository()` disponível

### 2. DataService
- Atualizado método `getAllPagamentos()` para usar a collection global
- Busca otimizada: uma única query na collection global ao invés de N queries (uma por evento)
- Preenche informações do evento usando um Map para lookup eficiente

### 3. Página de Pagamentos
- Página `/pagamentos` já existente e funcionando
- Usa `useAllPagamentos()` hook que chama `dataService.getAllPagamentos()`
- Agora busca diretamente da collection global `users/{userId}/pagamentos`

## 🚀 Próximos Passos Sugeridos

1. **Migração de Dados Existentes**: Executar o endpoint `/api/pagamentos/atualiza-pagamento` para normalizar dados existentes

2. **Uso em Relatórios**: Atualizar serviços de relatórios para usar a collection global quando necessário

3. **Monitoramento**: Adicionar logs/métricas para monitorar a sincronização entre collections

4. **Validação**: Criar testes para garantir que a sincronização funciona corretamente

5. **Otimização de Consultas**: Avaliar quais consultas devem usar qual collection para melhor performance

## ⚠️ Considerações Importantes

1. **Consistência**: A sincronização é assíncrona e pode falhar. Em caso de erro, o pagamento é criado/atualizado na collection principal, mas pode não estar na collection global.

2. **Idempotência**: O endpoint de normalização pode ser executado múltiplas vezes sem problemas (verifica se já existe antes de criar).

3. **Performance**: A duplicação de dados aumenta o uso de armazenamento, mas melhora significativamente a performance de consultas gerais.

4. **Manutenção**: Qualquer alteração na estrutura de dados do pagamento deve ser refletida em ambas as collections.

## 📊 Análise de Escalabilidade e Manutenibilidade

### Escalabilidade
- ✅ Consultas por evento continuam rápidas (collection principal)
- ✅ Consultas gerais são otimizadas (collection global)
- ✅ Estrutura permite crescimento sem degradação de performance
- ⚠️ Duplicação de dados aumenta uso de armazenamento (trade-off aceitável)

### Manutenibilidade
- ✅ Código bem organizado com repositories separados
- ✅ Sincronização centralizada no PagamentoRepository
- ✅ Endpoint de normalização permite correção de inconsistências
- ⚠️ Necessário manter sincronização manual em caso de mudanças diretas no Firestore

### Melhorias Futuras
1. Implementar transações do Firestore para garantir consistência atômica
2. Adicionar retry logic para sincronização em caso de falhas temporárias
3. Criar job de background para verificar e corrigir inconsistências
4. Implementar cache para reduzir leituras do Firestore
5. Considerar usar Cloud Functions para sincronização automática

