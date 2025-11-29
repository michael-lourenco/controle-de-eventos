# Melhoria do Gráfico "Serviços por Tipo de Evento"

## Data
2025-01-27

## Problema Identificado
No relatório de serviços (`/relatorios`), na seção "Serviços por Tipo de Evento", o gráfico apresentava legendas genéricas que não informavam quais serviços estavam sendo exibidos:
- "Total de Serviços"
- "Serviço Mais Utilizado"
- "2º Mais Utilizado"
- "3º Mais Utilizado"

Essas legendas não eram informativas, pois não indicavam quais serviços específicos estavam sendo representados.

## Análise
- **Arquivo afetado**: `src/components/relatorios/ServicosReport.tsx`
- **Componente**: Gráfico "Serviços por Tipo de Evento"
- **Problema**: Legendas genéricas sem nomes dos serviços
- **Impacto**: Dificuldade em interpretar os dados do gráfico

## Solução Implementada

### Alterações Realizadas

#### 1. Remoção do Gráfico "Serviços por Mês"
O gráfico "Serviços por Mês" foi removido para dar espaço ao gráfico "Serviços por Tipo de Evento", que agora ocupa toda a largura horizontal.

**Antes:**
- Grid com 2 colunas: "Serviços por Mês" (esquerda) e "Serviços por Tipo de Evento" (direita)

**Depois:**
- Card único: "Serviços por Tipo de Evento" ocupando toda a largura

#### 2. Modificação dos Dados do Gráfico
Os dados do gráfico foram modificados para incluir os nomes dos serviços junto com as quantidades:

```tsx
const servicosPorTipoEventoChartData = dadosServicos.servicosPorTipoEvento.map(item => ({
  tipoEvento: item.tipoEvento,
  quantidadeServicos: item.quantidadeServicos,
  topServico1: item.tiposMaisUtilizados[0]?.quantidade || 0,
  topServico1Nome: item.tiposMaisUtilizados[0]?.tipoServico || '',
  topServico2: item.tiposMaisUtilizados[1]?.quantidade || 0,
  topServico2Nome: item.tiposMaisUtilizados[1]?.tipoServico || '',
  topServico3: item.tiposMaisUtilizados[2]?.quantidade || 0,
  topServico3Nome: item.tiposMaisUtilizados[2]?.tipoServico || ''
}));
```

#### 3. Criação de Sistema de Cores para Serviços
Foi criado um sistema que mapeia cada serviço único a uma cor específica:

```tsx
const servicosUnicosNoGrafico = new Set<string>();
dadosServicos.servicosPorTipoEvento.forEach(item => {
  item.tiposMaisUtilizados.forEach(servico => {
    if (servico.tipoServico) {
      servicosUnicosNoGrafico.add(servico.tipoServico);
    }
  });
});

const coresServicos: Record<string, string> = {};
const coresDisponiveis = ['#21b6bf', '#5d6b74', '#1a9ba3', '#313c43', '#d97757', '#a4b3ba'];
Array.from(servicosUnicosNoGrafico).forEach((servico, index) => {
  coresServicos[servico] = coresDisponiveis[index % coresDisponiveis.length];
});
```

#### 4. Reorganização do Layout
O gráfico agora usa um layout de grid com duas colunas:
- **Esquerda**: Gráfico de barras
- **Direita**: Legenda customizada com nomes dos serviços

```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
  {/* Gráfico à esquerda */}
  {/* Legenda à direita */}
</div>
```

#### 5. Legenda Customizada
Foi criada uma legenda customizada à direita que exibe:
- **Total de Serviços**: Barra cinza escura
- **Serviços por Posição**: Cores para 1º, 2º e 3º mais utilizados
- **Serviços Utilizados**: Lista completa de todos os serviços com:
  - Nome do serviço
  - Cor correspondente
  - Informação de em quais tipos de evento aparece e em qual posição

#### 6. Melhoria do Tooltip
O tooltip foi modificado para exibir os nomes reais dos serviços ao invés das legendas genéricas:

```tsx
<Tooltip 
  content={({ active, payload }) => {
    // ... código ...
    let nomeServico = entry.name;
    if (entry.dataKey === 'topServico1' && payloadData?.topServico1Nome) {
      nomeServico = payloadData.topServico1Nome;
    } else if (entry.dataKey === 'topServico2' && payloadData?.topServico2Nome) {
      nomeServico = payloadData.topServico2Nome;
    } else if (entry.dataKey === 'topServico3' && payloadData?.topServico3Nome) {
      nomeServico = payloadData.topServico3Nome;
    }
    // ... exibir nomeServico ...
  }}
/>
```

## Arquivos Modificados

### 1. `src/components/relatorios/ServicosReport.tsx`
- **Função**: Componente de relatório de serviços por tipo
- **Alterações**: 
  - Removido gráfico "Serviços por Mês"
  - Modificados dados do gráfico para incluir nomes dos serviços
  - Criado sistema de cores para serviços
  - Reorganizado layout para gráfico ocupar toda largura
  - Criada legenda customizada à direita
  - Melhorado tooltip para exibir nomes dos serviços
- **Linhas alteradas**: 
  - Linhas 231-237: Modificação dos dados do gráfico
  - Linhas 239-268: Criação de sistema de cores e config dinâmico
  - Linhas 474-658: Remoção do gráfico "Serviços por Mês" e reorganização do layout

## Resultado
O gráfico "Serviços por Tipo de Evento" agora:
1. Ocupa toda a largura horizontal disponível
2. Exibe nomes reais dos serviços na legenda customizada
3. Mostra informações claras sobre quais serviços aparecem em cada tipo de evento
4. Possui tooltip melhorado que exibe os nomes dos serviços
5. Tem uma legenda organizada à direita com todas as informações relevantes

## Observações
- O gráfico mantém as mesmas cores para cada posição (1º, 2º, 3º) para facilitar a leitura
- A legenda customizada é scrollável caso haja muitos serviços
- Cada serviço na legenda mostra em quais tipos de evento aparece e em qual posição
- O layout é responsivo, mantendo o gráfico em uma coluna em telas menores

