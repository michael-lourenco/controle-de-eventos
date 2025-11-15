# Análise e Proposta de Melhorias - Sistema de Exclusão de Dados

## Script de Migração de Dados

### Migração de Campos de Integridade

Foi criado um script de migração para adicionar os novos campos de integridade (`ativo`, `arquivado`) nos dados existentes na base de dados. Este script garante que os dados antigos sejam compatíveis com o novo sistema de integridade.

**Endpoint:** `POST /api/admin/migrate-data-integrity-fields`

**Parâmetros:**
- `dryRun` (boolean, opcional, padrão: `false`): Se `true`, apenas simula a migração sem aplicar mudanças

**Autenticação:**
- Requer autenticação admin OU
- Header `x-api-key` com valor `dev-seed-key-2024` (ou o valor de `SEED_API_KEY` no `.env`)

**O que o script faz:**

1. **Clientes**: Adiciona `arquivado: false` em todos os clientes que não têm esse campo
2. **Eventos**: Adiciona `arquivado: false` em todos os eventos que não têm esse campo
3. **Tipos de Serviço**: Adiciona `ativo: true` em todos os tipos que não têm esse campo
4. **Tipos de Custo**: Adiciona `ativo: true` em todos os tipos que não têm esse campo
5. **Canais de Entrada**: Adiciona `ativo: true` em todos os canais que não têm esse campo
6. **Tipos de Evento**: Adiciona `ativo: true` em todos os tipos que não têm esse campo

**Como usar:**

1. **Teste primeiro (Dry Run):**
```bash
POST /api/admin/migrate-data-integrity-fields
Headers: { "x-api-key": "dev-seed-key-2024", "Content-Type": "application/json" }
Body: { "dryRun": true }
```

2. **Execute a migração:**
```bash
POST /api/admin/migrate-data-integrity-fields
Headers: { "x-api-key": "dev-seed-key-2024", "Content-Type": "application/json" }
Body: { "dryRun": false }
```

**Importante:**
- O script é **idempotente** - pode ser executado múltiplas vezes sem problemas
- O script só atualiza documentos que não têm os campos (`undefined` ou `null`)
- Documentos que já têm os campos não são modificados
- O script processa todos os usuários (exceto admin) na base de dados

**Exemplo de resposta:**

```json
{
  "success": true,
  "dryRun": false,
  "message": "Migração concluída com sucesso!",
  "resumo": {
    "usuariosProcessados": 5,
    "totalAtualizacoes": 42,
    "clientesAtualizados": 10,
    "eventosAtualizados": 8,
    "tiposServicoAtualizados": 6,
    "tiposCustoAtualizados": 5,
    "canaisEntradaAtualizados": 7,
    "tiposEventoAtualizados": 6
  },
  "erros": null
}
```

---

## 📋 Objetivo

Analisar todos os pontos de exclusão no sistema e propor melhorias para manter a integridade dos dados históricos e relatórios, implementando estratégias como soft delete (inativação) ou arquivamento ao invés de exclusão física.

---

## 🔍 Análise dos Tipos de Itens que Podem Ser Excluídos

### 1. **TipoServico** (Tipo de Serviço)
**Localização**: `/tipos-servicos`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `ServicoEvento` - Serviços já cadastrados em eventos usam `tipoServicoId`
- Relatórios de Serviços (`ServicosReport`) dependem dos tipos para agrupar dados
- Histórico de eventos pode ficar inconsistente

**Impacto da exclusão**:
- ❌ Relatórios históricos podem quebrar ou mostrar "Tipo não encontrado"
- ❌ Eventos passados perdem referência ao tipo de serviço
- ❌ Dados históricos ficam inconsistentes
- ✅ Tipo ainda pode ser criado novamente

**Proposta**: ⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Não exibir em listas de seleção para novos cadastros
- Continuar exibindo em eventos e relatórios históricos
- Permitir reativar no futuro se necessário

---

### 2. **TipoCusto** (Tipo de Custo)
**Localização**: `/tipos-custos`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `CustoEvento` - Custos já cadastrados em eventos usam `tipoCustoId`
- Relatórios financeiros podem depender dos tipos
- Histórico de custos pode ficar inconsistente

