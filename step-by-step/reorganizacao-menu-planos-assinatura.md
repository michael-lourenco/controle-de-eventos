# Reorganização do Menu: Planos e Assinatura

## Data: 2025-01-27

## Objetivo
Reorganizar o menu removendo "Planos" e "Assinatura" do menu lateral e adicionando-os como componentes dentro da página de Configurações. Além disso, adicionar verificação de plano ativo e exibir um banner de oferta no top bar quando o usuário não tiver um plano ativo.

## Alterações Realizadas

### 1. Remoção do Menu Lateral (`src/components/Layout.tsx`)

**Alteração:** Removidos os itens "Planos" e "Assinatura" do array `navigation`.

**Antes:**
```tsx
const navigation = [
  // ... outros itens ...
  { name: 'Planos', href: '/planos', icon: CreditCardIcon },
  { name: 'Assinatura', href: '/assinatura', icon: DocumentTextIcon },
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];
```

**Depois:**
```tsx
const navigation = [
  // ... outros itens ...
  { name: 'Configurações', href: '/configuracoes', icon: CogIcon },
];
```

**Função:** Remove os itens do menu lateral, mantendo apenas "Configurações" como ponto de acesso.

### 2. Adição de Cards na Página de Configurações (`src/app/configuracoes/page.tsx`)

**Imports adicionados:**
```tsx
import { CreditCardIcon } from '@heroicons/react/24/outline';
```

**Cards adicionados:**
- **Card de Planos:**
  - Ícone: `CreditCardIcon` (roxo)
  - Título: "Planos"
  - Descrição: "Visualizar planos disponíveis"
  - Ação: Redireciona para `/planos`
  - Botão: "Ver Planos"

- **Card de Assinatura:**
  - Ícone: `DocumentTextIcon` (laranja)
  - Título: "Assinatura"
  - Descrição: "Gerenciar sua assinatura"
  - Ação: Redireciona para `/assinatura`
  - Botão: "Gerenciar Assinatura"

**Função:** Adiciona dois novos cards na página de configurações seguindo o mesmo padrão visual dos outros cards (Dados da Empresa e Google Calendar), permitindo acesso fácil a planos e assinatura.

### 3. Verificação de Plano Ativo (`src/components/Layout.tsx`)

**Imports adicionados:**
```tsx
import { usePlano } from '@/lib/hooks/usePlano';
```

**Estado e verificação:**
```tsx
const { statusPlano, loading: loadingPlano } = usePlano();
const [showPlanoBanner, setShowPlanoBanner] = useState(true);
const temPlanoAtivo = statusPlano?.ativo === true;
```

**Função:** 
- Usa o hook `usePlano()` para obter o status do plano do usuário
- Verifica se o usuário tem um plano ativo através da propriedade `statusPlano?.ativo`
- Mantém estado para controlar a exibição do banner (pode ser fechado pelo usuário)

### 4. Banner de Oferta de Plano no Top Bar (`src/components/Layout.tsx`)

**Componente adicionado:**
```tsx
{!loadingPlano && !temPlanoAtivo && showPlanoBanner && (
  <div className="sticky top-0 z-50 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 px-4 py-3 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <CreditCardIcon className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">
            Assine um plano para desbloquear todas as funcionalidades
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Acesse as configurações para ver os planos disponíveis
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => router.push('/configuracoes')}
          className="bg-primary hover:bg-accent text-white"
        >
          Ver Planos
        </Button>
        <button
          onClick={() => setShowPlanoBanner(false)}
          className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Fechar banner"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
)}
```

**Características do Banner:**
- **Posicionamento:** Sticky no topo da página (z-50)
- **Visual:** Gradiente de fundo com cores primárias, borda sutil
- **Conteúdo:**
  - Ícone de cartão de crédito
  - Mensagem principal: "Assine um plano para desbloquear todas as funcionalidades"
  - Mensagem secundária: "Acesse as configurações para ver os planos disponíveis"
  - Botão "Ver Planos" que redireciona para `/configuracoes`
  - Botão de fechar (X) para ocultar o banner
- **Condições de exibição:**
  - Não está carregando dados do plano (`!loadingPlano`)
  - Usuário não tem plano ativo (`!temPlanoAtivo`)
  - Banner não foi fechado pelo usuário (`showPlanoBanner`)

**Ajuste do Top Bar:**
O top bar foi ajustado para considerar o espaço do banner quando ele está visível:
```tsx
className={`sticky ${!loadingPlano && !temPlanoAtivo && showPlanoBanner ? 'top-[73px]' : 'top-0'} z-40 ...`}
```

**Função:** Exibe um banner promocional no topo da página quando o usuário não tem plano ativo, incentivando a assinatura e facilitando o acesso às configurações onde pode ver os planos.

## Arquivos Modificados

1. **src/components/Layout.tsx**
   - Função: Componente de layout principal que contém o menu lateral e estrutura das páginas
   - Alterações:
     - Removidos "Planos" e "Assinatura" do menu navigation
     - Adicionado hook `usePlano` para verificar status do plano
     - Adicionado banner de oferta de plano no top bar
     - Ajustado posicionamento do top bar quando banner está visível

2. **src/app/configuracoes/page.tsx**
   - Função: Página de configurações do sistema
   - Alterações:
     - Adicionado card "Planos" com link para `/planos`
     - Adicionado card "Assinatura" com link para `/assinatura`
     - Mantido padrão visual consistente com outros cards

## Resultado

### Menu Lateral
- ✅ "Planos" e "Assinatura" removidos do menu lateral
- ✅ Apenas "Configurações" permanece no menu

### Página de Configurações
- ✅ Dois novos cards adicionados: "Planos" e "Assinatura"
- ✅ Cards seguem o mesmo padrão visual dos existentes
- ✅ Acesso fácil através de cliques nos cards

### Banner de Oferta
- ✅ Banner aparece no topo quando usuário não tem plano ativo
- ✅ Banner pode ser fechado pelo usuário
- ✅ Botão "Ver Planos" redireciona para configurações
- ✅ Top bar ajusta posição quando banner está visível

## Impacto

- **UX:** Melhora a organização do menu, agrupando funcionalidades relacionadas em Configurações
- **Conversão:** Banner promocional aumenta a visibilidade da oferta de planos
- **Navegação:** Facilita o acesso a planos e assinatura através da página de configurações
- **Visual:** Interface mais limpa e organizada

## Observações

- Nenhum erro de lint foi introduzido pelas alterações
- O banner só aparece quando o usuário não tem plano ativo
- O banner pode ser fechado pelo usuário e não reaparece na mesma sessão (até recarregar a página)
- A verificação de plano ativo é feita através do hook `usePlano()` que consulta o `statusPlano?.ativo`
- O top bar ajusta dinamicamente sua posição baseado na presença do banner
- Os cards na página de configurações mantêm consistência visual com os existentes

