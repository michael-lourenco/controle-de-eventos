# Correção do Preview do Contrato no Modo Dark

## Data
2025-01-27

## Problema Identificado
Na página de criação de contratos (`contratos/novo?eventoId=...`), na seção "Preview do Contrato", quando o sistema está em modo dark, o texto do preview ficava branco sobre fundo branco, tornando-o ilegível. Como o contrato será impresso, ele deve sempre exibir texto escuro sobre fundo branco, independentemente do tema do sistema.

## Análise
- **Arquivo afetado**: `src/app/contratos/novo/page.tsx`
- **Linha problemática**: 342
- **Problema**: O div que renderiza o preview HTML tinha apenas `bg-white`, mas não forçava o texto a ser escuro no modo dark
- **Impacto**: Usuários em modo dark não conseguiam visualizar o preview do contrato corretamente

## Solução Implementada

### Alteração Realizada
No arquivo `src/app/contratos/novo/page.tsx`, linha 342, foi adicionado classes CSS do Tailwind para forçar o texto a ser escuro mesmo no modo dark:

**Antes:**
```tsx
<div className="border rounded p-4 bg-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
```

**Depois:**
```tsx
<div className="border rounded p-4 bg-white text-gray-900 [&_*]:text-gray-900 [&_*]:dark:text-gray-900" dangerouslySetInnerHTML={{ __html: previewHtml }} />
```

### Explicação das Classes Adicionadas
- `text-gray-900`: Define o texto do container como escuro
- `[&_*]:text-gray-900`: Força todos os elementos filhos a terem texto escuro (seletor arbitrário do Tailwind)
- `[&_*]:dark:text-gray-900`: Garante que mesmo no modo dark, todos os elementos filhos mantenham texto escuro

## Arquivos Modificados

### 1. `src/app/contratos/novo/page.tsx`
- **Função**: Página de criação de novos contratos
- **Alteração**: Adicionadas classes CSS para forçar texto escuro no preview do contrato
- **Linhas alteradas**: 342

## Testes Realizados
- Verificação de lint: ✅ Sem erros
- Verificação de outros locais onde o preview é renderizado: ✅ Apenas um local encontrado

## Resultado
O preview do contrato agora sempre exibe texto escuro sobre fundo branco, independentemente do tema do sistema (light ou dark), garantindo:
1. Legibilidade adequada em qualquer modo
2. Consistência com a aparência da impressão
3. Melhor experiência do usuário

## Observações
- A solução utiliza seletores arbitrários do Tailwind CSS (`[&_*]`) para aplicar estilos a todos os elementos filhos do container
- Esta abordagem garante que qualquer HTML gerado dinamicamente dentro do preview também terá texto escuro
- O fundo branco (`bg-white`) já estava presente e foi mantido