**Impacto da exclusão**:
- ❌ Relatórios de custos podem quebrar
- ❌ Eventos passados perdem referência ao tipo de custo
- ❌ Dados financeiros históricos ficam inconsistentes
- ✅ Tipo ainda pode ser criado novamente

**Proposta**: ⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Não exibir em listas de seleção para novos cadastros
- Continuar exibindo em eventos e relatórios históricos
- Permitir reativar no futuro se necessário

---

### 3. **CanalEntrada** (Canal de Entrada)
**Localização**: `/canais-entrada`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Cliente` - Clientes referenciam `canalEntradaId`
- Relatórios de Canais de Entrada (`CanaisEntradaReport`) dependem dos canais
- Análise de marketing e origem de leads depende desses dados

**Impacto da exclusão**:
- ❌ Relatórios de canais podem quebrar ou perder dados históricos
- ❌ Clientes perdem referência ao canal de origem
- ❌ Análises de marketing ficam incompletas
- ✅ Canal ainda pode ser criado novamente (mas perde histórico)

**Proposta**: ⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Não exibir em listas de seleção para novos cadastros
- Continuar exibindo em clientes e relatórios históricos
- Permitir reativar no futuro se necessário

---

### 4. **TipoEvento** (Tipo de Evento)
**Localização**: `/tipos-eventos`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Evento` - Eventos referenciam `tipoEventoId` ou `tipoEvento` (string)
- Relatórios de Performance (`PerformanceEventosReport`) agrupam por tipo
- Relatórios diversos dependem dos tipos para categorização

**Impacto da exclusão**:
- ❌ Relatórios podem quebrar ou perder categorização
- ❌ Eventos passados perdem referência ao tipo
- ❌ Dados históricos ficam inconsistentes
- ✅ Tipo ainda pode ser criado novamente

**Proposta**: ⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Não exibir em listas de seleção para novos cadastros
- Continuar exibindo em eventos e relatórios históricos
- Permitir reativar no futuro se necessário

---

### 5. **Cliente**
**Localização**: `/clientes`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Evento` - Eventos referenciam `clienteId` e têm objeto `cliente` embutido
- Relatórios dependem dos dados de clientes
- Histórico de relacionamento com clientes

**Impacto da exclusão**:
- ❌ Eventos órfãos (sem referência ao cliente)
- ❌ Relatórios podem quebrar
- ❌ Histórico de relacionamento perdido
- ⚠️ **CRÍTICO**: Impacto muito alto

**Proposta**: ⭐⭐ **ARQUIVAR** (Adicionar campo `arquivado: boolean` e `dataArquivamento`)
- Não deletar fisicamente
- Marcar como arquivado (`arquivado: true`)
- Não exibir em listas normais (apenas em "Clientes Arquivados")
- Manter todos os eventos e relacionamentos intactos
- Permitir desarquivar no futuro
- Opcionalmente adicionar campo `motivoArquivamento: string`

---

### 6. **Evento**
**Localização**: `/eventos`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Pagamento` - Subcollection de pagamentos
- `CustoEvento` - Subcollection de custos
- `ServicoEvento` - Subcollection de serviços
- `AnexoEvento` - Arquivos anexados
- Relatórios financeiros e de performance

**Impacto da exclusão**:
- ❌ Perda de histórico financeiro completo
- ❌ Relatórios podem quebrar
- ❌ Dados de receita/despesa perdidos
- ⚠️ **CRÍTICO**: Impacto muito alto

**Proposta**: ⭐⭐ **ARQUIVAR** ou **CANCELAR** (Adicionar campo `status: 'Cancelado'` e `arquivado: boolean`)
- Não deletar fisicamente
- Para eventos futuros: Mudar status para "Cancelado"
- Para eventos passados: Marcar como arquivado (`arquivado: true`)
- Não exibir em listas ativas por padrão
- Manter todos os relacionamentos (pagamentos, custos, serviços)
- Relatórios continuam funcionando normalmente
- Permitir desarquivar no futuro

---

### 7. **Pagamento** (de Evento)
**Localização**: Dentro de um Evento
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `AnexoPagamento` - Comprovantes de pagamento
- Relatórios financeiros
- Cálculo de saldo de eventos

