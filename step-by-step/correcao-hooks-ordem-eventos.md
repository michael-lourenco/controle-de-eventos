# Correção: Ordem dos Hooks na Página de Eventos

**Data de Criação:** 2025-01-XX  
**Status:** Corrigido  
**Problema:** Violação das regras dos Hooks do React

---

## 📋 Resumo do Problema

O React detectou uma mudança na ordem dos Hooks chamados por `EventosPage`. Isso ocorria porque um `useEffect` estava sendo chamado **depois** dos early returns, violando a regra fundamental dos Hooks do React que exige que todos os hooks sejam chamados na mesma ordem em cada render.

### Erro Original

```
React has detected a change in the order of Hooks called by EventosPage.
Previous render: ... (57 hooks)
Next render: ... (58 hooks) - useEffect aparecendo como undefined no render anterior
```

---

## 🔍 Causa Raiz

O `useEffect` que verifica o acesso ao botão copiar estava posicionado **após** os early returns (linha 264), mas **antes** do JSX de retorno. Isso causava:

1. **Quando há early return** (ex: `loading === true`): O `useEffect` não é executado
2. **Quando não há early return**: O `useEffect` é executado
3. **Resultado**: Ordem diferente de hooks entre renders = erro do React

### Estrutura Problemática

```typescript
// ✅ Hooks no topo (linhas 36-51)
const router = useRouter();
const { userId } = useCurrentUser();
// ... outros hooks

// ✅ useMemo (linhas 61-126)
const tiposEventoFilterOptions = React.useMemo(...);
const filteredEventos = useMemo(...);
const sortedEventos = useMemo(...);

// ❌ Early returns (linhas 129-157)
if (loading) return <Layout>...</Layout>;
if (error) return <Layout>...</Layout>;
if (!eventos) return <Layout>...</Layout>;

// ❌ PROBLEMA: useEffect DEPOIS dos early returns (linha 264)
useEffect(() => {
  const verificarAcesso = async () => {
    const acesso = await temPermissao('BOTAO_COPIAR');
    setTemAcessoCopiar(acesso);
  };
  verificarAcesso();
}, [temPermissao]);

// JSX de retorno...
```

---

## ✅ Solução

Mover o `useEffect` para **antes** dos early returns, garantindo que todos os hooks sejam sempre chamados na mesma ordem.

### Estrutura Corrigida

```typescript
// ✅ Hooks no topo (linhas 36-51)
const router = useRouter();
const { userId } = useCurrentUser();
// ... outros hooks

// ✅ useMemo (linhas 61-126)
const tiposEventoFilterOptions = React.useMemo(...);
const filteredEventos = useMemo(...);
const sortedEventos = useMemo(...);

// ✅ useEffect ANTES dos early returns (movido para linha ~127)
useEffect(() => {
  const verificarAcesso = async () => {
    const acesso = await temPermissao('BOTAO_COPIAR');
    setTemAcessoCopiar(acesso);
  };
  verificarAcesso();
}, [temPermissao]);

// ✅ Early returns (linhas 129-157)
if (loading) return <Layout>...</Layout>;
if (error) return <Layout>...</Layout>;
if (!eventos) return <Layout>...</Layout>;

// ✅ JSX de retorno...
```

---

## 📝 Mudanças Realizadas

### Arquivo: `src/app/eventos/page.tsx`

1. **Movido `useEffect`** da linha 264 para antes dos early returns (após os `useMemo`)
2. **Removido `useEffect` duplicado** que estava após a função `formatEventInfoForCopy`

### Antes

```typescript
// Linha ~127: sortedEventos useMemo
const sortedEventos = useMemo(...);

// Linha ~129: Early returns
if (loading) return ...;

// Linha ~264: useEffect (PROBLEMA!)
useEffect(() => {
  const verificarAcesso = async () => {
    const acesso = await temPermissao('BOTAO_COPIAR');
    setTemAcessoCopiar(acesso);
  };
  verificarAcesso();
}, [temPermissao]);
```

### Depois

```typescript
// Linha ~127: sortedEventos useMemo
const sortedEventos = useMemo(...);

// Linha ~128: useEffect (CORRIGIDO!)
useEffect(() => {
  const verificarAcesso = async () => {
    const acesso = await temPermissao('BOTAO_COPIAR');
    setTemAcessoCopiar(acesso);
  };
  verificarAcesso();
}, [temPermissao]);

// Linha ~129: Early returns
if (loading) return ...;
```

---

## 🎯 Regras dos Hooks do React

### Regra Fundamental

> **Sempre chame os hooks no mesmo nível superior. Não chame hooks dentro de loops, condições ou funções aninhadas.**

### Ordem Importante

1. ✅ Todos os hooks devem ser chamados **antes** de qualquer early return
2. ✅ A ordem dos hooks deve ser **sempre a mesma** em cada render
3. ✅ Hooks condicionais são **proibidos**

### Estrutura Correta

```typescript
function Component() {
  // 1. Hooks de contexto/estado
  const context = useContext(...);
  const [state, setState] = useState(...);
  
  // 2. Hooks de efeito
  useEffect(...);
  
  // 3. Hooks de memoização
  const memoized = useMemo(...);
  const callback = useCallback(...);
  
  // 4. Early returns (DEPOIS de todos os hooks)
  if (condition) return <div>...</div>;
  
  // 5. JSX de retorno
  return <div>...</div>;
}
```

---

## ✅ Validação

Após a correção:
- ✅ Todos os hooks são chamados antes dos early returns
- ✅ A ordem dos hooks é consistente em cada render
- ✅ Não há mais erro do React sobre ordem de hooks
- ✅ Funcionalidade do botão copiar continua funcionando

---

## 🔗 Referências

- [Rules of Hooks - React Documentation](https://react.dev/reference/rules/rules-of-hooks)
- [Hooks API Reference - React](https://react.dev/reference/react)

---

**Última Atualização:** 2025-01-XX

