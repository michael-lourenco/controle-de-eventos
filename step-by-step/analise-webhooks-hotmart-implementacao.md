# Análise: Implementação de Webhooks Hotmart - Estado Atual e Pendências

## Data: 2025-01-27

## Objetivo
Analisar o estado atual da implementação de webhooks da Hotmart, identificar o que já está implementado e o que precisa ser implementado, incluindo criação de endpoints mock para testes.

## Eventos Disponíveis no Hotmart (Versão 2.0.0)

Baseado no arquivo `payloads-webhook.md`, os eventos disponíveis são:

### Eventos de Compra (PURCHASE_*)
1. **PURCHASE_APPROVED** - Compra aprovada ✅
2. **PURCHASE_COMPLETE** - Compra completa ✅
3. **PURCHASE_EXPIRED** - Compra expirada ✅
4. **PURCHASE_CANCELED** - Compra cancelada ✅
5. **PURCHASE_CHARGEBACK** - Chargeback ❌
6. **PURCHASE_PROTEST** - Protesto ❌
7. **PURCHASE_DELAYED** - Compra atrasada ❌
8. **PURCHASE_REFUNDED** - Compra reembolsada ❌
9. **PURCHASE_BILLET_PRINTED** - Boleto impresso ✅ (tratado como renewed)
10. **PURCHASE_OUT_OF_SHOPPING_CART** - Removido do carrinho ❌

### Eventos de Assinatura (SUBSCRIPTION_*)
1. **SUBSCRIPTION_PURCHASE** - Compra de assinatura ✅
2. **SUBSCRIPTION_ACTIVATED** - Assinatura ativada ✅
3. **SUBSCRIPTION_RENEWED** - Assinatura renovada ✅
4. **SUBSCRIPTION_CANCELLATION** - Cancelamento de assinatura ✅
5. **SUBSCRIPTION_EXPIRED** - Assinatura expirada ✅
6. **SUBSCRIPTION_SUSPENDED** - Assinatura suspensa ✅

### Eventos Especiais
1. **SWITCH_PLAN** - Troca de plano ❌ **CRÍTICO**
2. **UPDATE_SUBSCRIPTION_CHARGE_DATE** - Atualização de data de cobrança ❌

## Estado Atual da Implementação

### ✅ Eventos Implementados

#### 1. Compra/Ativação (PURCHASE_APPROVED, PURCHASE_COMPLETE, SUBSCRIPTION_PURCHASE)
- **Método:** `processarCompra()`
- **Ação:** Cria nova assinatura ou atualiza existente
- **Status:** Funcional
- **Mapeamento:** `PURCHASE_APPROVED`, `PURCHASE_COMPLETED`, `PURCHASE_FINISHED`, `SUBSCRIPTION_PURCHASE` → `'purchase'`

#### 2. Ativação (SUBSCRIPTION_ACTIVATED)
- **Método:** `processarAtivacao()`
- **Ação:** Ativa assinatura existente, atualiza status para 'active'
- **Status:** Funcional
- **Mapeamento:** `SUBSCRIPTION_ACTIVATED` → `'activated'`

#### 3. Renovação (SUBSCRIPTION_RENEWED, PURCHASE_BILLET_PRINTED, PURCHASE_CHARGED)
- **Método:** `processarRenovacao()`
- **Ação:** Atualiza data de renovação, mantém status 'active'
- **Status:** Funcional
- **Mapeamento:** `SUBSCRIPTION_RENEWED`, `PURCHASE_BILLET_PRINTED`, `PURCHASE_UPDATED`, `PURCHASE_CHARGED` → `'renewed'`

#### 4. Cancelamento (PURCHASE_CANCELED, SUBSCRIPTION_CANCELLATION)
- **Método:** `processarCancelamento()`
- **Ação:** Cancela assinatura, mantém ativa até fim do período
- **Status:** Funcional
- **Mapeamento:** `PURCHASE_CANCELED`, `PURCHASE_CANCELLED`, `SUBSCRIPTION_CANCELLED`, `SUBSCRIPTION_CANCELED` → `'cancelled'`

#### 5. Expiração (PURCHASE_EXPIRED, SUBSCRIPTION_EXPIRED)
- **Método:** `processarExpiracao()`
- **Ação:** Expira assinatura, remove funcionalidades do usuário
- **Status:** Funcional
- **Mapeamento:** `PURCHASE_EXPIRED`, `SUBSCRIPTION_EXPIRED` → `'expired'`

#### 6. Suspensão (SUBSCRIPTION_SUSPENDED)
- **Método:** `processarSuspensao()`
- **Ação:** Suspende assinatura, remove funcionalidades temporariamente
- **Status:** Funcional
- **Mapeamento:** `SUBSCRIPTION_SUSPENDED` → `'suspended'`

### ❌ Eventos NÃO Implementados (Críticos)

