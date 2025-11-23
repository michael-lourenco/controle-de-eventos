# Implementação Completa de Webhooks Hotmart

## Data: 2025-01-27

## Objetivo
Implementar todos os eventos de webhook da Hotmart necessários para gerenciamento completo de assinaturas, incluindo troca de planos, atualização de datas, e eventos financeiros.

## Eventos Implementados

### ✅ Eventos Já Implementados (6 eventos)
1. **PURCHASE_APPROVED / PURCHASE_COMPLETE** - Compra aprovada
2. **SUBSCRIPTION_ACTIVATED** - Assinatura ativada
3. **SUBSCRIPTION_RENEWED** - Assinatura renovada
4. **PURCHASE_CANCELED / SUBSCRIPTION_CANCELLATION** - Cancelamento
5. **PURCHASE_EXPIRED / SUBSCRIPTION_EXPIRED** - Expiração
6. **SUBSCRIPTION_SUSPENDED** - Suspensão

### ✅ Novos Eventos Implementados (7 eventos)

#### 1. SWITCH_PLAN - Troca de Plano ⚠️ **CRÍTICO**
**Evento:** `SWITCH_PLAN`
**Método:** `processarTrocaPlano()`

**Funcionalidade:**
- Identifica assinatura existente pelo `hotmartSubscriptionId`
- Extrai novo plano do payload (plano marcado como `current: true`)
- Busca novo plano no banco de dados
- Atualiza assinatura com novo plano
- Aplica novas funcionalidades ao usuário
- Mantém histórico da troca (plano anterior → plano novo)

**Payload esperado:**
```json
{
  "event": "SWITCH_PLAN",
  "data": {
    "subscription": {
      "subscriber_code": "9W2LNSG4",
      "user": { "email": "usuario@exemplo.com" }
    },
    "plans": [
      { "name": "BASICO_MENSAL", "current": false },
      { "name": "PROFISSIONAL_MENSAL", "current": true }
    ]
  }
}
```

**Ações realizadas:**
- Atualiza `planoId` na assinatura
- Atualiza `funcionalidadesHabilitadas` com funcionalidades do novo plano
- Atualiza dados do usuário (planoId, planoNome, planoCodigoHotmart, funcionalidadesHabilitadas)
- Registra no histórico: plano anterior, plano novo, data da troca

#### 2. UPDATE_SUBSCRIPTION_CHARGE_DATE - Atualização de Data de Cobrança
**Evento:** `UPDATE_SUBSCRIPTION_CHARGE_DATE`
**Método:** `processarAtualizacaoDataCobranca()`

**Funcionalidade:**
- Atualiza data de próxima cobrança da assinatura
- Registra mudança no histórico

**Payload esperado:**
```json
{
  "event": "UPDATE_SUBSCRIPTION_CHARGE_DATE",
  "data": {
    "subscription": {
      "dateNextCharge": "2025-02-15T00:00:00.000Z",
      "newChargeDay": 15,
      "oldChargeDay": 7
    },
    "subscriber": {
      "code": "00000000",
      "email": "usuario@exemplo.com"
    }
  }
}
```

**Ações realizadas:**
- Atualiza `dataRenovacao` na assinatura
- Registra no histórico: data anterior, data nova, dia anterior, dia novo

#### 3. PURCHASE_CHARGEBACK - Chargeback
**Evento:** `PURCHASE_CHARGEBACK`
**Método:** `processarChargeback()`

**Funcionalidade:**
- Suspende assinatura imediatamente
- Remove funcionalidades do usuário
- Registra motivo no histórico

**Ações realizadas:**
- Atualiza status para `suspended`
- Remove `funcionalidadesHabilitadas` da assinatura e do usuário
- Registra no histórico: motivo "Chargeback detectado no pagamento"

#### 4. PURCHASE_PROTEST - Protesto
**Evento:** `PURCHASE_PROTEST`
**Método:** `processarProtesto()`

**Funcionalidade:**
- Suspende assinatura devido a protesto de boleto
- Remove funcionalidades do usuário
- Registra motivo no histórico

**Ações realizadas:**
- Atualiza status para `suspended`
- Remove `funcionalidadesHabilitadas` da assinatura e do usuário
- Registra no histórico: motivo "Boleto protestado"

#### 5. PURCHASE_REFUNDED - Reembolso
**Evento:** `PURCHASE_REFUNDED`
**Método:** `processarReembolso()`

**Funcionalidade:**
- Cancela assinatura imediatamente
- Remove plano e funcionalidades do usuário
- Define data de fim como agora
- Registra motivo no histórico

