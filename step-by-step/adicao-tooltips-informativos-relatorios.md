# Adição de Tooltips Informativos em Todos os Relatórios

## Data: 2025-01-27

## Objetivo
Adicionar tooltips informativos em todos os tópicos e métricas da página "/relatorios" para explicar o significado de cada informação e como ela é calculada, estabelecendo um padrão de documentação para os usuários.

## Alterações Realizadas

### 1. Melhorias no Componente StatCard
**Arquivo**: `src/components/charts/StatCard.tsx` e `src/types/charts.ts`

- Adicionada prop opcional `tooltip` ao `StatCardProps` para suportar tooltips informativos
- Modificado o componente `StatCard` para exibir o `InfoTooltip` quando a prop `tooltip` for fornecida
- Permite adicionar tooltips de forma consistente em todos os cards de estatísticas

### 2. Melhorias no Componente TabbedChart
**Arquivo**: `src/components/charts/ChartContainer.tsx` e `src/types/charts.ts`

- Adicionada prop opcional `titleTooltip` ao `TabbedChartProps` e `ChartContainerProps`
- Modificado o componente `ChartContainer` para exibir tooltip no título quando fornecido
- Permite adicionar tooltips nos títulos dos gráficos com abas

### 3. DetalhamentoReceberReport
**Arquivo**: `src/components/relatorios/DetalhamentoReceberReport.tsx`

Tooltips adicionados:
- **Total a Receber**: Explica que é a soma de valores pendentes e em atraso
- **Valor Pendente**: Explica valores dentro do prazo de vencimento
- **Valor em Atraso**: Explica valores vencidos que precisam de atenção

### 4. ReceitaMensalReport
**Arquivo**: `src/components/relatorios/ReceitaMensalReport.tsx`

Tooltips adicionados:
- **Receita Total**: Explica soma de pagamentos recebidos no período
- **Média Mensal**: Explica cálculo da média de receita por mês
- **Maior Receita**: Explica o maior valor mensal registrado
- **Menor Receita**: Explica o menor valor mensal (excluindo zeros)
- **Meses c/ Receita**: Explica quantidade de meses com receita vs total
- **Receita Mensal** (gráfico): Explica evolução temporal da receita

### 5. PerformanceEventosReport
**Arquivo**: `src/components/relatorios/PerformanceEventosReport.tsx`

Tooltips adicionados:
- **Total de Eventos**: Explica contagem de eventos no período
- **Concluídos**: Explica eventos com status concluído
- **Cancelados**: Explica eventos cancelados
- **Taxa de Conclusão**: Explica percentual de eventos concluídos
- **Eventos por Status** (gráfico): Explica distribuição por status
- **Eventos por Tipo** (gráfico): Explica distribuição por tipo de evento

### 6. FluxoCaixaReport
**Arquivo**: `src/components/relatorios/FluxoCaixaReport.tsx`

Tooltips adicionados:
- **Receita Total**: Explica soma de pagamentos recebidos
- **Despesa Total**: Explica soma de custos cadastrados
- **Saldo Atual**: Explica diferença entre receitas e despesas
- **Variação do Saldo**: Explica percentual de variação em relação ao mês anterior
- **Fluxo de Caixa Mensal** (gráfico): Explica evolução de receitas, despesas e saldo
- **Receitas por Forma de Pagamento** (gráfico): Explica distribuição por forma de pagamento
- **Despesas por Categoria** (gráfico): Explica distribuição por categoria de custo
- **Projeções para os Próximos 3 Meses**: Explica como as projeções são calculadas

### 7. ServicosReport
**Arquivo**: `src/components/relatorios/ServicosReport.tsx`

Tooltips adicionados:
- **Total de Serviços**: Explica soma de serviços contratados
- **Tipos Únicos**: Explica quantidade de tipos diferentes de serviços
- **Eventos com Serviços**: Explica eventos que possuem serviços cadastrados
- **Taxa de Utilização**: Explica percentual de eventos com serviços
- **Serviços por Tipo** (gráfico): Explica distribuição por tipo de serviço
- **Tipos em Alta**: Já existia, mantido
- **Crescimento**: Já existia, mantido

