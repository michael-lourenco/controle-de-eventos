# Debug: Email de Redefinição de Senha Não Está Chegando

## Data: 2025

## Problema Reportado

O usuário solicitou o envio de instruções para redefinir senha, mas o email não chegou. A requisição POST para `/api/auth/reset-password` foi concluída, mas não há evidência de que o email foi enviado.

## Análise do Problema

O código atual retorna sucesso mesmo quando há erros (por segurança, para não expor se o email existe ou não). Isso pode estar mascarando problemas reais no envio do email.

## Solução Implementada

### 1. Logs Detalhados no Endpoint de Reset

**Arquivo:** `src/app/api/auth/reset-password/route.ts`

**Melhorias:**
- Logs em cada etapa do processo de reset de senha
- Logs de verificação de configuração do serviço de email
- Logs detalhados de erros (tipo, mensagem, código, stack trace)
- Logs de sucesso em cada etapa

**Logs Adicionados:**
```typescript
- [reset-password] Verificando configuração do serviço de email...
- [reset-password] Serviço de email configurado corretamente.
- [reset-password] Processando reset para email: ...
- [reset-password] Verificando se usuário existe no Firebase...
- [reset-password] Usuário encontrado: ...
- [reset-password] Nome do usuário: ...
- [reset-password] Gerando link de reset do Firebase...
- [reset-password] Link de reset gerado com sucesso
- [reset-password] Código oobCode extraído com sucesso
- [reset-password] Token curto gerado: ...
- [reset-password] Armazenando token no banco...
- [reset-password] Token armazenado no banco com sucesso
- [reset-password] URL de reset criada: ...
- [reset-password] Gerando template de email...
- [reset-password] Template de email gerado. Tamanho HTML: ... bytes
- [reset-password] Enviando email via Resend...
- [reset-password] ✅ Email personalizado enviado com sucesso para: ...
```

### 2. Logs Detalhados no Serviço de Email

**Arquivo:** `src/lib/services/resend-email-service.ts`

**Melhorias:**
- Logs antes de tentar enviar o email (destinatário, assunto, remetente)
- Log do ID do email quando enviado com sucesso
- Logs completos de erros do Resend
- Logs de exceções com stack trace

**Logs Adicionados:**
```typescript
- [resend-email-service] Tentando enviar email para: ...
- [resend-email-service] Assunto: ...
- [resend-email-service] From: ...
- [resend-email-service] Email enviado com sucesso. ID: ...
- [resend-email-service] Erro do Resend: ... (quando houver erro)
- [resend-email-service] Exceção ao enviar email: ... (com stack trace)
```

### 3. Melhor Tratamento de Erros

**Melhorias:**
- Erros agora são logados com informações completas:
  - Tipo do erro
  - Mensagem do erro
  - Código do erro (quando aplicável)
  - Stack trace completo
- Isso permite identificar exatamente onde e por que o processo está falhando

## Como Usar os Logs para Debug

### Passo 1: Verificar os Logs do Servidor

Quando o usuário solicitar reset de senha, verifique os logs do servidor. Você verá uma sequência de logs mostrando cada etapa do processo.

### Passo 2: Identificar Onde Está Falhando

Os logs mostrarão exatamente onde o processo está parando:

1. **Se parar em "Verificando configuração do serviço de email..."**
   - Problema: `RESEND_API_KEY` não está configurada
   - Solução: Configure a variável de ambiente `RESEND_API_KEY`

2. **Se parar em "Verificando se usuário existe no Firebase..."**
   - Problema: Usuário não encontrado ou erro no Firebase
   - Solução: Verificar se o email está cadastrado e se há problemas de conexão com Firebase

3. **Se parar em "Gerando link de reset do Firebase..."**
   - Problema: Erro ao gerar link de reset
   - Solução: Verificar configuração do Firebase Admin

4. **Se parar em "Enviando email via Resend..."**
   - Problema: Erro ao enviar email via Resend
   - Solução: Verificar logs do `[resend-email-service]` para detalhes do erro

5. **Se aparecer "❌ ERRO" nos logs**
   - Verificar o tipo, mensagem e stack trace do erro
   - Isso mostrará exatamente o que está falhando

