# Spec — CUSTOS FIXOS

**Status:** aprovada para implementação  
**Domínio:** financeiro (independente de eventos)  
**Referência de espelho:** `tipo_custos` + `custos` (de evento) + página `/pagamentos` + `/tipos-custos`

---

## 1. Problema

Hoje **custos** existem apenas atrelados a **eventos** (`custos.evento_id NOT NULL`). O usuário não consegue registrar despesas operacionais recorrentes/avulsas (aluguel, software, internet, etc.) sem inventar um evento.

## 2. Solução

Criar um domínio separado **CUSTOS FIXOS**, com:

1. **Tipos de Custo Fixo** — cadastro de categorias (lookup multi-tenant), espelhando `Tipos de Custo`.
2. **Custos Fixos** — lançamentos com data de pagamento, valor, quantidade, tipo, descrição e anexo, **sem** vínculo com evento.

Custos de evento (`custos` / `tipo_custos`) **não mudam**.

## 3. Escopo

### Incluído
- Schema Supabase: `tipo_custos_fixos`, `custos_fixos`, `anexos_custo_fixo`
- Types, repositórios Supabase, factory, DataService
- APIs create/list/update/delete + upload/list/delete de anexos
- Páginas de menu: `/tipos-custos-fixos` e `/custos-fixos`
- Form + listagem com soft delete
- Feature flags de plano (gate)
- Atualização de rules/architecture do projeto

### Fora de escopo (v1)
- Recorrência automática (gerar lançamentos mensais)
- Integração em relatórios/fluxo de caixa (pode ser fase 2)
- Migração de dados legados
- Reutilizar `tipo_custos` (taxonomia separada por requisito de “mundo à parte”)

## 4. Modelo de dados

### 4.1 `tipo_custos_fixos`
Espelho de `tipo_custos`:

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | VARCHAR(255) PK | UUID |
| `user_id` | VARCHAR(255) NOT NULL | FK users, CASCADE |
| `nome` | VARCHAR(255) NOT NULL | UNIQUE (user_id, nome) |
| `descricao` | TEXT | |
| `ativo` | BOOLEAN DEFAULT true | soft delete = false |
| `data_cadastro` | TIMESTAMPTZ DEFAULT NOW() | |

### 4.2 `custos_fixos`
**Sem `evento_id`.**

| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | VARCHAR(255) PK | |
| `user_id` | VARCHAR(255) NOT NULL | FK users |
| `tipo_custo_fixo_id` | VARCHAR(255) NOT NULL | FK tipo_custos_fixos RESTRICT |
| `valor` | DECIMAL(10,2) NOT NULL | valor unitário |
| `quantidade` | INTEGER NOT NULL DEFAULT 1 | espelho de `custos.quantidade` |
| `data_pagamento` | DATE NOT NULL | campo pedido pelo produto |
| `descricao` | TEXT | |
| `removido` | BOOLEAN DEFAULT false | soft delete |
| `data_remocao` | TIMESTAMPTZ | |
| `motivo_remocao` | TEXT | |
| `data_cadastro` | TIMESTAMPTZ DEFAULT NOW() | |
| `data_atualizacao` | TIMESTAMPTZ DEFAULT NOW() | trigger |

Índices: `user_id`, `data_pagamento`, parcial `(user_id, removido) WHERE removido = false`, `tipo_custo_fixo_id`.

### 4.3 `anexos_custo_fixo`
Espelho de `anexos_custo` **sem** `evento_id`:

| Coluna | Tipo |
|--------|------|
| `id` | VARCHAR(255) PK |
| `user_id` | VARCHAR(255) NOT NULL |
| `custo_fixo_id` | VARCHAR(255) NOT NULL FK CASCADE |
| `nome`, `tipo`, `tamanho`, `s3_key`, `url` | iguais a anexos_custo |
| `data_upload`, `data_cadastro` | TIMESTAMPTZ |

S3 key: `users/{userId}/custos-fixos/{custoFixoId}/anexos/{timestamp}_{filename}`

## 5. Tipos TypeScript (`src/types/index.ts`)

```ts
export interface TipoCustoFixo {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCadastro: Date;
}

export interface CustoFixo {
  id: string;
  tipoCustoFixoId: string;
  tipoCustoFixo?: TipoCustoFixo;
  valor: number;
  quantidade?: number; // default 1
  dataPagamento: Date;
  descricao?: string;
  removido?: boolean;
  dataRemocao?: Date;
  motivoRemocao?: string;
  dataCadastro: Date;
  dataAtualizacao?: Date;
}

export interface AnexoCustoFixo {
  id: string;
  userId: string;
  custoFixoId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  s3Key: string;
  url: string;
  dataUpload: Date;
  dataCadastro: Date;
}
```

## 6. Camadas (obrigatório)

```
Pages/Components → API Routes → DataService → Repositories → Supabase
```

