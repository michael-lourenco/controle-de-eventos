# Correções do Tema Dark - Click-se Sistema

## Problema Identificado
O tema dark está parcialmente aplicado. Apenas o background do menu superior e as letras do menu esquerdo foram alteradas, mas muitos itens ainda possuem cores hardcoded que não respondem ao tema.

## Análise Realizada
- ✅ Contexto de tema está funcionando corretamente
- ✅ Variáveis CSS estão definidas no globals.css
- ❌ Muitos componentes ainda usam cores hardcoded do Tailwind
- ❌ Cores de texto, background e bordas não estão usando as variáveis do tema

## Cores Hardcoded Encontradas
### Cores de Texto:
- `text-red-600`, `text-green-600`, `text-blue-600`, `text-orange-600`
- `text-gray-500`, `text-gray-600`, `text-gray-700`, `text-gray-900`
- `text-yellow-600`, `text-purple-600`

### Cores de Background:
- `bg-red-100`, `bg-green-100`, `bg-blue-100`, `bg-orange-100`
- `bg-gray-50`, `bg-gray-100`, `bg-gray-200`
- `bg-yellow-100`, `bg-purple-100`

## Plano de Correção
1. Substituir cores de texto hardcoded por variáveis do tema
2. Substituir cores de background hardcoded por variáveis do tema
3. Manter cores semânticas (sucesso, erro, aviso) mas adaptá-las ao tema
4. Testar em ambos os temas (light e dark)

## Arquivos a Serem Corrigidos
- `src/app/dashboard/page.tsx`
- `src/components/Layout.tsx`
- `src/app/eventos/page.tsx`
- `src/app/login/page.tsx`
- `src/components/AnexosEvento.tsx`
- `src/app/eventos/[id]/page.tsx`
- E outros componentes identificados

## Status
🔄 Em andamento - Corrigindo cores hardcoded

## Progresso Realizado
### ✅ Arquivos Corrigidos:
1. **src/app/globals.css** - Adicionadas variáveis de cores semânticas para light e dark mode
2. **src/app/dashboard/page.tsx** - Substituídas todas as cores hardcoded por variáveis do tema
3. **src/components/Layout.tsx** - Corrigidas cores do sidebar e elementos de navegação
4. **src/components/ThemeToggle.tsx** - Atualizado para usar variáveis do tema
5. **src/app/login/page.tsx** - Corrigidas cores de texto e background
6. **src/app/eventos/page.tsx** - Corrigidas cores de status, filtros e elementos da interface

### 🔄 Próximos Arquivos a Corrigir:
- src/components/AnexosEvento.tsx
- src/app/eventos/[id]/page.tsx
- src/components/PagamentoHistorico.tsx
- src/components/forms/PagamentoForm.tsx
- src/app/pagamentos/page.tsx
- src/app/relatorios/page.tsx
- src/app/register/page.tsx
- src/app/admin/collections/page.tsx
- src/app/admin/migration/page.tsx
- src/app/admin/users/page.tsx
- src/components/CustosEvento.tsx
- src/components/filters/DateRangeFilter.tsx
