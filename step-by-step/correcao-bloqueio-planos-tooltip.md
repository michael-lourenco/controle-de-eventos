# Correção do Bloqueio de Planos com Tooltip

## Data: 2025-01-27

## Objetivo
Substituir o componente `PlanoBloqueio` (que exibia um componente gigante informando bloqueio) por uma solução mais elegante usando Tooltip com botão desabilitado, seguindo o mesmo padrão implementado no botão "Gerar Contrato" em `/eventos/[id]`.

## Problema Identificado
Nas páginas `/canais-entrada`, `/tipos-eventos` e `/tipos-custos`, quando o usuário estava no plano `BASICO_MENSAL`, o componente `PlanoBloqueio` exibia um componente grande informando que a funcionalidade estava bloqueada, causando uma experiência ruim de usuário.

## Solução Aplicada
Aplicada a mesma solução usada no botão "Gerar Contrato" em `/eventos/[id]/page.tsx`:
- Verificar acesso usando `temPermissao('TIPOS_PERSONALIZADO')`
- Se tiver acesso: mostrar botão normal
- Se não tiver acesso: mostrar botão desabilitado com Tooltip explicando o bloqueio

## Alterações Realizadas

### 1. Página Canais de Entrada (`src/app/canais-entrada/page.tsx`)

**Imports adicionados:**
```tsx
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
```

**Estado e verificação de acesso:**
- Adicionado `statusPlano` ao hook `usePlano()`
- Adicionado estado `temAcessoPersonalizado`
- Adicionado `useEffect` para verificar acesso a `TIPOS_PERSONALIZADO`

**Substituição do PlanoBloqueio:**
- Removido `PlanoBloqueio` envolvendo o botão "Novo Canal"
- Implementado condicional: se `temAcessoPersonalizado === true`, mostra botão normal; caso contrário, mostra botão desabilitado com Tooltip
- Removido `PlanoBloqueio` do formulário de novo canal

**Função:** O botão "Novo Canal" agora mostra um tooltip elegante quando bloqueado, em vez de um componente grande que ocupa muito espaço.

### 2. Página Tipos de Evento (`src/app/tipos-eventos/page.tsx`)

**Imports adicionados:**
```tsx
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
```

**Estado e verificação de acesso:**
- Adicionado `statusPlano` ao hook `usePlano()`
- Adicionado estado `temAcessoPersonalizado`
- Adicionado `useEffect` para verificar acesso a `TIPOS_PERSONALIZADO`

**Substituição do PlanoBloqueio:**
- Removido `PlanoBloqueio` envolvendo o botão "Novo Tipo"
- Implementado condicional: se `temAcessoPersonalizado === true`, mostra botão normal; caso contrário, mostra botão desabilitado com Tooltip
- Removido `PlanoBloqueio` do formulário de novo tipo

**Função:** O botão "Novo Tipo" agora mostra um tooltip elegante quando bloqueado, em vez de um componente grande que ocupa muito espaço.

### 3. Página Tipos de Custo (`src/app/tipos-custos/page.tsx`)

**Imports adicionados:**
```tsx
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
```

**Estado e verificação de acesso:**
- Adicionado `statusPlano` ao hook `usePlano()` (já tinha `temPermissao`)
- Estado `temAcessoPersonalizado` já existia, apenas atualizado o `useEffect` para usar `statusPlano`

**Substituição do PlanoBloqueio:**
- Removido `PlanoBloqueio` envolvendo o botão "Novo Tipo"
- Implementado condicional: se `temAcessoPersonalizado === true`, mostra botão normal; caso contrário, mostra botão desabilitado com Tooltip
- Removido `PlanoBloqueio` do formulário de novo tipo

**Função:** O botão "Novo Tipo" agora mostra um tooltip elegante quando bloqueado, em vez de um componente grande que ocupa muito espaço.

## Estrutura do Tooltip

O Tooltip implementado segue o mesmo padrão do botão "Gerar Contrato":

1. **Botão Desabilitado:**
   - Variant: `outline`
   - Classe: `cursor-not-allowed`
   - Ícone: `LockClosedIcon`
   - Texto do botão mantido

2. **Conteúdo do Tooltip:**
   - Estilo: warning (fundo amarelo/laranja)
   - Título: "Acesso Bloqueado" com ícone de cadeado
   - Mensagem explicativa sobre o bloqueio
   - Informação do plano atual (se disponível)
   - Botão "Ver Planos Disponíveis" que redireciona para `/assinatura`

## Arquivos Modificados

1. **src/app/canais-entrada/page.tsx**
   - Função: Página de gerenciamento de canais de entrada
   - Alteração: Substituição de `PlanoBloqueio` por Tooltip no botão "Novo Canal"

2. **src/app/tipos-eventos/page.tsx**
   - Função: Página de gerenciamento de tipos de evento
   - Alteração: Substituição de `PlanoBloqueio` por Tooltip no botão "Novo Tipo"

3. **src/app/tipos-custos/page.tsx**
   - Função: Página de gerenciamento de tipos de custo
   - Alteração: Substituição de `PlanoBloqueio` por Tooltip no botão "Novo Tipo"

## Resultado
Agora todas as três páginas seguem o mesmo padrão visual do botão "Gerar Contrato":
- ✅ Botão desabilitado com ícone de cadeado quando bloqueado
- ✅ Tooltip elegante explicando o bloqueio ao passar o mouse
- ✅ Informação do plano atual
- ✅ Botão para ver planos disponíveis
- ✅ Sem componentes grandes ocupando espaço desnecessário

## Impacto
- **UX:** Melhora significativa na experiência do usuário, com feedback mais discreto e elegante
- **Consistência:** Todas as páginas agora seguem o mesmo padrão de bloqueio
- **Visual:** Interface mais limpa, sem componentes grandes bloqueando a visualização
- **Funcionalidade:** Mantém todas as funcionalidades, apenas melhora a apresentação

## Observações
- Nenhum erro de lint foi introduzido pelas alterações
- O componente `PlanoBloqueio` ainda pode ser usado em outros contextos onde um bloqueio mais visível seja necessário
- A verificação de acesso é feita de forma assíncrona usando `useEffect` e `temPermissao`
- O Tooltip só aparece quando o usuário passa o mouse sobre o botão desabilitado
- A solução é responsiva e funciona bem em diferentes tamanhos de tela

