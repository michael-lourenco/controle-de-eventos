# Correção: Erro de Credenciais do Firebase Admin

## Data: 2025

## Problema Identificado

Ao tentar solicitar reset de senha, o sistema apresentava o seguinte erro:

```
Error: Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error: "Error fetching access token: Error while making request: getaddrinfo ENOTFOUND metadata.google.internal. Error code: ENOTFOUND".
```

## Causa Raiz

O erro ocorria porque:

1. **Credenciais não configuradas**: As variáveis de ambiente `FIREBASE_ADMIN_SDK_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY` não estavam configuradas.

2. **Fallback para ADC**: Quando não havia credenciais explícitas, o código tentava usar Application Default Credentials (ADC), que busca credenciais do Google Cloud Metadata Service (`metadata.google.internal`).

3. **Ambiente local**: Em ambiente local (não Google Cloud), o Metadata Service não existe, causando o erro `ENOTFOUND`.

4. **Erro silencioso**: O erro era capturado silenciosamente no bloco `catch`, mas o `adminAuth` ficava `null`, causando erro posterior ao tentar usá-lo.

## Solução Implementada

### 1. Remoção do Fallback para ADC

**Arquivo:** `src/lib/firebase-admin.ts`

**Alteração:**
- Removido o fallback que tentava usar Application Default Credentials
- Agora, se não houver credenciais configuradas, o sistema lança um erro claro ao invés de tentar usar ADC

**Código Antes:**
```typescript
} else {
  // Fallback: usar Application Default Credentials ou variáveis de ambiente individuais
  adminApp = initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}
```

**Código Depois:**
```typescript
} else {
  // NÃO tentar usar Application Default Credentials em ambiente local
  // Isso causa erro "ENOTFOUND metadata.google.internal"
  const errorMessage = 'Firebase Admin não pode ser inicializado: credenciais não configuradas. Configure FIREBASE_ADMIN_SDK_KEY ou FIREBASE_SERVICE_ACCOUNT_KEY nas variáveis de ambiente.';
  console.error('[firebase-admin] ❌', errorMessage);
  initializationError = new Error(errorMessage);
  throw initializationError;
}
```

**Função:** Evita tentar usar ADC em ambiente local, forçando a configuração correta das credenciais.

### 2. Logs Detalhados na Inicialização

**Alteração:**
- Adicionados logs detalhados em cada etapa da inicialização
- Logs mostram quais credenciais estão configuradas
- Logs mostram qual método de autenticação está sendo usado
- Logs de erro completos com tipo, mensagem e stack trace

**Logs Adicionados:**
```typescript
- [firebase-admin] Iniciando inicialização do Firebase Admin...
- [firebase-admin] Verificando configuração:
- [firebase-admin] - FIREBASE_ADMIN_SDK_KEY: ✓ configurada / ✗ não configurada
- [firebase-admin] - FIREBASE_SERVICE_ACCOUNT_KEY: ✓ configurada / ✗ não configurada
- [firebase-admin] - NEXT_PUBLIC_FIREBASE_PROJECT_ID: ✓ ... / ✗ não configurada
- [firebase-admin] Usando FIREBASE_ADMIN_SDK_KEY...
- [firebase-admin] ✅ Firebase Admin inicializado com FIREBASE_ADMIN_SDK_KEY
- [firebase-admin] ✅ Serviços do Firebase Admin inicializados com sucesso
```

**Função:** Facilita identificar problemas de configuração durante desenvolvimento e produção.

### 3. Funções Helper para Verificação

**Alteração:**
- Adicionadas funções helper para verificar se o Firebase Admin está inicializado
- Função para obter o erro de inicialização (se houver)

**Código:**
```typescript
// Função helper para verificar se o Firebase Admin está inicializado
export function isFirebaseAdminInitialized(): boolean {
  return adminApp !== null && adminAuth !== null && adminDb !== null;
}

// Função helper para obter erro de inicialização
export function getFirebaseAdminInitializationError(): Error | null {
  return initializationError;
}
```

