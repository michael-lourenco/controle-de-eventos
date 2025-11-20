# Plano Detalhado - Reformulação dos Planos

**Data de Criação:** 2025-01-XX  
**Status:** Planejamento Aprovado  
**Objetivo:** Reformular funcionalidades e planos conforme especificações do negócio

---

## 📋 Resumo Executivo

Este plano detalha a reformulação completa dos planos (Básico, Profissional, Enterprise) com:
- Remoção de funcionalidades desnecessárias
- Adição de novas funcionalidades
- Reformulação de funcionalidades existentes
- Atualização de limites (eventos/mês, clientes/ano)
- Implementação de diferenciação padrão vs personalizado
- Controle de acesso por plano

---

## 🎯 Objetivos Específicos

### Planos Atualizados

#### **BÁSICO**
- ✅ Remover número de funcionalidades da exibição
- ✅ Remover limite de 1 usuário (só será 1 mesmo)
- ✅ Até 10 eventos cadastrados por mês
- ✅ Até 100 clientes por ano
- ✅ Cadastro de Eventos limitado
- ✅ Cadastro de Clientes limitado
- ✅ Controle de pagamentos (padrão)
- ✅ Gerenciador de tipos de custos (padrão)
- ✅ Gerenciador de tipos de serviços (padrão)
- ✅ Gerenciador de tipos de Eventos (padrão)
- ✅ Gerenciador de canais de entrada (padrão)
- ✅ Acesso a Relatórios básicos

#### **PROFISSIONAL**
- ✅ Remover número de funcionalidades da exibição
- ✅ Até 50 eventos cadastrados por mês
- ✅ Até 600 clientes cadastrados por ano
- ✅ Controle de pagamentos (personalizado)
- ✅ Gerenciador de tipos de custos (personalizado)
- ✅ Gerenciador de tipos de serviços (personalizado)
- ✅ Gerenciador de tipos de Eventos (personalizado)
- ✅ Gerenciador de canais de entrada (personalizado)
- ✅ Acesso a Relatórios avançado
- ✅ Acesso a upload de anexos
- ✅ Botão "Copiar" (informações do evento)

#### **ENTERPRISE**
- ✅ Remover número de funcionalidades da exibição
- ✅ Até 400 eventos cadastrados por mês
- ✅ Até 4.800 clientes cadastrados por ano
- ✅ Controle de pagamentos (personalizado)
- ✅ Gerenciador de tipos de custos (personalizado)
- ✅ Gerenciador de tipos de serviços (personalizado)
- ✅ Gerenciador de tipos de Eventos (personalizado)
- ✅ Gerenciador de canais de entrada (personalizado)
- ✅ Acesso a Relatórios Full
- ✅ Acesso a upload de anexos
- ✅ Botão "Copiar" (informações do evento)
- ✅ Preenchimento automatizado de contrato

---

## 🔍 Análise do Estado Atual

### Funcionalidades Existentes
- ✅ Sistema de limites de eventos mensais (já implementado)
- ✅ Sistema de verificação de permissões por funcionalidade
- ✅ Upload de anexos (infraestrutura completa)
- ✅ Botão "Copiar" (já implementado em eventos)
- ✅ Sistema de contratos (modelos existentes)
- ✅ Relatórios básicos e avançados

### Pontos de Atenção
- ⚠️ Limite de clientes ainda não implementado (precisa ser anual)
- ⚠️ Diferenciação padrão/personalizado não existe
- ⚠️ Relatórios Full não existe (apenas básicos e avançados)
- ⚠️ Botão copiar não tem controle de acesso por plano
- ⚠️ Upload de anexos não tem controle de acesso por plano
- ⚠️ Controle de criação personalizada não existe

---

## 📐 Estrutura de Implementação

### FASE 1: Atualização de Tipos e Modelos de Dados

#### 1.1 Atualizar `src/types/funcionalidades.ts`
- [ ] Adicionar campo `limiteClientesAnual?: number` no tipo `Plano`
- [ ] Verificar se todos os campos necessários estão presentes

