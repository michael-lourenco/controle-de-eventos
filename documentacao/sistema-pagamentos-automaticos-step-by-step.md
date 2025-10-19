# Sistema de Pagamentos Automáticos - Documentação Step-by-Step

## Visão Geral

Este documento detalha a implementação do sistema de pagamentos automáticos para eventos, onde o status dos pagamentos é determinado automaticamente baseado na data do pagamento em relação ao dia final de pagamento definido para cada evento.

## Regras de Negócio Implementadas

### 1. **Valor Total e Dia Final de Pagamento**
- Cada evento possui um **valor total** a ser pago
- Cada evento possui um **dia final de pagamento** para pagamento completo
- O cliente pode fazer pagamentos parciais até o dia final

### 2. **Status Automático dos Pagamentos**
- **Pago**: Pagamento realizado até o dia final de pagamento
- **Atrasado**: Pagamento realizado após o dia final de pagamento
- O status é calculado automaticamente baseado na data do pagamento

### 3. **Cálculo de Valores**
- **Valor Total**: Valor total definido para o evento
- **Valor Pago**: Soma dos pagamentos com status "Pago"
- **Valor Atrasado**: Soma dos pagamentos com status "Atrasado"
- **Valor Pendente**: Valor total - (Valor Pago + Valor Atrasado)

## Estrutura de Dados Atualizada

### 1. Interface Evento
```typescript
export interface Evento {
  // ... campos existentes
  valorTotal: number; // Valor total a ser pago pelo evento
  diaFinalPagamento: Date; // Dia final para pagamento completo
}
```

### 2. Interface Pagamento Simplificada
```typescript
export interface Pagamento {
  id: string;
  eventoId: string;
  evento: Evento;
  valor: number;
  dataPagamento: Date;
  formaPagamento: 'Dinheiro' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX' | 'Transferência';
  status: 'Pago' | 'Atrasado'; // Status automático
  observacoes?: string;
  comprovante?: string;
  dataCadastro: Date;
  dataAtualizacao: Date;
}
```

## Implementação Técnica

### 1. Função de Cálculo de Status
```typescript
export const calcularStatusPagamento = (dataPagamento: Date, diaFinalPagamento: Date): 'Pago' | 'Atrasado' => {
  return dataPagamento <= diaFinalPagamento ? 'Pago' : 'Atrasado';
};
```

### 2. Função de Resumo Financeiro
```typescript
export const getResumoFinanceiroEvento = (eventoId: string) => {
  const evento = getEventoById(eventoId);
  const pagamentosEvento = getPagamentosByEventoId(eventoId);
  
  const valorPago = pagamentosEvento
    .filter(p => p.status === 'Pago')
    .reduce((total, p) => total + p.valor, 0);

  const valorAtrasado = pagamentosEvento
    .filter(p => p.status === 'Atrasado')
    .reduce((total, p) => total + p.valor, 0);

  const valorPendente = evento.valorTotal - valorPago - valorAtrasado;

  return {
    valorTotal: evento.valorTotal,
    valorPago,
    valorPendente: Math.max(0, valorPendente),
    valorAtrasado,
    diaFinalPagamento: evento.diaFinalPagamento
  };
};
```

### 3. Criação de Pagamentos com Status Automático
```typescript
export const createPagamento = (pagamentoData: Omit<Pagamento, 'id' | 'status' | 'dataCadastro' | 'dataAtualizacao'>): Pagamento => {
  const evento = getEventoById(pagamentoData.eventoId);
  const status = calcularStatusPagamento(pagamentoData.dataPagamento, evento.diaFinalPagamento);
  
  const novoPagamento: Pagamento = {
    ...pagamentoData,
    status,
    // ... outros campos
  };
  
  return novoPagamento;
};
```

## Componentes Atualizados

### 1. **EventoForm** (`src/components/forms/EventoForm.tsx`)
**Novos Campos Adicionados:**
- **Valor Total**: Campo obrigatório para definir o valor total do evento
- **Dia Final de Pagamento**: Campo obrigatório para definir a data limite

**Validações:**
- Valor total deve ser maior que zero
- Dia final de pagamento é obrigatório

### 2. **PagamentoForm** (`src/components/forms/PagamentoForm.tsx`)
**Estrutura Simplificada:**
- Removidos campos de vencimento e parcelas
- Foco apenas em: valor, data de pagamento, forma de pagamento
- Status calculado automaticamente
- Informações do evento exibidas para contexto

**Funcionalidades:**
- Seleção de data de pagamento
- Escolha da forma de pagamento
- Campo para observações
- Campo para comprovante

### 3. **PagamentoHistorico** (`src/components/PagamentoHistorico.tsx`)
**Resumo Financeiro Visual:**
- **Valor Total**: Valor definido para o evento
- **Valor Pago**: Pagamentos realizados em dia
- **Valor Pendente**: Valor ainda não pago
- **Valor Atrasado**: Pagamentos realizados após o prazo
- **Dia Final de Pagamento**: Data limite exibida

**Histórico de Pagamentos:**
- Lista de todos os pagamentos
- Status visual com cores (Verde: Pago, Vermelho: Atrasado)
- Informações detalhadas de cada pagamento
- Ações de editar e excluir

