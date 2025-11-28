# Correção: Preservação do Histórico de Assinatura ao Expirar e Exibição na Página

## Data: 2025-01-27

## Problema Identificado

Quando um webhook de plano expirado (`SUBSCRIPTION_EXPIRED`) era recebido, o histórico de alterações da assinatura estava sendo apagado. O mesmo problema ocorria com outros eventos como cancelamento, reembolso, chargeback e protesto.

### Causa Raiz

O problema estava no método `atualizarStatus` do `AssinaturaRepository`:

1. O método buscava a assinatura do banco
2. Adicionava um evento ao histórico via `addHistorico` (que atualizava o banco)
3. Fazia `update` passando `...assinatura` (objeto antigo buscado antes do `addHistorico`)
4. Isso sobrescrevia o histórico atualizado com o histórico antigo

### Impacto

- Perda de dados de auditoria importantes
- Impossibilidade de rastrear o histórico completo de uma assinatura
- Dificuldade para entender o que aconteceu com uma conta ao longo do tempo

## Soluções Implementadas

### 1. Correção do Método `atualizarStatus`

**Arquivo**: `src/lib/repositories/assinatura-repository.ts`

**Alteração**: Após adicionar o evento ao histórico, o método agora busca a assinatura atualizada novamente antes de fazer o `update`, garantindo que o histórico atualizado seja preservado.

```typescript
async atualizarStatus(id: string, status: StatusAssinatura, dadosAdicionais?: Partial<Assinatura>): Promise<Assinatura> {
  const assinatura = await this.findById(id);
  if (!assinatura) {
    throw new Error('Assinatura não encontrada');
  }

  // Adicionar evento ao histórico
  await this.addHistorico(id, {
    data: new Date(),
    acao: `Status alterado para ${status}`,
    detalhes: { statusAnterior: assinatura.status, statusNovo: status }
  });

  // Buscar assinatura atualizada (com histórico atualizado) para preservar o histórico
  const assinaturaAtualizada = await this.findById(id);
  if (!assinaturaAtualizada) {
    throw new Error('Assinatura não encontrada após atualização do histórico');
  }

  // Atualizar status e outros campos, preservando o histórico atualizado
  return this.update(id, {
    ...assinaturaAtualizada,
    status,
    ...dadosAdicionais,
    dataAtualizacao: new Date()
  });
}
```

### 2. Melhoria dos Métodos de Processamento de Webhooks

**Arquivo**: `src/lib/services/hotmart-webhook-service.ts`

Todos os métodos de processamento de webhooks foram atualizados para:
- Adicionar registros específicos no histórico ANTES de atualizar o status
- Incluir informações detalhadas sobre o evento (status anterior, status novo, motivo, data, etc.)

#### Métodos Corrigidos:

1. **`processarExpiracao`**
   - Adiciona registro específico de expiração no histórico
   - Inclui detalhes: status anterior, status novo, motivo (webhook recebido), data de expiração

2. **`processarCancelamento`**
   - Adiciona registro específico de cancelamento no histórico
   - Inclui detalhes: status anterior, status novo, motivo, observação sobre manter ativa até fim do período

3. **`processarReembolso`**
   - Adiciona registro específico de reembolso no histórico ANTES de atualizar o status
   - Inclui detalhes: status anterior, status novo, motivo, data de reembolso

4. **`processarChargeback`**
   - Adiciona registro específico de chargeback no histórico ANTES de atualizar o status
   - Inclui detalhes: status anterior, status novo, motivo, data de chargeback

5. **`processarProtesto`**
   - Adiciona registro específico de protesto no histórico ANTES de atualizar o status
   - Inclui detalhes: status anterior, status novo, motivo, data de protesto

## Estrutura dos Registros de Histórico

Todos os registros de histórico seguem a estrutura:

```typescript
{
  data: Date,
  acao: string, // Descrição da ação
  detalhes: {
    statusAnterior?: string,
    statusNovo?: string,
    motivo?: string,
    observacao?: string,
    dataEvento?: string, // ISO string
    // Outros campos específicos do evento
  }
}
```

## Benefícios

1. **Preservação Completa do Histórico**: O histórico nunca é apagado, mesmo quando a assinatura expira, é cancelada ou sofre outros eventos
2. **Auditoria Completa**: Possibilidade de rastrear todas as mudanças na assinatura ao longo do tempo
3. **Registros Detalhados**: Cada evento inclui informações contextuais importantes (status anterior, motivo, data, etc.)
4. **Consistência**: Todos os métodos de processamento de webhooks seguem o mesmo padrão

## Arquivos Modificados

1. `src/lib/repositories/assinatura-repository.ts`
   - Método `atualizarStatus`: Corrigido para preservar o histórico atualizado

2. `src/lib/services/hotmart-webhook-service.ts`
   - Método `processarExpiracao`: Melhorado para adicionar registro específico no histórico
   - Método `processarCancelamento`: Melhorado para adicionar registro específico no histórico
   - Método `processarReembolso`: Corrigido para adicionar histórico antes de atualizar status
   - Método `processarChargeback`: Corrigido para adicionar histórico antes de atualizar status
   - Método `processarProtesto`: Corrigido para adicionar histórico antes de atualizar status