#### 1.2 Criar/Atualizar Funcionalidades no Seed
**Arquivo:** `src/app/api/seed/funcionalidades-planos/route.ts`

**Funcionalidades a Remover:**
- [ ] Remover `EVENTOS_ILIMITADOS` (não será mais usado)
- [ ] Remover `CLIENTES_ILIMITADOS` (não será mais usado)

**Funcionalidades a Adicionar:**
- [ ] `PAGAMENTOS_CONTROLE_PADRAO` - Controle de pagamentos padrão
- [ ] `PAGAMENTOS_CONTROLE_PERSONALIZADO` - Controle de pagamentos personalizado
- [ ] `TIPOS_CUSTOS_PADRAO` - Gerenciador de tipos de custos padrão
- [ ] `TIPOS_CUSTOS_PERSONALIZADO` - Gerenciador de tipos de custos personalizado
- [ ] `TIPOS_SERVICOS_PADRAO` - Gerenciador de tipos de serviços padrão
- [ ] `TIPOS_SERVICOS_PERSONALIZADO` - Gerenciador de tipos de serviços personalizado
- [ ] `TIPOS_EVENTOS_PADRAO` - Gerenciador de tipos de eventos padrão
- [ ] `TIPOS_EVENTOS_PERSONALIZADO` - Gerenciador de tipos de eventos personalizado
- [ ] `CANAIS_ENTRADA_PADRAO` - Gerenciador de canais de entrada padrão
- [ ] `CANAIS_ENTRADA_PERSONALIZADO` - Gerenciador de canais de entrada personalizado
- [ ] `RELATORIOS_FULL` - Relatórios Full (métricas completas)
- [ ] `UPLOAD_ANEXOS` - Upload de anexos
- [ ] `BOTAO_COPIAR` - Botão copiar informações
- [ ] `CONTRATO_AUTOMATIZADO` - Preenchimento automatizado de contrato

**Funcionalidades a Manter:**
- [ ] `EVENTOS_LIMITADOS` - Eventos limitados
- [ ] `CLIENTES_LIMITADOS` - Clientes limitados
- [ ] `PAGAMENTOS_REGISTRAR` - Registrar pagamentos
- [ ] `PAGAMENTOS_COMPROVANTES` - Comprovantes de pagamento
- [ ] `RELATORIOS_BASICOS` - Relatórios básicos
- [ ] `RELATORIOS_AVANCADOS` - Relatórios avançados
- [ ] `FLUXO_CAIXA` - Fluxo de caixa

#### 1.3 Atualizar Planos no Seed
**Arquivo:** `src/app/api/seed/funcionalidades-planos/route.ts`

**Plano BÁSICO:**
```typescript
{
  nome: 'Basico',
  descricao: 'Plano ideal para começar a usar o sistema',
  codigoHotmart: 'BASICO_MENSAL',
  limiteEventos: 10, // por mês
  limiteClientes: 100, // por ano
  limiteUsuarios: 1,
  funcionalidades: [
    'EVENTOS_LIMITADOS',
    'CLIENTES_LIMITADOS',
    'PAGAMENTOS_REGISTRAR',
    'PAGAMENTOS_CONTROLE_PADRAO',
    'TIPOS_CUSTOS_PADRAO',
    'TIPOS_SERVICOS_PADRAO',
    'TIPOS_EVENTOS_PADRAO',
    'CANAIS_ENTRADA_PADRAO',
    'RELATORIOS_BASICOS'
  ]
}
```

