# Configuração do Sistema de Email de Reset de Senha

## Problema Resolvido

O sistema agora envia emails de reset de senha em **português** com URLs curtas e profissionais, em vez dos emails padrão do Firebase que são em inglês e têm URLs muito longas.

## O que foi implementado

1. ✅ **Template de email em português** - Email profissional e limpo
2. ✅ **URL curta e limpa** - Em vez de URLs gigantes do Firebase, agora é: `https://seudominio.com/redefinir-senha?token=abc123...`
3. ✅ **Sistema de tokens** - Tokens curtos e seguros que são convertidos internamente para códigos do Firebase
4. ✅ **Suporte a ambos os formatos** - O sistema ainda funciona com links diretos do Firebase (fallback)

## Configuração Necessária

### 1. Firebase Admin SDK

O sistema usa Firebase Admin SDK para gerar os códigos de reset. Configure uma das seguintes opções:

**Opção A: Service Account Key (Recomendado para produção)**
1. No Firebase Console, vá em "Project Settings" > "Service Accounts"
2. Clique em "Generate New Private Key"
3. Baixe o arquivo JSON
4. Adicione ao `.env.local`:
   ```env
   FIREBASE_ADMIN_SDK_KEY='{"type":"service_account",...}'
   ```
   Ou codifique em base64:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY=<base64_encoded_json>
   ```

**Opção B: Application Default Credentials (Para servidores Google Cloud)**
- Configure as credenciais padrão do Google Cloud

### 2. Serviço de Envio de Email

O sistema atualmente **simula** o envio de email. Você precisa implementar um serviço real.

**Opções recomendadas:**

#### Opção A: Resend (Recomendado - Mais simples)
1. Instale: `yarn add resend`
2. Crie conta em: https://resend.com
3. Obtenha API key
4. Atualize `src/app/api/auth/reset-password-custom/route.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: 'Clicksehub <noreply@seudominio.com>',
    to,
    subject,
    html,
  });
  return { success: true };
}
```

Adicione ao `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
```

#### Opção B: SendGrid
1. Instale: `yarn add @sendgrid/mail`
2. Crie conta em: https://sendgrid.com
3. Obtenha API key
4. Atualize a função `sendEmail`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({
    to,
    from: 'noreply@seudominio.com',
    subject,
    html,
  });
  return { success: true };
}
```

#### Opção C: Nodemailer (SMTP)
Para usar seu próprio servidor SMTP:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@seudominio.com',
    to,
    subject,
    html,
  });
  return { success: true };
}
```

### 3. Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Firebase Admin (uma das opções)
FIREBASE_ADMIN_SDK_KEY='{"type":"service_account",...}'
# OU
FIREBASE_SERVICE_ACCOUNT_KEY=<base64_encoded_json>

# Serviço de Email (escolha um)
RESEND_API_KEY=re_xxxxxxxxxxxx
# OU
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
# OU
SMTP_HOST=smtp.seudominio.com
SMTP_PORT=587
SMTP_USER=noreply@seudominio.com
SMTP_PASS=sua_senha
SMTP_FROM=Clicksehub <noreply@seudominio.com>

# URL da aplicação
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

## Como Funciona

1. Usuário solicita reset em `/esqueci-senha`
2. Sistema gera código do Firebase via Admin SDK
3. Sistema cria token curto e armazena no banco
4. Sistema envia email em português com URL curta: `/redefinir-senha?token=abc123...`
5. Usuário clica no link
6. Sistema converte token curto no código do Firebase
7. Sistema valida e permite redefinição da senha

## Fallback

Se o sistema customizado falhar, ele automaticamente usa o sistema padrão do Firebase (email em inglês com URL longa).

## Testando

1. Configure o Firebase Admin SDK
2. Configure um serviço de email (Resend recomendado)
3. Teste o fluxo completo em `/esqueci-senha`
4. Verifique se o email chega com o formato correto

## Nota Importante

⚠️ **O sistema atualmente SIMULA o envio de email**. Você DEVE implementar um serviço real de email antes de usar em produção, caso contrário os emails não serão enviados.

