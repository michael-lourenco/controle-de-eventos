# Sistema de Controle de Funcionalidades por Planos

## 📋 Análise e Plano de Ação

### Data: 2025

---

## 🎯 Objetivo

Implementar um sistema flexível de controle de funcionalidades baseado em planos de uso, permitindo habilitar/desabilitar funcionalidades específicas para cada usuário de forma individual ou através de planos pré-configurados.

---

## 📊 Análise da Arquitetura Proposta

### 1. **Conceito de Funcionalidades vs Planos**

O sistema deve funcionar com uma separação clara entre:
- **Funcionalidades**: Recursos específicos do sistema que podem ser habilitados/desabilitados
- **Planos**: Conjuntos de funcionalidades pré-configuradas que representam pacotes de uso
- **Permissões de Usuário**: Aplicação individual de funcionalidades ou planos para cada usuário

**Vantagens desta abordagem:**
- ✅ Flexibilidade máxima: pode criar planos personalizados ou habilitar funcionalidades individuais
- ✅ Escalabilidade: fácil adicionar novas funcionalidades sem impactar planos existentes
- ✅ Manutenibilidade: mudanças em funcionalidades não exigem alteração em múltiplos planos
- ✅ Customização: permite casos especiais (usuários com permissões fora dos planos padrão)

### 2. **Integração com Hotmart**

**Fluxo de integração:**
1. Usuário contrata plano na Hotmart
2. Hotmart envia webhook para nosso sistema
3. Sistema identifica o plano através do ID
4. Sistema habilita funcionalidades correspondentes ao plano no perfil do usuário
5. Sistema atualiza status da assinatura (ativa, cancelada, trial, etc.)

**Período de Trial:**
- Usuário pode ter 7 dias grátis na Hotmart
- Durante este período, funcionalidades devem estar habilitadas
- Se cancelar antes do período de cobrança, funcionalidades são desabilitadas
- Webhook deve tratar status: `trial`, `active`, `cancelled`, `expired`

---

## 🏗️ Arquitetura Técnica

### 1. **Estrutura de Dados**

#### Collection: `funcionalidades`
```typescript
{
  id: string;
  codigo: string; // Ex: 'EVENTOS_ILIMITADOS', 'RELATORIOS_AVANCADOS'
  nome: string;
  descricao: string;
  categoria: 'EVENTOS' | 'FINANCEIRO' | 'RELATORIOS' | 'INTEGRACAO' | 'ADMIN';
  ativo: boolean;
  ordem: number;
  dataCadastro: Date;
}
```

#### Collection: `planos`
```typescript
{
  id: string;
  nome: string; // Ex: 'Básico', 'Profissional', 'Enterprise'
  descricao: string;
  codigoHotmart: string; // ID do plano na Hotmart
  funcionalidades: string[]; // IDs das funcionalidades
  preco: number;
  intervalo: 'mensal' | 'anual';
  ativo: boolean;
  destaque: boolean; // Para destacar no marketplace
  limiteEventos?: number; // Limite de eventos por mês (se aplicável)
  limiteClientes?: number; // Limite de clientes (se aplicável)
  limiteUsuarios?: number; // Limite de usuários na conta (se aplicável)
  dataCadastro: Date;
  dataAtualizacao: Date;
}
```

#### Collection: `assinaturas`
```typescript
{
  id: string;
  userId: string;
  planoId?: string; // Plano atual (pode ser null se customizado)
  hotmartSubscriptionId: string; // ID da assinatura na Hotmart
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'suspended';
  dataInicio: Date;
  dataFim?: Date; // Se trial ou cancelada
  dataRenovacao?: Date;
  funcionalidadesHabilitadas: string[]; // IDs das funcionalidades ativas
  historico: Array<{
    data: Date;
    acao: string;
    detalhes: any;
  }>;
  dataCadastro: Date;
  dataAtualizacao: Date;
}
```