**Plano PROFISSIONAL:**
```typescript
{
  nome: 'Profissional',
  descricao: 'Plano completo para profissionais',
  codigoHotmart: 'PROFISSIONAL_MENSAL',
  limiteEventos: 50, // por mês
  limiteClientes: 600, // por ano
  limiteUsuarios: 1,
  funcionalidades: [
    'EVENTOS_LIMITADOS',
    'CLIENTES_LIMITADOS',
    'PAGAMENTOS_REGISTRAR',
    'PAGAMENTOS_COMPROVANTES',
    'PAGAMENTOS_CONTROLE_PERSONALIZADO',
    'TIPOS_CUSTOS_PERSONALIZADO',
    'TIPOS_SERVICOS_PERSONALIZADO',
    'TIPOS_EVENTOS_PERSONALIZADO',
    'CANAIS_ENTRADA_PERSONALIZADO',
    'RELATORIOS_BASICOS',
    'RELATORIOS_AVANCADOS',
    'FLUXO_CAIXA',
    'UPLOAD_ANEXOS',
    'BOTAO_COPIAR'
  ]
}
```

**Plano ENTERPRISE:**
```typescript
{
  nome: 'Enterprise',
  descricao: 'Plano premium com todas as funcionalidades',
  codigoHotmart: 'ENTERPRISE_MENSAL',
  limiteEventos: 400, // por mês
  limiteClientes: 4800, // por ano
  limiteUsuarios: 1,
  funcionalidades: [
    'EVENTOS_LIMITADOS',
    'CLIENTES_LIMITADOS',
    'PAGAMENTOS_REGISTRAR',
    'PAGAMENTOS_COMPROVANTES',
    'PAGAMENTOS_CONTROLE_PERSONALIZADO',
    'TIPOS_CUSTOS_PERSONALIZADO',
    'TIPOS_SERVICOS_PERSONALIZADO',
    'TIPOS_EVENTOS_PERSONALIZADO',
    'CANAIS_ENTRADA_PERSONALIZADO',
    'RELATORIOS_BASICOS',
    'RELATORIOS_AVANCADOS',
    'RELATORIOS_FULL',
    'FLUXO_CAIXA',
    'UPLOAD_ANEXOS',
    'BOTAO_COPIAR',
    'CONTRATO_AUTOMATIZADO'
  ]
}
```

---

### FASE 2: Implementação de Limites e Controles

#### 2.1 Melhorar Limite de Eventos Mensais
**Arquivo:** `src/lib/services/funcionalidade-service.ts`

- [ ] Revisar método `obterLimitesUsuario` para otimizar contagem de eventos mensais
- [ ] Adicionar cache ou otimização para não buscar todos os eventos
- [ ] Garantir que o cálculo seja baseado em `dataCadastro` do evento

#### 2.2 Implementar Limite Anual de Clientes
**Arquivo:** `src/lib/services/funcionalidade-service.ts`

- [ ] Criar método `verificarLimiteClientesAnual` que:
  - Calcula clientes cadastrados no ano civil atual (01/01 até 31/12)
  - Compara com `limiteClientes` do plano
  - Retorna `{ pode: boolean, limite?: number, usado: number, restante?: number }`
- [ ] Atualizar método `obterLimitesUsuario` para incluir contagem anual de clientes
- [ ] Atualizar método `verificarPodeCriar` para usar limite anual de clientes

**Arquivo:** `src/lib/repositories/cliente-repository.ts`
- [ ] Criar método `countClientesPorAno(ano: number, userId: string)` para otimizar contagem
- [ ] Usar query otimizada do Firestore com filtros de data

#### 2.3 Atualizar Verificações de Limites
**Arquivo:** `src/lib/services/funcionalidade-service.ts`

- [ ] Garantir que `verificarLimiteEventos` está robusto
- [ ] Garantir que `verificarLimiteClientes` usa limite anual
- [ ] Adicionar logs para debugging quando limites são atingidos

---

### FASE 3: Implementação de Controles de Acesso

#### 3.1 Controle de Upload de Anexos
**Arquivos:**
- `src/components/AnexosEvento.tsx`
- `src/components/forms/PagamentoForm.tsx`
- `src/components/PagamentoHistorico.tsx`
- `src/app/api/upload/route.ts`