**Ações realizadas:**
- Atualiza status para `cancelled`
- Define `dataFim` como data atual
- Remove `planoId`, `planoNome`, `planoCodigoHotmart` e `funcionalidadesHabilitadas` do usuário
- Registra no histórico: motivo "Pagamento reembolsado"

#### 6. PURCHASE_DELAYED - Pagamento Atrasado
**Evento:** `PURCHASE_DELAYED`
**Método:** `processarPagamentoAtrasado()`

**Funcionalidade:**
- Suspende assinatura temporariamente
- Mantém funcionalidades (serão removidas apenas se não houver pagamento)
- Registra observação no histórico

**Ações realizadas:**
- Atualiza status para `suspended`
- Registra no histórico: motivo "Pagamento em atraso", observação "Assinatura será reativada quando pagamento for confirmado"

#### 7. Método Auxiliar: extrairNovoPlanoDoSwitchPlan()
**Funcionalidade:**
- Extrai código do novo plano do payload SWITCH_PLAN
- Busca plano marcado como `current: true`
- Fallback para primeiro plano da lista se não encontrar

## Endpoint Mock Criado

### `/api/webhooks/hotmart/mock`

**Método:** POST
**Descrição:** Endpoint para simular webhooks da Hotmart sem precisar usar sandbox ou produção

**Parâmetros de Query:**
- `event` (obrigatório): Tipo de evento a simular
- `email` (obrigatório): Email do usuário
- `subscription_code` (opcional): Código da assinatura (gera automaticamente se não fornecido)
- `plan_code` (opcional): Código do plano atual (padrão: BASICO_MENSAL)
- `new_plan_code` (obrigatório para SWITCH_PLAN): Código do novo plano
- `new_charge_date` (opcional para UPDATE_SUBSCRIPTION_CHARGE_DATE): Nova data de cobrança (ISO)

**Exemplos de Uso:**

1. **Compra Aprovada:**
```
POST /api/webhooks/hotmart/mock?event=PURCHASE_APPROVED&email=usuario@exemplo.com&plan_code=PROFISSIONAL_MENSAL
```

2. **Troca de Plano:**
```
POST /api/webhooks/hotmart/mock?event=SWITCH_PLAN&email=usuario@exemplo.com&new_plan_code=PREMIUM_MENSAL
```

3. **Atualização de Data de Cobrança:**
```
POST /api/webhooks/hotmart/mock?event=UPDATE_SUBSCRIPTION_CHARGE_DATE&email=usuario@exemplo.com&new_charge_date=2025-02-15T00:00:00.000Z
```

4. **Chargeback:**
```
POST /api/webhooks/hotmart/mock?event=PURCHASE_CHARGEBACK&email=usuario@exemplo.com
```

5. **Reembolso:**
```
POST /api/webhooks/hotmart/mock?event=PURCHASE_REFUNDED&email=usuario@exemplo.com
```

**Método GET:**
Retorna documentação do endpoint com exemplos e eventos disponíveis.

## Alterações no Código

### Arquivo: `src/lib/services/hotmart-webhook-service.ts`

#### 1. Atualização do Mapeamento de Eventos
- Adicionados novos casos no `mapEventToAction()`:
  - `SWITCH_PLAN` → `'switch_plan'`
  - `UPDATE_SUBSCRIPTION_CHARGE_DATE` → `'update_charge_date'`
  - `PURCHASE_CHARGEBACK` → `'chargeback'`
  - `PURCHASE_PROTEST` → `'protest'`
  - `PURCHASE_REFUNDED` → `'refunded'`
  - `PURCHASE_DELAYED` → `'delayed'`

#### 2. Otimização de Validação
- Eventos que não precisam validar plano:
  - `update_charge_date`
  - `chargeback`
  - `protest`
  - `refunded`
  - `delayed`
  - `cancelled`
  - `expired`
  - `suspended`
  - `activated`
  - `renewed`

- Eventos que precisam validar plano:
  - `purchase`
  - `switch_plan`

#### 3. Novos Métodos de Processamento

**processarTrocaPlano():**
- Busca assinatura existente
- Busca novo plano
- Atualiza assinatura e usuário
- Registra histórico completo

**processarAtualizacaoDataCobranca():**
- Atualiza data de renovação
- Registra mudança no histórico

**processarChargeback():**
- Suspende assinatura
- Remove funcionalidades

**processarProtesto():**
- Suspende assinatura
- Remove funcionalidades

**processarReembolso():**
- Cancela assinatura
- Remove plano e funcionalidades