#### Atualização na Collection: `controle_users`
```typescript
{
  // ... campos existentes
  assinaturaId?: string; // Referência à assinatura ativa
  funcionalidadesHabilitadas: string[]; // Cache para performance
  planoAtual?: string; // Nome do plano atual (para exibição)
  dataExpiraAssinatura?: Date; // Para avisos de expiração
}
```

### 2. **Códigos de Funcionalidades Identificadas**

Com base na análise do sistema, identifiquei as seguintes funcionalidades que podem ser controladas:

#### **Eventos**
- `EVENTOS_ILIMITADOS` - Criar eventos sem limite
- `EVENTOS_LIMITADOS` - Criar eventos com limite mensal (será controlado pelo plano)
- `EVENTOS_EXPORTAR` - Exportar eventos para Excel/PDF
- `EVENTOS_IMPORTAR` - Importar eventos em lote

#### **Clientes**
- `CLIENTES_ILIMITADOS` - Cadastrar clientes sem limite
- `CLIENTES_LIMITADOS` - Cadastrar clientes com limite (será controlado pelo plano)
- `CLIENTES_EXPORTAR` - Exportar lista de clientes

#### **Financeiro**
- `PAGAMENTOS_REGISTRAR` - Registrar pagamentos
- `PAGAMENTOS_EXPORTAR` - Exportar relatórios de pagamentos
- `PAGAMENTOS_COMPROVANTES` - Upload de comprovantes
- `FLUXO_CAIXA` - Acesso ao relatório de fluxo de caixa

#### **Relatórios**
- `RELATORIOS_BASICOS` - Relatórios básicos (dashboard)
- `RELATORIOS_AVANCADOS` - Relatórios avançados (performance, canais, etc.)
- `RELATORIOS_EXPORTAR` - Exportar relatórios
- `RELATORIOS_COMPARATIVOS` - Relatórios comparativos entre períodos

#### **Serviços e Custos**
- `SERVICOS_GERENCIAR` - Gerenciar serviços
- `CUSTOS_GERENCIAR` - Gerenciar tipos de custos
- `CUSTOS_AVANCADOS` - Custos avançados por evento

#### **Integrações**
- `INTEGRACAO_EMAIL` - Envio de emails automáticos
- `INTEGRACAO_CALENDARIO` - Sincronização com calendário externo
- `INTEGRACAO_CONTABILIDADE` - Integração com sistemas contábeis

#### **Administração**
- `USUARIOS_MULTIPLOS` - Gerenciar múltiplos usuários na conta
- `BACKUP_AUTOMATICO` - Backup automático de dados
- `SUPORTE_PRIORITARIO` - Suporte prioritário
- `PERSONALIZACAO` - Personalização de marca/cor

#### **Limitações (Controladas por Plano)**
- `LIMITE_EVENTOS_MES` - Número máximo de eventos por mês
- `LIMITE_CLIENTES` - Número máximo de clientes
- `LIMITE_USUARIOS_CONTA` - Número máximo de usuários por conta
- `LIMITE_ARQUIVOS` - Espaço de armazenamento para arquivos

---

## 📦 Estrutura de Planos Propostos

### **Plano 1: Básico** (Starter)
**Código Hotmart:** `BASICO_MENSAL`
**Preço:** R$ 49,90/mês

**Funcionalidades:**
- ✅ EVENTOS_LIMITADOS (10 eventos/mês)
- ✅ CLIENTES_LIMITADOS (50 clientes)
- ✅ PAGAMENTOS_REGISTRAR
- ✅ RELATORIOS_BASICOS
- ✅ SERVICOS_GERENCIAR
- ✅ CUSTOS_GERENCIAR

**Limitações:**
- Máximo 10 eventos por mês
- Máximo 50 clientes
- 1 usuário por conta
- Sem exportação de dados

---

### **Plano 2: Profissional** (Professional)
**Código Hotmart:** `PROFISSIONAL_MENSAL`
**Preço:** R$ 149,90/mês