**Impacto da exclusão**:
- ❌ Histórico financeiro inconsistente
- ❌ Relatórios de fluxo de caixa podem quebrar
- ❌ Anexos podem ficar órfãos

**Proposta**: ⭐⭐ **MARCADO COMO CANCELADO** (Adicionar campo `cancelado: boolean` e `dataCancelamento`)
- Não deletar fisicamente
- Marcar como cancelado (`cancelado: true`)
- Não contar em cálculos de saldo ativo
- Manter para histórico e auditoria
- Exibir com indicador visual de cancelado

---

### 8. **CustoEvento** (Custo de Evento)
**Localização**: Dentro de um Evento
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- Relatórios de custos
- Cálculo de margem de lucro
- Histórico financeiro

**Impacto da exclusão**:
- ❌ Histórico de custos inconsistente
- ❌ Relatórios podem quebrar
- ❌ Margem de lucro calculada incorretamente

**Proposta**: ⭐⭐ **MARCADO COMO REMOVIDO** (Adicionar campo `removido: boolean` e `dataRemocao`)
- Não deletar fisicamente
- Marcar como removido (`removido: true`)
- Não contar em cálculos ativos
- Manter para histórico e auditoria
- Exibir com indicador visual de removido

---

### 9. **ServicoEvento** (Serviço de Evento)
**Localização**: Dentro de um Evento
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- Relatórios de serviços
- Histórico do que foi prestado

**Impacto da exclusão**:
- ❌ Histórico de serviços inconsistente
- ❌ Relatórios podem quebrar

**Proposta**: ⭐⭐ **MARCADO COMO REMOVIDO** (Adicionar campo `removido: boolean` e `dataRemocao`)
- Não deletar fisicamente
- Marcar como removido (`removido: true`)
- Não contar em cálculos ativos
- Manter para histórico e auditoria
- Exibir com indicador visual de removido

---

### 10. **AnexoEvento / AnexoPagamento / Arquivo**
**Localização**: Dentro de Eventos/Pagamentos
**Estado atual**: Permite exclusão física (com remoção do S3)
**Dependências identificadas**:
- Documentação e comprovantes
- Auditoria

**Impacto da exclusão**:
- ⚠️ **JUSTIFICADO**: Anexos podem ser deletados (com confirmação)
- ❌ Perda de comprovantes pode ser crítica

**Proposta**: ⚡ **MANTER COMO ESTÁ** (com melhorias)
- Exclusão física é aceitável (com confirmação)
- Adicionar confirmação mais rigorosa
- Opcional: Sistema de backup/arquivamento automático antes de deletar

---

