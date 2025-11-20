# Alteração de Ícones: Pagamentos e Tipos de Custo

## Data: 2025-01-27

## Objetivo
Alterar os ícones de "Pagamentos" e "Tipos de Custo" para que não compartilhem o mesmo ícone (`CurrencyDollarIcon`), melhorando a diferenciação visual no menu.

## Problema Identificado
Ambos os itens do menu ("Pagamentos" e "Tipos de Custo") estavam usando o mesmo ícone `CurrencyDollarIcon`, dificultando a identificação visual rápida no menu lateral.

## Solução Aplicada

### Alteração de Ícones

**Antes:**
- Pagamentos: `CurrencyDollarIcon` (cifrão/dólar)
- Tipos de Custo: `CurrencyDollarIcon` (cifrão/dólar) ❌ Duplicado

**Depois:**
- Pagamentos: `BanknotesIcon` (notas de dinheiro) ✅
- Tipos de Custo: `CalculatorIcon` (calculadora) ✅

## Justificativa da Escolha

### `BanknotesIcon` para Pagamentos
- **Representação:** Notas de dinheiro/cédulas
- **Adequação:** Ideal para representar pagamentos recebidos, transações financeiras
- **Diferenciação:** Visualmente distinto de outros ícones do menu

### `CalculatorIcon` para Tipos de Custo
- **Representação:** Calculadora
- **Adequação:** Representa categorização, classificação e cálculo de custos
- **Consistência:** Já é usado no componente `CustosEvento.tsx`, mantendo consistência visual
- **Diferenciação:** Visualmente distinto e apropriado para tipos/categorias

## Alteração Realizada

### Arquivo: `src/components/Layout.tsx`

**Imports adicionados:**
```tsx
import {
  // ... outros imports ...
  BanknotesIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
```

**Alteração no array navigation:**
```tsx
// Antes
{ name: 'Pagamentos', href: '/pagamentos', icon: CurrencyDollarIcon },
{ name: 'Tipos de Custo', href: '/tipos-custos', icon: CurrencyDollarIcon },

// Depois
{ name: 'Pagamentos', href: '/pagamentos', icon: BanknotesIcon },
{ name: 'Tipos de Custo', href: '/tipos-custos', icon: CalculatorIcon },
```

## Função do Arquivo

**src/components/Layout.tsx**
- Função: Componente de layout principal que contém o menu lateral (sidebar) e estrutura das páginas autenticadas
- Alteração: Substituição dos ícones de "Pagamentos" e "Tipos de Custo" para melhor diferenciação visual

## Resultado
Agora cada item do menu tem um ícone único e apropriado:
- ✅ "Pagamentos" usa `BanknotesIcon` (notas de dinheiro)
- ✅ "Tipos de Custo" usa `CalculatorIcon` (calculadora)
- ✅ Melhor diferenciação visual no menu
- ✅ Ícones semanticamente apropriados para cada funcionalidade

## Impacto
- **UX:** Melhora a identificação visual rápida dos itens do menu
- **Consistência:** `CalculatorIcon` já é usado em componentes relacionados a custos
- **Clareza:** Cada ícone representa melhor sua funcionalidade específica
- **Visual:** Interface mais organizada e fácil de navegar

## Alteração Adicional: Página de Tipos de Custo

Para manter a consistência visual, também foi alterado o ícone na página `/tipos-custos`:

**Arquivo:** `src/app/tipos-custos/page.tsx`

**Alterações:**
- Import: `CurrencyDollarIcon` → `CalculatorIcon`
- Título da página: `CurrencyDollarIcon` → `CalculatorIcon`
- Estado vazio (quando não há tipos): `CurrencyDollarIcon` → `CalculatorIcon`

**Resultado:** Agora a página de tipos de custo usa o mesmo ícone do menu, mantendo consistência visual em todo o sistema.

## Observações
- Nenhum erro de lint foi introduzido pelas alterações
- As alterações afetam tanto o menu desktop quanto o menu mobile
- O ícone `CurrencyDollarIcon` ainda pode ser usado em outros contextos do sistema
- A escolha dos ícones foi baseada em:
  - Semântica apropriada para cada funcionalidade
  - Consistência com outros componentes do sistema
  - Diferenciação visual clara
- A página de tipos de custo agora está alinhada com o ícone do menu