- [ ] Adicionar verificação de permissão `UPLOAD_ANEXOS` antes de mostrar componentes de upload
- [ ] Usar `PlanoBloqueio` ou verificação similar para bloquear upload no plano Básico
- [ ] Adicionar verificação no backend (API) para garantir segurança

#### 3.2 Controle de Botão Copiar
**Arquivos:**
- `src/app/eventos/[id]/page.tsx`
- `src/app/eventos/page.tsx`

- [ ] Adicionar verificação de permissão `BOTAO_COPIAR` antes de renderizar botão
- [ ] Usar `usePlano().temPermissao('BOTAO_COPIAR')` para verificar acesso
- [ ] Ocultar botão ou mostrar mensagem de bloqueio se não tiver permissão

#### 3.3 Controle de Relatórios Full
**Arquivo:** `src/app/relatorios/page.tsx`

- [ ] Adicionar verificação de permissão `RELATORIOS_FULL` para seções específicas
- [ ] Usar `PlanoBloqueio` para bloquear acesso a relatórios Full no plano Básico e Profissional
- [ ] Criar seções específicas para relatórios Full (Enterprise)

#### 3.4 Controle de Contrato Automatizado
**Arquivo:** `src/app/contratos/` (páginas relacionadas)

- [ ] Adicionar verificação de permissão `CONTRATO_AUTOMATIZADO`
- [ ] Bloquear funcionalidade de preenchimento automatizado para planos Básico e Profissional
- [ ] Manter funcionalidade existente de preenchimento do contratante

---

### FASE 4: Implementação de Padrão vs Personalizado

#### 4.1 Entender o Conceito
- **Padrão:** Itens default que já vêm cadastrados quando o usuário cria a conta
- **Personalizado:** Capacidade de criar novos itens além dos que já existem

#### 4.2 Implementar Controle de Criação Personalizada
**Arquivos:**
- `src/app/tipos-custos/page.tsx`
- `src/app/tipos-servicos/page.tsx`
- `src/app/tipos-eventos/page.tsx`
- `src/app/canais-entrada/page.tsx`
- `src/app/servicos/page.tsx` (se aplicável)

**Estratégia:**
- [ ] Identificar quais itens são "padrão" (vêm do seed inicial)
- [ ] Adicionar campo `padrao: boolean` ou similar nos tipos
- [ ] Verificar permissão antes de permitir criação:
  - Se tem `*_PADRAO`: pode apenas usar itens padrão
  - Se tem `*_PERSONALIZADO`: pode criar novos itens
- [ ] Bloquear botão "Criar Novo" ou "Adicionar" se não tiver permissão personalizada
- [ ] Mostrar mensagem educativa sobre upgrade de plano

#### 4.3 Implementar Controle de Pagamentos
**Arquivo:** `src/app/pagamentos/` ou componentes relacionados

- [ ] Verificar permissão `PAGAMENTOS_CONTROLE_PADRAO` ou `PAGAMENTOS_CONTROLE_PERSONALIZADO`
- [ ] Se padrão: limitar opções de personalização
- [ ] Se personalizado: permitir todas as opções

---

### FASE 5: Atualização de Interface do Usuário

#### 5.1 Página de Planos (`/planos`)
**Arquivo:** `src/app/planos/page.tsx`

- [ ] Remover exibição de "número de funcionalidades"
- [ ] Atualizar descrições dos planos
- [ ] Atualizar limites exibidos (eventos/mês, clientes/ano)
- [ ] Destacar funcionalidades principais de cada plano
- [ ] Adicionar badges para "Padrão" vs "Personalizado"

#### 5.2 Página de Assinatura (`/assinatura`)
**Arquivo:** `src/app/assinatura/page.tsx`

- [ ] Atualizar informações exibidas sobre o plano atual
- [ ] Mostrar limites de uso (eventos/mês, clientes/ano)
- [ ] Exibir funcionalidades habilitadas

#### 5.3 Página Admin de Planos (`/admin/planos`)
**Arquivo:** `src/app/admin/planos/page.tsx`

