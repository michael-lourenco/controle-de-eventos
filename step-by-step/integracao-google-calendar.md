# 📅 Integração com Google Calendar - Documentação Completa

## 📋 Sumário Executivo

Este documento descreve o planejamento completo para integração bidirecional entre o sistema Clicksehub e o Google Calendar, permitindo que eventos criados no sistema sejam automaticamente sincronizados com o calendário do Google e vice-versa.

**Data de Criação:** 2025-01-XX  
**Status:** Planejamento  
**Prioridade:** Alta

---

## 🎯 Objetivos

1. **Sincronização Automática**: Eventos criados/editados no Clicksehub são automaticamente refletidos no Google Calendar
2. **Sincronização Bidirecional**: Alterações feitas no Google Calendar também atualizam o Clicksehub
3. **Multi-Usuário**: Cada usuário conecta sua própria conta do Google
4. **Simplicidade**: Interface intuitiva para conectar/desconectar e gerenciar sincronização

---

## 📊 Requisitos Funcionais

### Restrição por Plano
- ⚠️ **Funcionalidade disponível apenas para:**
  - Planos com `codigoHotmart = "PROFISSIONAL_MENSAL"`
  - Planos com `codigoHotmart = "ENTERPRISE_MENSAL"`
- ❌ **Usuários de outros planos não terão acesso a esta funcionalidade**

### Escopo da Sincronização
- ✅ **Todos os eventos** (independente de status)
- ✅ **Apenas eventos ativos** (não arquivados)
- ✅ **Sincronização bidirecional** (Clicksehub ↔ Google Calendar)

### Informações Sincronizadas
- ✅ **Data/Hora do evento** (apenas início, sem data/hora final)
- ✅ **Título** do evento (nome do evento ou cliente)

**Nota:** Nesta primeira versão, os eventos serão criados apenas com data/hora de início. Não será incluída data/hora final.

### Comportamento
- ✅ **Múltiplos eventos no mesmo dia**: Criar eventos separados no Google Calendar
- ✅ **Evento cancelado/arquivado**: Remover do Google Calendar
- ✅ **Mudança de status**: Atualizar evento no Google Calendar

---

## 🏗️ Arquitetura da Solução

### Fluxo de Dados

```
┌─────────────────┐                    ┌──────────────────┐
│   Clicksehub    │                    │ Google Calendar  │
│                 │                    │                  │
│  ┌───────────┐  │                    │  ┌────────────┐ │
│  │  Evento   │  │─── Create ────────>│  │   Event    │ │
│  │  Created  │  │                    │  │  Created   │ │
│  └───────────┘  │                    │  └────────────┘ │
│                 │                    │                  │
│  ┌───────────┐  │                    │  ┌────────────┐ │
│  │  Evento   │  │─── Update ────────>│  │   Event    │ │
│  │  Updated  │  │                    │  │  Updated   │ │
│  └───────────┘  │                    │  └────────────┘ │
│                 │                    │                  │
│  ┌───────────┐  │                    │  ┌────────────┐ │
│  │  Evento   │  │─── Delete ────────>│  │   Event    │ │
│  │  Archived │  │                    │  │  Deleted   │ │
│  └───────────┘  │                    │  └────────────┘ │
│                 │                    │                  │
│  ┌───────────┐  │<─── Webhook ───────│  ┌────────────┐ │
│  │  Evento   │  │                    │  │   Event    │ │
│  │  Updated  │  │                    │  │  Changed   │ │
│  └───────────┘  │                    │  └────────────┘ │
└─────────────────┘                    └──────────────────┘
```

### Componentes Principais

1. **Google Calendar Service**: Serviço para interagir com a API do Google
2. **OAuth 2.0 Handler**: Gerenciamento de autenticação e tokens
3. **Sync Service**: Lógica de sincronização bidirecional
4. **Webhook Handler**: Recebe notificações do Google Calendar
5. **UI Components**: Interface para gerenciar conexão

---

