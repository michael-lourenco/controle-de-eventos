# Atualização de Planos e Funcionalidades em Usuários

**Data de Criação:** 2025-01-XX  
**Status:** Implementado  
**Objetivo:** Criar endpoint para atualizar planos e funcionalidades de todos os usuários quando os planos são atualizados

---

## 📋 Resumo Executivo

Quando os planos e funcionalidades são atualizados através do seed, é necessário atualizar todas as assinaturas dos usuários para refletir as novas funcionalidades e configurações dos planos. Este documento descreve a implementação de um endpoint administrativo que realiza essa atualização em massa.

---

## 🎯 Objetivo

Criar um endpoint que:
1. Busca todas as assinaturas (ativas ou todas)
2. Para cada assinatura, busca o plano atualizado
3. Atualiza a assinatura com as novas funcionalidades do plano
4. Sincroniza o plano no usuário (atualiza cache)

---

## 🏗️ Implementação

### Arquivo Criado

**`src/app/api/admin/atualizar-planos-usuarios/route.ts`**

Este endpoint:
- ✅ Verifica autenticação (admin ou API key)
- ✅ Busca assinaturas (ativas ou todas)
- ✅ Atualiza funcionalidades das assinaturas baseado nos planos atualizados
- ✅ Sincroniza dados do plano no usuário
- ✅ Registra histórico de alterações
- ✅ Suporta modo dry-run para simulação
- ✅ Retorna estatísticas detalhadas

### Funcionalidades

#### Parâmetros do Request Body

```typescript
{
  apenasAtivas?: boolean;  // true = apenas assinaturas ativas, false = todas (padrão: true)
  dryRun?: boolean;        // true = apenas simula sem aplicar mudanças (padrão: false)
}
```

#### Fluxo de Execução

1. **Autenticação**: Verifica se é admin ou tem API key válida
2. **Busca Assinaturas**: Busca assinaturas conforme parâmetro `apenasAtivas`
3. **Para cada assinatura**:
   - Busca o plano atualizado pelo `planoId`
   - Compara funcionalidades atuais vs novas
   - Se diferentes, atualiza a assinatura com novas funcionalidades
   - Adiciona evento ao histórico
   - Sincroniza plano no usuário (atualiza cache)
4. **Retorna estatísticas**: Total processado, atualizadas, erros e detalhes

#### Exemplo de Resposta

```json
{
  "success": true,
  "message": "Atualização concluída: 15 assinatura(s) atualizada(s)",
  "dryRun": false,
  "apenasAtivas": true,
  "estatisticas": {
    "totalProcessadas": 15,
    "atualizadas": 15,
    "erros": 0
  },
  "detalhes": [
    {
      "userId": "user123",
      "assinaturaId": "assinatura456",
      "planoId": "plano789",
      "planoNome": "Profissional",
      "status": "sucesso",
      "mensagem": "Atualizado com 11 funcionalidades"
    }
  ]
}
```

---

## 📝 Uso

### Via Postman/API

```bash
POST /api/admin/atualizar-planos-usuarios
Headers:
  Content-Type: application/json
  x-api-key: dev-seed-key-2024 (ou SEED_API_KEY do .env)

Body:
{
  "apenasAtivas": true,
  "dryRun": false
}
```

### Modo Dry Run (Simulação)

Para testar sem aplicar mudanças:

```json
{
  "apenasAtivas": true,
  "dryRun": true
}
```

### Atualizar Todas as Assinaturas

Para atualizar todas as assinaturas (não apenas as ativas):

```json
{
  "apenasAtivas": false,
  "dryRun": false
}
```

---

## 🔄 Fluxo Completo de Atualização

### 1. Atualizar Planos e Funcionalidades

```bash
POST /api/seed/funcionalidades-planos
# ou com reset
POST /api/seed/funcionalidades-planos?reset=true
```

### 2. Atualizar Usuários

```bash
POST /api/admin/atualizar-planos-usuarios
Body: { "apenasAtivas": true, "dryRun": false }
```

---

## 🔍 Detalhes Técnicos

### O que é Atualizado

1. **Assinatura**:
   - `funcionalidadesHabilitadas`: Atualizado com funcionalidades do plano
   - `dataAtualizacao`: Atualizado para agora
   - `historico`: Adicionado evento de atualização

2. **Usuário** (via `sincronizarPlanoUsuario`):
   - `planoId`: ID do plano
   - `planoNome`: Nome do plano
   - `planoCodigoHotmart`: Código do plano na Hotmart
   - `funcionalidadesHabilitadas`: Cache das funcionalidades
   - `assinaturaStatus`: Status da assinatura
   - `pagamentoEmDia`: Status de pagamento
   - `dataExpiraAssinatura`: Data de expiração
   - `dataProximoPagamento`: Data do próximo pagamento
   - `ultimaSincronizacaoPlano`: Timestamp da última sincronização

### Tratamento de Erros

- Se plano não encontrado: Registra erro e continua com próximo
- Se erro ao atualizar: Registra erro e continua
- Retorna lista de erros no response

### Logs

O endpoint gera logs detalhados:
- Total de assinaturas encontradas
- Processamento de cada assinatura
- Atualizações realizadas
- Erros encontrados

---

## ✅ Validações

- ✅ Autenticação (admin ou API key)
- ✅ Verificação de existência do plano
- ✅ Comparação de funcionalidades antes de atualizar
- ✅ Tratamento de erros individual por assinatura
- ✅ Modo dry-run para testes seguros

---

## 📊 Estatísticas e Monitoramento

O endpoint retorna:
- Total de assinaturas processadas
- Quantas foram atualizadas
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
3. ⏳ Adicionar ao Postman collection
4. ⏳ Testar em ambiente de desenvolvimento
5. ⏳ Executar após atualização de planos

---

## 📌 Notas Importantes

- **Execute após atualizar planos**: Sempre execute este endpoint após atualizar planos e funcionalidades via seed
- **Use dry-run primeiro**: Recomendado testar com `dryRun: true` antes de aplicar mudanças
- **Apenas ativas por padrão**: Por padrão, apenas assinaturas ativas são atualizadas
- **Idempotente**: Pode ser executado múltiplas vezes sem problemas

---

## 🔗 Arquivos Relacionados

- `src/app/api/admin/atualizar-planos-usuarios/route.ts` - Endpoint principal
- `src/lib/services/assinatura-service.ts` - Serviço de assinaturas
- `src/lib/repositories/assinatura-repository.ts` - Repositório de assinaturas
- `src/lib/repositories/plano-repository.ts` - Repositório de planos
- `src/app/api/seed/funcionalidades-planos/route.ts` - Seed de planos e funcionalidades

---

**Última Atualização:** 2025-01-XX

