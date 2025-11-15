# 📋 Plano de Implementação - Sistema de Planos e Funcionalidades

## 🎯 Objetivo
Implementar sistema completo de planos com validações e limites funcionais no sistema.

---

## 📦 FASE 1: Estrutura de Assinatura no Usuário

### 1.1 Atualizar Tipo User
**Arquivo:** `src/types/index.ts`

**Alterações:**
- Expandir campos relacionados a plano/assinatura
- Adicionar campos de validação de status de pagamento
- Adicionar campos de metadados de plano

**Estrutura proposta:**
```typescript
export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user';
  ativo: boolean;
  
  // Assinatura e Plano
  assinaturaId?: string;
  planoId?: string; // ID do plano atual
  planoNome?: string; // Nome do plano (cache)
  planoCodigoHotmart?: string; // Código do plano na Hotmart (cache)
  
  // Funcionalidades (cache para performance)
  funcionalidadesHabilitadas?: string[]; // IDs das funcionalidades
  
  // Status e Validações
  assinaturaStatus?: 'ATIVA' | 'TRIAL' | 'CANCELADA' | 'EXPIRADA' | 'SUSPENSA';
  pagamentoEmDia?: boolean;
  dataExpiraAssinatura?: Date;
  dataProximoPagamento?: Date;
  
  // Metadados
  dataCadastro: Date;
  dataAtualizacao: Date;
  ultimaSincronizacaoPlano?: Date; // Quando o plano foi sincronizado pela última vez
}
```

---

### 1.2 Criar Serviço de Assinatura
**Arquivo:** `src/lib/services/assinatura-service.ts` (NOVO)

**Funcionalidades:**
- `atualizarAssinaturaUsuario(userId, assinaturaId)`: Atualiza assinatura do usuário
- `obterPlanoUsuario(userId)`: Retorna plano do usuário com validações
- `validarStatusPagamento(userId)`: Verifica se pagamento está em dia
- `verificarAssinaturaAtiva(userId)`: Verifica se assinatura está ativa
- `sincronizarPlanoUsuario(userId)`: Sincroniza dados do plano no usuário (cache)

**Lógica:**
- Admin sempre tem acesso total (bypass de validações)
- Usuário sem assinatura = sem acesso (ou plano trial padrão)
- Assinatura expirada = sem acesso
- Pagamento em atraso = acesso limitado

---

### 1.3 Criar API para Gerenciar Assinatura
**Arquivo:** `src/app/api/users/[id]/assinatura/route.ts` (NOVO)

**Endpoints:**
- `PUT /api/users/[id]/assinatura`: Atualizar assinatura do usuário
- `GET /api/users/[id]/assinatura`: Obter dados de assinatura do usuário
- `POST /api/users/[id]/assinatura/sincronizar`: Forçar sincronização de plano

---

## 📦 FASE 2: Migração de Usuários Existentes

### 2.1 Criar Script de Migração
**Arquivo:** `src/app/api/admin/migrate-users-to-plans/route.ts` (NOVO)

**Funcionalidades:**
- Buscar todos os usuários sem plano
- Atribuir plano padrão (Básico ou Profissional)
- Criar assinatura para cada usuário
- Atualizar campos de plano no User
- Opção: plano padrão configurável via env

**Parâmetros:**
- `planoPadrao`: Código Hotmart do plano padrão (ex: 'BASICO_MENSAL')
- `statusPadrao`: Status da assinatura ('ATIVA' ou 'TRIAL')
- `dataExpiracao`: Data de expiração (se trial)
- `dryRun`: Apenas simular, não aplicar mudanças

---

### 2.2 Criar Endpoint de Migração
**Arquivo:** `src/app/api/admin/migrate-users-to-plans/route.ts`

**Endpoint:**
- `POST /api/admin/migrate-users-to-plans`

**Body:**
```json
{
  "planoPadrao": "BASICO_MENSAL",
  "statusPadrao": "ATIVA",
  "dataExpiracao": null,
  "dryRun": false
}
```