## 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── services/
│   │   ├── google-calendar-service.ts          # Serviço principal de integração
│   │   └── google-calendar-sync-service.ts     # Lógica de sincronização
│   ├── repositories/
│   │   └── google-calendar-token-repository.ts # Gerenciamento de tokens
│   └── utils/
│       └── google-calendar-mapper.ts            # Conversão de dados
│
├── app/
│   ├── api/
│   │   ├── google-calendar/
│   │   │   ├── auth/route.ts                    # Iniciar OAuth
│   │   │   ├── callback/route.ts                # Callback OAuth
│   │   │   ├── sync/route.ts                    # Sincronização manual
│   │   │   ├── disconnect/route.ts              # Desconectar conta
│   │   │   └── status/route.ts                  # Status da conexão
│   │   └── webhooks/
│   │       └── google-calendar/route.ts         # Webhook do Google
│   │
│   └── configuracoes/
│       └── calendario/
│           └── page.tsx                          # Página de configuração
│
├── types/
│   └── google-calendar.ts                        # Tipos TypeScript
│
└── components/
    └── google-calendar/
        ├── SyncStatus.tsx                         # Status da sincronização
        ├── ConnectButton.tsx                      # Botão de conexão
        └── EventSyncIndicator.tsx                 # Indicador em eventos
```

---

## 🔐 Fase 1: Configuração e Autenticação OAuth 2.0

### 1.1. Configuração no Google Cloud Console

**Passos:**

1. Acessar [Google Cloud Console](https://console.cloud.google.com/)
2. Criar novo projeto ou selecionar existente
3. Habilitar **Google Calendar API**
4. Criar credenciais OAuth 2.0:
   - Tipo: **Aplicativo Web**
   - Nome: "Clicksehub Calendar Integration"
   - URIs de redirecionamento autorizados:
     - `http://localhost:3000/api/google-calendar/callback` (dev)
     - `https://seu-dominio.com/api/google-calendar/callback` (prod)
5. Copiar **Client ID** e **Client Secret**

### 1.2. Estrutura de Dados para Tokens

**Collection no Firestore:** `google_calendar_tokens`

```typescript
interface GoogleCalendarToken {
  id: string;
  userId: string;
  accessToken: string;        // Token de acesso (criptografado)
  refreshToken: string;        // Token de refresh (criptografado)
  expiresAt: Date;             // Data de expiração do accessToken
  calendarId: string;          // ID do calendário principal
  syncEnabled: boolean;        // Se a sincronização está ativa
  lastSyncAt?: Date;           // Última sincronização bem-sucedida
  googleCalendarEventId?: string; // ID do evento no Google (para rastreamento)
  dataCadastro: Date;
  dataAtualizacao: Date;
}
```

**Segurança:**
- Tokens devem ser criptografados antes de armazenar
- Usar biblioteca de criptografia (ex: `crypto` do Node.js)

### 1.3. Verificação de Plano

**Antes de permitir acesso à funcionalidade:**

```typescript
// Verificar se usuário tem plano permitido
async function verificarAcessoGoogleCalendar(userId: string): Promise<boolean> {
  const userRepo = new UserRepository();
  const user = await userRepo.findById(userId);
  
  if (!user?.planoCodigoHotmart) {
    return false;
  }
  
  const planosPermitidos = ['PROFISSIONAL_MENSAL', 'ENTERPRISE_MENSAL'];
  return planosPermitidos.includes(user.planoCodigoHotmart);
}
```

**Aplicar verificação em:**
- Todos os endpoints da API (`/api/google-calendar/*`)
- Página de configurações (`/configuracoes/calendario`)
- Componentes de UI relacionados

**Mensagem de erro:**
- "Esta funcionalidade está disponível apenas para planos Profissional e Enterprise"

### 1.4. Fluxo de Autenticação OAuth 2.0

**Fluxo Completo:**

