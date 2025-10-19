# Migração para Firebase Firestore - Documentação Step-by-Step

## Visão Geral

Este documento detalha a migração completa do sistema Click-se da versão mockada para o Firebase Firestore, implementando autenticação real com NextAuth e criando uma arquitetura de repositories para independência de banco de dados.

## Fases da Migração

### ✅ FASE 1: Configuração e Dependências

#### 1.1 Instalação de Dependências
```bash
npm install firebase next-auth @next-auth/firebase-adapter
```

**Arquivos criados:**
- `src/lib/firebase.ts` - Configuração do Firebase
- `src/lib/auth-config.ts` - Configuração do NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - API routes do NextAuth
- `src/types/next-auth.d.ts` - Tipos do NextAuth

#### 1.2 Configuração do Firebase
- Configuração do Firebase SDK
- Inicialização do Firestore e Auth
- Variáveis de ambiente configuradas

#### 1.3 Configuração do NextAuth
- Providers: Google e Credentials
- Adapter: FirestoreAdapter
- Callbacks para JWT e Session
- Páginas personalizadas de login

### ✅ FASE 2: Arquitetura de Repositories

#### 2.1 Interfaces Base
**Arquivo:** `src/lib/repositories/base-repository.ts`
- Interface `BaseRepository<T>` com operações CRUD
- Interface `QueryOptions` para consultas avançadas
- Interface `RepositoryResult<T>` para resultados padronizados

#### 2.2 Repository Base para Firestore
**Arquivo:** `src/lib/repositories/firestore-repository.ts`
- Classe `FirestoreRepository<T>` implementando `BaseRepository`
- Conversão automática de Timestamps para Date
- Métodos para CRUD completo
- Suporte a consultas com filtros

#### 2.3 Repositories Específicos
- `ClienteRepository` - Gestão de clientes
- `EventoRepository` - Gestão de eventos
- `PagamentoRepository` - Gestão de pagamentos
- `TipoCustoRepository` - Gestão de tipos de custo
- `CustoEventoRepository` - Gestão de custos por evento

#### 2.4 Factory Pattern
**Arquivo:** `src/lib/repositories/repository-factory.ts`
- Singleton pattern para repositories
- Centralização da criação de instâncias
- Facilita manutenção e testes

### ✅ FASE 3: Collections do Firestore

#### 3.1 Definição das Collections
**Arquivo:** `src/lib/firestore/collections.ts`

**Collections com prefixo `controle_`:**
- `controle_users` - Usuários do sistema (NextAuth)
- `controle_clientes` - Dados dos clientes
- `controle_eventos` - Eventos cadastrados
- `controle_pagamentos` - Histórico de pagamentos
- `controle_tipo_custos` - Tipos de custos disponíveis
- `controle_custos` - Custos por evento
- `controle_historico_pagamentos` - Histórico detalhado
- `controle_servicos` - Catálogo de serviços
- `controle_pacotes_servicos` - Pacotes de serviços
- `controle_contratos_servicos` - Contratos de serviços
- `controle_promoters` - Profissionais/promoters
- `controle_insumos` - Insumos disponíveis
- `controle_anexos_eventos` - Anexos dos eventos

#### 3.2 Scripts de Inicialização
**Arquivo:** `src/lib/firestore/init-collections.ts`
- `initializeCollections()` - Criação das collections
- `seedInitialData()` - Migração dos dados mockados
- `resetCollections()` - Reset completo das collections

#### 3.3 Página de Administração
**Arquivo:** `src/app/admin/collections/page.tsx`
- Interface para gerenciar collections
- Botões para inicializar, migrar e resetar
- Visualização de resultados das operações

### ✅ FASE 4: Migração de Dados

#### 4.1 Serviço de Migração
**Arquivo:** `src/lib/migration/migration-service.ts`
- Classe `MigrationService` para migração completa
- Migração em ordem de dependências
- Validação de integridade dos dados
- Relatórios detalhados de migração

#### 4.2 Ordem de Migração
1. **Tipos de Custo** (sem dependências)
2. **Clientes** (sem dependências)
3. **Eventos** (dependem de clientes)
4. **Pagamentos** (dependem de eventos)
5. **Custos de Eventos** (dependem de eventos e tipos de custo)

