# Reordenação do Menu: Relatórios e Contratos

## Data: 2025-01-27

## Objetivo
Reordenar os itens do menu lateral para que "Relatórios" e "Contratos" apareçam logo abaixo de "Clientes".

## Alteração Realizada

### Arquivo: `src/components/Layout.tsx`

**Antes:**
```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Eventos', href: '/eventos', icon: CalendarIcon },
  { name: 'Clientes', href: '/clientes', icon: UserIcon },
  { name: 'Pagamentos', href: '/pagamentos', icon: CurrencyDollarIcon },
  { name: 'Serviços', href: '/servicos', icon: WrenchScrewdriverIcon },
  { name: 'Canais de Entrada', href: '/canais-entrada', icon: TagIcon },
  { name: 'Tipos de Evento', href: '/tipos-eventos', icon: CalendarDaysIcon },
  { name: 'Tipos de Custo', href: '/tipos-custos', icon: CurrencyDollarIcon },
  { name: 'Relatórios', href: '/relatorios', icon: ChartBarIcon },
  { name: 'Planos', href: '/planos', icon: CreditCardIcon },
  { name: 'Assinatura', href: '/assinatura', icon: DocumentTextIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon },
];
```

**Depois:**
```tsx
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Eventos', href: '/eventos', icon: CalendarIcon },
  { name: 'Clientes', href: '/clientes', icon: UserIcon },
  { name: 'Relatórios', href: '/relatorios', icon: ChartBarIcon },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon },
  { name: 'Pagamentos', href: '/pagamentos', icon: CurrencyDollarIcon },
  { name: 'Serviços', href: '/servicos', icon: WrenchScrewdriverIcon },
  { name: 'Canais de Entrada', href: '/canais-entrada', icon: TagIcon },
  { name: 'Tipos de Evento', href: '/tipos-eventos', icon: CalendarDaysIcon },
  { name: 'Tipos de Custo', href: '/tipos-custos', icon: CurrencyDollarIcon },
  { name: 'Planos', href: '/planos', icon: CreditCardIcon },
  { name: 'Assinatura', href: '/assinatura', icon: DocumentTextIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];
```

## Nova Ordem do Menu

1. Dashboard
2. Eventos
3. Clientes
4. **Relatórios** (movido)
5. **Contratos** (movido)
6. Pagamentos
7. Serviços
8. Canais de Entrada
9. Tipos de Evento
10. Tipos de Custo
11. Planos
12. Assinatura
13. Configurações

## Função do Arquivo

**src/components/Layout.tsx**
- Função: Componente de layout principal que contém o menu lateral (sidebar) e estrutura das páginas autenticadas
- Alteração: Reordenação do array `navigation` para mover "Relatórios" e "Contratos" para logo após "Clientes"

## Resultado
Agora "Relatórios" e "Contratos" aparecem logo abaixo de "Clientes" no menu lateral, tanto na versão desktop quanto mobile.

## Impacto
- **UX:** Melhora a organização lógica do menu, agrupando funcionalidades relacionadas
- **Navegação:** Facilita o acesso a relatórios e contratos, que são funcionalidades frequentemente usadas
- **Visual:** Mantém a consistência visual, apenas alterando a ordem dos itens

## Observações
- Nenhum erro de lint foi introduzido pela alteração
- A alteração afeta tanto o menu desktop quanto o menu mobile
- A ordem dos itens é definida pela ordem no array `navigation`
- Todos os ícones e links permanecem os mesmos, apenas a ordem foi alterada

