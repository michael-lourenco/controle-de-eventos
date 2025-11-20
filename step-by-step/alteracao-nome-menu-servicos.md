# Alteração do Nome do Menu: Serviços para Tipos de Serviços

## Data: 2025-01-27

## Objetivo
Alterar o nome do item do menu de "Serviços" para "Tipos de Serviços" para melhor clareza e consistência com outros itens do menu como "Tipos de Evento" e "Tipos de Custo".

## Alteração Realizada

### Arquivo: `src/components/Layout.tsx`

**Antes:**
```tsx
{ name: 'Serviços', href: '/servicos', icon: WrenchScrewdriverIcon },
```

**Depois:**
```tsx
{ name: 'Tipos de Serviços', href: '/servicos', icon: WrenchScrewdriverIcon },
```

## Função do Arquivo

**src/components/Layout.tsx**
- Função: Componente de layout principal que contém o menu lateral (sidebar) e estrutura das páginas autenticadas
- Alteração: Mudança do nome do item de menu de "Serviços" para "Tipos de Serviços"

## Resultado
O menu agora exibe "Tipos de Serviços" em vez de "Serviços", mantendo consistência com outros itens do menu como "Tipos de Evento" e "Tipos de Custo".

## Impacto
- **Consistência:** Mantém o padrão de nomenclatura com outros itens do menu (Tipos de Evento, Tipos de Custo)
- **Clareza:** Deixa mais claro que se trata de tipos/categorias de serviços, não serviços individuais
- **UX:** Melhora a compreensão do usuário sobre o que encontrará ao acessar essa seção

## Observações
- Nenhum erro de lint foi introduzido pela alteração
- A alteração afeta tanto o menu desktop quanto o menu mobile
- O href (`/servicos`) permanece o mesmo, apenas o nome exibido foi alterado
- O ícone permanece o mesmo (`WrenchScrewdriverIcon`)