## Testes Recomendados

1. Testar webhook `SUBSCRIPTION_EXPIRED` e verificar se o histórico é preservado
2. Testar webhook `SUBSCRIPTION_CANCELLATION` e verificar se o histórico é preservado
3. Testar webhook `PURCHASE_REFUNDED` e verificar se o histórico é preservado
4. Testar webhook `PURCHASE_CHARGEBACK` e verificar se o histórico é preservado
5. Testar webhook `PURCHASE_PROTEST` e verificar se o histórico é preservado
6. Verificar que o histórico completo está disponível mesmo após a assinatura expirar

## Observações

- O histórico agora é sempre preservado, independentemente do status da assinatura
- Cada evento adiciona um registro específico no histórico antes de atualizar o status
- O método `atualizarStatus` garante que o histórico atualizado seja sempre preservado
- Todos os registros incluem informações contextuais para facilitar a auditoria

---

## Parte 2: Exibição do Histórico na Página /assinatura

### Problema Adicional Identificado

Quando o usuário não possui um plano ativo no momento presente, a página `/assinatura` exibia apenas uma mensagem informando que não havia assinatura ativa. Porém, se o usuário já teve um plano anteriormente e, por algum motivo, não tem mais (expirado, cancelado, etc.), ele precisava ter acesso ao histórico de informações de alterações do plano para fins de auditoria.

### Solução Implementada

#### 1. Modificação da API de Assinaturas

**Arquivo**: `src/app/api/assinaturas/route.ts`

**Alteração**: A API agora retorna tanto a assinatura ativa quanto todas as assinaturas do usuário (para histórico).

```typescript
// Usuário comum: retornar assinatura ativa e todas as assinaturas (para histórico)
const assinatura = await repo.findByUserId(session.user.id);
const todasAssinaturas = await repo.findAllByUserId(session.user.id);

return NextResponse.json({ 
  assinatura, // Assinatura ativa (ou null se não houver)
  todasAssinaturas // Todas as assinaturas do usuário (para histórico)
});
```

#### 2. Atualização da Página /assinatura

**Arquivo**: `src/app/assinatura/page.tsx`

**Alterações**:

1. **Consolidação do Histórico**: A página agora consolida o histórico de todas as assinaturas do usuário, não apenas da assinatura ativa.

2. **Exibição Condicional**: 
   - Se o usuário nunca teve plano: mostra mensagem padrão
   - Se o usuário não tem plano ativo mas tem histórico: mostra o histórico completo com aviso informativo

3. **Histórico Consolidado**: Todos os eventos de todas as assinaturas são consolidados e ordenados por data (mais recente primeiro).

```typescript
// Consolidar histórico de todas as assinaturas
const historico: any[] = [];
data.todasAssinaturas.forEach((ass: Assinatura) => {
  if (ass.historico && Array.isArray(ass.historico)) {
    ass.historico.forEach((evento) => {
      historico.push({
        ...evento,
        assinaturaId: ass.id,
        assinaturaStatus: ass.status
      });
    });
  }
});

// Ordenar por data (mais recente primeiro)
historico.sort((a, b) => {
  const getDate = (date: any): Date => {
    if (date && typeof date === 'object' && 'seconds' in date) {
      const seconds = (date as any).seconds;
      const nanoseconds = (date as any).nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
    return new Date(date);
  };
  
  const dataA = getDate(a.data);
  const dataB = getDate(b.data);
  return dataB.getTime() - dataA.getTime();
});
```

### Benefícios Adicionais

1. **Auditoria Completa**: Usuários podem acessar o histórico completo mesmo quando não têm plano ativo
2. **Transparência**: Usuários podem ver todas as alterações que ocorreram em suas assinaturas ao longo do tempo
3. **Rastreabilidade**: Facilita a identificação de problemas ou questões relacionadas a assinaturas anteriores
4. **Experiência do Usuário**: Mensagem clara quando não há plano ativo mas há histórico disponível

### Arquivos Modificados (Parte 2)

1. `src/app/api/assinaturas/route.ts`
   - Modificado para retornar todas as assinaturas do usuário além da assinatura ativa

2. `src/app/assinatura/page.tsx`
   - Adicionada lógica para consolidar histórico de todas as assinaturas
   - Modificada exibição para mostrar histórico mesmo sem plano ativo
   - Adicionada mensagem informativa quando não há plano ativo mas há histórico

### Testes Recomendados (Parte 2)

1. Testar com usuário que nunca teve plano: deve mostrar mensagem padrão
2. Testar com usuário que teve plano mas expirou: deve mostrar histórico completo
3. Testar com usuário que teve plano mas cancelou: deve mostrar histórico completo
4. Testar com usuário com plano ativo: deve mostrar histórico normalmente
5. Verificar que o histórico consolidado está ordenado corretamente (mais recente primeiro)
6. Verificar que todos os eventos de todas as assinaturas aparecem no histórico consolidado