**Função:** Permite que outros módulos verifiquem se o Firebase Admin está configurado antes de tentar usá-lo.

### 4. Verificação Prévia nos Endpoints

**Arquivos:**
- `src/app/api/auth/reset-password/route.ts`
- `src/app/api/auth/reset-password-custom/route.ts`

**Alteração:**
- Adicionada verificação se o Firebase Admin está inicializado ANTES de tentar usá-lo
- Se não estiver inicializado, retorna erro claro ao invés de tentar usar e falhar

**Código:**
```typescript
// Verificar se o Firebase Admin está inicializado
console.log('[reset-password] Verificando se Firebase Admin está inicializado...');
if (!isFirebaseAdminInitialized()) {
  const initError = getFirebaseAdminInitializationError();
  console.error('[reset-password] ❌ Firebase Admin não está inicializado');
  if (initError) {
    console.error('[reset-password] Erro de inicialização:', initError.message);
  }
  return NextResponse.json(
    { 
      success: false,
      error: 'Firebase Admin não está configurado. Configure FIREBASE_ADMIN_SDK_KEY ou FIREBASE_SERVICE_ACCOUNT_KEY nas variáveis de ambiente.'
    },
    { status: 500 }
  );
}
```

**Função:** Evita erros em runtime e fornece mensagens claras sobre o que está faltando.

### 5. Melhor Tratamento de Erros de Parse

**Alteração:**
- Adicionado tratamento específico para erros de parse das credenciais
- Logs detalhados quando há erro ao fazer parse do JSON

**Código:**
```typescript
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY!);
  // ...
} catch (parseError: any) {
  console.error('[firebase-admin] ❌ Erro ao fazer parse do FIREBASE_ADMIN_SDK_KEY:', parseError.message);
  throw new Error(`Erro ao fazer parse do FIREBASE_ADMIN_SDK_KEY: ${parseError.message}`);
}
```

**Função:** Facilita identificar quando as credenciais estão mal formatadas.

## Arquivos Modificados

1. **src/lib/firebase-admin.ts**
   - Removido fallback para Application Default Credentials
   - Adicionados logs detalhados na inicialização
   - Adicionadas funções helper para verificação
   - Melhorado tratamento de erros de parse
   - Variáveis agora podem ser `null` para indicar não inicializado

2. **src/app/api/auth/reset-password/route.ts**
   - Adicionada verificação prévia se Firebase Admin está inicializado
   - Logs detalhados sobre o status da inicialização

3. **src/app/api/auth/reset-password-custom/route.ts**
   - Adicionada verificação prévia se Firebase Admin está inicializado
   - Uso de non-null assertion (`!`) após verificação

## Como Configurar as Credenciais

### Opção 1: GOOGLE_CREDENTIALS_* (Variáveis Individuais) - Já Configurado

Se você já tem as credenciais configuradas com o prefixo `GOOGLE_CREDENTIALS_*`, o sistema agora as detecta automaticamente. As variáveis necessárias são:

```env
GOOGLE_CREDENTIALS_TYPE=service_account
GOOGLE_CREDENTIALS_PROJECT_ID=seu-projeto-id
GOOGLE_CREDENTIALS_PRIVATE_KEY_ID="..."
GOOGLE_CREDENTIALS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CREDENTIALS_CLIENT_EMAIL=firebase-adminsdk-xxx@projeto.iam.gserviceaccount.com
GOOGLE_CREDENTIALS_CLIENT_ID="..."
GOOGLE_CREDENTIALS_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_CREDENTIALS_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_CREDENTIALS_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
GOOGLE_CREDENTIALS_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
GOOGLE_CREDENTIALS_UNIVERSE_DOMAIN=googleapis.com
```

