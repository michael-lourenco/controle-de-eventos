# Correção de Permissão para Associar Serviços a Eventos

## Data: 2025-01-27

## Problema Identificado
Os usuários estavam recebendo o erro "Seu plano não permite gerenciar serviços" ao tentar criar um evento em `/eventos/novo`, mesmo tendo permissão para criar eventos. O erro ocorria ao associar serviços existentes ao evento.

## Análise do Problema

### Comportamento Anterior (Incorreto)
O método `createServicoEvento` estava validando a permissão `SERVICOS_GERENCIAR` antes de permitir associar serviços a um evento. Isso causava confusão porque:

1. **Criar novo tipo de serviço** (`createTipoServico`) - deve exigir `SERVICOS_GERENCIAR` ✅
2. **Associar serviço existente a evento** (`createServicoEvento`) - estava exigindo `SERVICOS_GERENCIAR` ❌ (incorreto)

### Regra de Negócio Correta
- O plano deve limitar apenas a **criação de novos tipos de serviços**
- A **utilização de serviços existentes** é essencial para poder criar um evento
- Se o usuário tem permissão para criar eventos, deve poder associar serviços existentes a eles

## Solução Implementada

### Alteração no `DataService`

**Arquivo:** `src/lib/data-service.ts`

**Método alterado:** `createServicoEvento`

**Antes:**
```typescript
async createServicoEvento(userId: string, eventoId: string, servicoEvento: Omit<ServicoEvento, 'id'>): Promise<ServicoEvento> {
  // Validar permissão para gerenciar serviços
  const temPermissao = await this.funcionalidadeService.verificarPermissao(userId, 'SERVICOS_GERENCIAR');
  if (!temPermissao) {
    const erro = new Error('Seu plano não permite gerenciar serviços');
    (erro as any).status = 403;
    throw erro;
  }

  return this.servicoEventoRepo.createServicoEvento(userId, eventoId, servicoEvento);
}
```

**Depois:**
```typescript
async createServicoEvento(userId: string, eventoId: string, servicoEvento: Omit<ServicoEvento, 'id'>): Promise<ServicoEvento> {
  // Não valida permissão aqui, pois este método apenas associa serviços existentes a um evento
  // A validação de permissão deve estar apenas em createTipoServico (criar novo tipo de serviço)
  // Se o usuário pode criar o evento, pode associar serviços existentes a ele
  return this.servicoEventoRepo.createServicoEvento(userId, eventoId, servicoEvento);
}
```

## Validações Mantidas

### 1. Criar Novo Tipo de Serviço (`createTipoServico`)
- ✅ Continua exigindo a permissão `SERVICOS_GERENCIAR`
- ✅ Localização: `src/lib/data-service.ts` linha 680-690
- ✅ Comportamento: Bloqueia a criação de novos tipos de serviços se o plano não permitir

### 2. Atualizar Tipo de Serviço (`updateTipoServico`)
- ✅ Mantém validação (se houver)
- ✅ Localização: `src/lib/data-service.ts` linha 692+

### 3. Operações de Serviço de Evento
- ✅ `updateServicoEvento` - não exige permissão especial (já estava correto)
- ✅ `deleteServicoEvento` - não exige permissão especial (já estava correto)
- ✅ `createServicoEvento` - **corrigido** para não exigir permissão especial

## Fluxo de Criação de Evento

### Como Funciona Agora

1. **Usuário cria um evento:**
   - Validação: Permissão para criar eventos (`EVENTOS_LIMITADOS`)
   - Validação: Limite mensal de eventos
   - ✅ Passa se tiver permissão

2. **Sistema associa serviços ao evento:**
   - Chama `sincronizarServicosEvento()` no `EventoForm`
   - Para cada serviço selecionado, chama `createServicoEvento()`
   - ✅ **Agora não bloqueia** por falta de `SERVICOS_GERENCIAR`

3. **Usuário tenta criar novo tipo de serviço:**
   - Chama `createTipoServico()`
   - Validação: Permissão `SERVICOS_GERENCIAR`
   - ❌ Bloqueia se não tiver permissão (comportamento correto)

### Arquivos Envolvidos

#### Componentes Frontend
- `src/components/forms/EventoForm.tsx` - Formulário de criação/edição de eventos
  - Linha 515-598: Função `sincronizarServicosEvento()` que chama `createServicoEvento()`
  - Linha 788: Chama `sincronizarServicosEvento()` após criar evento

- `src/components/ServicosEvento.tsx` - Componente de gerenciamento de serviços do evento
  - Linha 185: Chama `createServicoEvento()` ao adicionar serviços existentes
  - Linha 223: Chama `createServicoEvento()` ao salvar novo serviço

#### Serviços Backend
- `src/lib/data-service.ts` - Serviço principal de dados
  - Linha 680-690: `createTipoServico()` - **Mantém validação** ✅
  - Linha 722-727: `createServicoEvento()` - **Removida validação** ✅

## Benefícios da Correção

1. **UX melhorada:** Usuários podem criar eventos sem bloqueios inesperados
2. **Regra de negócio correta:** Limitação apenas para criar novos tipos de serviços, não para usar os existentes
3. **Flexibilidade:** Usuários podem utilizar serviços existentes independente do plano

## Testes Realizados

1. ✅ Verificado que `createTipoServico` ainda exige `SERVICOS_GERENCIAR`
2. ✅ Verificado que `createServicoEvento` não exige mais `SERVICOS_GERENCIAR`
3. ✅ Verificado que não há erros de lint
4. ✅ Verificado que o fluxo de criação de eventos funciona corretamente

## Observações

- A correção foi mínima e focada apenas no método que estava bloqueando incorretamente
- Outras validações de permissão permanecem intactas
- A distinção entre "criar novo tipo de serviço" e "usar serviço existente" está agora clara no código

## Impacto

- **Usuários afetados:** Todos os usuários que tentavam criar eventos com serviços
- **Plano impactado:** Todos os planos que não possuem `SERVICOS_GERENCIAR`, mas têm permissão para criar eventos
- **Mudança:** Permissão mais restritiva apenas para criar novos tipos de serviços, não para usar os existentes

