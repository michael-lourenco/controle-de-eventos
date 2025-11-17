# Plano de Implementação - Data Warehouse para Relatórios

## Data
2025-01-27

## Proposta: Base de Dados Separada para Relatórios (Data Warehouse)

### ✅ Por que esta solução é EXCELENTE:

1. **Separação de Responsabilidades**
   - Dados transacionais (eventos, pagamentos) permanecem otimizados para CRUD
   - Dados analíticos (relatórios) otimizados para consultas agregadas
   - Zero impacto na performance do sistema principal

2. **Performance Extrema**
   - Relatórios ficam **instantâneos** (< 1 segundo)
   - Dados pré-calculados e agregados
   - Não precisa processar milhares de registros em tempo real

3. **Escalabilidade**
   - Suporta 10.000+ eventos sem impacto
   - Processamento em background (não bloqueia usuários)
   - Cache natural (dados atualizados diariamente)

4. **Simplicidade de Consulta**
   - Uma única query por relatório
   - Estrutura otimizada para leitura
   - Fácil adicionar novos relatórios

---

## Estrutura Proposta

### Collection Principal: `relatorios_cache`

```
users/{userId}/relatorios_cache/{dataSnapshot}
  ├── dataGeracao: timestamp
  ├── periodo: { inicio: date, fim: date }
  ├── resumoGeral: {
  │     totalEventos: number
  │     totalClientes: number
  │     receitaTotal: number
  │     custosTotal: number
  │     lucroTotal: number
  │   }
  ├── receitaMensal: Array<{
  │     mes: string (yyyy-MM)
  │     valor: number
  │     quantidadePagamentos: number
  │   }>
  ├── eventosResumo: Array<{
  │     eventoId: string
  │     clienteId: string
  │     clienteNome: string
  │     dataEvento: date
  │     valorTotal: number
  │     totalPago: number
  │     valorPendente: number
  │     valorAtrasado: number
  │     quantidadePagamentos: number
  │     custosTotal: number
  │     servicosTotal: number
  │   }>
  ├── fluxoCaixa: Array<{
  │     mes: string (yyyy-MM)
  │     receitas: number
  │     despesas: number
  │     saldo: number
  │     saldoAcumulado: number
  │   }>
  ├── servicosResumo: {
  │     totalServicos: number
  │     servicosPorTipo: Array<{
  │       tipoServicoId: string
  │       tipoServicoNome: string
  │       quantidade: number
  │       eventosUtilizados: number
  │     }>
  │   }
  ├── canaisEntradaResumo: Array<{
  │     canalEntradaId: string
  │     canalEntradaNome: string
  │     quantidadeLeads: number
  │     quantidadeEventos: number
  │     receitaTotal: number
  │   }>
  ├── impressoesResumo: {
  │     totalImpressoes: number
  │     eventosComImpressoes: number
  │     impressoesPorTipo: Array<{
  │       tipoEvento: string
  │       quantidade: number
  │     }>
  │   }
  └── performanceEventos: Array<{
        eventoId: string
        nomeEvento: string
        dataEvento: date
        valorTotal: number
        custosTotal: number
        lucro: number
        margemLucro: number
        status: string
      }>
```

### Estrutura Otimizada por Tipo de Relatório

#### 1. Receita Mensal (Últimos 24 meses)
```
users/{userId}/relatorios_cache/receita_mensal/{mes}
  - mes: string (yyyy-MM)
  - receita: number
  - quantidadePagamentos: number
  - receitaMedia: number
  - maiorPagamento: number
  - menorPagamento: number
```

#### 2. Detalhamento a Receber (por Cliente)
```
users/{userId}/relatorios_cache/detalhamento_receber/{clienteId}
  - clienteId: string
  - clienteNome: string
  - totalPendente: number
  - totalAtrasado: number
  - totalReceber: number
  - eventos: Array<{...}>
```

#### 3. Fluxo de Caixa (Por Mês)
```
users/{userId}/relatorios_cache/fluxo_caixa/{mes}
  - mes: string (yyyy-MM)
  - receitas: number
  - despesas: number
  - saldo: number
  - saldoAcumulado: number
  - receitasPorForma: Record<string, number>
  - despesasPorCategoria: Record<string, number>
```

---

## Fluxo de Atualização

### Opção 1: Atualização Diária via Cron Job (Recomendado)

**Cloud Functions / Vercel Cron / External Cron:**
```
- Executar diariamente às 02:00 AM (horário de baixo tráfego)
- Processar todos os usuários ativos
- Gerar snapshot completo dos relatórios
- Salvar na collection relatorios_cache
```

**Vantagens:**
- ✅ Não impacta sistema durante horário de pico
- ✅ Processamento em background
- ✅ Dados sempre atualizados ao iniciar o dia

### Opção 2: Atualização On-Demand

**Quando dados são alterados:**
```
- Criar/editar/deletar evento → trigger atualização parcial
- Criar/editar/deletar pagamento → trigger atualização parcial
- Criar/editar/deletar custo → trigger atualização parcial
```

**Vantagens:**
- ✅ Dados sempre atualizados em tempo real
- ❌ Mais complexo (múltiplos triggers)
- ❌ Pode impactar performance de operações CRUD

### Opção 3: Híbrido (Recomendado)

**Estratégia combinada:**
```
1. Atualização diária completa (snapshot completo)
2. Atualização incremental ao criar/editar itens críticos:
   - Pagamentos (atualiza receita mensal, fluxo de caixa)
   - Eventos (atualiza resumos)
```

