# Sistema Click-se - Documentação Step-by-Step

## Visão Geral do Projeto

Este documento detalha o desenvolvimento do sistema de controle financeiro e gerenciamento de eventos para a Click-se, baseado na análise das planilhas existentes e formulários de contratação.

## Análise Inicial das Planilhas

### 1. CLICK-SE ENTRADAS (2023)
**Função:** Controle financeiro de serviços contratados
**Dados principais:**
- Nome do cliente
- Data do evento
- Serviço contratado
- Valor total do serviço
- Pagamentos mensais (jan-dez/2023)
- Valor restante
- Formas de pagamento

**Regras de negócio identificadas:**
- Pagamentos podem ser à vista ou parcelados
- Controle mensal de recebimentos
- Cálculo automático de valores restantes
- Diferentes tipos de serviços e pacotes

### 2. CLICK-SE PROMOTORES
**Função:** Gestão de eventos e profissionais
**Dados principais:**
- Informações do evento (data, local, horários)
- Dados do contratante
- Profissionais atribuídos (promoters)
- Custos por profissional
- Insumos utilizados
- Custo total do evento

**Regras de negócio identificadas:**
- Atribuição de profissionais por especialidade
- Controle de custos por evento
- Gestão de logística (montagem, desmontagem)
- Controle de insumos

### 3. Formulário de Contratação (Google Forms)
**Função:** Captura de dados do cliente
**Dados coletados:**
- Dados pessoais (nome, CPF, endereço, telefone)
- Informações do evento (data, local, tipo)
- Serviços desejados
- Forma de pagamento
- Observações especiais

## Estrutura do Sistema Desenvolvido

### Tecnologias Utilizadas
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Heroicons** - Ícones
- **date-fns** - Manipulação de datas
- **Dados mockados** - Para MVP

### Arquitetura de Pastas

```
src/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Página principal
│   ├── eventos/           # Gestão de eventos
│   ├── pagamentos/        # Controle financeiro
│   ├── relatorios/        # Relatórios e análises
│   └── login/             # Autenticação
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (Button, Input, Card)
│   └── Layout.tsx        # Layout principal
├── lib/                  # Utilitários e dados
│   ├── auth.ts          # Sistema de autenticação mockado
│   └── mockData.ts      # Dados de exemplo
└── types/               # Definições TypeScript
    └── index.ts         # Interfaces e tipos
```

## Funcionalidades Implementadas

### 1. Sistema de Autenticação
**Arquivo:** `src/lib/auth.ts`
**Funcionalidades:**
- Login mockado com usuários pré-definidos
- Persistência de sessão no localStorage
- Controle de permissões (admin/user)
- Hook useAuth para componentes React

**Usuários de teste:**
- Admin: admin@clickse.com / qualquer senha
- Usuário: user@clickse.com / qualquer senha

### 2. Dashboard Principal
**Arquivo:** `src/app/dashboard/page.tsx`
**Funcionalidades:**
- Visão geral do negócio
- Estatísticas em tempo real
- Eventos do dia
- Pagamentos pendentes/atrasados
- Próximos eventos
- Resumo financeiro

### 3. Gestão de Eventos
**Arquivo:** `src/app/eventos/page.tsx`
**Funcionalidades:**
- Listagem de todos os eventos
- Filtros por status e tipo
- Busca por cliente ou local
- Visualização em cards
- Ações (visualizar, editar)

### 4. Controle Financeiro
**Arquivo:** `src/app/pagamentos/page.tsx`
**Funcionalidades:**
- Lista de todos os pagamentos
- Filtros por status e forma de pagamento
- Resumo financeiro (pago, pendente, atrasado)
- Controle de parcelas
- Ações de gerenciamento

### 5. Relatórios e Análises
**Arquivo:** `src/app/relatorios/page.tsx`
**Funcionalidades:**
- Seleção de período personalizado
- Gráficos de receita mensal
- Distribuição por tipo de evento
- Status dos pagamentos
- Exportação de relatórios (preparado)

## Modelos de Dados

### Entidades Principais

1. **Cliente**
   - Dados pessoais completos
   - Informações de contato
   - Como conheceu o serviço

2. **Evento**
   - Dados do evento (data, local, horários)
   - Informações do contratante
   - Status do evento
   - Observações

3. **Serviço/Pacote**
   - Catálogo de serviços
   - Pacotes predefinidos
   - Preços e durações

4. **Contrato**
   - Vinculação evento-serviço
   - Valores e formas de pagamento
   - Parcelamento

5. **Pagamento**
   - Controle de parcelas
   - Status de pagamento
   - Datas de vencimento

6. **Promoter**
   - Profissionais disponíveis
   - Especialidades
   - Custos por hora

## Componentes de UI

### Componentes Base
- **Button** - Botões com variantes e estados
- **Input** - Campos de entrada com validação
- **Card** - Containers para conteúdo
- **Layout** - Layout principal com sidebar

### Características dos Componentes
- Responsivos
- Acessíveis
- Reutilizáveis
- Tipados com TypeScript

## Dados Mockados

### Estrutura dos Dados
**Arquivo:** `src/lib/mockData.ts`
- Baseado nas planilhas reais analisadas
- Dados realistas para demonstração
- Funções utilitárias para cálculos
- Filtros e buscas

### Dados Incluídos
- 3 clientes de exemplo
- 6 tipos de serviços
- 4 pacotes predefinidos
- 5 promoters
- 2 eventos de exemplo
- 6 pagamentos de exemplo

## Funcionalidades de Cálculo

### Financeiro
- Cálculo de receita mensal/anual
- Valor total pendente
- Controle de parcelas
- Status de pagamentos

### Eventos
- Eventos do dia
- Próximos eventos
- Filtros por período
- Estatísticas por tipo

## Responsividade

O sistema foi desenvolvido com foco em responsividade:
- Mobile-first approach
- Sidebar colapsível em mobile
- Grids adaptativos
- Componentes flexíveis

## Próximos Passos (Futuras Implementações)

### 1. Banco de Dados Real
- Substituir dados mockados
- Implementar CRUD completo
- Migração de dados das planilhas

### 2. Autenticação Real
- Integração com provedor de autenticação
- Controle de permissões granular
- Recuperação de senha

### 3. Funcionalidades Avançadas
- Notificações em tempo real
- Integração com APIs de pagamento
- Relatórios em PDF/Excel
- Backup automático

### 4. Melhorias de UX
- Formulários de cadastro
- Edição inline
- Drag & drop
- Atalhos de teclado

## Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
cd click-se-sistema
npm install
npm run dev
```

### Acesso
- URL: http://localhost:3000
- Redirecionamento automático para login
- Credenciais de teste fornecidas na tela de login

## Conclusão

O sistema desenvolvido atende às necessidades identificadas na análise das planilhas, oferecendo:

1. **Centralização** - Todos os dados em um só lugar
2. **Automação** - Cálculos automáticos e relatórios
3. **Usabilidade** - Interface intuitiva e responsiva
4. **Escalabilidade** - Arquitetura preparada para crescimento
5. **Manutenibilidade** - Código organizado e documentado

O MVP está pronto para demonstração e pode ser facilmente expandido conforme as necessidades do negócio evoluem.