**processarPagamentoAtrasado():**
- Suspende temporariamente
- Mantém funcionalidades (para reativação)

**extrairNovoPlanoDoSwitchPlan():**
- Extrai código do novo plano do payload

### Arquivo: `src/app/api/webhooks/hotmart/mock/route.ts`

**Criado:** Novo endpoint para testes mock

**Funcionalidades:**
- Gera payloads mock baseados no tipo de evento
- Suporta todos os eventos implementados
- Validação de parâmetros obrigatórios
- Logs detalhados
- Retorna payload gerado para debug

## Fluxo de Processamento

### Eventos que Requerem Plano
1. Valida email → busca usuário
2. Valida código do plano → busca plano
3. Processa evento com plano validado

### Eventos que NÃO Requerem Plano
1. Valida email → busca usuário
2. Processa evento diretamente (usa apenas subscription_id)

### SWITCH_PLAN (Especial)
1. Valida email → busca usuário
2. Extrai novo plano do payload
3. Busca novo plano no banco
4. Processa troca

## Histórico de Assinatura

Todos os eventos importantes são registrados no histórico da assinatura:
- Troca de plano: plano anterior → plano novo
- Atualização de data: data anterior → data nova
- Chargeback/Protesto/Reembolso: motivo e status anterior
- Pagamento atrasado: observação sobre reativação

## Status de Assinatura

**Status suportados:**
- `trial` - Período de teste
- `active` - Ativa
- `cancelled` - Cancelada (mas ainda ativa até fim do período)
- `expired` - Expirada
- `suspended` - Suspensa

**Mapeamento de eventos para status:**
- `purchase` → `active` ou `trial`
- `activated` → `active`
- `renewed` → `active`
- `cancelled` → `cancelled`
- `expired` → `expired`
- `suspended` → `suspended`
- `chargeback` → `suspended`
- `protest` → `suspended`
- `refunded` → `cancelled`
- `delayed` → `suspended`

## Testes via Postman

### Collection Sugerida

Criar collection com as seguintes requisições:

1. **Compra Aprovada (Básico)**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_APPROVED&email={{email}}&plan_code=BASICO_MENSAL`

2. **Compra Aprovada (Profissional)**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_APPROVED&email={{email}}&plan_code=PROFISSIONAL_MENSAL`

3. **Compra Aprovada (Premium)**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_APPROVED&email={{email}}&plan_code=PREMIUM_MENSAL`

4. **Troca de Plano (Básico → Profissional)**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=SWITCH_PLAN&email={{email}}&new_plan_code=PROFISSIONAL_MENSAL`

5. **Troca de Plano (Profissional → Premium)**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=SWITCH_PLAN&email={{email}}&new_plan_code=PREMIUM_MENSAL`

6. **Atualização de Data de Cobrança**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=UPDATE_SUBSCRIPTION_CHARGE_DATE&email={{email}}&new_charge_date=2025-02-15T00:00:00.000Z`

7. **Cancelamento**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=SUBSCRIPTION_CANCELLATION&email={{email}}`

8. **Expiração**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=SUBSCRIPTION_EXPIRED&email={{email}}`

9. **Chargeback**
   - Method: POST
   - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_CHARGEBACK&email={{email}}`

10. **Protesto**
    - Method: POST
    - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_PROTEST&email={{email}}`

11. **Reembolso**
    - Method: POST
    - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_REFUNDED&email={{email}}`

12. **Pagamento Atrasado**
    - Method: POST
    - URL: `/api/webhooks/hotmart/mock?event=PURCHASE_DELAYED&email={{email}}`

## Resultado

✅ **13 eventos implementados** (6 existentes + 7 novos)
✅ **Endpoint mock criado** para testes
✅ **Validação otimizada** (não valida plano quando não necessário)
✅ **Histórico completo** de todas as ações
✅ **Tratamento de erros** robusto
✅ **Logs detalhados** para debug

## Impacto

- **Funcionalidade:** Sistema agora suporta todos os eventos críticos da Hotmart
- **Manutenibilidade:** Código organizado e bem documentado
- **Testabilidade:** Endpoint mock facilita testes sem depender do sandbox
- **Confiabilidade:** Tratamento adequado de todos os cenários financeiros
- **Rastreabilidade:** Histórico completo de todas as alterações

## Observações

- O endpoint mock não valida HMAC (para facilitar testes)
- Todos os eventos são processados de forma idempotente (pode ser chamado múltiplas vezes)
- Logs incluem prefixo [SANDBOX] quando processado via mock
- Validação de plano é otimizada para eventos que não precisam
- Histórico é sempre atualizado para auditoria

