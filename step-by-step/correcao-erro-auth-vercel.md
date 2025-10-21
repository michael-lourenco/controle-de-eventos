# Correção do Erro de Autenticação na Vercel

## Data: 2025-01-27

## Problema Identificado
Erro `500 (Internal Server Error)` nas rotas de autenticação:
- `/api/auth/_log`
- `/api/auth/error`

## Causa do Problema
O erro ocorre porque as **variáveis de ambiente não estão configuradas na Vercel**:

1. **NEXTAUTH_SECRET:** Necessário para o NextAuth.js funcionar em produção
2. **Variáveis do Firebase:** Necessárias para autenticação com Firebase
3. **NEXTAUTH_URL:** URL da aplicação em produção

## Correções Implementadas

### 1. Melhorias na Configuração de Autenticação
**Arquivo:** `src/lib/auth-config.ts`
- Adicionada verificação se o Firebase está configurado
- Melhorado tratamento de erros
- Adicionado fallback para modo de desenvolvimento
- Configurado `NEXTAUTH_SECRET` obrigatório

### 2. Configuração Robusta do Firebase
**Arquivo:** `src/lib/firebase.ts`
- Adicionados valores padrão para evitar erros de inicialização
- Configuração mais robusta para ambientes sem Firebase configurado

### 3. Documentação de Configuração
**Arquivo:** `ENV_SETUP.md`
- Instruções detalhadas para configurar variáveis na Vercel
- Guia para obter configurações do Firebase
- Comandos para gerar NEXTAUTH_SECRET

## Solução para o Usuário

### Passo 1: Configurar Variáveis na Vercel
1. Acesse o dashboard da Vercel
2. Vá para o projeto "controle-de-eventos"
3. Clique em "Settings" > "Environment Variables"
4. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:
```
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=https://controle-de-eventos.vercel.app
```

#### Variáveis do Firebase (se configurado):
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### Passo 2: Gerar NEXTAUTH_SECRET
Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

### Passo 3: Fazer Novo Deploy
Após configurar as variáveis, faça um novo deploy na Vercel.

## Modo de Desenvolvimento
Se não configurar o Firebase, o sistema funcionará em modo de desenvolvimento com:
- **admin@clickse.com** / qualquer senha (admin)
- **user@clickse.com** / qualquer senha (usuário)

## Status
- ✅ Código corrigido para ser mais robusto
- ✅ Documentação criada
- ⏳ Aguardando configuração das variáveis na Vercel
