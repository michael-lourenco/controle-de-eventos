# Implementação de Menu Lateral Colapsável

## Data: 2025-01-27

## Objetivo
Implementar funcionalidade para colapsar/expandir o menu lateral, exibindo apenas ícones quando colapsado, com tooltips ao passar o mouse. A preferência deve ser salva no localStorage, similar ao tema dark/light.

## Funcionalidades Implementadas

### 1. Contexto de Sidebar (`src/contexts/SidebarContext.tsx`)

**Criado:** Contexto React para gerenciar o estado do menu colapsado, seguindo o mesmo padrão do `ThemeContext`.

**Características:**
- Estado `isCollapsed`: boolean que indica se o menu está colapsado
- Função `toggleSidebar()`: alterna entre colapsado/expandido
- Função `setCollapsed(collapsed)`: define o estado diretamente
- Persistência no localStorage através de `sidebarUtils`
- Prevenção de flash de conteúdo não estilizado (similar ao tema)

**Interface:**
```tsx
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}
```

### 2. Utilitários de Sidebar (`src/utils/sidebarUtils.ts`)

**Criado:** Funções utilitárias para gerenciar a persistência da preferência do menu.

**Funções:**
- `getInitialSidebarState()`: Lê o estado do localStorage ou retorna `false` (expandido) como padrão
- `saveSidebarState(collapsed)`: Salva o estado no localStorage com a chave `'sidebar-collapsed'`

**Comportamento:**
- Default: menu expandido (`false`)
- Tratamento de erros ao acessar localStorage
- Compatível com SSR (verifica `typeof window`)

### 3. Modificações no Layout (`src/components/Layout.tsx`)

#### 3.1. Imports Adicionados
```tsx
import { useSidebar } from '@/contexts/SidebarContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
```

#### 3.2. Uso do Contexto
```tsx
const { isCollapsed, toggleSidebar } = useSidebar();
```

#### 3.3. Menu Desktop - Largura Dinâmica
```tsx
<div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
  isCollapsed ? 'lg:w-20' : 'lg:w-64'
}`}>
```

**Comportamento:**
- Expandido: `w-64` (256px)
- Colapsado: `w-20` (80px)
- Transição suave de 300ms

#### 3.4. Header do Menu - Logo e Botão Toggle

**Expandido:**
- Exibe logo + texto "Clicksehub"
- Botão de colapsar (ChevronLeft) à direita

**Colapsado:**
- Exibe apenas logo centralizado
- Botão de expandir (ChevronRight) abaixo do logo

**Tooltips:**
- Botão de toggle tem tooltip explicando a ação

#### 3.5. Itens de Navegação

**Expandido:**
- Exibe ícone + texto
- Layout normal com espaçamento

**Colapsado:**
- Exibe apenas ícone centralizado
- Tooltip ao passar o mouse mostrando o nome do item
- `delayDuration={0}` para tooltip aparecer imediatamente

**Implementação:**
```tsx
<TooltipProvider>
  {navigation.map((item) => (
    <Tooltip key={item.name} delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          className={`group flex items-center ... ${
            isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
          }`}
        >
          <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>{item.name}</span>}
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          {item.name}
        </TooltipContent>
      )}
    </Tooltip>
  ))}