### 11. **Plano** (Admin)
**Localização**: `/admin/planos`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Assinatura` - Assinaturas referenciam `planoId`
- `User` - Usuários têm `planoId` e cache de dados do plano

**Impacto da exclusão**:
- ❌ Assinaturas ativas podem ficar órfãs
- ❌ Usuários perdem referência ao plano
- ❌ Histórico de assinaturas pode quebrar

**Proposta**: ⭐⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Bloquear exclusão se houver assinaturas ativas vinculadas
- Não permitir criar novas assinaturas com o plano inativo
- Manter histórico de assinaturas funcionando
- Permitir reativar no futuro

---

### 12. **Funcionalidade** (Admin)
**Localização**: `/admin/funcionalidades`
**Estado atual**: Permite exclusão física
**Dependências identificadas**:
- `Plano` - Planos têm array de `funcionalidades` (IDs)
- Validações de acesso baseadas em funcionalidades

**Impacto da exclusão**:
- ❌ Planos podem ficar com IDs de funcionalidades inexistentes
- ❌ Validações podem quebrar
- ❌ Histórico de funcionalidades perdido

**Proposta**: ⭐ **INATIVAR** (Soft Delete via campo `ativo`)
- Manter o registro no banco com `ativo: false`
- Bloquear exclusão se estiver vinculada a planos ativos
- Não exibir em formulários de criação de planos
- Manter validações funcionando para itens já atribuídos
- Permitir reativar no futuro

---

## 📊 Resumo das Propostas

| Item | Ação Proposta | Criticidade | Prioridade |
|------|---------------|-------------|------------|
| TipoServico | Inativar (`ativo: false`) | Alta | ⭐⭐ |
| TipoCusto | Inativar (`ativo: false`) | Alta | ⭐⭐ |
| CanalEntrada | Inativar (`ativo: false`) | Alta | ⭐⭐ |
| TipoEvento | Inativar (`ativo: false`) | Alta | ⭐⭐ |
| Cliente | Arquivar (`arquivado: boolean`) | **Crítica** | ⭐⭐⭐ |
| Evento | Arquivar/Cancelar (`arquivado: boolean`, `status`) | **Crítica** | ⭐⭐⭐ |
| Pagamento | Marcar como Cancelado (`cancelado: boolean`) | **Crítica** | ⭐⭐⭐ |
| CustoEvento | Marcar como Removido (`removido: boolean`) | Alta | ⭐⭐ |
| ServicoEvento | Marcar como Removido (`removido: boolean`) | Alta | ⭐⭐ |
| Anexos | Manter exclusão física (com melhorias) | Média | ⭐ |
| Plano | Inativar (`ativo: false`) + Validação | Alta | ⭐⭐ |
| Funcionalidade | Inativar (`ativo: false`) + Validação | Alta | ⭐⭐ |

---

## 🎯 Estratégias de Implementação

### **Estratégia 1: Inativação (Soft Delete via campo `ativo`)**
**Aplicável para**: TipoServico, TipoCusto, CanalEntrada, TipoEvento, Plano, Funcionalidade

**Vantagens**:
- ✅ Simples de implementar (já existe campo `ativo`)
- ✅ Mantém integridade histórica
- ✅ Permite reativação fácil
- ✅ Não quebra relatórios existentes

**Implementação**:
1. Modificar queries para filtrar `ativo: true` em listagens normais
2. Modificar exclusões para fazer `update({ ativo: false })` ao invés de `delete()`
3. Adicionar opção "Reativar" em interfaces admin
4. Manter itens inativos em relatórios históricos

---

### **Estratégia 2: Arquivamento**
**Aplicável para**: Cliente, Evento

**Vantagens**:
- ✅ Preserva todos os relacionamentos
- ✅ Mantém histórico completo
- ✅ Permite desarquivar
- ✅ Não quebra relatórios

**Implementação**:
1. Adicionar campo `arquivado: boolean` (default: `false`)
2. Adicionar campo `dataArquivamento?: Date`
3. Adicionar campo `motivoArquivamento?: string` (opcional)
4. Modificar exclusões para fazer `update({ arquivado: true, dataArquivamento: new Date() })`
5. Filtrar `arquivado: false` em listagens normais
6. Criar seção "Arquivados" para visualização

---

### **Estratégia 3: Marcação como Removido/Cancelado**
**Aplicável para**: Pagamento, CustoEvento, ServicoEvento

**Vantagens**:
- ✅ Mantém histórico para auditoria
- ✅ Não quebra cálculos se implementado corretamente
- ✅ Permite rastreabilidade

**Implementação**:
1. Adicionar campo `cancelado: boolean` ou `removido: boolean` (default: `false`)
2. Adicionar campo `dataCancelamento?: Date` ou `dataRemocao?: Date`
3. Modificar cálculos para excluir itens cancelados/removidos
4. Modificar exclusões para fazer `update({ cancelado: true, ... })`
5. Adicionar indicadores visuais nos componentes

---

## 🔐 Validações Necessárias

### **Validações antes de Inativar/Arquivar**

1. **TipoServico**:
   - ✅ Permitir inativar sempre (não bloqueia nada crítico)
   - ⚠️ Avisar se há serviços ativos em eventos futuros

2. **TipoCusto**:
   - ✅ Permitir inativar sempre (não bloqueia nada crítico)
   - ⚠️ Avisar se há custos ativos em eventos futuros

3. **CanalEntrada**:
   - ✅ Permitir inativar sempre
   - ⚠️ Avisar se há clientes vinculados

4. **TipoEvento**:
   - ✅ Permitir inativar sempre
   - ⚠️ Avisar se há eventos futuros usando o tipo

5. **Cliente**:
   - ⚠️ **BLOQUEAR** arquivamento se houver eventos futuros agendados
   - ✅ Permitir arquivar se apenas eventos passados
   - ⚠️ Avisar sobre impacto em relatórios

6. **Evento**:
   - ✅ Sempre permitir cancelar/arquivar
   - ⚠️ Avisar sobre impacto em relatórios financeiros

7. **Plano**:
   - ⚠️ **BLOQUEAR** inativação se houver assinaturas ativas
   - ✅ Permitir inativar se apenas assinaturas canceladas/expiradas

8. **Funcionalidade**:
   - ⚠️ **BLOQUEAR** inativação se estiver em planos ativos
   - ✅ Permitir inativar se apenas em planos inativos

---

## 📝 Campos a Adicionar nos Tipos

### **Tipos que já têm `ativo: boolean`**
- TipoServico ✅
- TipoCusto ✅
- CanalEntrada ✅
- TipoEvento ✅
- Plano ✅ (já tem)
- Funcionalidade ✅ (já tem)

**Ação**: Apenas usar o campo existente

---

### **Tipos que precisam de novos campos**

1. **Cliente**:
```typescript
arquivado?: boolean;
dataArquivamento?: Date;
motivoArquivamento?: string;
```

2. **Evento**:
```typescript
arquivado?: boolean;
dataArquivamento?: Date;
motivoArquivamento?: string;
// Já tem status que pode ser usado para "Cancelado"
```

3. **Pagamento**:
```typescript
cancelado?: boolean;
dataCancelamento?: Date;
motivoCancelamento?: string;
```

4. **CustoEvento**:
```typescript
removido?: boolean;
dataRemocao?: Date;
motivoRemocao?: string;
```

5. **ServicoEvento**:
```typescript
removido?: boolean;
dataRemocao?: Date;
motivoRemocao?: string;
```

---

## 🚀 Fases de Implementação

### **FASE 1: Implementar Inativação (Alta Prioridade)**
1. TipoServico
2. TipoCusto
3. CanalEntrada
4. TipoEvento

**Benefício**: Protege dados históricos mais críticos

---

### **FASE 2: Implementar Arquivamento (Crítica)**
1. Cliente
2. Evento

**Benefício**: Protege dados financeiros e relacionamentos

---

### **FASE 3: Implementar Marcação de Remoção (Alta Prioridade)**
1. Pagamento
2. CustoEvento
3. ServicoEvento

**Benefício**: Mantém auditoria e cálculos corretos

---

### **FASE 4: Validações e Bloqueios (Média Prioridade)**
1. Plano (bloquear inativação se há assinaturas ativas)
2. Funcionalidade (bloquear inativação se está em planos ativos)
3. Cliente (bloquear arquivamento se há eventos futuros)

**Benefício**: Previne ações destrutivas acidentais

---

## ❓ Perguntas para Escalar o Escopo

1. **Cliente**: Deve haver limite de tempo antes de permitir arquivamento? (ex: só arquivar clientes sem eventos há X meses?)

2. **Evento**: Eventos cancelados devem ter tratamento diferente de arquivados? Ou cancelado = arquivado automaticamente?

3. **Anexos**: Deve haver backup automático antes de deletar? Ou confirmação dupla é suficiente?

4. **Relatórios**: Deve haver filtro para incluir/excluir itens arquivados/inativos nos relatórios?

5. **Interface**: Deve haver uma página/área dedicada para gerenciar itens arquivados/inativos?

6. **Auditoria**: Deve haver log de quem arquivou/inativou e quando? (já pode existir via `dataAtualizacao`)

---

## ✅ Próximos Passos Recomendados

1. **Validar as propostas** com stakeholders
2. **Responder perguntas** de escopo
3. **Priorizar fases** conforme necessidade do negócio
4. **Implementar FASE 1** (mais segura e rápida)
5. **Testar** em ambiente de desenvolvimento
6. **Migrar** dados existentes se necessário (caso haja exclusões recentes)
7. **Documentar** para usuários finais

---

**Documento criado em**: 2025-01-XX
**Status**: Aguardando aprovação e respostas às perguntas de escopo