```
1. Usuário clica em "Conectar Google Calendar"
   ↓
2. Verificar se tem plano permitido
   ↓ (se não tiver, mostrar mensagem e bloquear)
3. Redireciona para /api/google-calendar/auth
   ↓
4. Gera URL de autorização do Google
   ↓
5. Redireciona usuário para Google
   ↓
6. Usuário autoriza aplicação
   ↓
7. Google redireciona para /api/google-calendar/callback?code=...
   ↓
8. Troca code por access_token e refresh_token
   ↓
9. Armazena tokens no Firestore (criptografados)
   ↓
10. Redireciona para página de configurações com sucesso
```

**Endpoints:**

- `GET /api/google-calendar/auth`: Inicia fluxo OAuth (com verificação de plano)
- `GET /api/google-calendar/callback`: Recebe callback do Google (com verificação de plano)
- `POST /api/google-calendar/disconnect`: Desconecta conta (com verificação de plano)
- `GET /api/google-calendar/status`: Status da conexão (com verificação de plano)

---

## 🔄 Fase 2: Serviço de Sincronização

### 2.1. Google Calendar Service

**Responsabilidades:**
- Criar eventos no Google Calendar
- Atualizar eventos existentes
- Deletar eventos
- Listar eventos
- Gerenciar refresh token automaticamente
- Tratamento de erros e rate limiting

**Métodos Principais:**

```typescript
class GoogleCalendarService {
  // Autenticação
  async refreshAccessToken(userId: string): Promise<string>
  
  // CRUD de Eventos
  async createEvent(userId: string, evento: Evento): Promise<string>
  async updateEvent(userId: string, googleEventId: string, evento: Evento): Promise<void>
  async deleteEvent(userId: string, googleEventId: string): Promise<void>
  async getEvent(userId: string, googleEventId: string): Promise<GoogleCalendarEvent>
  
  // Sincronização
  async syncEventToCalendar(userId: string, evento: Evento): Promise<void>
  async syncCalendarToEvent(userId: string, googleEvent: GoogleCalendarEvent): Promise<Evento>
}
```

### 2.2. Mapeamento de Dados

**Clicksehub → Google Calendar:**

```typescript
function mapEventoToGoogleCalendar(evento: Evento): GoogleCalendarEvent {
  // Apenas data/hora de início (sem data/hora final)
  const startDateTime = new Date(`${evento.dataEvento}T${evento.horarioInicio}`);
  
  return {
    summary: evento.nomeEvento || evento.cliente.nome,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    // Evento sem duração definida (apenas ponto no tempo)
    end: {
      dateTime: startDateTime.toISOString(), // Mesma data/hora do início
      timeZone: 'America/Sao_Paulo'
    },
    description: `Evento: ${evento.tipoEvento}\nCliente: ${evento.cliente.nome}`
  };
}
```

**Nota:** O Google Calendar requer um campo `end`, mas será o mesmo valor do `start` para criar um evento sem duração específica.

**Google Calendar → Clicksehub:**

```typescript
function mapGoogleCalendarToEvento(googleEvent: GoogleCalendarEvent, userId: string): Partial<Evento> {
  const startDate = new Date(googleEvent.start.dateTime || googleEvent.start.date);
  
  return {
    nomeEvento: googleEvent.summary,
    dataEvento: startDate,
    horarioInicio: format(startDate, 'HH:mm'),
    // horarioDesmontagem não será sincronizado nesta versão
    // ... outros campos
  };
}
```

### 2.3. Identificação de Eventos

**Estratégia:**
- Armazenar `googleCalendarEventId` no documento do evento no Firestore
- Permitir rastreamento bidirecional
- Usar este ID para atualizar/deletar eventos

**Atualização do tipo Evento:**

```typescript
export interface Evento {
  // ... campos existentes
  googleCalendarEventId?: string;  // NOVO
  googleCalendarSyncedAt?: Date;  // NOVO
}
```

---

## 📤 Fase 3: Sincronização Clicksehub → Google Calendar

### 3.1. Hooks de Sincronização

**Pontos de Integração:**

1. **Ao criar evento:**
   - `EventoRepository.createEvento()`
   - **Verificar se usuário tem plano permitido**
   - Se tiver, após criar com sucesso, chamar `syncToGoogleCalendar()`
   - Armazenar `googleCalendarEventId` retornado

