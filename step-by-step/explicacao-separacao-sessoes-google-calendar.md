# 🔐 Explicação: Separação de Sessões - Sistema vs Google Calendar

## 📋 Resumo

As sessões do sistema e do Google Calendar são **completamente separadas** e não se misturam. Cada uma tem seu próprio propósito e armazenamento.

---

## 🎯 Duas Sessões Diferentes

### 1. **Sessão do Sistema (NextAuth)**
- **Propósito**: Autenticar o usuário no sistema Clicksehub
- **Onde é armazenada**: Cookies do navegador (JWT)
- **O que contém**: ID do usuário, email, nome, role (admin/user)
- **Duração**: Controlada pelo NextAuth (geralmente até logout ou expiração)
- **Uso**: Identificar **QUEM** está usando o sistema

### 2. **Tokens do Google Calendar (OAuth2)**
- **Propósito**: Autorizar acesso à API do Google Calendar
- **Onde é armazenado**: Firestore (collection `google_calendar_tokens`)
- **O que contém**: Access Token, Refresh Token (criptografados)
- **Duração**: Access Token expira em ~1 hora, Refresh Token é permanente (até revogação)
- **Uso**: Acessar a API do Google Calendar **EM NOME DO USUÁRIO**

---

## 🔄 Fluxo de Separação

### Passo 1: Usuário faz login no sistema
```
Usuário → Login → NextAuth → Sessão JWT criada
```
- Sessão armazenada em cookie do navegador
- Contém apenas: `userId`, `email`, `name`, `role`
- **NÃO contém tokens do Google Calendar**

### Passo 2: Usuário conecta Google Calendar
```
Usuário → Clica "Conectar" → OAuth Flow do Google → Tokens recebidos
```
- Tokens são **armazenados no Firestore** (não na sessão)
- Collection: `google_calendar_tokens`
- Documento vinculado ao `userId` da sessão do sistema
- Tokens são **criptografados** antes de salvar

### Passo 3: Usar Google Calendar API
```
Requisição → Verifica sessão do sistema (userId) → Busca tokens no Firestore → Usa tokens para API do Google
```

---

## 🗄️ Armazenamento Separado

### Sessão do Sistema (NextAuth)
```typescript
// Armazenado em cookie JWT
{
  userId: "cq4RqZVCbFSwkpnXVzKGWF8znKj2",
  email: "usuario@exemplo.com",
  name: "Nome do Usuário",
  role: "user"
}
```

### Tokens do Google Calendar
```typescript
// Armazenado no Firestore: google_calendar_tokens/{tokenId}
{
  id: "token_id_123",
  userId: "cq4RqZVCbFSwkpnXVzKGWF8znKj2", // ← Vinculado ao userId da sessão
  accessToken: "ya29.encrypted...",        // ← Criptografado
  refreshToken: "1//05.encrypted...",     // ← Criptografado
  expiresAt: Date,
  calendarId: "primary",
  syncEnabled: true,
  dataCadastro: Date,
  dataAtualizacao: Date
}
```

---

## 🔗 Como Eles se Conectam (Sem se Misturar)

### 1. **Identificação do Usuário**
```typescript
// Em qualquer API route do Google Calendar
const session = await getServerSession(authOptions); // ← Sessão do sistema
const userId = session.user.id; // ← Pega apenas o ID do usuário
```

### 2. **Busca dos Tokens**
```typescript
// Busca tokens do Google Calendar usando o userId
const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
const token = await tokenRepo.findByUserId(userId); // ← Busca no Firestore
```

### 3. **Uso dos Tokens**
```typescript
// Usa tokens para autenticar na API do Google
const accessToken = decrypt(token.accessToken, ENCRYPTION_KEY);
oauth2Client.setCredentials({ access_token: accessToken });
```

---

## 🛡️ Por Que Não se Misturam?

### 1. **Armazenamento Diferente**
- **Sessão do sistema**: Cookie do navegador (JWT)
- **Tokens do Google**: Firestore (banco de dados)

### 2. **Propósito Diferente**
- **Sessão do sistema**: "Quem está logado?"
- **Tokens do Google**: "Como acessar o Google Calendar?"

### 3. **Ciclo de Vida Diferente**
- **Sessão do sistema**: Expira quando usuário faz logout
- **Tokens do Google**: Permanecem até desconectar ou revogar