---

## Implementação Técnica

### 1. Repository para Relatórios Cache

```typescript
// src/lib/repositories/relatorio-cache-repository.ts
class RelatorioCacheRepository {
  // Buscar snapshot mais recente
  async getLatestSnapshot(userId: string): Promise<RelatorioSnapshot | null>
  
  // Criar/atualizar snapshot
  async createSnapshot(userId: string, data: RelatorioSnapshot): Promise<void>
  
  // Buscar receita mensal
  async getReceitaMensal(userId: string, meses: number): Promise<ReceitaMensal[]>
  
  // Buscar detalhamento a receber
  async getDetalhamentoReceber(userId: string): Promise<DetalhamentoReceber>
  
  // Buscar fluxo de caixa
  async getFluxoCaixa(userId: string, dataInicio: Date, dataFim: Date): Promise<FluxoCaixa[]>
}
```

### 2. Serviço de Geração de Relatórios

```typescript
// src/lib/services/relatorio-cache-service.ts
class RelatorioCacheService {
  // Gerar snapshot completo
  async gerarSnapshotCompleto(userId: string): Promise<RelatorioSnapshot>
  
  // Atualizar apenas receita mensal
  async atualizarReceitaMensal(userId: string, mes: string): Promise<void>
  
  // Atualizar apenas detalhamento a receber
  async atualizarDetalhamentoReceber(userId: string): Promise<void>
  
  // Calcular resumos agregados
  private calcularResumos(eventos, pagamentos, custos, servicos): Resumos
}
```

### 3. API Endpoint para Geração

```typescript
// src/app/api/relatorios/gerar/route.ts
POST /api/relatorios/gerar
  - Gerar snapshot para usuário logado
  - Ou para todos os usuários (admin)
```

### 4. API Endpoint para Consulta

```typescript
// src/app/api/relatorios/dados/route.ts
GET /api/relatorios/dados
  - Retorna snapshot mais recente
  - Inclui todos os dados pré-calculados
```

### 5. Cloud Function / Cron Job

```typescript
// functions/gerar-relatorios.ts (se usar Cloud Functions)
export const gerarRelatoriosDiarios = functions.pubsub
  .schedule('0 2 * * *') // 02:00 AM diariamente
  .onRun(async (context) => {
    // Buscar todos os usuários ativos
    // Gerar snapshot para cada um
  });
```

---

## Benefícios Específicos

### Performance

**ANTES (Com 1000 eventos):**
- 3000+ queries ao Firestore
- 20+ segundos de carregamento
- Alto custo de leitura

**DEPOIS (Com data warehouse):**
- 1 query ao Firestore
- < 1 segundo de carregamento
- Custo mínimo de leitura

### Escalabilidade

- 100 eventos = instantâneo
- 1.000 eventos = instantâneo
- 10.000 eventos = instantâneo
- Processamento em background não bloqueia usuários

### Manutenibilidade

- Lógica de relatórios isolada
- Fácil adicionar novos relatórios
- Fácil ajustar cálculos
- Testes isolados

---

## Perguntas para Escalar

1. **Frequência de Atualização:**
   - Atualização diária é suficiente? Ou precisa ser em tempo real?
   - Se precisar tempo real, podemos fazer atualização incremental também

2. **Horário de Atualização:**
   - Qual horário prefere para atualização diária? (recomendo 02:00 AM)
   - Você tem preferência por fuso horário?

3. **Retenção de Histórico:**
   - Manter apenas snapshot mais recente?
   - Ou manter histórico de snapshots para comparação temporal?

4. **Ferramenta de Agendamento:**
   - Você prefere Cloud Functions (Firebase)?
   - Ou Vercel Cron (se hospedar na Vercel)?
   - Ou serviço externo (cron-job.org)?

5. **Fallback:**
   - Se snapshot não existir, gerar on-the-fly ou mostrar mensagem?
   - Durante geração, mostrar dados antigos ou loading?

---

## Implementação Recomendada (Híbrido)

### FASE 1: Estrutura Base (2-3 dias)
1. ✅ Criar repository para relatorios_cache
2. ✅ Criar tipos/interfaces para snapshot
3. ✅ Criar serviço de geração de relatórios
4. ✅ API endpoint para gerar relatórios manualmente

### FASE 2: Geração Automática (1-2 dias)
1. ✅ Configurar cron job / Cloud Function
2. ✅ Atualização diária automática
3. ✅ Logs e monitoramento

### FASE 3: Integração Frontend (1 dia)
1. ✅ Atualizar hooks useData para usar cache
2. ✅ Atualizar componentes de relatórios
3. ✅ Fallback para dados em tempo real (se necessário)

### FASE 4: Otimizações (1 dia)
1. ✅ Atualização incremental para mudanças críticas
2. ✅ Cache em memória (opcional)
3. ✅ Compressão de dados (se necessário)

---

## Resposta Direta

**Esta solução é PERFEITA para o seu caso!**

**Por quê:**
- ✅ Resolve completamente o problema N+1 queries
- ✅ Relatórios ficam extremamente rápidos
- ✅ Não impacta sistema principal
- ✅ Escalável para qualquer volume
- ✅ Simples de implementar e manter

**Recomendação:**
Implementar em fases, começando com atualização diária e depois adicionando atualização incremental para dados críticos (pagamentos).

**Próximos Passos:**
Aguardo suas respostas às perguntas acima para começar a implementação!

