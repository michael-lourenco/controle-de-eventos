# Configuração de Variáveis de Ambiente

## Variáveis Necessárias para a Vercel

Você precisa configurar as seguintes variáveis de ambiente na Vercel:

### 1. Configuração do Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Configuração do NextAuth.js
```
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=https://controle-de-eventos.vercel.app
```

## Como Configurar na Vercel

1. Acesse o dashboard da Vercel
2. Vá para o projeto "controle-de-eventos"
3. Clique em "Settings" > "Environment Variables"
4. Adicione cada variável acima
5. Faça um novo deploy

## Como Obter as Variáveis do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em "Project Settings" > "General"
4. Role para baixo até "Your apps"
5. Se não tiver um app web, clique em "Add app" > "Web"
6. Copie as configurações do objeto `firebaseConfig`

## Gerar NEXTAUTH_SECRET

Execute este comando no terminal:
```bash
openssl rand -base64 32
```

Ou use este gerador online: https://generate-secret.vercel.app/32
