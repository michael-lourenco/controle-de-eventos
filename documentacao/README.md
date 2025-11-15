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
- **Firebase Firestore** - Banco de dados em tempo real
- **NextAuth.js** - Autenticação
- **Firebase Auth** - Autenticação de usuários

## 📋 Pré-requisitos

### Mínimo Necessário
- Node.js 18 ou superior
- npm ou yarn

### Para Usar Firebase (Opcional)
- Conta no Firebase
- Projeto Firebase configurado

## 🚀 Como Executar

### ⚡ Setup Rápido (Recomendado para Primeira Execução)

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd click-se-sistema
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure rapidamente**
   - Crie um arquivo `.env.local` com:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=desenvolvimento_secret_key_123
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse o sistema**
   ```
   http://localhost:3000
   ```

### 🔥 Setup Completo (Com Firebase)

Para usar com persistência de dados no Firestore:

1. Siga os passos do setup rápido acima
2. Configure o Firebase seguindo `CONFIGURACAO.md`
3. Acesse: `http://localhost:3000/admin/collections`
4. Clique em "Migração Completa" para migrar os dados

📋 **Veja `SETUP-RAPIDO.md` para instruções detalhadas**

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
│   ├── firebase.ts      # Configuração Firebase
│   ├── auth-config.ts   # Configuração NextAuth
│   ├── data-service.ts  # Serviço de dados
│   ├── auth.ts          # Autenticação
│   ├── mockData.ts      # Dados de exemplo
│   ├── repositories/    # Repositories para Firestore
│   ├── firestore/       # Configuração Firestore
│   └── migration/       # Serviços de migração
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

## 🔄 Migração para Firebase Firestore

### ✅ Concluído
- **Configuração do Firebase**: SDK configurado e funcionando
- **NextAuth**: Autenticação real implementada
- **Repositories**: Arquitetura independente de banco de dados
- **Collections**: Estrutura completa com prefixo `controle_`
- **Migração de Dados**: Dados mockados migrados para Firestore
- **Hooks Personalizados**: Integração com repositories

### 📊 Collections do Firestore
- `controle_users` - Usuários do sistema
- `controle_clientes` - Dados dos clientes
- `controle_eventos` - Eventos cadastrados
- `controle_pagamentos` - Histórico de pagamentos
- `controle_tipo_custos` - Tipos de custos
- `controle_custos` - Custos por evento
- E mais collections de apoio...

### 🛠️ Arquitetura
- **Repository Pattern**: Independência de banco de dados
- **Factory Pattern**: Centralização de repositories
- **Data Service**: Camada de abstração para dados
- **Custom Hooks**: Integração com React

## 🔮 Próximos Passos

### Fase 2 - Funcionalidades Avançadas
- Sistema de notificações em tempo real
- Upload de arquivos para Firebase Storage
- Relatórios em PDF/Excel

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

### Documentação Principal
- `documentacao/step-by-step.md` - Desenvolvimento completo do sistema
- `documentacao/migracao-firebase-step-by-step.md` - Migração para Firebase
- `CONFIGURACAO.md` - Guia de configuração do ambiente

### Documentação Técnica
- `documentacao/custos-anexos-eventos-step-by-step.md` - Sistema de custos
- `documentacao/sistema-pagamentos-automaticos-step-by-step.md` - Pagamentos
- `documentacao/simplificacao-tipo-custo-step-by-step.md` - Tipos de custo

## 🤝 Contribuição

Este é um projeto MVP desenvolvido para demonstração. Para contribuições ou sugestões, entre em contato.

## 📄 Licença

Este projeto é privado e destinado ao uso da Click-se.

---

**Desenvolvido com ❤️ para a Click-se**# controle-de-eventos