### 8. CanaisEntradaReport
**Arquivo**: `src/components/relatorios/CanaisEntradaReport.tsx`

Tooltips adicionados:
- **Total de Clientes**: Explica contagem de clientes no período
- **Canais Ativos**: Explica quantidade de canais diferentes utilizados
- **Taxa de Preenchimento**: Explica percentual de clientes com canal cadastrado
- **Clientes sem Canal**: Explica clientes sem canal de entrada
- **Clientes por Canal de Entrada** (gráfico): Explica distribuição por canal
- **Clientes por Mês** (gráfico): Explica evolução temporal de clientes
- **Taxa de Conversão por Canal** (gráfico): Explica efetividade de cada canal
- **Tendências e Insights**:
  - Canal Mais Efetivo
  - Canal Menos Efetivo
  - Crescimento de Leads
  - Canais em Alta

### 9. ImpressoesReport
**Arquivo**: `src/components/relatorios/ImpressoesReport.tsx`

Tooltips adicionados:
- **Total de Impressões**: Explica soma de impressões realizadas
- **Eventos com Impressões**: Explica eventos que utilizaram impressões
- **Taxa de Utilização**: Explica percentual de eventos com impressões
- **Custo Médio por Impressão**: Explica custo fixo por impressão (R$ 0,50)
- **Impressões por Tipo de Evento** (gráfico): Explica distribuição por tipo
- **Impressões por Mês** (gráfico): Explica evolução temporal
- **Custo de Impressões por Tipo** (gráfico): Explica análise custo-benefício
- **Top Eventos com Mais Impressões**: Explica lista de eventos com maior volume
- **Tendências e Insights**:
  - Evento com Mais Impressões
  - Evento com Menos Impressões
  - Crescimento de Impressões
  - Tipos Mais Impressos

## Padrão Estabelecido

Todos os tooltips seguem o mesmo padrão:
1. **Título**: Nome da métrica/seção
2. **Descrição**: O que a métrica significa e sua importância
3. **Cálculo** (quando aplicável): Como a métrica é calculada, incluindo fórmulas quando relevante

## Componentes Utilizados

- `InfoTooltip`: Componente reutilizável criado anteriormente para exibir tooltips informativos
- Ícone de informação (i) visível e acessível
- Tooltips adaptam-se corretamente aos temas claro/escuro

## Benefícios

1. **Transparência**: Usuários entendem o que cada métrica significa
2. **Educação**: Usuários aprendem como os cálculos são feitos
3. **Confiança**: Maior confiança nos dados apresentados
4. **Padronização**: Todos os relatórios seguem o mesmo padrão de documentação
5. **Acessibilidade**: Informações disponíveis através de tooltips sem poluir a interface

## Arquivos Modificados

1. `src/components/charts/StatCard.tsx`
2. `src/types/charts.ts`
3. `src/components/charts/ChartContainer.tsx`
4. `src/components/relatorios/DetalhamentoReceberReport.tsx`
5. `src/components/relatorios/ReceitaMensalReport.tsx`
6. `src/components/relatorios/PerformanceEventosReport.tsx`
7. `src/components/relatorios/FluxoCaixaReport.tsx`
8. `src/components/relatorios/ServicosReport.tsx`
9. `src/components/relatorios/CanaisEntradaReport.tsx`
10. `src/components/relatorios/ImpressoesReport.tsx`

## Notas Técnicas

- Todos os tooltips utilizam o componente `InfoTooltip` já existente
- Tooltips são opcionais e não quebram a funcionalidade se não fornecidos
- Ícones de informação têm tamanho adequado (h-6 w-6) para boa visibilidade
- Tooltips funcionam corretamente em modo claro e escuro
- Não há erros de lint após as alterações