- [ ] Atualizar formulário para incluir novos campos
- [ ] Adicionar campo para limite anual de clientes
- [ ] Atualizar lista de funcionalidades disponíveis

#### 5.4 Componentes de Bloqueio
**Arquivo:** `src/components/PlanoBloqueio.tsx`

- [ ] Verificar se está funcionando corretamente
- [ ] Adicionar suporte para novos tipos de bloqueio se necessário

---

### FASE 6: Validação e Testes

#### 6.1 Testes de Limites
- [ ] Testar criação de eventos no limite (10, 50, 400)
- [ ] Testar bloqueio ao exceder limite de eventos
- [ ] Testar criação de clientes no limite anual (100, 600, 4800)
- [ ] Testar bloqueio ao exceder limite anual de clientes
- [ ] Verificar reset de contadores (eventos mensal, clientes anual)

#### 6.2 Testes de Permissões
- [ ] Testar acesso a upload de anexos (Básico bloqueado, Profissional/Enterprise liberado)
- [ ] Testar botão copiar (Básico bloqueado, Profissional/Enterprise liberado)
- [ ] Testar relatórios Full (apenas Enterprise)
- [ ] Testar criação personalizada (padrão vs personalizado)

#### 6.3 Testes de Seed
- [ ] Executar seed com `reset=true`
- [ ] Verificar se funcionalidades foram criadas corretamente
- [ ] Verificar se planos foram atualizados corretamente
- [ ] Verificar se limites estão corretos

---

### FASE 7: Documentação e Finalização

#### 7.1 Atualizar Documentação
- [ ] Atualizar este arquivo com resultados
- [ ] Documentar mudanças em cada arquivo modificado
- [ ] Criar resumo das alterações

#### 7.2 Checklist Final
- [ ] Todas as funcionalidades implementadas
- [ ] Todos os limites funcionando
- [ ] Todas as permissões funcionando
- [ ] Interface atualizada
- [ ] Testes realizados
- [ ] Seed executado com sucesso

---

## 🔧 Detalhamento Técnico

### Estrutura de Funcionalidades

```
EVENTOS
├── EVENTOS_LIMITADOS (todos os planos)

CLIENTES
├── CLIENTES_LIMITADOS (todos os planos)

PAGAMENTOS
├── PAGAMENTOS_REGISTRAR (todos os planos)
├── PAGAMENTOS_COMPROVANTES (Profissional, Enterprise)
├── PAGAMENTOS_CONTROLE_PADRAO (Básico)
└── PAGAMENTOS_CONTROLE_PERSONALIZADO (Profissional, Enterprise)

TIPOS
├── TIPOS_CUSTOS_PADRAO (Básico)
├── TIPOS_CUSTOS_PERSONALIZADO (Profissional, Enterprise)
├── TIPOS_SERVICOS_PADRAO (Básico)
├── TIPOS_SERVICOS_PERSONALIZADO (Profissional, Enterprise)
├── TIPOS_EVENTOS_PADRAO (Básico)
├── TIPOS_EVENTOS_PERSONALIZADO (Profissional, Enterprise)
├── CANAIS_ENTRADA_PADRAO (Básico)
└── CANAIS_ENTRADA_PERSONALIZADO (Profissional, Enterprise)

RELATÓRIOS
├── RELATORIOS_BASICOS (todos os planos)
├── RELATORIOS_AVANCADOS (Profissional, Enterprise)
└── RELATORIOS_FULL (Enterprise)

OUTROS
├── FLUXO_CAIXA (Profissional, Enterprise)
├── UPLOAD_ANEXOS (Profissional, Enterprise)
├── BOTAO_COPIAR (Profissional, Enterprise)
└── CONTRATO_AUTOMATIZADO (Enterprise)
```

### Limites por Plano

| Plano | Eventos/Mês | Clientes/Ano | Usuários |
|-------|------------|--------------|----------|
| Básico | 10 | 100 | 1 |
| Profissional | 50 | 600 | 1 |
| Enterprise | 400 | 4.800 | 1 |

