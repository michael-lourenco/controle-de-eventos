# Implementação de Hover e Indicador de Item Ativo no Menu

## Data: 2025-01-27

## Objetivo
Implementar efeitos visuais sutis mas perceptíveis quando o usuário passa o mouse sobre os itens do menu, e adicionar uma indicação visual clara do item ativo (página atual).

## Funcionalidades Implementadas

### 1. Detecção de Rota Ativa

**Import adicionado:**
```tsx
import { usePathname } from 'next/navigation';
```

**Função criada:**
```tsx
const pathname = usePathname();

const isActive = (href: string) => {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
};
```

**Comportamento:**
- Para `/dashboard`: verifica se a rota é exatamente `/dashboard`
- Para outras rotas: verifica se a rota atual começa com o `href` do item
- Permite detectar rotas filhas (ex: `/eventos/123` corresponde a `/eventos`)

### 2. Efeitos de Hover

**Características:**
- **Mudança de cor:** `hover:text-text-primary` (texto fica mais destacado)
- **Background:** `hover:bg-surface-hover` (fundo muda sutilmente)
- **Escala:** `hover:scale-[1.02]` (aumento de 2% no tamanho)
- **Sombra:** `hover:shadow-sm` (sombra sutil)
- **Ícone:** `group-hover:scale-110` (ícone aumenta 10%)
- **Transição:** `transition-all duration-200` (transição suave de 200ms)

**Aplicado em:**
- Itens do menu principal
- Itens do menu de administração
- Menu mobile

### 3. Indicador de Item Ativo

**Características visuais:**
- **Background:** `bg-primary/10` (fundo com cor primária em 10% de opacidade)
- **Cor do texto:** `text-primary` (texto na cor primária)
- **Escala:** `scale-105` (aumento de 5% no tamanho)
- **Sombra:** `shadow-sm` (sombra sutil)
- **Borda lateral:** Barra vertical na cor primária à esquerda do item
- **Ícone:** `scale-110` (ícone aumenta 10%)

**Implementação da barra lateral:**
```tsx
{active && !isCollapsed && (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
)}
```

**Comportamento:**
- Barra vertical aparece apenas quando o menu está expandido
- Posicionada à esquerda do item
- Altura de 24px (h-6)
- Largura de 4px (w-1)
- Cor primária
- Bordas arredondadas à direita

### 4. Transições Suaves

**Propriedades:**
- `transition-all duration-200`: Todas as propriedades animam em 200ms
- `transition-transform duration-200`: Transições de escala específicas

**Aplicado em:**
- Mudanças de cor
- Mudanças de escala
- Mudanças de background
- Transformações de ícones

## Alterações Realizadas

### Arquivo: `src/components/Layout.tsx`

#### 1. Imports Adicionados
```tsx
import { usePathname } from 'next/navigation';
```

#### 2. Hook de Pathname
```tsx
const pathname = usePathname();
```

#### 3. Função de Verificação de Item Ativo
```tsx
const isActive = (href: string) => {
  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname.startsWith(href);
};
```

#### 4. Menu Desktop - Itens Principais

**Antes:**
```tsx
<Link
  href={item.href}
  className="group flex items-center text-sm font-medium rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-200 hover:shadow-sm cursor-pointer ..."
>
  <item.icon className="h-5 w-5 ..." />
  {!isCollapsed && <span>{item.name}</span>}
</Link>
```

**Depois:**
```tsx
const active = isActive(item.href);
<Link
  href={item.href}
  className={`group relative flex items-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ... ${
    active
      ? 'bg-primary/10 text-primary shadow-sm scale-105'
      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:shadow-sm hover:scale-[1.02]'
  }`}
>
  {active && !isCollapsed && (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
  )}
  <item.icon className={`transition-transform duration-200 ... ${
    active ? 'scale-110' : 'group-hover:scale-110'
  }`} />
  {!isCollapsed && <span className="font-medium">{item.name}</span>}
</Link>
```

#### 5. Menu Desktop - Itens de Administração

Mesma lógica aplicada aos itens do menu de administração.

#### 6. Menu Mobile

Mesma lógica aplicada ao menu mobile, incluindo a barra lateral de indicação.

## Estilos Aplicados

### Item Inativo (Hover)
- Cor do texto: `text-text-secondary` → `hover:text-text-primary`
- Background: transparente → `hover:bg-surface-hover`
- Escala: normal → `hover:scale-[1.02]` (2% maior)
- Ícone: normal → `group-hover:scale-110` (10% maior)
- Sombra: nenhuma → `hover:shadow-sm`

### Item Ativo
- Cor do texto: `text-primary`
- Background: `bg-primary/10`
- Escala: `scale-105` (5% maior)
- Ícone: `scale-110` (10% maior)
- Sombra: `shadow-sm`
- Barra lateral: Barra vertical de 4px na cor primária

## Resultado

✅ Efeitos de hover sutis mas perceptíveis
✅ Indicador visual claro do item ativo
✅ Barra lateral para item ativo (quando menu expandido)
✅ Transições suaves em todas as interações
✅ Consistência entre menu desktop e mobile
✅ Funciona tanto com menu expandido quanto colapsado

## Impacto

- **UX:** Melhora significativa na experiência do usuário com feedback visual claro
- **Navegação:** Usuário sempre sabe em qual página está
- **Profissionalismo:** Interface mais polida e moderna
- **Acessibilidade:** Feedback visual ajuda na navegação

## Observações

- Nenhum erro de lint foi introduzido pelas alterações
- As transições são suaves e não causam problemas de performance
- A barra lateral só aparece quando o menu está expandido (não faz sentido quando colapsado)
- O efeito de escala é sutil (2% no hover, 5% no ativo) para não ser intrusivo
- A função `isActive` trata `/dashboard` de forma especial para evitar falsos positivos
- Todos os efeitos funcionam tanto no menu desktop quanto no mobile

