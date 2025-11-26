# Correção de Erro de Memória no Build do Next.js

## Data: 2025

## Problema Identificado

O build do Next.js estava falhando com o erro:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

Este erro ocorre quando o processo Node.js excede o limite padrão de memória heap (geralmente ~2GB) durante o processo de build.

## Causa Raiz

O projeto possui várias dependências pesadas que consomem muita memória durante o processo de build:
- `puppeteer` e suas dependências
- `googleapis` e bibliotecas relacionadas
- `firebase-admin`
- `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner`

Além disso, havia um warning sobre múltiplos lockfiles que poderia estar causando confusão no processo de build.

## Soluções Implementadas

### 1. Aumento do Limite de Memória do Node.js

**Arquivo:** `package.json`

**Alteração:**
- Modificado o script de build para incluir `NODE_OPTIONS=--max-old-space-size=4096`
- Isso aumenta o limite de memória heap de ~2GB para 4GB

**Código:**
```json
"build": "NODE_OPTIONS=--max-old-space-size=4096 next build"
```

**Função:** Permite que o processo de build use até 4GB de memória RAM, evitando o erro de "out of memory".

### 2. Otimizações no Next.js Config

**Arquivo:** `next.config.ts`

#### 2.1. Resolução do Warning de Lockfiles

**Alteração:**
- Adicionado `outputFileTracingRoot: path.join(__dirname)` para resolver o warning sobre múltiplos lockfiles

**Função:** Informa ao Next.js qual é o diretório raiz correto do workspace, evitando confusão com lockfiles em outros diretórios.

#### 2.2. Adição de Pacotes Pesados como Externals

**Alteração:**
- Adicionados os seguintes pacotes em `serverExternalPackages`:
  - `puppeteer`
  - `puppeteer-core`
  - `@puppeteer/browsers`
  - `firebase-admin`
  - `@aws-sdk/client-s3`
  - `@aws-sdk/s3-request-presigner`

**Função:** Evita que o webpack tente fazer bundle desses pacotes pesados durante o build, reduzindo significativamente o uso de memória.

#### 2.3. Otimizações de Webpack

**Alteração:**
- Adicionadas otimizações de webpack:
  ```typescript
  config.optimization = {
    ...config.optimization,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
  };
  ```

**Função:** Usa IDs determinísticos para módulos e chunks, reduzindo o uso de memória e melhorando a cacheabilidade do build.

#### 2.4. Externals no Cliente e Servidor

**Alteração:**
- Reorganizado o código para adicionar pacotes pesados como externals tanto no cliente quanto no servidor
- Criadas constantes `clientExternals` e `serverExternals` para melhor organização

**Função:** Garante que pacotes pesados não sejam incluídos no bundle, reduzindo o tamanho e o uso de memória durante o build.

## Arquivos Modificados

1. **package.json**
   - Script de build atualizado para aumentar limite de memória

2. **next.config.ts**
   - Adicionado `outputFileTracingRoot`
   - Adicionados pacotes pesados em `serverExternalPackages`
   - Otimizações de webpack
   - Melhor organização dos externals

## Resultado Esperado

Após essas alterações, o build deve:
1. ✅ Usar até 4GB de memória (em vez de ~2GB)
2. ✅ Não processar pacotes pesados desnecessariamente
3. ✅ Resolver o warning sobre lockfiles múltiplos
4. ✅ Completar o build com sucesso

## Como Testar

Execute o comando de build:
```bash
yarn run build
```

O build deve completar sem erros de memória.

## Observações

- Se o erro persistir mesmo com 4GB, pode ser necessário aumentar para 6GB ou 8GB alterando o valor em `--max-old-space-size`
- Em ambientes com pouca memória disponível, considere usar um servidor de CI/CD com mais recursos
- As otimizações de webpack também melhoram a performance de builds subsequentes devido ao cache

## Próximos Passos (Opcional)

1. Considerar usar `swc` minifier se ainda não estiver usando (já é padrão no Next.js 15)
2. Avaliar se todos os pacotes pesados são realmente necessários no bundle
3. Considerar code splitting mais agressivo para reduzir o tamanho dos bundles

