# Botão "Copiar informações do evento" na lista `/eventos`

**Data:** 2026-07-21  
**Objetivo:** Expor na lista de eventos o mesmo botão de cópia já existente em `/eventos/[id]`.

## Alterações

1. **Util compartilhado** `src/lib/utils/evento-copy-info.ts`
   - `formatEventInfoForCopy(evento, servicosNomes)` — texto padronizado
   - `copiarTextoParaClipboard(text)` — clipboard + fallback

2. **`src/app/eventos/page.tsx`**
   - Gate `BOTAO_COPIAR` via `temPermissao`
   - Botão com tooltip “Copiar informações do evento” / “Informações copiadas!”
   - Usa serviços já carregados por `useServicosPorEventos`

3. **`src/app/eventos/[id]/page.tsx`**
   - Passa a usar o util compartilhado (mesmo texto da lista)

## Função dos arquivos

| Arquivo | Função |
|---------|--------|
| `evento-copy-info.ts` | Formatação e cópia do texto do evento |
| `eventos/page.tsx` | Lista com ações (view, copy, edit, clone, archive) |
| `eventos/[id]/page.tsx` | Detalhe do evento (já tinha o botão) |