2. **Ao atualizar evento:**
   - `EventoRepository.updateEvento()`
   - Se já tem `googleCalendarEventId`, atualizar no Google
   - Se não tem, criar novo evento no Google

3. **Ao arquivar/cancelar evento:**
   - `EventoRepository.deleteEvento()`
   - Se tem `googleCalendarEventId`, deletar do Google

4. **Ao mudar status:**
   - Qualquer atualização que mude o status
   - Atualizar evento no Google Calendar

**Implementação:**

```typescript
// No EventoRepository
async createEvento(userId: string, evento: Omit<Evento, 'id'>): Promise<Evento> {
  // Criar evento no Firestore
  const eventoCriado = await this.create(...);
  
  // Verificar se usuário tem plano permitido para Google Calendar
  const temAcesso = await verificarAcessoGoogleCalendar(userId);
  
  // Sincronizar com Google Calendar apenas se tiver acesso (não bloquear se falhar)
  if (temAcesso) {
    try {
      const googleService = new GoogleCalendarService();
      const googleEventId = await googleService.syncEventToCalendar(userId, eventoCriado);
      
      // Atualizar evento com googleCalendarEventId
      await this.update(eventoCriado.id, {
        googleCalendarEventId: googleEventId,
        googleCalendarSyncedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao sincronizar com Google Calendar:', error);
      // Não falhar a criação do evento por causa da sincronização
    }
  }
  
  return eventoCriado;
}
```

### 3.2. Tratamento de Erros

**Estratégias:**

1. **Não bloquear operação principal:**
   - Se sincronização falhar, evento ainda é criado/editado
   - Log de erro para debug

2. **Retry automático:**
   - Para erros temporários (rate limit, network)
   - Implementar fila de retry

3. **Notificação ao usuário:**
   - Mostrar toast se sincronização falhar
   - Permitir sincronização manual posterior

---

## 📥 Fase 4: Sincronização Google Calendar → Clicksehub

### 4.1. Webhook do Google Calendar

**Configuração:**

1. Criar canal de notificação no Google Calendar
2. Configurar endpoint: `/api/webhooks/google-calendar`
3. Validar assinatura do webhook
4. Processar eventos: `created`, `updated`, `deleted`

**Fluxo:**

```
Google Calendar detecta mudança
  ↓
Envia POST para /api/webhooks/google-calendar
  ↓
Validar assinatura (X-Goog-Channel-Token)
  ↓
Identificar usuário pelo channelId
  ↓
Buscar evento correspondente no Clicksehub
  ↓
Atualizar evento no Clicksehub
  ↓
Retornar 200 OK
```

**Estrutura do Webhook:**

```typescript
// POST /api/webhooks/google-calendar
export async function POST(request: NextRequest) {
  // 1. Validar assinatura
  const token = request.headers.get('X-Goog-Channel-Token');
  if (token !== process.env.GOOGLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Processar notificação
  const body = await request.json();
  const { resourceState, resourceId } = body;
  
  // 3. Buscar token do usuário
  const tokenRepo = new GoogleCalendarTokenRepository();
  const token = await tokenRepo.findByResourceId(resourceId);
  
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }
  
  // 4. Buscar evento atualizado no Google
  const googleService = new GoogleCalendarService();
  const googleEvent = await googleService.getEvent(token.userId, resourceId);
  
  // 5. Atualizar evento no Clicksehub
  const eventoRepo = new EventoRepository();
  const evento = await eventoRepo.findByGoogleCalendarId(resourceId);
  
  if (evento) {
    await syncCalendarToClicksehub(token.userId, googleEvent, evento);
  }
  
  return NextResponse.json({ success: true });
}
```

### 4.2. Polling Alternativo (Fallback)

**Quando usar:**
- Se webhook não estiver disponível
- Para sincronização inicial de eventos existentes
- Como backup caso webhook falhe

**Implementação:**

