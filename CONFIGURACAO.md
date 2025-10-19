# Configuração do Sistema Click-se

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration (Obrigatório)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration (Obrigatório)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# Google OAuth (Opcional - para login com Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**⚠️ IMPORTANTE**: Mesmo sem configurar o Firebase, o sistema funcionará com dados mockados para desenvolvimento. Para usar o Firestore, configure as variáveis do Firebase.

## Como Obter as Configurações do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto ou crie um novo
3. Vá em "Configurações do projeto" (ícone de engrenagem)
4. Na aba "Geral", role até "Seus apps"
5. Selecione o app web ou crie um novo
6. Copie as configurações do Firebase

## Como Obter o NEXTAUTH_SECRET

Execute o seguinte comando para gerar uma chave secreta:

```bash
openssl rand -base64 32
```

## Configuração do Google OAuth (Opcional)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ 
4. Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Configure as URLs de redirecionamento:
   - `http://localhost:3000/api/auth/callback/google` (desenvolvimento)
   - `https://yourdomain.com/api/auth/callback/google` (produção)

## Configuração do Firestore

1. No Console do Firebase, vá em "Firestore Database"
2. Crie um banco de dados
3. Configure as regras de segurança (para desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Modos de Execução

### Modo Desenvolvimento (Sem Firebase)
Para desenvolvimento rápido sem configurar o Firebase:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie apenas o arquivo `.env.local` com:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=desenvolvimento_secret_key_123
   ```

3. Execute o projeto:
   ```bash
   npm run dev
   ```

4. Acesse o sistema:
   ```
   http://localhost:3000
   ```

### Modo Produção (Com Firebase)
Para usar com Firebase Firestore:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure todas as variáveis de ambiente no arquivo `.env.local`

3. Execute o projeto:
   ```bash
   npm run dev
   ```

4. Acesse a página de administração para inicializar as collections:
   ```
   http://localhost:3000/admin/collections
   ```

5. Clique em "Migração Completa" para migrar os dados mockados

## Usuários de Teste

Após a configuração, você pode usar os seguintes usuários para teste:

- **Administrador**: admin@clickse.com / qualquer senha (mínimo 3 caracteres)
- **Usuário**: user@clickse.com / qualquer senha (mínimo 3 caracteres)

## Troubleshooting

### Erro de CORS
Se encontrar erros de CORS, verifique se as URLs do Firebase estão corretas.

### Erro de Permissão do Firestore
Verifique se as regras de segurança do Firestore permitem acesso para usuários autenticados.

### Erro de NextAuth
Verifique se o NEXTAUTH_SECRET está configurado e se as URLs estão corretas.
