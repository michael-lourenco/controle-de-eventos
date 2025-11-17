# Configuração de Recuperação de Senha

## ✅ Implementação Completa

Todas as 7 ações foram implementadas com sucesso:

1. ✅ Página `/esqueci-senha` com formulário de email
2. ✅ Link "Esqueci minha senha" na página de login
3. ✅ API route para enviar email de reset usando `sendPasswordResetEmail`
4. ✅ Página `/redefinir-senha` para definir nova senha
5. ✅ API route para confirmar reset de senha
6. ✅ Validações de senha iguais ao cadastro (6 caracteres, maiúscula, minúscula, número, caractere especial)
7. ✅ Rate limiting básico (5 tentativas por hora por email)

## 🔧 O que você precisa fazer no Firebase Console

### 1. Configurar Template de Email de Redefinição de Senha

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Templates** → **Password reset**
4. Clique em **Edit** ou **Customize**
5. Configure os seguintes campos:

**Subject (Assunto):**
```
Redefinir sua senha - Clicksehub
```

**Body (Corpo do Email):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #FF4001;">
        <span style="color: #2563eb;">Clickse</span>
        <span style="color: #FF4001;">hub</span>
      </h1>
    </div>
    
    <h2 style="color: #2563eb;">Redefinir Senha</h2>
    
    <p>Olá,</p>
    
    <p>Recebemos uma solicitação para redefinir a senha da sua conta Clicksehub.</p>
    
    <p>Clique no botão abaixo para redefinir sua senha:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="%LINK%" 
         style="background-color: #FF4001; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Redefinir Senha
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Ou copie e cole este link no seu navegador:<br>
      <a href="%LINK%" style="color: #2563eb; word-break: break-all;">%LINK%</a>
    </p>
    
    <p style="color: #666; font-size: 14px;">
      Este link expira em 1 hora por motivos de segurança.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
      Clicksehub - Sistema de Gestão de Eventos<br>
      © 2025 Todos os direitos reservados
    </p>
  </div>
</body>
</html>
```

### 2. Configurar URL de Redirecionamento

1. Ainda em **Authentication** → **Settings** → **Authorized domains**
2. Certifique-se de que os seguintes domínios estão autorizados:
   - Seu domínio de produção (ex: `clicksehub.com`)
   - `localhost` (para desenvolvimento)
   - Qualquer outro domínio que você esteja usando

### 3. Configurar Variável de Ambiente (Opcional mas Recomendado)

No seu arquivo `.env` ou `.env.local`, adicione:

```env
NEXT_PUBLIC_APP_URL=https://clicksehub.com
```

Para desenvolvimento local, use:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Importante:** O Firebase automaticamente adiciona os parâmetros `oobCode` e `mode` ao link de redefinição. A URL final será algo como:
```
https://clicksehub.com/redefinir-senha?mode=resetPassword&oobCode=ABC123...
```

### 4. Testar o Fluxo

1. Acesse `/esqueci-senha`
2. Digite um email cadastrado
3. Verifique a caixa de entrada do email
4. Clique no link recebido
5. Você será redirecionado para `/redefinir-senha` com os parâmetros necessários
6. Defina uma nova senha seguindo os critérios

## 📋 Endpoints Criados

### POST `/api/auth/reset-password`
- Envia email de redefinição de senha
- Rate limiting: 5 tentativas por hora por email
- Body: `{ "email": "usuario@exemplo.com" }`

### POST `/api/auth/verify-reset-code`
- Verifica se o código de redefinição é válido
- Body: `{ "code": "codigo-do-firebase" }`
- Retorna: `{ "success": true, "email": "usuario@exemplo.com" }`

### POST `/api/auth/confirm-reset-password`
- Confirma a redefinição de senha
- Body: `{ "code": "codigo-do-firebase", "newPassword": "novaSenha123!" }`
- Valida senha: mínimo 6 caracteres, 3 de 4 critérios (maiúscula, minúscula, número, especial)

## 🔒 Segurança Implementada

- ✅ Rate limiting para prevenir spam
- ✅ Não expõe se o email existe ou não (sempre retorna mensagem de sucesso)
- ✅ Código de redefinição expira em 1 hora (padrão Firebase)
- ✅ Validação rigorosa de senha
- ✅ Tokens únicos e não reutilizáveis

## ⚠️ Observações

1. O template de email padrão do Firebase funcionará, mas é altamente recomendado personalizar para manter a identidade visual da marca.

2. Se você não configurar `NEXT_PUBLIC_APP_URL`, o sistema usará `http://localhost:3000` como padrão. **Configure para produção!**

3. O rate limiting atual é em memória. Para produção com múltiplos servidores, considere usar Redis ou similar.

4. Testes locais podem requerer que você configure `localhost` como domínio autorizado no Firebase Console.