---

## 📝 Notas de Implementação

### Considerações Importantes

1. **Limite Anual de Clientes:**
   - Reset automático em 01/01 de cada ano
   - Contagem baseada em `dataCadastro` do cliente
   - Não considerar clientes arquivados na contagem

2. **Limite Mensal de Eventos:**
   - Reset automático no primeiro dia de cada mês
   - Contagem baseada em `dataCadastro` do evento
   - Não considerar eventos arquivados na contagem

3. **Padrão vs Personalizado:**
   - Itens padrão são criados no seed inicial do sistema
   - Usuários com permissão padrão só podem usar itens existentes
   - Usuários com permissão personalizada podem criar novos itens

4. **Upload de Anexos:**
   - Infraestrutura já existe
   - Apenas adicionar controle de acesso
   - Não há limite de tamanho/quantidade por plano (por enquanto)

5. **Botão Copiar:**
   - Funcionalidade já existe
   - Apenas adicionar controle de acesso
   - Formato do texto já está definido

6. **Contrato Automatizado:**
   - Preenchimento do contratante já existe
   - Preenchimento de eventos será implementado futuramente
   - Por enquanto, apenas restringir UI

---

## ✅ Checklist de Execução

### Preparação
- [x] Análise do código atual
- [x] Entendimento dos requisitos
- [x] Criação do plano detalhado

### Implementação
- [ ] Fase 1: Atualização de Tipos e Modelos
- [ ] Fase 2: Implementação de Limites
- [ ] Fase 3: Controles de Acesso
- [ ] Fase 4: Padrão vs Personalizado
- [ ] Fase 5: Atualização de UI
- [ ] Fase 6: Validação e Testes
- [ ] Fase 7: Documentação

---

## 🚀 Próximos Passos

1. Revisar e aprovar este plano
2. Iniciar implementação fase por fase
3. Documentar progresso em cada fase
4. Testar cada funcionalidade implementada
5. Executar seed final
6. Validar em ambiente dev

---

**Última Atualização:** 2025-01-XX  
**Status:** ✅ IMPLEMENTAÇÃO CONCLUÍDA

---

## ✅ Status de Implementação

### FASE 1: ✅ CONCLUÍDA
- [x] Funcionalidades atualizadas no seed
- [x] Planos atualizados com novos limites e funcionalidades
- [x] Removidas funcionalidades obsoletas (EVENTOS_ILIMITADOS, CLIENTES_ILIMITADOS)
- [x] Adicionadas novas funcionalidades conforme especificação

### FASE 2: ✅ CONCLUÍDA
- [x] Limite anual de clientes implementado (reset em 01/01)
- [x] Método `countClientesPorAno` criado no repositório
- [x] Limite mensal de eventos revisado e otimizado
- [x] Método `verificarPodeCriar` simplificado

### FASE 3: ✅ CONCLUÍDA
- [x] Upload de anexos bloqueado no plano Básico
- [x] Botão "Copiar" bloqueado no plano Básico (páginas de detalhe e lista)

### FASE 4: ✅ CONCLUÍDA
- [x] Controle de criação personalizada implementado para:
  - [x] Tipos de custos
  - [x] Tipos de serviços
  - [x] Tipos de eventos
  - [x] Canais de entrada

### FASE 5: ✅ CONCLUÍDA
- [x] Página de planos atualizada (removido número de funcionalidades)
- [x] Limite de clientes exibido como "clientes/ano"
- [x] Seção de Relatórios Full adicionada (apenas Enterprise)
- [x] Controle de Contrato Automatizado adicionado (apenas Enterprise)

---

## 📝 Próximos Passos

1. **Executar Seed:** Executar `/api/seed/funcionalidades-planos?reset=true` para atualizar o banco de dados
2. **Testar:** Validar todas as funcionalidades implementadas
3. **Validar:** Verificar se os limites estão funcionando corretamente

