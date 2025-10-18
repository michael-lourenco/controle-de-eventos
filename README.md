# Sistema Click-se - Controle de Pagamentos e Eventos

Sistema web desenvolvido para gerenciar eventos e controle financeiro da Click-se, baseado na análise das planilhas existentes e formulários de contratação.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Principal** - Visão geral do negócio com estatísticas em tempo real
- **Gestão de Eventos** - Cadastro, visualização e controle de eventos
- **Controle Financeiro** - Acompanhamento de pagamentos e receitas
- **Relatórios** - Análises financeiras e estatísticas do negócio
- **Autenticação** - Sistema de login mockado para MVP
- **Interface Responsiva** - Funciona em desktop e mobile

### 🔄 Em Desenvolvimento
- Sistema de notificações e alertas
- Deploy na Vercel

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Heroicons** - Ícones
- **date-fns** - Manipulação de datas
- **Dados mockados** - Para demonstração (MVP)

## 📋 Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

## 🚀 Como Executar

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd click-se-sistema
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:3000
   ```

## 🔐 Credenciais de Teste

### Administrador
- **Email:** admin@clickse.com
- **Senha:** qualquer senha (mínimo 3 caracteres)

### Usuário
- **Email:** user@clickse.com
- **Senha:** qualquer senha (mínimo 3 caracteres)

## 📊 Estrutura do Projeto

```
src/
├── app/                    # Páginas do Next.js
│   ├── dashboard/         # Dashboard principal
│   ├── eventos/           # Gestão de eventos
│   ├── pagamentos/        # Controle financeiro
│   ├── relatorios/        # Relatórios e análises
│   └── login/             # Página de login
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base
│   └── Layout.tsx        # Layout principal
├── lib/                  # Utilitários e dados
│   ├── auth.ts          # Autenticação mockada
│   └── mockData.ts      # Dados de exemplo
└── types/               # Definições TypeScript
    └── index.ts         # Interfaces e tipos
```

## 📈 Funcionalidades Detalhadas

### Dashboard
- Estatísticas em tempo real
- Eventos do dia
- Pagamentos pendentes/atrasados
- Próximos eventos
- Resumo financeiro

### Eventos
- Listagem com filtros
- Busca por cliente ou local
- Filtros por status e tipo
- Visualização em cards
- Ações de gerenciamento

### Pagamentos
- Controle de parcelas
- Filtros por status e forma de pagamento
- Resumo financeiro
- Status de pagamentos
- Ações de gerenciamento

### Relatórios
- Seleção de período personalizado
- Gráficos de receita mensal
- Distribuição por tipo de evento
- Status dos pagamentos
- Exportação (preparado)

## 🎯 Baseado nas Planilhas Analisadas

O sistema foi desenvolvido baseado na análise das seguintes planilhas:

1. **CLICK-SE ENTRADAS** - Controle financeiro de serviços
2. **CLICK-SE PROMOTORES** - Gestão de eventos e profissionais
3. **Formulário de Contratação** - Captura de dados do cliente

## 🔮 Próximos Passos

### Fase 2 - Banco de Dados Real
- Substituir dados mockados
- Implementar CRUD completo
- Migração de dados das planilhas

### Fase 3 - Funcionalidades Avançadas
- Notificações em tempo real
- Integração com APIs de pagamento
- Relatórios em PDF/Excel
- Backup automático

### Fase 4 - Melhorias de UX
- Formulários de cadastro
- Edição inline
- Drag & drop
- Atalhos de teclado

## 📝 Documentação

Consulte o arquivo `documentacao/step-by-step.md` para detalhes completos do desenvolvimento.

## 🤝 Contribuição

Este é um projeto MVP desenvolvido para demonstração. Para contribuições ou sugestões, entre em contato.

## 📄 Licença

Este projeto é privado e destinado ao uso da Click-se.

---

**Desenvolvido com ❤️ para a Click-se**# controle-de-eventos