**Resposta:**
```json
{
  "success": true,
  "usuariosMigrados": 10,
  "assinaturasCriadas": 10,
  "erros": []
}
```

---

## 📦 FASE 3: Implementação de Validações e Limites

### 3.1 Melhorar FuncionalidadeService
**Arquivo:** `src/lib/services/funcionalidade-service.ts`

**Melhorias:**
- ✅ Validar status de pagamento antes de verificar permissão
- ✅ Validar data de expiração da assinatura
- ✅ Melhorar mensagens de erro
- ✅ Adicionar cache de verificações (opcional)

**Novos métodos:**
- `verificarLimiteEventos(userId)`: Verifica se pode criar mais eventos
- `verificarLimiteClientes(userId)`: Verifica se pode criar mais clientes
- `verificarAcessoRelatorio(userId, tipoRelatorio)`: Verifica acesso a relatórios
- `obterStatusAssinatura(userId)`: Retorna status completo da assinatura

---

### 3.2 Criar Middleware de Validação
**Arquivo:** `src/lib/middleware/plano-validation.ts` (NOVO)

**Funções:**
- `withPlanoValidation(handler)`: Wrapper para validar plano em API routes
- `validateFuncionalidade(codigo)`: Decorator/helper para validar funcionalidade
- `validateLimite(tipo)`: Decorator/helper para validar limite

**Uso:**
```typescript
// Em API routes
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  // Validar funcionalidade
  const podeCriarEvento = await validateFuncionalidade('EVENTOS_LIMITADOS')(user.id);
  if (!podeCriarEvento) {
    return NextResponse.json({ error: 'Plano não permite criar eventos' }, { status: 403 });
  }
  
  // Validar limite
  const podeCriarMais = await validateLimite('eventos')(user.id);
  if (!podeCriarMais) {
    return NextResponse.json({ error: 'Limite de eventos atingido' }, { status: 403 });
  }
  
  // Continuar com criação...
}
```

---

### 3.3 Criar Helpers para Frontend
**Arquivo:** `src/lib/hooks/usePlano.ts` (NOVO)

**Hook:**
```typescript
export function usePlano() {
  const { data: session } = useSession();
  const [statusPlano, setStatusPlano] = useState<PlanoStatus | null>(null);
  const [limites, setLimites] = useState<LimitesUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar permissão
  const temPermissao = async (codigoFuncionalidade: string) => {
    // ...
  };

  // Verificar limite
  const podeCriar = async (tipo: 'eventos' | 'clientes') => {
    // ...
  };

  return {
    statusPlano,
    limites,
    temPermissao,
    podeCriar,
    loading
  };
}
```

---

### 3.4 Criar Componente de Bloqueio
**Arquivo:** `src/components/PlanoBloqueio.tsx` (NOVO)

**Funcionalidade:**
- Mostrar mensagem quando funcionalidade não está disponível
- Mostrar limite atingido
- Botão para atualizar plano

**Uso:**
```tsx
<PlanoBloqueio 
  funcionalidade="EVENTOS_LIMITADOS"
  limite="eventos"
  mensagem="Você atingiu o limite de eventos do seu plano"
/>
```

---

## 📦 FASE 4: Aplicar Validações nas Funcionalidades

### 4.1 Validações em Eventos
**Arquivo:** `src/app/api/eventos/route.ts`

**Validações:**
- ✅ Verificar `EVENTOS_LIMITADOS` ou `EVENTOS_ILIMITADOS`
- ✅ Verificar limite mensal de eventos
- ✅ Bloquear criação se limite atingido
- ✅ Mostrar erro claro para usuário

