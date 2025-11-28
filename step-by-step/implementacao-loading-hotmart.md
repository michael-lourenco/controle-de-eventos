# Implementação do Loading Estilo Hotmart

## Data: 2025-01-27

## Objetivo

Substituir todos os loadings do projeto por um componente unificado no estilo Hotmart, que possui:
- Logo fixa no centro
- Indicador de loading circular girando ao redor da logo

## Componente Criado

### `src/components/LoadingHotmart.tsx`

Componente reutilizável que exibe a logo do sistema no centro com um spinner circular ao redor.

**Características:**
- Três tamanhos disponíveis: `sm`, `md` (padrão), `lg`
- Logo fixa no centro usando `Image` do Next.js
- Spinner circular usando `animate-spin` do Tailwind
- Border transparente na parte superior para criar efeito de rotação
- Z-index para garantir que a logo fique acima do spinner

**Tamanhos:**
- `sm`: 24x24 (logo 32px)
- `md`: 32x32 (logo 48px) - padrão
- `lg`: 48x48 (logo 72px)

## Arquivos Modificados

### Componentes e Páginas Principais

1. **`src/app/page.tsx`**
   - Substituído loading inicial por `<LoadingHotmart size="md" />`

2. **`src/components/Layout.tsx`**
   - Substituído loading de autenticação por `<LoadingHotmart size="md" />`

3. **`src/app/assinatura/page.tsx`**
   - Substituído loading por `<LoadingHotmart size="sm" />`

4. **`src/app/eventos/[id]/page.tsx`**
   - Substituído loading de evento por `<LoadingHotmart size="sm" />`
   - Mantido texto "Carregando evento..." abaixo do loading

5. **`src/app/contratos/novo/page.tsx`**
   - Substituído loading do Suspense por `<LoadingHotmart size="md" />`
   - Mantido texto "Carregando..." abaixo do loading

6. **`src/app/redefinir-senha/page.tsx`**
   - Substituído loading do Suspense por `<LoadingHotmart size="md" />`
   - Substituído loading de verificação por `<LoadingHotmart size="md" />`
   - Mantidos textos informativos abaixo do loading

7. **`src/app/login/page.tsx`**
   - Substituído loading inicial por `<LoadingHotmart size="md" />`

8. **`src/app/esqueci-senha/page.tsx`**
   - Substituído loading inicial por `<LoadingHotmart size="md" />`

## Estrutura do Componente

```tsx
<div className="relative flex items-center justify-center">
  {/* Spinner circular ao redor */}
  <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  
  {/* Logo fixa no centro */}
  <div className="relative z-10">
    <Image src="/logo.png" alt="Clicksehub Logo" width={48} height={48} />
  </div>
</div>
```

## Benefícios

1. **Consistência Visual**: Todos os loadings seguem o mesmo padrão visual
2. **Identidade de Marca**: Logo sempre visível durante o carregamento
3. **Experiência do Usuário**: Loading mais profissional e alinhado com padrões modernos
4. **Reutilização**: Componente único para todos os casos de uso
5. **Flexibilidade**: Três tamanhos disponíveis para diferentes contextos

## Observações

- Os loadings muito pequenos (h-4 w-4) foram mantidos como estavam, pois são muito pequenos para exibir a logo
- O componente usa `priority` na imagem para garantir carregamento rápido
- O spinner usa `border-t-transparent` para criar o efeito de rotação
- O z-index garante que a logo fique sempre acima do spinner

## Testes Recomendados

1. Verificar que o loading aparece corretamente em todas as páginas modificadas
2. Verificar que a logo está centralizada e o spinner gira ao redor
3. Testar os diferentes tamanhos (sm, md, lg)
4. Verificar que não há problemas de performance
5. Testar em diferentes tamanhos de tela