```typescript
// Executar periodicamente (ex: a cada 15 minutos)
async function syncFromGoogleCalendar(userId: string) {
  const tokenRepo = new GoogleCalendarTokenRepository();
  const token = await tokenRepo.findByUserId(userId);
  
  if (!token || !token.syncEnabled) return;
  
  const googleService = new GoogleCalendarService();
  const events = await googleService.listEvents(userId, {
    timeMin: new Date(),
    maxResults: 100
  });
  
  // Comparar com eventos do Clicksehub
  // Atualizar se houver diferenças
}
```

### 4.3. Resolução de Conflitos

**Estratégia:**
- Se evento editado em ambos os lados, priorizar última modificação
- Comparar `updatedAt` do Clicksehub com `updated` do Google Calendar
- Log de conflitos para análise manual se necessário

---

## 🎨 Fase 5: Interface do Usuário

### 5.1. Página de Configurações

**Rota:** `/configuracoes/calendario`

**Verificação de Acesso:**
- Verificar se usuário tem plano `PROFISSIONAL_MENSAL` ou `ENTERPRISE_MENSAL`
- Se não tiver, mostrar mensagem explicativa e botão para ver planos
- Redirecionar para `/planos` se clicar no botão

**Componentes:**

1. **Verificação de Plano:**
   - Se não tiver acesso: Mensagem + botão "Ver Planos"
   - Se tiver acesso: Mostrar componentes abaixo

2. **Status da Conexão:**
   - Indicador visual (conectado/desconectado)
   - Email da conta Google conectada
   - Última sincronização

3. **Botões de Ação:**
   - "Conectar Google Calendar" (se desconectado)
   - "Desconectar" (se conectado)
   - "Sincronizar Agora" (se conectado)

4. **Configurações:**
   - Toggle: "Sincronização automática"
   - Lista de eventos sincronizados
   - Log de sincronizações recentes

### 5.2. Indicadores Visuais

**Nos Eventos:**

- Badge "Sincronizado" nos cards de eventos
- Ícone de status (sincronizado, pendente, erro)
- Tooltip com detalhes da sincronização

**Exemplo:**

```tsx
{evento.googleCalendarEventId && (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-bg text-success-text">
    <CheckIcon className="h-3 w-3 mr-1" />
    Sincronizado
  </span>
)}
```

### 5.3. Sincronização Manual

**Funcionalidades:**

- Botão "Sincronizar Agora" na página de eventos
- Sincronização em lote de eventos existentes
- Progress indicator durante sincronização
- Feedback de sucesso/erro

---

## 🧪 Fase 6: Testes e Validação

### 6.1. Testes Unitários

**Cenários:**

- ✅ Mapeamento de dados (Evento → Google Calendar)
- ✅ Mapeamento de dados (Google Calendar → Evento)
- ✅ Refresh token automático
- ✅ Tratamento de erros
- ✅ Validação de dados

### 6.2. Testes de Integração

**Cenários:**

- ✅ Fluxo completo OAuth 2.0
- ✅ Criação de evento → Google Calendar
- ✅ Atualização de evento → Google Calendar
- ✅ Remoção de evento → Google Calendar
- ✅ Webhook do Google → Atualização no Clicksehub
- ✅ Múltiplos eventos no mesmo dia
- ✅ Sincronização bidirecional simultânea

### 6.3. Testes de Carga

**Cenários:**

- ✅ Sincronização de 100+ eventos
- ✅ Rate limiting do Google (10.000 requests/dia)
- ✅ Múltiplos usuários sincronizando simultaneamente

---

## 📦 Dependências Necessárias

### Instalação

```bash
npm install googleapis
```

### Versão Recomendada

```json
{
  "googleapis": "^128.0.0"
}
```

**Nota:** `next-auth` já existe no projeto e pode ser usado para gerenciar sessões OAuth.

---

## 🔧 Variáveis de Ambiente

### Arquivo `.env` / `.env.local`

**⚠️ IMPORTANTE:** Estas variáveis devem ser adicionadas ao arquivo `.env.local` (para desenvolvimento local) e configuradas no Vercel (para produção).

