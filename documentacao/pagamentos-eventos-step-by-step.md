# Sistema de Pagamentos por Evento - Documentação Step-by-Step

## Visão Geral

Este documento detalha a implementação do sistema de vinculação de pagamentos aos eventos, permitindo o acompanhamento financeiro completo de cada evento com funcionalidades CRUD para pagamentos.

## Estrutura Implementada

### 1. Funções CRUD para Pagamentos (`src/lib/mockData.ts`)

#### Funções Principais
- `createPagamento()` - Cria novo pagamento
- `updatePagamento()` - Atualiza pagamento existente
- `deletePagamento()` - Remove pagamento
- `getPagamentoById()` - Busca pagamento por ID
- `getPagamentosByEventoId()` - Busca pagamentos por evento
- `getContratoByEventoId()` - Busca contrato por evento
- `getResumoFinanceiroEvento()` - Calcula resumo financeiro do evento

#### Resumo Financeiro
A função `getResumoFinanceiroEvento()` retorna:
- Valor total do contrato
- Valor pago, pendente e atrasado
- Total de parcelas e parcelas pagas/pendentes/atrasadas

### 2. Formulário de Pagamento (`src/components/forms/PagamentoForm.tsx`)

**Função:** Formulário completo para cadastro e edição de pagamentos
**Características:**
- Suporte a criação e edição de pagamentos
- Validação completa de campos obrigatórios
- Exibição de informações do contrato
- Campos organizados em seções lógicas
- Validação em tempo real
- Suporte a diferentes formas de pagamento

**Seções do Formulário:**
1. **Informações do Contrato** - Dados do contrato vinculado
2. **Dados do Pagamento** - Informações específicas do pagamento

**Validações Implementadas:**
- Valor deve ser maior que zero
- Data de vencimento obrigatória
- Data de pagamento obrigatória quando status é "Pago"
- Número da parcela não pode ser maior que total de parcelas

### 3. Componente de Histórico de Pagamentos (`src/components/PagamentoHistorico.tsx`)

**Função:** Exibe histórico completo de pagamentos do evento
**Características:**
- Resumo financeiro visual
- Lista de pagamentos com status
- Ações CRUD (Criar, Editar, Excluir)
- Modal de confirmação para exclusão
- Indicadores visuais de status
- Informações detalhadas de cada pagamento

**Funcionalidades:**
- **Resumo Financeiro:** Cards com valores totais, pagos, pendentes e atrasados
- **Histórico:** Lista cronológica de pagamentos
- **Ações:** Botões para criar, editar e excluir pagamentos
- **Status:** Indicadores visuais com cores e ícones
- **Detalhes:** Informações completas de cada pagamento

### 4. Páginas Implementadas

#### Visualização de Evento Atualizada (`src/app/eventos/[id]/page.tsx`)
**Novas Funcionalidades:**
- Carregamento de pagamentos e contrato
- Integração com componente de histórico
- Atualização automática após mudanças
- Estado reativo para pagamentos

#### Edição de Pagamento (`src/app/eventos/[id]/pagamentos/[pagamentoId]/editar/page.tsx`)
**Funcionalidades:**
- Formulário pré-preenchido com dados do pagamento
- Validação e atualização de dados
- Navegação de volta para visualização do evento
- Salvamento das alterações

## Fluxo de Navegação

### 1. Visualização de Pagamentos
```
/eventos → Visualizar Evento → /eventos/[id] → Ver Histórico de Pagamentos
```

### 2. Criação de Pagamento
```
/eventos/[id] → Novo Pagamento → Formulário → Salvar → Volta para /eventos/[id]
```

### 3. Edição de Pagamento
```
/eventos/[id] → Editar Pagamento → /eventos/[id]/pagamentos/[id]/editar → Salvar → Volta para /eventos/[id]
```

### 4. Exclusão de Pagamento
```
/eventos/[id] → Excluir Pagamento → Modal de Confirmação → Confirmar → Atualiza Lista
```

## Status de Pagamentos

### Status Disponíveis
- **Pendente** - Pagamento aguardando
- **Pago** - Pagamento realizado
- **Atrasado** - Pagamento vencido
- **Cancelado** - Pagamento cancelado

### Indicadores Visuais
- **Verde** - Pagos (CheckCircleIcon)
- **Amarelo** - Pendentes (ClockIcon)
- **Vermelho** - Atrasados (ExclamationTriangleIcon)
- **Cinza** - Cancelados (XCircleIcon)