#### 4.3 Validação de Migração
- Contagem de registros por collection
- Verificação de integridade referencial
- Relatórios de erros e sucessos

### 🔄 FASE 5: Atualização dos Componentes (Em Andamento)

#### 5.1 Serviço de Dados
**Arquivo:** `src/lib/data-service.ts`
- Classe `DataService` substituindo dados mockados
- Métodos para todas as entidades
- Cálculos de dashboard e relatórios
- Integração com repositories

#### 5.2 Hooks Personalizados
**Arquivo:** `src/hooks/useData.ts`
- `useClientes()` - Hook para clientes
- `useEventos()` - Hook para eventos
- `usePagamentos()` - Hook para pagamentos
- `useDashboardData()` - Hook para dashboard
- Estados de loading, error e refetch

#### 5.3 Atualização dos Componentes
- Substituição de imports de dados mockados
- Implementação de loading states
- Tratamento de erros
- Atualização de hooks e contextos

## Estrutura de Arquivos Criados

```
src/
├── lib/
│   ├── firebase.ts                    # Configuração Firebase
│   ├── auth-config.ts                 # Configuração NextAuth
│   ├── data-service.ts                # Serviço de dados
│   ├── repositories/
│   │   ├── base-repository.ts         # Interfaces base
│   │   ├── firestore-repository.ts    # Repository base
│   │   ├── cliente-repository.ts      # Repository clientes
│   │   ├── evento-repository.ts       # Repository eventos
│   │   ├── pagamento-repository.ts    # Repository pagamentos
│   │   ├── custo-repository.ts        # Repository custos
│   │   └── repository-factory.ts      # Factory pattern
│   ├── firestore/
│   │   ├── collections.ts             # Definição collections
│   │   └── init-collections.ts        # Scripts inicialização
│   └── migration/
│       └── migration-service.ts       # Serviço migração
├── hooks/
│   └── useData.ts                     # Hooks personalizados
├── types/
│   └── next-auth.d.ts                 # Tipos NextAuth
└── app/
    ├── api/auth/[...nextauth]/
    │   └── route.ts                   # API routes NextAuth
    └── admin/collections/
        └── page.tsx                   # Página administração
```

## Benefícios da Arquitetura

### Escalabilidade
- Repositories permitem trocar Firebase por outro banco facilmente
- Estrutura modular facilita manutenção
- Collections bem organizadas com prefixo identificador

### Manutenibilidade
- Separação clara de responsabilidades
- Interfaces bem definidas
- Código independente de implementação específica

### Flexibilidade
- Fácil adição de novas funcionalidades
- Possibilidade de usar múltiplos bancos de dados
- Estrutura preparada para crescimento

## Próximos Passos

### FASE 6: Autenticação Real
- Implementar NextAuth com Firebase Auth
- Migrar usuários mockados para Firebase Auth
- Configurar middleware de autenticação

### FASE 7: Testes e Validação
- Testar todas as funcionalidades
- Validar performance
- Verificar integridade dos dados

### FASE 8: Documentação Final
- Atualizar README
- Documentar APIs
- Criar guias de uso

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Acessar Página de Administração
```
http://localhost:3000/admin/collections
```

## Configuração de Ambiente

### Variáveis Necessárias (.env.local)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Status da Migração

- ✅ **FASE 1**: Configuração e Dependências - **CONCLUÍDA**
- ✅ **FASE 2**: Arquitetura de Repositories - **CONCLUÍDA**
- ✅ **FASE 3**: Collections do Firestore - **CONCLUÍDA**
- ✅ **FASE 4**: Migração de Dados - **CONCLUÍDA**
- 🔄 **FASE 5**: Atualização dos Componentes - **EM ANDAMENTO**
- ⏳ **FASE 6**: Autenticação Real - **PENDENTE**
- ⏳ **FASE 7**: Testes e Validação - **PENDENTE**
- ⏳ **FASE 8**: Documentação Final - **PENDENTE**

## Conclusão

A migração está progredindo bem com as fases fundamentais concluídas. A arquitetura implementada garante escalabilidade, manutenibilidade e flexibilidade para futuras expansões do sistema.
