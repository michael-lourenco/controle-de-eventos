# Correção do Problema: Email Padrão do Firebase Sendo Enviado

## Data: 2025

## Problema Identificado

O formulário em `/esqueci-senha` estava enviando o email padrão do Firebase (em inglês) ao invés do email personalizado em português que foi implementado.

## Causa Raiz

A rota `/api/auth/reset-password` tinha um fallback silencioso para o sistema padrão do Firebase quando:
1. O serviço Resend não estava configurado (`RESEND_API_KEY` não definida)
2. O envio do email personalizado falhava por qualquer motivo

O código fazia:
```typescript
catch (customError) {
  // Fallback para o sistema padrão do Firebase se o customizado falhar
  result = await authService.sendPasswordReset(email);
}
```

Isso fazia com que, mesmo quando o Resend não estava configurado, o sistema silenciosamente usava o Firebase, enviando o email padrão em inglês.

## Solução Implementada

### 1. Verificação Prévia da Configuração

**Arquivo:** `src/app/api/auth/reset-password/route.ts`

**Alteração:**
- Adicionada verificação se o serviço de email está configurado ANTES de tentar usar
- Se não estiver configurado, retorna erro claro ao invés de fazer fallback

**Código:**
```typescript
// Verificar se o serviço de email está configurado
if (!isEmailServiceConfigured()) {
  console.error('[reset-password] RESEND_API_KEY não configurada.');
  return NextResponse.json(
    { 
      success: false,
      error: 'Serviço de email não configurado. Configure RESEND_API_KEY nas variáveis de ambiente.'
    },
    { status: 500 }
  );
}
```

**Função:** Evita que o sistema tente enviar email sem ter o serviço configurado, forçando a configuração correta.

### 2. Remoção do Fallback Silencioso

**Alteração:**
- Removido o fallback automático para `authService.sendPasswordReset()`
- Agora, se o envio personalizado falhar, retorna erro claro ao invés de usar Firebase

**Código Antes:**
```typescript
if (!emailResult.success) {
  // Se falhar o envio customizado, usar fallback do Firebase
  throw new Error(emailResult.error || 'Erro ao enviar email');
}
} catch (customError) {
  // Fallback para o sistema padrão do Firebase se o customizado falhar
  result = await authService.sendPasswordReset(email);
}
```

**Código Depois:**
```typescript
if (!emailResult.success) {
  console.error('[reset-password] Erro ao enviar email personalizado:', emailResult.error);
  // Não fazer fallback para Firebase - retornar erro
  return NextResponse.json(
    { 
      success: false,
      error: `Erro ao enviar email: ${emailResult.error}. Verifique a configuração do Resend.`
    },
    { status: 500 }
  );
}
```

**Função:** Força o uso do email personalizado e não permite fallback silencioso para o Firebase.

### 3. Logs de Debug Detalhados

**Alteração:**
- Adicionados logs muito detalhados em todas as etapas do processo para facilitar debug:
  - Log quando RESEND_API_KEY não está configurada (com verificação se existe)
  - Log em cada etapa do processo de reset (verificação de usuário, geração de token, etc.)
  - Log detalhado no serviço de email Resend (tentativa de envio, sucesso, erros)
  - Log quando o envio de email falha (com detalhes completos do erro)
  - Log quando o email é enviado com sucesso (com ID do email)
  - Log de erros no processo (com tipo, mensagem, código e stack trace)

**Arquivos Modificados:**
- `src/app/api/auth/reset-password/route.ts` - Logs em cada etapa do processo
- `src/lib/services/resend-email-service.ts` - Logs detalhados do envio de email

**Função:** Facilita identificar exatamente onde o processo está falhando durante desenvolvimento e produção. Os logs incluem:
- ✅ Verificação de configuração do serviço
- ✅ Processamento do email normalizado
- ✅ Verificação de existência do usuário
- ✅ Geração do link de reset
- ✅ Extração do código oobCode
- ✅ Geração e armazenamento do token
- ✅ Criação da URL de reset
- ✅ Geração do template de email
- ✅ Tentativa de envio via Resend
- ✅ Resultado do envio (sucesso ou erro com detalhes)

### 4. Remoção de Import Não Utilizado

**Alteração:**
- Removido import de `authService` que não é mais necessário

## Arquivos Modificados

1. **src/app/api/auth/reset-password/route.ts**
   - Adicionada verificação de configuração do Resend
   - Removido fallback para Firebase
   - Adicionados logs detalhados em cada etapa do processo
   - Melhorado tratamento de erros com logs completos (tipo, mensagem, código, stack)
   - Removido import não utilizado

2. **src/lib/services/resend-email-service.ts**
   - Adicionados logs detalhados antes e depois do envio
   - Log do ID do email quando enviado com sucesso
   - Log completo de erros com stack trace

## Resultado Esperado

Após essas alterações:
1. ✅ Se `RESEND_API_KEY` não estiver configurada, o sistema retorna erro claro
2. ✅ O sistema não faz mais fallback silencioso para o Firebase
3. ✅ Logs detalhados facilitam identificar problemas
4. ✅ O email personalizado em português será sempre usado quando configurado corretamente

## Como Configurar

Para que o sistema funcione corretamente, é necessário:

1. **Criar conta no Resend:**
   - Acesse https://resend.com
   - Crie uma conta
   - Obtenha sua API key

2. **Configurar variável de ambiente:**
   - Adicione ao `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

3. **Verificar configuração:**
   - O sistema agora retornará erro claro se a chave não estiver configurada
   - Verifique os logs do servidor para confirmar que o email está sendo enviado

## Testando

1. Configure `RESEND_API_KEY` no `.env.local`
2. Reinicie o servidor de desenvolvimento
3. Acesse `/esqueci-senha`
4. Digite um email cadastrado
5. Verifique os logs do servidor - você verá logs detalhados de cada etapa:
   - `[reset-password] Verificando configuração do serviço de email...`
   - `[reset-password] Processando reset para email: ...`
   - `[reset-password] Usuário encontrado: ...`
   - `[resend-email-service] Tentando enviar email para: ...`
   - `[resend-email-service] Email enviado com sucesso. ID: ...`
6. Verifique se recebe o email personalizado em português
7. Se houver erro, os logs mostrarão exatamente onde falhou com detalhes completos

## Observações

- O sistema agora é mais rigoroso: não permite fallback silencioso
- Isso força a configuração correta do serviço de email
- Em produção, certifique-se de que `RESEND_API_KEY` está configurada
- Os logs detalhados ajudam a identificar problemas rapidamente
- **IMPORTANTE:** Se o email não estiver chegando, verifique os logs do servidor. Eles mostrarão exatamente onde o processo está falhando:
  - Se `RESEND_API_KEY` não está configurada
  - Se o usuário não existe no Firebase
  - Se houve erro ao gerar o token
  - Se houve erro ao enviar o email (com detalhes do Resend)
  - Qualquer outro erro no processo (com stack trace completo)

## Próximos Passos (Opcional)

1. Adicionar notificação visual quando o serviço não estiver configurado
2. Criar página de status do sistema mostrando se o email está configurado
3. Adicionar métricas de envio de email