```env
# ============================================
# Google Calendar Integration
# ============================================

# Google OAuth 2.0 Credentials
# Obtenha estas credenciais em: https://console.cloud.google.com/
# 1. Criar projeto no Google Cloud Console
# 2. Habilitar Google Calendar API
# 3. Criar credenciais OAuth 2.0 (Tipo: Aplicativo Web)
GOOGLE_CLIENT_ID=seu_client_id_do_google_cloud_console
GOOGLE_CLIENT_SECRET=seu_client_secret_do_google_cloud_console

# Redirect URI para desenvolvimento (localhost)
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-calendar/callback

# Redirect URI para produção
# Substitua 'seu-dominio.com' pelo domínio real da aplicação
GOOGLE_REDIRECT_URI_PROD=https://seu-dominio.com/api/google-calendar/callback

# Secret para validar webhooks do Google Calendar
# Gere uma string aleatória segura (mínimo 32 caracteres)
# Exemplo: openssl rand -base64 32
GOOGLE_WEBHOOK_SECRET=secret_aleatorio_para_validar_webhooks_do_google

# Chave para criptografar tokens de acesso do Google
# Gere uma string aleatória segura (mínimo 32 caracteres)
# Exemplo: openssl rand -base64 32
# ⚠️ NUNCA compartilhe esta chave ou faça commit no repositório
ENCRYPTION_KEY=chave_secreta_para_criptografar_tokens_do_google
```

### Variáveis Relacionadas (já existentes no projeto)

O projeto já utiliza outras variáveis de ambiente que devem estar configuradas:

```env
# ============================================
# NextAuth.js
# ============================================
NEXTAUTH_SECRET=sua_chave_secreta_nextauth
NEXTAUTH_URL=http://localhost:3000  # ou URL de produção
NEXT_PUBLIC_NEXTAUTH_SECRET=sua_chave_secreta_nextauth

# ============================================
# Firebase (se estiver usando)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# ============================================
# AWS S3 (se estiver usando)
# ============================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_S3_BUCKET_NAME=nome_do_bucket

# ============================================
# Hotmart Webhooks (se estiver usando)
# ============================================
HOTMART_WEBHOOK_SECRET=secret_do_webhook_hotmart
HOTMART_VALIDATE_HMAC=true
```

### Configuração no Vercel