| Peça | Path sugerido |
|------|----------------|
| Repo tipos | `src/lib/repositories/supabase/tipo-custo-fixo-supabase-repository.ts` |
| Repo custos | `src/lib/repositories/supabase/custo-fixo-supabase-repository.ts` |
| Repo anexos | `src/lib/repositories/supabase/anexo-custo-fixo-supabase-repository.ts` |
| Factory | getters em `repository-factory.ts` |
| DataService | `getTiposCustoFixo`, `createCustoFixo`, etc. |
| Form | `src/components/forms/CustoFixoForm.tsx` |
| Página tipos | `src/app/tipos-custos-fixos/page.tsx` |
| Página lista | `src/app/custos-fixos/page.tsx` |

**Nunca** usar Firestore para esta feature. **Nunca** reutilizar `CustoSupabaseRepository` misturando com `evento_id` nullable.

## 7. APIs

| Método | Path | Body / query |
|--------|------|--------------|
| POST | `/api/tipos-custo-fixo/create` | `{ nome, descricao?, ativo? }` |
| POST | `/api/custos-fixos/create` | `{ tipoCustoFixoId, valor, dataPagamento, quantidade?, descricao? }` |
| PUT | `/api/custos-fixos/[id]` | partial update |
| DELETE | `/api/custos-fixos/[id]` | soft delete (`removido`) |
| GET | `/api/custos-fixos` | lista do user (filtros opcionais: período, tipo) |
| POST | `/api/upload-anexo-custo-fixo` | multipart: `file`, `custoFixoId` |
| GET/DELETE | `/api/anexos-custo-fixo` | `custoFixoId`, `anexoId` |

Padrão: `getAuthenticatedUser` + `createApiResponse` / `handleApiError`. Filtrar sempre por `user.id`.

## 8. UI / Menu

Em `Layout.tsx` `navigation`, após **Pagamentos**:

1. `{ name: 'Custos Fixos', href: '/custos-fixos', icon: CurrencyDollarIcon }` (ou ícone distinto)
2. `{ name: 'Tipos de Custo Fixo', href: '/tipos-custos-fixos', icon: CalculatorIcon }` — perto de Tipos de Custo

### `/tipos-custos-fixos`
Espelhar `/tipos-custos`: abas ativos/inativos, create inline, edit, soft delete + reativar, `PlanOverlay`, toasts.

### `/custos-fixos`
Espelhar listagem de `/pagamentos`:
- Lista com filtros (busca, tipo, período via `DateRangeFilter`) — ver `FILTROS.md`
- Botão “Novo custo fixo” → dialog/form
- Colunas: data pagamento, tipo, descrição, quantidade, valor, anexos, ações
- Soft delete com `ConfirmationDialog` → **hard delete** do lançamento (tipos continuam soft delete)
- Total do item na UI: preferir `valor * quantidade` (mesmo padrão visual de custos de evento, se existir)

### `CustoFixoForm`
Campos:
- Data de pagamento (obrigatório)
- Valor (obrigatório)
- Quantidade (obrigatório na UI; default `1` se omitido na API)
- Tipo de custo fixo (`SelectWithSearch`, opção criar novo tipo se padrão do projeto permitir)
- Descrição (textarea)
- Anexo(s) — se feature flag permitir; upload após create ou anexos temporários como em `CustoForm`

## 9. Planos / funcionalidades

Criar códigos Firestore (seed):

| Código | Uso |
|--------|-----|
| `CUSTOS_FIXOS` | Acesso às páginas e CRUD |
| `ANEXOS_CUSTO_FIXO` | Upload/list/delete anexos |

- Incluir `CUSTOS_FIXOS` nos planos que tiverem gestão financeira básica (no mínimo Plano Básico+).
- Gates: `withPlanoValidation` nas APIs de escrita; `temPermissao` / `PlanOverlay` no client.
- Atualizar seed em `src/app/api/seed/funcionalidades-planos/route.ts` e `scripts/executar-seed.ts`.

## 10. Critérios de aceite

- [ ] Usuário cria tipo de custo fixo e vê em ativos
- [ ] Usuário desativa e reativa tipo
- [ ] Usuário cria custo fixo com data, valor, quantidade, tipo, descrição
- [ ] Quantidade default `1` quando não enviada; aceita valores > 1
- [ ] Custo fixo **não** exige nem exibe evento
- [ ] Soft delete remove da listagem ativa
- [ ] Anexo sobe para S3 no path correto e aparece na UI
- [ ] Outro `user_id` não lê/escreve dados (filtro multi-tenant)
- [ ] Sem plano / sem flag: bloqueio consistente (403 + overlay)
- [ ] Itens no menu sidebar desktop + mobile
- [ ] `supabase/schema.sql` atualizado + migration SQL dedicada
- [ ] Código e mensagens em pt-BR

## 11. Ordem de implementação

Ver skill `.cursor/skills/implementar-custos-fixos/SKILL.md` e agent em `AGENTS.md`.

## 12. Não fazer

- Não adicionar `evento_id` nullable em `custos` existentes
- Não misturar tipos de custo de evento com tipos de custo fixo
- Não criar Prisma / ORMs novos
- Não documentar em markdown de produto além desta pasta de specs (salvo step-by-step de sessão)