## Exemplo Prático

### Cenário: Evento de R$ 2.500,00 com prazo até 15/01/2023

#### Pagamentos Realizados:
1. **R$ 500,00** em 05/01/2023 → Status: **Pago** ✅
2. **R$ 800,00** em 10/01/2023 → Status: **Pago** ✅
3. **R$ 700,00** em 20/01/2023 → Status: **Atrasado** ⚠️

#### Resumo Financeiro:
- **Valor Total**: R$ 2.500,00
- **Valor Pago**: R$ 1.300,00 (500 + 800)
- **Valor Atrasado**: R$ 700,00
- **Valor Pendente**: R$ 500,00 (2500 - 1300 - 700)

## Fluxo de Uso

### 1. **Criação do Evento**
```
1. Preencher dados básicos do evento
2. Definir valor total do evento
3. Definir dia final de pagamento
4. Salvar evento
```

### 2. **Registro de Pagamentos**
```
1. Acessar evento → Seção Pagamentos
2. Clicar em "Novo Pagamento"
3. Preencher valor e data do pagamento
4. Selecionar forma de pagamento
5. Salvar (status calculado automaticamente)
```

### 3. **Acompanhamento Financeiro**
```
1. Visualizar resumo financeiro
2. Verificar status de cada pagamento
3. Identificar pagamentos em atraso
4. Calcular valor pendente
```

## Vantagens do Sistema

### 1. **Automação**
- Status calculado automaticamente
- Redução de erros manuais
- Consistência nos dados

### 2. **Flexibilidade**
- Pagamentos parciais permitidos
- Múltiplas formas de pagamento
- Ajuste de datas quando necessário

### 3. **Controle Financeiro**
- Visão clara do status de pagamentos
- Identificação rápida de atrasos
- Cálculo automático de valores pendentes

### 4. **Transparência**
- Histórico completo de pagamentos
- Status visual claro
- Informações detalhadas de cada transação

## Validações Implementadas

### 1. **Formulário de Evento**
- Valor total obrigatório e maior que zero
- Dia final de pagamento obrigatório
- Data deve ser válida

### 2. **Formulário de Pagamento**
- Valor obrigatório e maior que zero
- Data de pagamento obrigatória
- Forma de pagamento obrigatória

### 3. **Lógica de Negócio**
- Status calculado baseado na data
- Valores sempre positivos
- Consistência entre pagamentos e evento

## Interface do Usuário

### 1. **Resumo Visual**
- Cards coloridos para cada tipo de valor
- Indicadores visuais de status
- Data limite destacada

### 2. **Lista de Pagamentos**
- Status com cores distintivas
- Informações organizadas
- Ações claras (editar/excluir)

### 3. **Formulários**
- Campos organizados logicamente
- Validação em tempo real
- Mensagens de erro claras

## Dados Mockados Atualizados

### 1. **Eventos de Exemplo**
```typescript
// Evento 1: R$ 2.500,00 - Prazo até 15/01/2023
{
  valorTotal: 2500,
  diaFinalPagamento: new Date('2023-01-15')
}

// Evento 2: R$ 1.800,00 - Prazo até 15/01/2023
{
  valorTotal: 1800,
  diaFinalPagamento: new Date('2023-01-15')
}
```

### 2. **Pagamentos de Exemplo**
```typescript
// Pagamentos em dia (Status: Pago)
{ valor: 500, dataPagamento: '2023-01-05', status: 'Pago' }
{ valor: 800, dataPagamento: '2023-01-10', status: 'Pago' }

// Pagamentos em atraso (Status: Atrasado)
{ valor: 700, dataPagamento: '2023-01-20', status: 'Atrasado' }
```

## Responsividade e Acessibilidade

### 1. **Mobile**
- Cards empilhados verticalmente
- Formulários em coluna única
- Botões de ação adaptados

### 2. **Desktop**
- Grid responsivo para resumo
- Formulários em múltiplas colunas
- Layout otimizado

### 3. **Acessibilidade**
- Labels associados aos campos
- Contraste adequado
- Navegação por teclado
- Indicadores visuais claros

## Próximos Passos Sugeridos

### 1. **Funcionalidades Avançadas**
- Relatórios de inadimplência
- Notificações de vencimento
- Integração com sistemas de cobrança
- Histórico de alterações

### 2. **Melhorias de UX**
- Filtros por status de pagamento
- Exportação de relatórios
- Dashboard financeiro
- Gráficos de evolução

### 3. **Integrações**
- Sistema de pagamento online
- Integração bancária
- Notificações por email/SMS
- Backup automático

## Conclusão

O sistema de pagamentos automáticos foi implementado com sucesso, oferecendo:

1. **Controle Automático**: Status calculado automaticamente baseado nas datas
2. **Flexibilidade**: Pagamentos parciais e múltiplas formas de pagamento
3. **Transparência**: Visão clara do status financeiro de cada evento
4. **Simplicidade**: Interface intuitiva e fácil de usar
5. **Confiabilidade**: Validações robustas e consistência nos dados

O sistema permite o acompanhamento preciso dos pagamentos, facilitando o controle financeiro e a identificação de situações de atraso, contribuindo para uma gestão mais eficiente dos eventos.