### 4. **Escopo Diferente**
- **Sessão do sistema**: Acesso ao sistema Clicksehub
- **Tokens do Google**: Acesso à API do Google Calendar

---

## 📊 Exemplo Prático

### Cenário: Usuário cria evento no Google Calendar

```typescript
// 1. Verifica sessão do sistema (identifica usuário)
const session = await getServerSession(authOptions);
const userId = session.user.id; // "cq4RqZVCbFSwkpnXVzKGWF8znKj2"

// 2. Busca tokens do Google Calendar (usando userId)
const token = await tokenRepo.findByUserId(userId);
// Retorna: { accessToken: "ya29...", refreshToken: "1//05..." }

// 3. Descriptografa tokens
const accessToken = decrypt(token.accessToken, ENCRYPTION_KEY);

// 4. Usa tokens para autenticar na API do Google
oauth2Client.setCredentials({ access_token: accessToken });

// 5. Cria evento no Google Calendar
await calendar.events.insert({ ... });
```

**Observação importante**: 
- A sessão do sistema apenas **identifica** o usuário
- Os tokens do Google são **buscados separadamente** no Firestore
- Os tokens são usados **apenas** para a API do Google

---

## 🔐 Segurança

### 1. **Tokens Criptografados**
```typescript
// Tokens são criptografados antes de salvar
const encryptedAccessToken = encrypt(tokens.accessToken, ENCRYPTION_KEY);
await tokenRepo.create({ accessToken: encryptedAccessToken, ... });
```

### 2. **Vinculação por userId**
```typescript
// Cada token está vinculado a um userId específico
const token = await tokenRepo.findByUserId(userId);
// Só retorna tokens do usuário autenticado
```

### 3. **Validação de Sessão**
```typescript
// Sempre verifica sessão antes de usar tokens
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
}
```

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO                              │
└─────────────────────────────────────────────────────────┘
                        │
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐              ┌──────────────────┐
│ SESSÃO SISTEMA│              │ TOKENS GOOGLE     │
│ (NextAuth)    │              │ (OAuth2)         │
├───────────────┤              ├──────────────────┤
│ Cookie JWT    │              │ Firestore        │
│ userId        │──────────────▶ userId           │
│ email         │   Vinculação │ accessToken      │
│ name          │              │ refreshToken     │
│ role          │              │ (criptografados) │
└───────────────┘              └──────────────────┘
        │                               │
        │                               │
        ▼                               ▼
┌───────────────┐              ┌──────────────────┐
│ Identifica    │              │ Acessa API       │
│ QUEM é o      │              │ Google Calendar  │
│ usuário       │              │ EM NOME DO       │
│               │              │ USUÁRIO           │
└───────────────┘              └──────────────────┘
```

---

## ✅ Vantagens dessa Separação

1. **Segurança**: Tokens sensíveis não ficam em cookies
2. **Flexibilidade**: Tokens podem ser renovados sem afetar sessão do sistema
3. **Isolamento**: Problemas com Google não afetam login no sistema
4. **Multi-dispositivo**: Tokens podem ser acessados de diferentes dispositivos (se necessário)
5. **Auditoria**: Histórico de tokens no Firestore

---

## 🔍 Como Verificar

### No Código:
```typescript
// Sessão do sistema (não contém tokens do Google)
const session = await getServerSession(authOptions);
console.log(session.user.id); // ✅ Apenas ID do usuário

// Tokens do Google (buscados separadamente)
const token = await tokenRepo.findByUserId(session.user.id);
console.log(token.accessToken); // ✅ Token do Google (criptografado)
```

### No Firestore:
- Collection: `google_calendar_tokens`
- Cada documento tem `userId` vinculado
- Tokens estão criptografados

### No Navegador:
- Cookie: `next-auth.session-token` (contém apenas sessão do sistema)
- **NÃO contém** tokens do Google Calendar

---

## 📝 Conclusão

As sessões são **completamente separadas**:

1. **Sessão do sistema** (NextAuth) → Identifica o usuário
2. **Tokens do Google** (Firestore) → Autoriza acesso ao Google Calendar
3. **Vinculação** → Através do `userId` (não mistura os dados)
4. **Segurança** → Tokens criptografados e armazenados separadamente

**Resultado**: Sistema seguro, organizado e fácil de manter! 🎉

---

**Data de Criação**: 2025-01-XX  
**Autor**: Auto (Cursor AI)