**Funcionalidades:**
- ✅ EVENTOS_ILIMITADOS
- ✅ CLIENTES_ILIMITADOS
- ✅ PAGAMENTOS_REGISTRAR
- ✅ PAGAMENTOS_EXPORTAR
- ✅ PAGAMENTOS_COMPROVANTES
- ✅ RELATORIOS_BASICOS
- ✅ RELATORIOS_AVANCADOS
- ✅ RELATORIOS_EXPORTAR
- ✅ EVENTOS_EXPORTAR
- ✅ CLIENTES_EXPORTAR
- ✅ SERVICOS_GERENCIAR
- ✅ CUSTOS_GERENCIAR
- ✅ CUSTOS_AVANCADOS
- ✅ FLUXO_CAIXA
- ✅ USUARIOS_MULTIPLOS (até 3 usuários)
- ✅ INTEGRACAO_EMAIL

**Limitações:**
- Máximo 3 usuários por conta
- 5GB de armazenamento

---

### **Plano 3: Enterprise** (Premium)
**Código Hotmart:** `ENTERPRISE_MENSAL`
**Preço:** R$ 349,90/mês

**Funcionalidades:**
- ✅ **TODAS as funcionalidades do plano Profissional**
- ✅ EVENTOS_IMPORTAR
- ✅ RELATORIOS_COMPARATIVOS
- ✅ INTEGRACAO_CALENDARIO
- ✅ INTEGRACAO_CONTABILIDADE
- ✅ USUARIOS_MULTIPLOS (ilimitado)
- ✅ BACKUP_AUTOMATICO
- ✅ SUPORTE_PRIORITARIO
- ✅ PERSONALIZACAO

**Limitações:**
- Usuários ilimitados
- 50GB de armazenamento
- Sem limitações funcionais

---

## 🔄 Fluxo de Integração com Hotmart

### 1. **Webhook de Assinatura**

**Endpoint:** `/api/webhooks/hotmart`

**Eventos tratados:**
- `SUBSCRIPTION_PURCHASE` - Nova assinatura criada (trial)
- `SUBSCRIPTION_ACTIVATED` - Assinatura ativada (após período trial)
- `SUBSCRIPTION_CANCELLED` - Assinatura cancelada
- `SUBSCRIPTION_EXPIRED` - Assinatura expirada
- `SUBSCRIPTION_RENEWED` - Assinatura renovada
- `SUBSCRIPTION_SUSPENDED` - Assinatura suspensa

**Payload exemplo:**
```json
{
  "event": "SUBSCRIPTION_PURCHASE",
  "data": {
    "subscription": {
      "code": "SUB-123456",
      "plan": {
        "code": "PROFISSIONAL_MENSAL"
      },
      "buyer": {
        "email": "cliente@exemplo.com",
        "name": "Nome do Cliente"
      },
      "status": "TRIAL",
      "trial_period_end": "2025-01-15T00:00:00Z"
    }
  }
}
```

### 2. **Processamento do Webhook**

1. **Validar autenticidade** (assinatura HMAC da Hotmart)
2. **Identificar usuário** pelo email
3. **Identificar plano** pelo código Hotmart
4. **Atualizar/criar assinatura** na collection `assinaturas`
5. **Habilitar funcionalidades** do plano no perfil do usuário
6. **Enviar email de confirmação** (se necessário)
7. **Log da transação** no histórico

---

## 🛠️ Implementação Técnica

### 1. **Tipos TypeScript**

Arquivo: `src/types/funcionalidades.ts`