1. Acessar projeto no [Vercel Dashboard](https://vercel.com/dashboard)
2. Ir em **Settings** → **Environment Variables**
3. Adicionar todas as variáveis do Google Calendar:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (para Preview/Development)
   - `GOOGLE_REDIRECT_URI_PROD` (para Production)
   - `GOOGLE_WEBHOOK_SECRET`
   - `ENCRYPTION_KEY`
4. Configurar para **Production**, **Preview** e **Development**
5. **Salvar** e fazer novo deploy

### Verificação das Variáveis

Após configurar, verifique se todas as variáveis estão acessíveis:

```typescript
// Em uma API route de teste
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado');
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_PROD);
console.log('GOOGLE_WEBHOOK_SECRET:', process.env.GOOGLE_WEBHOOK_SECRET ? '✅ Configurado' : '❌ Não configurado');
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? '✅ Configurado' : '❌ Não configurado');
```

### Segurança

⚠️ **IMPORTANTE:**
- **NUNCA** faça commit do arquivo `.env` ou `.env.local` no repositório
- Use `.env.example` (sem valores reais) como template
- Gere secrets aleatórios e seguros para `GOOGLE_WEBHOOK_SECRET` e `ENCRYPTION_KEY`
- Rotacione as chaves periodicamente em produção
- Use diferentes valores para desenvolvimento e produção

---

## 🚀 Fase 7: Deploy e Monitoramento

### 7.1. Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Google Cloud Console configurado
- [ ] OAuth redirect URIs configurados
- [ ] Webhook endpoint acessível publicamente
- [ ] Testes de integração passando
- [ ] Documentação atualizada

### 7.2. Monitoramento

**Métricas a acompanhar:**

- Taxa de sucesso de sincronizações
- Tempo médio de sincronização
- Erros de autenticação
- Rate limiting do Google
- Conflitos de sincronização

**Logs importantes:**

- Falhas de sincronização
- Erros de refresh token
- Webhooks recebidos
- Conflitos resolvidos

---

## ⚠️ Considerações Importantes

### Segurança

1. **Tokens Criptografados:**
   - Nunca armazenar tokens em texto plano
   - Usar criptografia AES-256
   - Chave de criptografia em variável de ambiente

2. **HTTPS Obrigatório:**
   - OAuth requer HTTPS em produção
   - Webhooks do Google requerem HTTPS

3. **Validação de Webhooks:**
   - Sempre validar assinatura do webhook
   - Verificar origem das requisições

### Performance

1. **Sincronização Assíncrona:**
   - Não bloquear operações principais
   - Usar filas para processamento

2. **Rate Limiting:**
   - Google permite 10.000 requests/dia por projeto
   - Implementar throttling se necessário
   - Cache quando apropriado

3. **Otimizações:**
   - Batch operations quando possível
   - Sincronização incremental (apenas mudanças)

### UX

1. **Feedback Visual:**
   - Indicadores claros de status
   - Mensagens de erro compreensíveis
   - Progress indicators

2. **Não Bloquear:**
   - Operações principais não devem falhar por causa da sincronização
   - Permitir sincronização manual se automática falhar

### Escalabilidade

1. **Multi-Usuário:**
   - Cada usuário com sua própria conta Google
   - Isolamento completo de dados
   - Tokens por usuário

2. **Concorrência:**
   - Suportar múltiplas sincronizações simultâneas
   - Tratamento de race conditions

---

## 📚 Recursos e Referências

### Documentação Oficial

- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Push Notifications (Webhooks)](https://developers.google.com/calendar/api/v3/push)

### Bibliotecas

- [googleapis (npm)](https://www.npmjs.com/package/googleapis)
- [Node.js Google APIs](https://github.com/googleapis/google-api-nodejs-client)

### Tutoriais

- [Google Calendar API Quickstart](https://developers.google.com/calendar/api/quickstart/nodejs)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)

---

## 📝 Próximos Passos

1. **Aprovação do Plano:** Revisar e aprovar este documento
2. **Configuração Inicial:** Configurar Google Cloud Console
3. **Implementação Fase 1:** Autenticação OAuth 2.0
4. **Implementação Fase 2:** Serviço de sincronização
5. **Implementação Fase 3:** Sincronização Clicksehub → Google
6. **Implementação Fase 4:** Sincronização Google → Clicksehub
7. **Implementação Fase 5:** Interface do usuário
8. **Testes:** Fase 6 completa
9. **Deploy:** Fase 7 - Produção

---

## ❓ FAQ

**P: E se o usuário desconectar a conta Google?**  
R: Os eventos já sincronizados permanecem no Google Calendar, mas novas sincronizações param. O usuário pode reconectar a qualquer momento.

**P: E se houver conflito (evento editado em ambos os lados)?**  
R: Priorizamos a última modificação. Se houver conflito, o sistema usa o timestamp mais recente.

**P: Quantos eventos podem ser sincronizados?**  
R: Não há limite técnico, mas o Google tem rate limit de 10.000 requests/dia. Para grandes volumes, implementar batch operations.

**P: A sincronização funciona offline?**  
R: Não. Requer conexão com a internet e acesso à API do Google Calendar.

**P: Posso sincronizar com múltiplos calendários?**  
R: Na versão inicial, apenas um calendário por usuário. Pode ser expandido no futuro.

**P: Qual plano preciso para usar o Google Calendar?**  
R: A funcionalidade está disponível apenas para planos **Profissional** (`PROFISSIONAL_MENSAL`) e **Enterprise** (`ENTERPRISE_MENSAL`).

**P: E se eu mudar de plano?**  
R: Se você mudar para um plano que não inclui Google Calendar, a sincronização será desabilitada, mas os eventos já sincronizados permanecerão no Google Calendar. Você pode reconectar quando voltar a um plano compatível.

---

**Documento criado em:** 2025-01-XX  
**Última atualização:** 2025-01-XX  
**Versão:** 1.0

