# Adição do Ícone do Olho no Dashboard

## Data: 23 de outubro de 2025

## Alterações Realizadas

### 0. **Remoção do Card de Estatísticas**
- Removido item "Eventos Hoje" do array `stats`
- Mantido apenas o card detalhado com lista de eventos

### 1. **Eventos de Hoje**
- Adicionado botão com ícone do olho (EyeIcon) para cada evento
- Usa componente Button com variant="ghost" e size="sm"
- Botão clicável que redireciona para `/eventos/${evento.id}`
- Hover effect com mudança de cor e background
- Tooltip "Visualizar"

### 2. **Próximos Eventos (7 dias)**
- Adicionada coluna "Ações" na tabela
- Botão com ícone do olho em cada linha da tabela
- Mesmo comportamento de redirecionamento
- Mesmo estilo de botão da lista de eventos

### 3. **Imports Adicionados**
- `useRouter` do Next.js para navegação
- `EyeIcon` do Heroicons
- `Button` do componente UI

### 4. **Funcionalidades**
- Redirecionamento direto para a página de detalhes do evento
- Interface consistente entre as duas seções
- Acessibilidade com tooltips e hover states

## Arquivos Modificados
- `src/app/dashboard/page.tsx`

## Resultado
Usuários agora podem clicar no ícone do olho para visualizar detalhes completos de qualquer evento listado no dashboard.