### Passo 3: Verificar Erros Específicos do Resend

Se o erro estiver no envio do email, os logs do `[resend-email-service]` mostrarão:
- Se a API key está inválida
- Se o domínio não está verificado
- Se há problemas de rate limiting
- Qualquer outro erro específico do Resend

## Exemplo de Logs de Sucesso

```
[reset-password] Verificando configuração do serviço de email...
[reset-password] Serviço de email configurado corretamente.
[reset-password] Processando reset para email: usuario@exemplo.com
[reset-password] Verificando se usuário existe no Firebase...
[reset-password] Usuário encontrado: abc123xyz
[reset-password] Nome do usuário: João Silva
[reset-password] Gerando link de reset do Firebase...
[reset-password] Link de reset gerado com sucesso
[reset-password] Código oobCode extraído com sucesso
[reset-password] Token curto gerado: a1b2c3d4
[reset-password] Armazenando token no banco...
[reset-password] Token armazenado no banco com sucesso
[reset-password] URL de reset criada: https://clicksehub.com/redefinir-senha?token=a1b2c3d4
[reset-password] Gerando template de email...
[reset-password] Template de email gerado. Tamanho HTML: 1234 bytes
[reset-password] Enviando email via Resend...
[resend-email-service] Tentando enviar email para: usuario@exemplo.com
[resend-email-service] Assunto: Redefinir sua senha - Clicksehub
[resend-email-service] From: Clicksehub <noreply@clicksehub.com>
[resend-email-service] Email enviado com sucesso. ID: abc123xyz
[reset-password] ✅ Email personalizado enviado com sucesso para: usuario@exemplo.com
```

## Exemplo de Logs de Erro

```
[reset-password] Verificando configuração do serviço de email...
[reset-password] RESEND_API_KEY não configurada. Configure a variável de ambiente RESEND_API_KEY.
[reset-password] RESEND_API_KEY existe? false
```

Ou:

```
[reset-password] Enviando email via Resend...
[resend-email-service] Tentando enviar email para: usuario@exemplo.com
[resend-email-service] Assunto: Redefinir sua senha - Clicksehub
[resend-email-service] From: Clicksehub <noreply@clicksehub.com>
[resend-email-service] Erro do Resend: Invalid API key
[reset-password] ERRO ao enviar email personalizado: Invalid API key
```

## Arquivos Modificados

1. **src/app/api/auth/reset-password/route.ts**
   - Adicionados logs detalhados em cada etapa do processo
   - Melhorado tratamento de erros com logs completos

2. **src/lib/services/resend-email-service.ts**
   - Adicionados logs antes e depois do envio
   - Log do ID do email quando enviado com sucesso
   - Logs completos de erros

## Problema Adicional Identificado: Firebase Admin Credentials

Durante o debug, foi identificado um problema adicional relacionado às credenciais do Firebase Admin. Veja o arquivo `correcao-firebase-admin-credentials.md` para detalhes.

**Erro comum:**
```
Error: Credential implementation provided to initializeApp() via the "credential" property failed to fetch a valid Google OAuth2 access token with the following error: "Error fetching access token: Error while making request: getaddrinfo ENOTFOUND metadata.google.internal. Error code: ENOTFOUND".
```

**Solução:** Configure `FIREBASE_ADMIN_SDK_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY` nas variáveis de ambiente.

## Próximos Passos

1. **Verificar configuração do Firebase Admin:**
   - Configure `FIREBASE_ADMIN_SDK_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Reinicie o servidor
   - Verifique os logs para confirmar inicialização

2. **Testar o fluxo completo de reset de senha:**
   - Verificar os logs do servidor quando o usuário solicitar reset
   - Identificar exatamente onde o processo está falhando usando os logs
   - Corrigir o problema específico identificado nos logs

## Observações Importantes

- Os logs são essenciais para identificar problemas em produção
- Em produção, considere usar um serviço de logging centralizado (ex: Sentry, LogRocket)
- Os logs não expõem informações sensíveis (senhas, tokens completos)
- O sistema ainda retorna mensagem genérica ao usuário por segurança, mas os logs mostram o erro real