#### 1. SWITCH_PLAN - Troca de Plano ⚠️ **CRÍTICO**
- **Evento:** `SWITCH_PLAN`
- **Descrição:** Quando usuário troca de plano (ex: Básico → Profissional)
- **Impacto:** Usuário pode ter plano desatualizado no sistema
- **Ação Necessária:** 
  - Identificar assinatura existente
  - Buscar novo plano
  - Atualizar assinatura com novo plano
  - Aplicar novas funcionalidades
  - Manter histórico da troca

#### 2. UPDATE_SUBSCRIPTION_CHARGE_DATE - Atualização de Data de Cobrança
- **Evento:** `UPDATE_SUBSCRIPTION_CHARGE_DATE`
- **Descrição:** Quando a data de próxima cobrança é alterada
- **Impacto:** Data de renovação pode ficar desatualizada
- **Ação Necessária:**
  - Identificar assinatura
  - Atualizar `dataRenovacao` com nova data
  - Registrar no histórico

### ⚠️ Eventos NÃO Implementados (Importantes mas não críticos)

#### 3. PURCHASE_CHARGEBACK - Chargeback
- **Evento:** `PURCHASE_CHARGEBACK`
- **Descrição:** Quando há estorno/chargeback do pagamento
- **Impacto:** Pagamento foi revertido, assinatura deve ser suspensa/cancelada
- **Ação Necessária:**
  - Suspender ou cancelar assinatura
  - Registrar motivo no histórico
  - Possivelmente notificar administrador

#### 4. PURCHASE_PROTEST - Protesto
- **Evento:** `PURCHASE_PROTEST`
- **Descrição:** Quando boleto é protestado
- **Impacto:** Pagamento não foi efetuado
- **Ação Necessária:**
  - Similar ao chargeback
  - Suspender assinatura
  - Registrar no histórico

#### 5. PURCHASE_REFUNDED - Reembolso
- **Evento:** `PURCHASE_REFUNDED`
- **Descrição:** Quando compra é reembolsada
- **Impacto:** Assinatura deve ser cancelada
- **Ação Necessária:**
  - Cancelar assinatura imediatamente
  - Remover funcionalidades
  - Registrar no histórico

#### 6. PURCHASE_DELAYED - Compra Atrasada
- **Evento:** `PURCHASE_DELAYED`
- **Descrição:** Quando pagamento está atrasado
- **Impacto:** Assinatura pode estar em risco
- **Ação Necessária:**
  - Marcar assinatura como "pagamento pendente"
  - Possivelmente suspender temporariamente
  - Notificar usuário

#### 7. PURCHASE_OUT_OF_SHOPPING_CART - Removido do Carrinho
- **Evento:** `PURCHASE_OUT_OF_SHOPPING_CART`
- **Descrição:** Quando item é removido do carrinho
- **Impacto:** Baixo - apenas informativo
- **Ação Necessária:**
  - Registrar evento (opcional)
  - Não requer ação no sistema

## Endpoints Existentes

### 1. `/api/webhooks/hotmart` (Produção)
- **Método:** POST
- **Validação HMAC:** Sim (configurável)
- **Status:** Funcional

### 2. `/api/webhooks/hotmart/sandbox` (Sandbox)
- **Método:** POST
- **Validação HMAC:** Opcional (para facilitar testes)
- **Status:** Funcional

## Estrutura de Dados

### Status de Assinatura Suportados
- `trial` - Período de teste
- `active` - Ativa
- `cancelled` - Cancelada (mas ainda ativa até fim do período)
- `expired` - Expirada
- `suspended` - Suspensa

### Campos da Assinatura
- `hotmartSubscriptionId` - ID da assinatura no Hotmart
- `planoId` - ID do plano no sistema
- `status` - Status atual
- `dataRenovacao` - Data da próxima cobrança
- `dataFim` - Data de término (se aplicável)
- `funcionalidadesHabilitadas` - Array de IDs de funcionalidades

## Planos Configurados

Conforme mencionado, há 3 planos:
- **BASICO** (BASICO_MENSAL)
- **PROFISSIONAL** (PROFISSIONAL_MENSAL)
- **PREMIUM** (PREMIUM_MENSAL)

## Resumo

### ✅ Implementado (6 eventos)
1. Compra/Ativação
2. Ativação
3. Renovação
4. Cancelamento
5. Expiração
6. Suspensão

### ❌ Não Implementado - Críticos (2 eventos)
1. **SWITCH_PLAN** - Troca de plano
2. **UPDATE_SUBSCRIPTION_CHARGE_DATE** - Atualização de data de cobrança

### ⚠️ Não Implementado - Importantes (5 eventos)
3. PURCHASE_CHARGEBACK
4. PURCHASE_PROTEST
5. PURCHASE_REFUNDED
6. PURCHASE_DELAYED
7. PURCHASE_OUT_OF_SHOPPING_CART (baixa prioridade)

## Próximos Passos Sugeridos

1. **Implementar SWITCH_PLAN** (prioridade máxima)
2. **Implementar UPDATE_SUBSCRIPTION_CHARGE_DATE** (prioridade alta)
3. **Criar endpoints mock** para testes via Postman
4. **Implementar eventos de chargeback/protesto/reembolso** (prioridade média)
5. **Implementar PURCHASE_DELAYED** (prioridade baixa)

