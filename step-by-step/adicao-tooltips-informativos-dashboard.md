# Adição de Tooltips Informativos no Dashboard

## Data: 2025-01-27

## Objetivo
Adicionar tooltips informativos em todos os tópicos e métricas da página "/dashboard" para explicar o significado de cada informação e como ela é calculada, seguindo o mesmo padrão estabelecido nos relatórios.

## Alterações Realizadas

### Arquivo Modificado
**Arquivo**: `src/app/dashboard/page.tsx`

### Tooltips Adicionados

#### 1. Stats Grid (Cards Principais)
Tooltips adicionados nos 4 cards principais do topo:

- **Receita Total**: 
  - Descrição: Soma de todos os pagamentos recebidos (com status 'Pago') desde o início. Representa a receita total acumulada da empresa.
  - Cálculo: Receita Total = Soma de todos os pagamentos com status 'Pago' registrados no sistema. Considera todos os pagamentos liquidados, independentemente da data.

- **Total a Receber**: 
  - Descrição: Soma de todos os valores ainda não liquidados (pendentes + em atraso) de todos os eventos. Representa o montante total que a empresa ainda deve receber.
  - Cálculo: Total a Receber = Valor Pendente + Valor em Atraso. Considera apenas eventos com valor previsto maior que zero e que ainda possuem valores não pagos.

- **Total de Eventos**: 
  - Descrição: Quantidade total de eventos cadastrados no sistema, independentemente do status ou data.
  - Cálculo: Total de Eventos = Contagem de todos os eventos cadastrados no sistema, incluindo concluídos, cancelados, pendentes, etc.

- **Eventos Concluídos**: 
  - Descrição: Quantidade de eventos com status 'Concluído' no sistema. Representa eventos finalizados com sucesso.
  - Cálculo: Eventos Concluídos = Contagem de eventos com status = 'Concluído' no sistema.

#### 2. Cards de Seções

- **Eventos de Hoje**: 
  - Descrição: Lista de eventos agendados para o dia atual. Mostra todos os eventos cuja dataEvento corresponde à data de hoje.
  - Cálculo: Eventos de Hoje = Eventos cuja dataEvento é igual à data atual (dia/mês/ano). Considera apenas a data, não a hora.

- **Valores Atrasados**: 
  - Descrição: Quantidade de pagamentos pendentes cuja data de vencimento já passou. Representa valores vencidos que precisam de atenção para cobrança.
  - Cálculo: Valores Atrasados = Contagem de pagamentos com status 'Pendente' cuja data de vencimento (diaFinalPagamento do evento) já passou.

- **Próximos Eventos (7 dias)**: 
  - Descrição: Lista de eventos agendados para os próximos 7 dias a partir de hoje. Ajuda no planejamento e preparação dos eventos.
  - Cálculo: Próximos Eventos = Eventos cuja dataEvento está entre hoje e os próximos 7 dias (inclusive). Ordenados por data mais próxima primeiro.

#### 3. Resumo Financeiro

- **Receita do Mês**: 
  - Descrição: Soma de todos os pagamentos recebidos (com status 'Pago') no mês atual. Representa a receita efetivamente recebida no mês corrente.
  - Cálculo: Receita do Mês = Soma de todos os pagamentos com status 'Pago' e dataPagamento dentro do mês atual (1º ao último dia do mês).

- **Receita do Ano**: 
  - Descrição: Soma de todos os pagamentos recebidos (com status 'Pago') no ano atual. Representa a receita acumulada desde o início do ano.
  - Cálculo: Receita do Ano = Soma de todos os pagamentos com status 'Pago' e dataPagamento dentro do ano atual (1º de janeiro até hoje).

- **Total de Pagamentos**: 
  - Descrição: Quantidade total de pagamentos pendentes registrados no sistema. Representa pagamentos que ainda não foram liquidados.
  - Cálculo: Total de Pagamentos = Contagem de pagamentos com status 'Pendente' no sistema. Inclui pagamentos dentro do prazo e em atraso.

## Padrão Estabelecido

Todos os tooltips seguem o mesmo padrão dos relatórios:
1. **Título**: Nome da métrica/seção
2. **Descrição**: O que a métrica significa e sua importância
3. **Cálculo**: Como a métrica é calculada, incluindo fórmulas quando relevante

## Componentes Utilizados

- `InfoTooltip`: Componente reutilizável criado anteriormente para exibir tooltips informativos
- Ícone de informação (i) com tamanho adequado (h-5 w-5) para os cards menores
- Tooltips adaptam-se corretamente aos temas claro/escuro

## Implementação Técnica

- Tooltips foram adicionados diretamente nos títulos e labels das métricas
- Para os cards do Stats Grid, os tooltips foram adicionados condicionalmente baseados no nome da métrica
- Todos os tooltips utilizam o mesmo componente `InfoTooltip` para consistência visual
- Os tooltips não interferem na funcionalidade de clique dos cards

## Benefícios

1. **Transparência**: Usuários entendem o que cada métrica significa no dashboard
2. **Educação**: Usuários aprendem como os cálculos são feitos
3. **Confiança**: Maior confiança nos dados apresentados
4. **Padronização**: Dashboard segue o mesmo padrão de documentação dos relatórios
5. **Acessibilidade**: Informações disponíveis através de tooltips sem poluir a interface
6. **Consistência**: Experiência uniforme entre dashboard e relatórios

## Arquivos Modificados

1. `src/app/dashboard/page.tsx`

## Notas Técnicas

- Todos os tooltips utilizam o componente `InfoTooltip` já existente
- Tooltips são opcionais e não quebram a funcionalidade se não fornecidos
- Ícones de informação têm tamanho adequado (h-5 w-5) para boa visibilidade nos cards menores
- Tooltips funcionam corretamente em modo claro e escuro
- Não há erros de lint após as alterações
- Os tooltips foram posicionados de forma a não interferir na interatividade dos cards clicáveis