**Alterações:**
```typescript
// Antes de criar evento
const funcionalidadeService = new FuncionalidadeService();

// Verificar permissão
const temPermissao = await funcionalidadeService.verificarPermissao(
  userId, 
  'EVENTOS_LIMITADOS' // ou EVENTOS_ILIMITADOS
);
if (!temPermissao) {
  return NextResponse.json(
    { error: 'Seu plano não permite criar eventos' },
    { status: 403 }
  );
}

// Verificar limite
const limites = await funcionalidadeService.obterLimitesUsuario(userId);
if (limites.eventosLimiteMes && limites.eventosMesAtual >= limites.eventosLimiteMes) {
  return NextResponse.json(
    { 
      error: 'Limite de eventos do mês atingido',
      limite: limites.eventosLimiteMes,
      usado: limites.eventosMesAtual
    },
    { status: 403 }
  );
}
```

---

### 4.2 Validações em Clientes
**Arquivo:** `src/app/api/clientes/route.ts`

**Validações:**
- ✅ Verificar `CLIENTES_LIMITADOS` ou `CLIENTES_ILIMITADOS`
- ✅ Verificar limite total de clientes
- ✅ Bloquear criação se limite atingido

---

### 4.3 Validações em Relatórios
**Arquivos:** 
- `src/app/relatorios/page.tsx`
- `src/components/relatorios/*.tsx`

**Validações:**
- ✅ `RELATORIOS_BASICOS`: Dashboard e Receita Mensal
- ✅ `RELATORIOS_AVANCADOS`: Performance, Serviços, Canais, Impressões
- ✅ `FLUXO_CAIXA`: Relatório de Fluxo de Caixa
- ✅ Mostrar mensagem se não tiver acesso
- ✅ Ocultar/desabilitar se não tiver acesso

---

### 4.4 Validações em Pagamentos
**Arquivo:** `src/app/api/pagamentos/route.ts`

**Validações:**
- ✅ `PAGAMENTOS_REGISTRAR`: Registrar pagamentos
- ✅ `PAGAMENTOS_COMPROVANTES`: Upload de comprovantes
- ✅ Bloquear se não tiver permissão

---

### 4.5 Validações em Serviços e Custos
**Arquivos:**
- `src/app/api/servicos/route.ts`
- `src/app/api/custos/route.ts`

**Validações:**
- ✅ `SERVICOS_GERENCIAR`: Gerenciar serviços
- ✅ `CUSTOS_GERENCIAR`: Gerenciar custos
- ✅ Bloquear se não tiver permissão

---

## 📦 FASE 5: Interface de Usuário

### 5.1 Criar Página de Status do Plano
**Arquivo:** `src/app/assinatura/page.tsx` (JÁ EXISTE - MELHORAR)

**Melhorias:**
- ✅ Mostrar status de pagamento
- ✅ Mostrar limites e uso atual
- ✅ Mostrar funcionalidades habilitadas
- ✅ Botão para atualizar plano
- ✅ Avisos de expiração

---

### 5.2 Criar Componente de Limite
**Arquivo:** `src/components/LimiteUso.tsx` (NOVO)

**Funcionalidade:**
- Barra de progresso de limites
- Mostrar uso atual vs limite
- Cores diferentes por status (normal, aviso, limite)

**Uso:**
```tsx
<LimiteUso 
  tipo="eventos"
  usado={limites.eventosMesAtual}
  limite={limites.eventosLimiteMes}
/>
```

---

### 5.3 Atualizar Páginas com Validações Visuais
**Arquivos:**
- `src/app/eventos/page.tsx`: Mostrar limite de eventos
- `src/app/clientes/page.tsx`: Mostrar limite de clientes
- `src/app/relatorios/page.tsx`: Ocultar relatórios não disponíveis
- `src/app/pagamentos/page.tsx`: Desabilitar ações não permitidas

---

## 📦 FASE 6: Testes e Validação

### 6.1 Testes de Validação
- ✅ Testar criação de evento com limite atingido
- ✅ Testar criação de cliente com limite atingido
- ✅ Testar acesso a relatórios sem permissão
- ✅ Testar usuário sem assinatura
- ✅ Testar assinatura expirada
- ✅ Testar assinatura cancelada