**Nota:** O sistema converte automaticamente `\n` na `PRIVATE_KEY` para quebras de linha reais.

### Opção 2: FIREBASE_ADMIN_SDK_KEY (JSON Completo)

1. **Obter Service Account Key do Firebase:**
   - Acesse o Firebase Console
   - Vá em Project Settings > Service Accounts
   - Clique em "Generate new private key"
   - Baixe o arquivo JSON

2. **Configurar variável de ambiente:**
   - Abra o arquivo JSON baixado
   - Copie TODO o conteúdo do JSON
   - Adicione ao `.env.local`:
   ```env
   FIREBASE_ADMIN_SDK_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
   - **IMPORTANTE:** O JSON deve estar em uma única linha, com aspas simples externas e aspas duplas internas escapadas ou usando template string

### Opção 3: FIREBASE_SERVICE_ACCOUNT_KEY (Base64)

1. **Obter Service Account Key do Firebase** (mesmo processo da Opção 1)

2. **Converter para Base64:**
   ```bash
   cat service-account-key.json | base64
   ```

3. **Configurar variável de ambiente:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY='<base64-encoded-json>'
   ```

### Opção 4: Arquivo de Credenciais (Não Recomendado para Produção)

Para desenvolvimento local, você pode usar um arquivo de credenciais, mas isso requer modificação do código e não é recomendado para produção.

## Verificação da Configuração

Após configurar as credenciais, reinicie o servidor e verifique os logs. Você deve ver:

```
[firebase-admin] Iniciando inicialização do Firebase Admin...
[firebase-admin] Verificando configuração:
[firebase-admin] - FIREBASE_ADMIN_SDK_KEY: ✗ não configurada
[firebase-admin] - FIREBASE_SERVICE_ACCOUNT_KEY: ✗ não configurada
[firebase-admin] - GOOGLE_CREDENTIALS_*: ✓ configurada
[firebase-admin] - NEXT_PUBLIC_FIREBASE_PROJECT_ID: ✓ seu-projeto-id
[firebase-admin] Usando GOOGLE_CREDENTIALS_* (variáveis individuais)...
[firebase-admin] ✅ Firebase Admin inicializado com GOOGLE_CREDENTIALS_*
[firebase-admin] ✅ Serviços do Firebase Admin inicializados com sucesso
```

## Resultado Esperado

Após essas alterações:

1. ✅ O sistema não tenta mais usar Application Default Credentials em ambiente local
2. ✅ Erros de configuração são detectados na inicialização, não em runtime
3. ✅ Logs detalhados facilitam identificar problemas de configuração
4. ✅ Mensagens de erro claras indicam exatamente o que está faltando
5. ✅ Endpoints verificam se o Firebase Admin está inicializado antes de usar

## Testando

1. Configure as credenciais no `.env` ou `.env.local`:
   - Se já tem `GOOGLE_CREDENTIALS_*` configuradas, o sistema as detecta automaticamente
   - Ou configure `FIREBASE_ADMIN_SDK_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY`
2. Reinicie o servidor de desenvolvimento
3. Verifique os logs - deve mostrar que o Firebase Admin foi inicializado com sucesso
4. Teste o reset de senha - deve funcionar corretamente

## Observações Importantes

- **Nunca commite** arquivos de credenciais ou `.env.local` no Git
- Use variáveis de ambiente diferentes para dev, test e prod
- Em produção, configure as credenciais nas variáveis de ambiente da plataforma (Vercel, Railway, etc.)
- O sistema agora é mais rigoroso: não permite inicialização sem credenciais explícitas
- Isso força a configuração correta e evita erros em runtime

## Próximos Passos (Opcional)

1. Adicionar validação do formato das credenciais na inicialização
2. Criar script de setup para facilitar a configuração inicial
3. Adicionar página de status mostrando se o Firebase Admin está configurado
4. Considerar usar variáveis de ambiente individuais ao invés de JSON completo (mais seguro)

