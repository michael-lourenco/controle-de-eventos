# Padrão de Tooltip Informativo e Ajuste de "Tipos em Alta" para 15%

## Data
2025-01-27

## Problema Identificado
1. O cálculo de "Tipos em Alta" usava 10% como threshold, que foi considerado muito baixo
2. Não havia explicação sobre o que significava "Tipos em Alta" e como era calculado
3. Faltava um padrão reutilizável para tooltips informativos em gráficos e métricas

## Solução Implementada

### 1. Criação do Componente InfoTooltip

Foi criado um componente reutilizável `InfoTooltip` em `src/components/ui/info-tooltip.tsx` que será usado em todos os gráficos e métricas para explicar cálculos e significados.

#### Características do Componente:
- **Ícone informativo**: Usa `InformationCircleIcon` do Heroicons
- **Tooltip rico**: Suporta título, descrição e explicação do cálculo
- **Acessível**: Inclui `aria-label` e suporte a teclado
- **Estilizado**: Segue o design system do projeto
- **Reutilizável**: Pode ser usado em qualquer lugar do sistema

#### Interface do Componente:
```tsx
interface InfoTooltipProps {
  title: string              // Título da informação
  description: string        // Descrição do que a métrica significa
  calculation?: string       // (Opcional) Explicação de como o cálculo é feito
  className?: string        // Classes CSS adicionais para o container
  iconClassName?: string     // Classes CSS adicionais para o ícone
}
```

#### Exemplo de Uso:
```tsx
<InfoTooltip
  title="Tipos em Alta"
  description="Tipos de serviços que representam mais de 15% do total de serviços contratados no período analisado."
  calculation="Para cada tipo de serviço, calculamos: (quantidade do tipo / total de serviços) × 100. Tipos com percentual maior que 15% são considerados 'em alta'."
/>
```

### 2. Ajuste do Threshold de 10% para 15%

O cálculo de "Tipos em Alta" foi ajustado de 10% para 15%:

**Antes:**
```tsx
const tiposEmAlta = servicosPorTipo
  .filter(tipo => tipo.percentual > 10)
  .map(tipo => tipo.tipoServico);
```

**Depois:**
```tsx
const tiposEmAlta = servicosPorTipo
  .filter(tipo => tipo.percentual > 15)
  .map(tipo => tipo.tipoServico);
```

### 3. Adição do Tooltip ao Card "Tipos em Alta"

O tooltip foi adicionado ao título do card para explicar:
- **O que significa**: Tipos de serviços que representam mais de 15% do total
- **Por que é útil**: Indica serviços com alta demanda e relevância no negócio
- **Como é calculado**: Fórmula e critério de threshold

**Antes:**
```tsx
<h4 className="font-medium text-accent-dark mb-2">
  Tipos em Alta
  {dadosServicos.tendencias.tiposEmAlta.length > 0 && (
    <span className="ml-2 text-xs font-normal">({dadosServicos.tendencias.tiposEmAlta.length})</span>
  )}
</h4>
```

**Depois:**
```tsx
<h4 className="font-medium text-accent-dark mb-2 flex items-center gap-2">
  <span>
    Tipos em Alta
    {dadosServicos.tendencias.tiposEmAlta.length > 0 && (
      <span className="ml-2 text-xs font-normal">({dadosServicos.tendencias.tiposEmAlta.length})</span>
    )}
  </span>
  <InfoTooltip
    title="Tipos em Alta"
    description="Tipos de serviços que representam mais de 15% do total de serviços contratados no período analisado. Isso indica serviços com alta demanda e relevância no negócio."
    calculation="Para cada tipo de serviço, calculamos: (quantidade do tipo / total de serviços) × 100. Tipos com percentual maior que 15% são considerados 'em alta'."
  />
</h4>
```

### 4. Atualização da Mensagem Vazia

A mensagem quando não há tipos em alta foi atualizada para refletir o novo threshold:

**Antes:**
```tsx
<p className="text-accent-dark/70 text-sm">Nenhum tipo acima de 10%</p>
```

**Depois:**
```tsx
<p className="text-accent-dark/70 text-sm">Nenhum tipo acima de 15%</p>
```

## Arquivos Criados

### 1. `src/components/ui/info-tooltip.tsx`
- **Função**: Componente reutilizável de tooltip informativo
- **Características**: 
  - Tooltip com título, descrição e cálculo
  - Ícone informativo clicável
  - Acessível e responsivo
  - Estilizado conforme design system

## Arquivos Modificados

### 1. `src/components/relatorios/ServicosReport.tsx`
- **Alterações**: 
  - Import do `InfoTooltip` adicionado
  - Threshold alterado de 10% para 15%
  - Tooltip adicionado ao card "Tipos em Alta"
  - Mensagem vazia atualizada
- **Linhas alteradas**: 
  - Linha 12: Import adicionado
  - Linha 160: Threshold alterado
  - Linhas 670-680: Tooltip adicionado
  - Linha 693: Mensagem atualizada

## Padrão Estabelecido

### Diretrizes para Uso do InfoTooltip

1. **Onde usar**: 
   - Títulos de métricas e KPIs
   - Labels de gráficos
   - Cards de resumo
   - Qualquer métrica que precise de explicação

2. **Estrutura do conteúdo**:
   - **title**: Nome da métrica (mesmo do título/label)
   - **description**: O que a métrica significa e por que é útil
   - **calculation**: Como o valor é calculado (fórmula, critérios, etc.)

3. **Boas práticas**:
   - Seja claro e conciso
   - Explique a utilidade da métrica
   - Inclua a fórmula ou critério quando relevante
   - Use linguagem acessível

4. **Exemplo de estrutura**:
```tsx
<InfoTooltip
  title="Nome da Métrica"
  description="O que significa e por que é útil para o negócio."
  calculation="Fórmula ou critério: (valor1 / valor2) × 100. Critério: valores acima de X são considerados..."
/>
```

## Resultado

1. **Componente reutilizável criado**: `InfoTooltip` pode ser usado em todo o sistema
2. **Threshold ajustado**: De 10% para 15%, tornando o critério mais rigoroso
3. **Tooltip informativo adicionado**: Usuários agora entendem o que significa "Tipos em Alta"
4. **Padrão estabelecido**: Base para adicionar tooltips informativos em todos os gráficos

## Próximos Passos

Este padrão deve ser aplicado a:
- Todos os cards de métricas em relatórios
- Títulos de gráficos que precisam de explicação
- KPIs e indicadores de performance
- Qualquer métrica calculada que possa não ser óbvia para o usuário

## Observações

- O componente `InfoTooltip` é totalmente acessível e segue as melhores práticas de UX
- O tooltip aparece ao passar o mouse ou focar no ícone
- O design é consistente com o sistema de design do projeto
- O threshold de 15% torna o critério mais seletivo, mostrando apenas serviços realmente em alta demanda