```typescript
export type CategoriaFuncionalidade = 
  | 'EVENTOS' 
  | 'FINANCEIRO' 
  | 'RELATORIOS' 
  | 'INTEGRACAO' 
  | 'ADMIN';

export interface Funcionalidade {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaFuncionalidade;
  ativo: boolean;
  ordem: number;
  dataCadastro: Date;
}

export type StatusAssinatura = 
  | 'trial' 
  | 'active' 
  | 'cancelled' 
  | 'expired' 
  | 'suspended';

export interface Plano {
  id: string;
  nome: string;
  descricao: string;
  codigoHotmart: string;
  funcionalidades: string[]; // IDs das funcionalidades
  preco: number;
  intervalo: 'mensal' | 'anual';
  ativo: boolean;
  destaque: boolean;
  limiteEventos?: number;
  limiteClientes?: number;
  limiteUsuarios?: number;
  limiteArmazenamento?: number; // em GB
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface Assinatura {
  id: string;
  userId: string;
  planoId?: string;
  hotmartSubscriptionId: string;
  status: StatusAssinatura;
  dataInicio: Date;
  dataFim?: Date;
  dataRenovacao?: Date;
  funcionalidadesHabilitadas: string[];
  historico: Array<{
    data: Date;
    acao: string;
    detalhes: any;
  }>;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface LimitesUsuario {
  eventosMesAtual: number;
  eventosLimiteMes?: number;
  clientesTotal: number;
  clientesLimite?: number;
  usuariosConta: number;
  usuariosLimite?: number;
  armazenamentoUsado: number; // em bytes
  armazenamentoLimite?: number; // em bytes
}
```

### 2. **Repositórios**

#### `src/lib/repositories/funcionalidade-repository.ts`
- `findAll()` - Buscar todas funcionalidades
- `findByCodigo(codigo)` - Buscar por código
- `findByCategoria(categoria)` - Buscar por categoria
- `findAtivas()` - Buscar apenas ativas

#### `src/lib/repositories/plano-repository.ts`
- `findAll()` - Buscar todos planos
- `findById(id)` - Buscar por ID
- `findByCodigoHotmart(codigo)` - Buscar por código Hotmart
- `findAtivos()` - Buscar apenas ativos
- `findDestaque()` - Buscar planos em destaque

#### `src/lib/repositories/assinatura-repository.ts`
- `findByUserId(userId)` - Buscar assinatura do usuário
- `findByHotmartId(hotmartId)` - Buscar por ID Hotmart
- `create(assinatura)` - Criar assinatura
- `update(id, data)` - Atualizar assinatura
- `addHistorico(id, evento)` - Adicionar evento ao histórico

### 3. **Serviços**

#### `src/lib/services/funcionalidade-service.ts`
- `verificarPermissao(userId, codigoFuncionalidade)` - Verificar se usuário tem permissão
- `obterFuncionalidadesHabilitadas(userId)` - Listar funcionalidades do usuário
- `obterLimitesUsuario(userId)` - Obter limites do usuário
- `verificarLimite(userId, tipoLimite, valorAtual)` - Verificar se limite foi atingido

#### `src/lib/services/plano-service.ts`
- `aplicarPlanoUsuario(userId, planoId)` - Aplicar plano ao usuário
- `obterPlanoAtual(userId)` - Obter plano atual do usuário
- `obterTodosPlanos()` - Listar todos planos disponíveis
- `compararPlanos()` - Comparar funcionalidades entre planos

#### `src/lib/services/hotmart-webhook-service.ts`
- `processarWebhook(payload)` - Processar webhook da Hotmart
- `validarAssinatura(payload)` - Validar HMAC da Hotmart
- `criarAssinatura(dados)` - Criar assinatura a partir do webhook
- `atualizarAssinatura(hotmartId, status)` - Atualizar status da assinatura
- `cancelarAssinatura(hotmartId)` - Cancelar assinatura

### 4. **Middleware/Guards**

#### `src/lib/middleware/verificar-funcionalidade.ts`
- Middleware para verificar permissão antes de acessar rota
- Retorna 403 se usuário não tiver permissão

#### `src/components/guards/FuncionalidadeGuard.tsx`
- Componente React para proteger rotas no frontend
- Oculta/mostra conteúdo baseado em permissões

### 5. **Hooks React**

#### `src/hooks/useFuncionalidades.ts`
```typescript
export function useFuncionalidades() {
  // Retorna funcionalidades habilitadas do usuário
  // Verifica permissões
  // Verifica limites
}
```

#### `src/hooks/usePlano.ts`
```typescript
export function usePlano() {
  // Retorna plano atual do usuário
  // Informações de assinatura
  // Status (trial, ativa, etc.)
}
```

---

## 📱 Interface do Usuário

