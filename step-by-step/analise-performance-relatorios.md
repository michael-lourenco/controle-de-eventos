# Análise de Performance - Página de Relatórios

## Data
2025-01-27

## Problema Identificado

A página `/relatorios` está demorando mais de 20 segundos para carregar com 100+ eventos. Com 1000 eventos, será inviável.

### Causas Raiz

#### 1. **Problema N+1 Queries (CRÍTICO)**

**Estrutura Atual:**
```
users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
users/{userId}/eventos/{eventoId}/custos/{custoId}
users/{userId}/eventos/{eventoId}/servicos/{servicoId}
```

**Problema:**
- Para buscar todos os pagamentos de 100 eventos = **100 queries ao Firestore**
- Para buscar todos os custos de 100 eventos = **100 queries ao Firestore**
- Para buscar todos os serviços de 100 eventos = **100 queries ao Firestore**
- **Total: 300+ queries apenas para carregar dados básicos**

**Código Problemático:**
```typescript
// src/lib/data-service.ts - getAllPagamentos()
async getAllPagamentos(userId: string): Promise<Pagamento[]> {
  const eventos = await this.getEventos(userId);
  const todosPagamentos: Pagamento[] = [];
  
  // ❌ LOOP COM N QUERIES
  for (const evento of eventos) {
    const pagamentosEvento = await this.getPagamentosPorEvento(userId, evento.id);
    todosPagamentos.push(...pagamentosEvento);
  }
  return todosPagamentos;
}
```

#### 2. **Processamento Síncrono no Frontend**

**DetalhamentoReceberReport.tsx:**
```typescript
// ❌ Promise.all com 100 eventos = 100 queries simultâneas
const resultados = await Promise.all(
  eventos.map(async (evento) => {
    const resumo = await dataService.getResumoFinanceiroPorEvento(...);
    // Cada resumo faz outra query para buscar pagamentos!
  })
);
```

**Impacto:**
- 100 eventos = 100 queries para resumos financeiros
- Cada resumo financeiro = 1 query adicional para pagamentos
- **Total: 200+ queries apenas para um componente**

#### 3. **Carregamento de Dados Desnecessários**

A página de relatórios carrega **TODOS** os dados de uma vez:
- Todos os eventos (incluindo arquivados)
- Todos os pagamentos de todos os eventos
- Todos os custos de todos os eventos
- Todos os serviços de todos os eventos
- Todos os clientes
- Todos os canais de entrada
- Dashboard data completo

**Com 1000 eventos:**
- 1000 queries para pagamentos
- 1000 queries para custos
- 1000 queries para serviços
- **Total: 3000+ queries ao Firestore**

#### 4. **Processamento no Cliente**

Todo o processamento de relatórios acontece no frontend:
- Cálculos de receita mensal
- Agrupamentos por tipo
- Filtros e ordenações
- Geração de gráficos

Com 1000 eventos, isso significa processar milhares de registros no navegador.

---

## Análise da Estrutura Atual

### ✅ O que está BOM:

1. **Isolamento por usuário**: Cada usuário tem seus próprios dados
2. **Subcollections organizadas**: Estrutura lógica e hierárquica
3. **Segurança**: Dados isolados por userId no path

### ❌ O que está RUIM:

1. **Subcollections não permitem queries agregadas**: Não é possível buscar todos os pagamentos de todos os eventos em uma única query
2. **N+1 queries obrigatórias**: Para cada evento, precisa fazer uma query separada
3. **Sem índices otimizados**: Queries não podem ser otimizadas com índices compostos
4. **Sem cache**: Toda vez que acessa relatórios, refaz todas as queries
5. **Sem paginação**: Carrega tudo de uma vez

---

## Soluções Propostas

### SOLUÇÃO 1: Collection Groups (RECOMENDADA - MÉDIO PRAZO)

**O que é:**
Firestore Collection Groups permitem buscar em todas as subcollections com o mesmo nome, independente do path.

**Estrutura mantida:**
```
users/{userId}/eventos/{eventoId}/pagamentos/{pagamentoId}
```

**Query otimizada:**
```typescript
// Buscar TODOS os pagamentos de um usuário em UMA query
const pagamentosRef = collectionGroup(db, 'pagamentos');
const q = query(
  pagamentosRef,
  where('userId', '==', userId), // Precisa adicionar userId no documento
  orderBy('dataPagamento', 'desc')
);
```

**Vantagens:**
- ✅ Mantém estrutura atual
- ✅ Reduz de N queries para 1 query
- ✅ Permite filtros e ordenação
- ✅ Funciona com índices compostos

**Desvantagens:**
- ⚠️ Precisa adicionar `userId` em cada documento de subcollection
- ⚠️ Requer migração de dados existentes
- ⚠️ Precisa criar índices compostos no Firestore

**Impacto esperado:**
- 100 eventos: De 300+ queries para **3 queries** (pagamentos, custos, serviços)
- 1000 eventos: De 3000+ queries para **3 queries**
- **Redução de 99%+ no número de queries**

---

### SOLUÇÃO 2: Reestruturação para Collections de Nível Superior (LONGO PRAZO)

