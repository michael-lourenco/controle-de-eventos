# Migração: ENTERPRISE_MENSAL → PREMIUM_MENSAL

**Data de Criação:** 2025-01-XX  
**Status:** Implementado  
**Objetivo:** Migrar usuários do plano antigo ENTERPRISE_MENSAL para o novo PREMIUM_MENSAL

---

## 📋 Resumo Executivo

Com a renomeação do plano Enterprise para Premium, é necessário migrar todos os usuários que possuem assinaturas com o código antigo `ENTERPRISE_MENSAL` para o novo código `PREMIUM_MENSAL`. Este documento descreve o endpoint criado para realizar essa migração.

---

## 🎯 Objetivo

Criar um endpoint que:
1. Busca todas as assinaturas com plano `ENTERPRISE_MENSAL`
2. Busca o novo plano `PREMIUM_MENSAL`
3. Atualiza as assinaturas para o novo plano
4. Atualiza os usuários (cache)
5. Registra histórico de migração

---

## 🏗️ Implementação

### Arquivo Criado

**`src/app/api/admin/migrate-enterprise-to-premium/route.ts`**

Este endpoint:
- ✅ Verifica autenticação (admin ou API key)
- ✅ Busca assinaturas com plano antigo (ENTERPRISE_MENSAL)
- ✅ Busca plano novo (PREMIUM_MENSAL)
- ✅ Atualiza assinaturas para o novo plano
- ✅ Atualiza funcionalidades baseado no novo plano
- ✅ Sincroniza dados do plano no usuário
- ✅ Registra histórico de alterações
- ✅ Suporta modo dry-run para simulação
- ✅ Retorna estatísticas detalhadas

### Funcionalidades

#### Parâmetros do Request Body

```typescript
{
  dryRun?: boolean;  // true = apenas simula sem aplicar mudanças (padrão: false)
}
```

#### Fluxo de Execução

1. **Autenticação**: Verifica se é admin ou tem API key válida
2. **Buscar Planos**: 
   - Busca plano antigo (ENTERPRISE_MENSAL)
   - Busca plano novo (PREMIUM_MENSAL)
3. **Buscar Assinaturas**: Busca todas as assinaturas com plano antigo
4. **Para cada assinatura**:
   - Atualiza `planoId` para o novo plano
   - Atualiza `funcionalidadesHabilitadas` com funcionalidades do novo plano
   - Adiciona evento ao histórico
   - Sincroniza plano no usuário (atualiza cache)
5. **Retorna estatísticas**: Total processado, migradas, erros e detalhes

#### Exemplo de Resposta

```json
{
  "success": true,
  "message": "Migração concluída: 5 assinatura(s) migrada(s) de ENTERPRISE_MENSAL para PREMIUM_MENSAL",
  "dryRun": false,
  "estatisticas": {
    "totalProcessadas": 5,
    "migradas": 5,
    "erros": 0
  },
  "detalhes": [
    {
      "userId": "user123",
      "assinaturaId": "assinatura456",
      "status": "sucesso",
      "mensagem": "Migrado de ENTERPRISE_MENSAL para PREMIUM_MENSAL"
    }
  ]
}
```

---

## 📝 Uso

### Via Postman/API

```bash
POST /api/admin/migrate-enterprise-to-premium
Headers:
  Content-Type: application/json
  x-api-key: dev-seed-key-2024 (ou SEED_API_KEY do .env)

Body:
{
  "dryRun": false
}
```

### Modo Dry Run (Simulação)

Para testar sem aplicar mudanças:

```json
{
  "dryRun": true
}
```

---

## 🔄 Fluxo Completo de Migração

### 1. Atualizar Planos (Seed)

Primeiro, execute o seed para criar/atualizar os planos:

```bash
POST /api/seed/funcionalidades-planos
# ou com reset
POST /api/seed/funcionalidades-planos?reset=true
```

Isso garante que o plano `PREMIUM_MENSAL` existe no sistema.

### 2. Migrar Usuários

Depois, execute a migração:

```bash
POST /api/admin/migrate-enterprise-to-premium
Body: { "dryRun": false }
```

---

## 🔍 Detalhes Técnicos

### O que é Atualizado

1. **Assinatura**:
   - `planoId`: Atualizado para ID do plano PREMIUM_MENSAL
   - `funcionalidadesHabilitadas`: Atualizado com funcionalidades do novo plano
   - `dataAtualizacao`: Atualizado para agora
   - `historico`: Adicionado evento de migração

2. **Usuário** (via `sincronizarPlanoUsuario`):
   - `planoId`: ID do novo plano
   - `planoNome`: Nome do novo plano (Premium)
   - `planoCodigoHotmart`: Código do novo plano (PREMIUM_MENSAL)
   - `funcionalidadesHabilitadas`: Cache das funcionalidades
   - `ultimaSincronizacaoPlano`: Timestamp da última sincronização

### Busca de Assinaturas

O endpoint busca assinaturas de duas formas:

1. **Por planoId**: Se o plano antigo (ENTERPRISE_MENSAL) ainda existir no banco
2. **Por códigoHotmart no usuário**: Se o plano antigo já foi removido, busca usuários com `planoCodigoHotmart === 'ENTERPRISE_MENSAL'`

### Tratamento de Erros

- Se plano PREMIUM_MENSAL não encontrado: Retorna erro 400
- Se erro ao atualizar: Registra erro e continua com próximo
- Retorna lista de erros no response

### Logs

O endpoint gera logs detalhados:
- Total de assinaturas encontradas
- Processamento de cada assinatura
- Migrações realizadas
- Erros encontrados

---

## ✅ Validações

- ✅ Autenticação (admin ou API key)
- ✅ Verificação de existência do plano PREMIUM_MENSAL
- ✅ Busca inteligente de assinaturas (por planoId ou códigoHotmart)
- ✅ Tratamento de erros individual por assinatura
- ✅ Modo dry-run para testes seguros

---

## 📊 Estatísticas e Monitoramento

O endpoint retorna:
- Total de assinaturas processadas
- Quantas foram migradas
- Quantas tiveram erros
- Detalhes de cada processamento (sucesso ou erro)

---

## 🔐 Segurança

- Requer autenticação admin ou API key válida
- Em produção, requer autenticação ou API key
- Em desenvolvimento, permite execução sem autenticação

---

## 🚀 Próximos Passos

1. ✅ Endpoint criado e funcional
2. ✅ Documentação criada
3. ✅ Adicionado ao Postman collection
4. ⏳ Testar em ambiente de desenvolvimento
5. ⏳ Executar após atualizar planos via seed

---

## 📌 Notas Importantes

- **Execute seed primeiro**: Sempre execute o seed antes da migração para garantir que o plano PREMIUM_MENSAL existe
- **Use dry-run primeiro**: Recomendado testar com `dryRun: true` antes de aplicar mudanças
- **Idempotente**: Pode ser executado múltiplas vezes sem problemas (não migra novamente se já foi migrado)
- **Histórico preservado**: O histórico da assinatura é preservado e um novo evento é adicionado

---

## 🔗 Arquivos Relacionados

- `src/app/api/admin/migrate-enterprise-to-premium/route.ts` - Endpoint principal
- `src/lib/services/assinatura-service.ts` - Serviço de assinaturas
- `src/lib/repositories/assinatura-repository.ts` - Repositório de assinaturas
- `src/lib/repositories/plano-repository.ts` - Repositório de planos
- `src/app/api/seed/funcionalidades-planos/route.ts` - Seed de planos e funcionalidades

---

**Última Atualização:** 2025-01-XX