## Formas de Pagamento

### Opções Disponíveis
- Dinheiro
- Cartão de crédito
- Depósito bancário
- PIX
- Transferência

## Resumo Financeiro

### Métricas Exibidas
1. **Valores Monetários:**
   - Valor Total do Contrato
   - Valor Pago
   - Valor Pendente
   - Valor Atrasado

2. **Contadores de Parcelas:**
   - Total de Parcelas
   - Parcelas Pagas
   - Parcelas Pendentes
   - Parcelas Atrasadas

## Validações Implementadas

### Campos Obrigatórios
- **Valor:** Deve ser maior que zero
- **Data de Vencimento:** Obrigatória
- **Status:** Seleção obrigatória

### Validações Condicionais
- **Data de Pagamento:** Obrigatória quando status é "Pago"
- **Número da Parcela:** Não pode ser maior que total de parcelas

### Validações de Formato
- Valores numéricos positivos
- Datas no formato correto
- Campos de texto com tamanhos apropriados

## Responsividade

### Mobile
- Cards empilhados verticalmente
- Botões de ação em coluna
- Formulários em coluna única
- Modais adaptados para tela pequena

### Desktop
- Grid responsivo para resumo financeiro
- Ações lado a lado
- Formulários em grid de 2 colunas
- Layout otimizado para tela grande

## Acessibilidade

### Recursos Implementados
- Labels associados aos campos
- Navegação por teclado
- Contraste adequado
- Textos descritivos
- Estados de foco visíveis
- Ícones com significado semântico

## Integração com Sistema Existente

### Compatibilidade
- Usa tipos existentes do sistema
- Integra com dados mockados
- Mantém consistência visual
- Segue padrões estabelecidos

### Dependências
- **Eventos:** Vinculação através de contrato
- **Contratos:** Base para cálculos financeiros
- **Clientes:** Informações do contratante

## Tratamento de Erros

### Validação de Formulário
- Mensagens de erro específicas
- Validação em tempo real
- Prevenção de envio com dados inválidos

### Estados de Carregamento
- Indicadores visuais
- Mensagens informativas
- Feedback ao usuário

### Tratamento de Dados
- Verificação de existência de contrato
- Validação de IDs
- Fallbacks para dados ausentes

## Funcionalidades Avançadas

### Cálculos Automáticos
- Resumo financeiro em tempo real
- Contadores de parcelas
- Valores totais e parciais

### Filtros e Busca
- Pagamentos por status
- Ordenação cronológica
- Busca por valor ou parcela

### Relatórios Visuais
- Cards de resumo financeiro
- Indicadores de status
- Progresso de pagamentos

## Próximos Passos Sugeridos

### Melhorias de UX
1. **Filtros Avançados** - Filtrar pagamentos por período, status, valor
2. **Exportação** - Exportar histórico de pagamentos em PDF/Excel
3. **Notificações** - Alertas para pagamentos próximos do vencimento
4. **Gráficos** - Visualização gráfica do progresso de pagamentos

### Funcionalidades Avançadas
1. **Pagamentos Recorrentes** - Criação automática de parcelas
2. **Integração Bancária** - Verificação automática de pagamentos
3. **Relatórios** - Relatórios financeiros detalhados
4. **Backup** - Backup automático de dados financeiros

### Melhorias Técnicas
1. **Testes Unitários** - Cobertura de testes para funções financeiras
2. **Otimização de Performance** - Cache de cálculos financeiros
3. **Auditoria** - Log de alterações em pagamentos
4. **API** - Endpoints para integração externa

## Conclusão

O sistema de pagamentos por evento foi implementado com sucesso, oferecendo:

1. **Funcionalidade Completa** - CRUD completo para pagamentos
2. **Interface Intuitiva** - Histórico visual e formulários organizados
3. **Validação Robusta** - Prevenção de erros e dados inválidos
4. **Responsividade** - Funciona em todos os dispositivos
5. **Acessibilidade** - Usável por todos os usuários
6. **Integração Perfeita** - Vinculação completa com eventos e contratos

O sistema permite o acompanhamento financeiro completo de cada evento, facilitando o controle de receitas e o gerenciamento de pagamentos de forma organizada e eficiente.