**Nova estrutura:**
```
users/{userId}/pagamentos/{pagamentoId}  // userId + eventoId no documento
users/{userId}/custos/{custoId}          // userId + eventoId no documento
users/{userId}/servicos/{servicoId}      // userId + eventoId no documento
```

**Vantagens:**
- ✅ Queries diretas sem collection groups
- ✅ Mais flexível para filtros complexos
- ✅ Melhor para relatórios agregados

**Desvantagens:**
- ❌ Mudança estrutural grande
- ❌ Requer migração completa de dados
- ❌ Perde hierarquia lógica

---

### SOLUÇÃO 3: Cache e Agregação Pré-calculada (CURTO PRAZO)

**Criar collection de resumos:**
```
users/{userId}/resumos_eventos/{eventoId}
  - totalPago: number
  - valorPendente: number
  - valorAtrasado: number
  - quantidadePagamentos: number
  - ultimaAtualizacao: timestamp
```

**Atualizar resumos:**
- Quando criar/editar/deletar pagamento
- Via Cloud Functions ou triggers

**Vantagens:**
- ✅ Implementação rápida
- ✅ Reduz queries drasticamente
- ✅ Mantém estrutura atual

**Desvantagens:**
- ⚠️ Dados podem ficar desatualizados se não sincronizar
- ⚠️ Requer lógica de sincronização

---

### SOLUÇÃO 4: API Route com Processamento no Servidor (CURTO PRAZO)

**Criar endpoint:**
```
/api/relatorios/dados
```

**Processar no servidor:**
- Buscar dados de forma otimizada
- Processar cálculos no servidor
- Retornar apenas resultados agregados

**Vantagens:**
- ✅ Implementação rápida
- ✅ Reduz carga no cliente
- ✅ Pode usar cache no servidor

**Desvantagens:**
- ⚠️ Ainda tem problema N+1 (mas no servidor)
- ⚠️ Não resolve o problema fundamental

---

### SOLUÇÃO 5: Lazy Loading e Paginação (MELHORIA UX)

**Carregar sob demanda:**
- Carregar apenas relatórios visíveis
- Paginar dados grandes
- Virtual scrolling para listas

**Vantagens:**
- ✅ Melhora percepção de velocidade
- ✅ Reduz uso de memória

**Desvantagens:**
- ⚠️ Não resolve problema de queries
- ⚠️ Ainda lento ao carregar

---

## Recomendação: Abordagem Híbrida

### FASE 1: Solução Imediata (1-2 dias)
1. **API Route para relatórios** com processamento otimizado
2. **Lazy loading** de componentes de relatório
3. **Cache simples** em memória (Redis opcional)

### FASE 2: Otimização Estrutural (1 semana)
1. **Collection Groups** para pagamentos, custos e serviços
2. **Adicionar userId** nos documentos de subcollections
3. **Criar índices compostos** no Firestore
4. **Migração de dados** existentes

### FASE 3: Agregação e Cache (2 semanas)
1. **Resumos pré-calculados** para eventos
2. **Cloud Functions** para manter resumos atualizados
3. **Cache distribuído** (Redis) para relatórios frequentes

---

## Perguntas para Escalar o Escopo

1. **Collection Groups:**
   - Você está disposto a adicionar `userId` em cada documento de subcollection (pagamentos, custos, serviços)?
   - Isso requer uma migração de dados. Aceita?

2. **Índices Firestore:**
   - Você tem acesso ao Firebase Console para criar índices compostos?
   - Os índices têm custo (gratuitos até certo limite). Está ciente?

3. **Cache:**
   - Você tem ou está disposto a configurar Redis para cache?
   - Ou prefere cache em memória (mais simples, mas não persiste entre reinicializações)?

4. **Prioridade:**
   - Qual é mais crítico: velocidade de carregamento inicial ou capacidade de processar muitos dados?
   - Relatórios precisam ser em tempo real ou podem ter delay de alguns minutos?

5. **Escalabilidade:**
   - Quantos usuários simultâneos você espera?
   - Qual o volume médio de eventos por usuário?

6. **Migração:**
   - Você tem dados em produção que precisam ser migrados?
   - Há janela de manutenção disponível?

---

## Resposta Direta

### É suficiente a estrutura atual?

**NÃO**, para relatórios com muitos eventos. A estrutura atual é adequada para:
- ✅ Operações CRUD individuais (criar/editar evento)
- ✅ Visualização de um evento específico
- ✅ Listagem de eventos (até ~100)

**NÃO é adequada para:**
- ❌ Relatórios agregados
- ❌ Buscar todos os pagamentos/custos/serviços
- ❌ Processar grandes volumes de dados

### É possível buscar informações rapidamente?

**SIM**, mas requer mudanças estruturais:

1. **Collection Groups** (recomendado): Permite buscar todos os pagamentos em 1 query ao invés de N
2. **Índices compostos**: Otimizam queries com filtros
3. **Cache**: Reduz necessidade de refazer queries

**Sem mudanças:**
- 100 eventos = 300+ queries = 20+ segundos
- 1000 eventos = 3000+ queries = **inviável**

**Com Collection Groups:**
- 100 eventos = 3 queries = < 1 segundo
- 1000 eventos = 3 queries = < 2 segundos

---

## Próximos Passos

Aguardo suas respostas às perguntas acima para elaborar um plano de implementação detalhado e priorizado.