### 6.2 Testes de Migração
- ✅ Testar migração de usuários existentes
- ✅ Testar dry-run
- ✅ Testar diferentes planos padrão
- ✅ Testar tratamento de erros

---

## 📋 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Sprint 1: Base (Fases 1 e 2)
1. ✅ Atualizar tipo User
2. ✅ Criar AssinaturaService
3. ✅ Criar API de assinatura
4. ✅ Criar script de migração
5. ✅ Testar migração

### Sprint 2: Validações (Fase 3)
1. ✅ Melhorar FuncionalidadeService
2. ✅ Criar middleware de validação
3. ✅ Criar hooks para frontend
4. ✅ Criar componente de bloqueio

### Sprint 3: Aplicar Validações (Fase 4)
1. ✅ Validar eventos
2. ✅ Validar clientes
3. ✅ Validar relatórios
4. ✅ Validar pagamentos
5. ✅ Validar serviços/custos

### Sprint 4: Interface (Fase 5)
1. ✅ Melhorar página de assinatura
2. ✅ Criar componente de limite
3. ✅ Atualizar páginas com validações visuais

### Sprint 5: Testes (Fase 6)
1. ✅ Testes de validação
2. ✅ Testes de migração
3. ✅ Ajustes finais

---

## 🔧 CONFIGURAÇÕES NECESSÁRIAS

### Variáveis de Ambiente
```env
# Plano padrão para novos usuários
PLANO_PADRAO_CODIGO=BASICO_MENSAL

# Status padrão da assinatura
PLANO_PADRAO_STATUS=ATIVA

# Dias de trial (se aplicável)
PLANO_TRIAL_DIAS=7
```

---

## 📊 ESTRUTURA DE DADOS FINAL

### User no Firestore
```typescript
{
  id: string,
  email: string,
  nome: string,
  role: 'admin' | 'user',
  ativo: boolean,
  
  // Assinatura
  assinaturaId: string,
  planoId: string,
  planoNome: string,
  planoCodigoHotmart: string,
  funcionalidadesHabilitadas: string[],
  
  // Status
  assinaturaStatus: 'ATIVA' | 'TRIAL' | 'CANCELADA' | 'EXPIRADA' | 'SUSPENSA',
  pagamentoEmDia: boolean,
  dataExpiraAssinatura: Date,
  dataProximoPagamento: Date,
  
  // Metadados
  dataCadastro: Date,
  dataAtualizacao: Date,
  ultimaSincronizacaoPlano: Date
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1 - Estrutura
- [ ] Atualizar tipo User
- [ ] Criar AssinaturaService
- [ ] Criar API de assinatura
- [ ] Testar criação de assinatura

### Fase 2 - Migração
- [ ] Criar script de migração
- [ ] Criar endpoint de migração
- [ ] Testar migração dry-run
- [ ] Executar migração real

### Fase 3 - Validações Base
- [ ] Melhorar FuncionalidadeService
- [ ] Criar middleware
- [ ] Criar hooks
- [ ] Criar componente de bloqueio

### Fase 4 - Aplicar Validações
- [ ] Validar eventos
- [ ] Validar clientes
- [ ] Validar relatórios
- [ ] Validar pagamentos
- [ ] Validar serviços/custos

### Fase 5 - Interface
- [ ] Melhorar página de assinatura
- [ ] Criar componente de limite
- [ ] Atualizar páginas com validações

### Fase 6 - Testes
- [ ] Testes de validação
- [ ] Testes de migração
- [ ] Ajustes finais

---

## 🚀 PRÓXIMOS PASSOS

1. **Revisar e aprovar plano**
2. **Iniciar Fase 1** (Estrutura de Assinatura)
3. **Implementar e testar cada fase sequencialmente**
4. **Fazer deploy incremental** (cada fase em produção)

---

**Data de criação:** {{ data atual }}
**Versão:** 1.0
**Status:** 📋 Planejamento