</TooltipProvider>
```

#### 3.6. Seção de Administração

**Expandido:**
- Exibe título "Administração"
- Itens com ícone + texto

**Colapsado:**
- Oculta título "Administração"
- Itens apenas com ícone + tooltip

#### 3.7. Rodapé do Menu - Usuário e Sair

**Expandido:**
- Exibe avatar + nome + email
- Botão "Sair" com ícone + texto

**Colapsado:**
- Oculta informações do usuário
- Botão "Sair" apenas com ícone + tooltip

#### 3.8. Área de Conteúdo Principal

**Ajuste dinâmico:**
```tsx
<div className={`transition-all duration-300 ${
  isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
}`}>
```

**Comportamento:**
- Expandido: `pl-64` (padding-left: 256px)
- Colapsado: `pl-20` (padding-left: 80px)
- Transição suave sincronizada com o menu

### 4. Integração no Layout Raiz (`src/app/layout.tsx`)

**Adicionado:** `SidebarProvider` envolvendo a aplicação.

```tsx
<ThemeProvider>
  <SidebarProvider>
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  </SidebarProvider>
</ThemeProvider>
```

## Arquivos Criados/Modificados

### Arquivos Criados

1. **src/contexts/SidebarContext.tsx**
   - Função: Contexto React para gerenciar estado do menu colapsado
   - Características: Similar ao ThemeContext, com persistência no localStorage

2. **src/utils/sidebarUtils.ts**
   - Função: Utilitários para salvar/carregar preferência do menu
   - Características: Funções para ler e escrever no localStorage

### Arquivos Modificados

1. **src/app/layout.tsx**
   - Função: Layout raiz da aplicação
   - Alteração: Adicionado `SidebarProvider` para disponibilizar o contexto

2. **src/components/Layout.tsx**
   - Função: Componente de layout principal com menu lateral
   - Alterações:
     - Integração com `useSidebar()`
     - Menu com largura dinâmica
     - Ocultação de textos quando colapsado
     - Tooltips nos itens quando colapsado
     - Botão de toggle
     - Ajuste da área de conteúdo principal

## Comportamento do Menu

### Estado Expandido (Padrão)
- Largura: 256px (w-64)
- Logo + texto "Clicksehub" visível
- Todos os textos dos itens visíveis
- Informações do usuário visíveis
- Botão "Sair" com texto
- Botão de colapsar (ChevronLeft) no header

### Estado Colapsado
- Largura: 80px (w-20)
- Apenas logo visível (centralizado)
- Apenas ícones dos itens visíveis
- Tooltips ao passar o mouse
- Informações do usuário ocultas
- Botão "Sair" apenas com ícone + tooltip
- Botão de expandir (ChevronRight) abaixo do logo

## Persistência

- **LocalStorage Key:** `'sidebar-collapsed'`
- **Valores:** `'true'` (colapsado) ou `'false'` (expandido)
- **Default:** `false` (expandido)
- **Comportamento:** Similar ao tema dark/light, a preferência é mantida entre sessões

## Transições

- **Duração:** 300ms
- **Propriedade:** `transition-all duration-300`
- **Aplicado em:**
  - Largura do menu
  - Padding da área de conteúdo
  - Todos os elementos que mudam de estado

## Tooltips

- **Biblioteca:** Componente `Tooltip` do sistema de UI
- **Posição:** `side="right"` (aparece à direita do menu)
- **Delay:** `delayDuration={0}` (aparece imediatamente)
- **Exibição:** Apenas quando menu está colapsado
- **Conteúdo:** Nome do item de menu ou ação do botão

## Resultado

✅ Menu pode ser colapsado/expandido com botão de toggle
✅ Textos são ocultados quando colapsado, mostrando apenas ícones
✅ Tooltips aparecem ao passar o mouse quando colapsado
✅ Preferência é salva no localStorage
✅ Transições suaves e profissionais
✅ Área de conteúdo se ajusta automaticamente
✅ Funciona apenas no desktop (mobile mantém comportamento original)

## Impacto

- **UX:** Melhora a experiência em telas menores, permitindo mais espaço para conteúdo
- **Profissionalismo:** Interface mais moderna e flexível
- **Persistência:** Preferência do usuário é mantida entre sessões
- **Acessibilidade:** Tooltips garantem que usuários saibam o que cada ícone representa

## Observações

- Nenhum erro de lint foi introduzido pelas alterações
- O menu mobile não é afetado (mantém comportamento original)
- A implementação segue o mesmo padrão do sistema de temas
- Tooltips são exibidos apenas quando necessário (menu colapsado)
- Transições são suaves e não causam problemas de performance
- O botão de toggle está sempre acessível e visível