### 1. **Página de Planos**

`/planos` ou `/assinar`
- Exibir todos os planos disponíveis
- Comparação de funcionalidades
- Botão "Assinar" que redireciona para Hotmart
- Destaque para plano atual (se houver)

### 2. **Página de Assinatura**

`/assinatura` ou `/minha-assinatura`
- Plano atual
- Status da assinatura
- Data de renovação/expiração
- Funcionalidades habilitadas
- Histórico de pagamentos
- Botão para cancelar/upgrade

### 3. **Avisos de Limites**

- Banner quando próximo do limite
- Modal quando limite atingido
- Sugestão de upgrade

### 4. **Bloqueio de Funcionalidades**

- Botões desabilitados com tooltip explicativo
- Mensagens de "Upgrade necessário"
- Redirecionamento para página de planos

---

## 🔐 Segurança

### 1. **Validação de Webhook**
- Validar HMAC da Hotmart
- Verificar origem do request
- Rate limiting

### 2. **Verificação de Permissões**
- Sempre verificar no backend
- Cache no frontend apenas para UX
- Logs de tentativas de acesso negadas

### 3. **Proteção de Dados**
- Dados sensíveis (IDs Hotmart) não expostos no frontend
- Sanitização de inputs
- Validação de tipos

---

## 📊 Monitoramento e Logs

### 1. **Eventos para Log**
- Webhooks recebidos
- Assinaturas criadas/atualizadas
- Tentativas de acesso negadas
- Limites atingidos
- Upgrades/downgrades

### 2. **Métricas Importantes**
- Taxa de conversão (trial -> pago)
- Taxa de cancelamento
- Funcionalidades mais bloqueadas
- Planos mais populares

---

## 🚀 Plano de Implementação

### **Fase 1: Estrutura Base** (Semana 1)
1. ✅ Criar tipos TypeScript
2. ✅ Criar collections no Firestore
3. ✅ Criar repositórios
4. ✅ Criar serviços básicos
5. ✅ Seed de funcionalidades iniciais
6. ✅ Seed de planos iniciais

### **Fase 2: Integração Hotmart** (Semana 2)
1. ✅ Criar endpoint de webhook
2. ✅ Implementar validação HMAC
3. ✅ Processar eventos do webhook
4. ✅ Atualizar perfil do usuário
5. ✅ Testes com webhooks de teste da Hotmart

### **Fase 3: Sistema de Permissões** (Semana 2-3)
1. ✅ Criar middleware de verificação
2. ✅ Criar guards React
3. ✅ Criar hooks
4. ✅ Proteger rotas existentes
5. ✅ Adicionar verificações de limites

### **Fase 4: Interface** (Semana 3-4)
1. ✅ Página de planos
2. ✅ Página de assinatura
3. ✅ Componentes de bloqueio
4. ✅ Avisos de limites
5. ✅ Atualizar Layout para mostrar plano atual

### **Fase 5: Testes e Ajustes** (Semana 4)
1. ✅ Testes end-to-end
2. ✅ Testes de limites
3. ✅ Testes de webhook
4. ✅ Ajustes de UX
5. ✅ Documentação final

---

## 🎯 Próximos Passos

1. Revisar e aprovar este plano
2. Confirmar estrutura de planos proposta
3. Obter credenciais da Hotmart (HMAC secret)
4. Iniciar implementação da Fase 1
5. Configurar ambiente de testes da Hotmart

---

## 📝 Notas Importantes

- **Trial Period**: Durante o trial, todas funcionalidades do plano devem estar ativas
- **Cancelamento**: Ao cancelar, funcionalidades permanecem ativas até o fim do período pago
- **Upgrade/Downgrade**: Mudanças devem ser aplicadas imediatamente (exceto downgrade que pode manter até fim do período)
- **Limites**: Verificações devem ser feitas antes de criar recursos, não apenas no frontend
- **Cache**: Funcionalidades podem ser cacheadas para performance, mas sempre validar no backend

---

**Status:** 📋 Análise e Plano Completo - Aguardando Aprovação

