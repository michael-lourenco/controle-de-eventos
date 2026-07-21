# Schema alvo — CUSTOS FIXOS

Fonte de verdade final: `supabase/schema.sql`. Este arquivo é o rascunho da migration.

```sql
-- ============================================
-- TIPOS DE CUSTO FIXO
-- ============================================
CREATE TABLE IF NOT EXISTS tipo_custos_fixos (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_tipo_custos_fixos_user_id ON tipo_custos_fixos(user_id);
CREATE INDEX IF NOT EXISTS idx_tipo_custos_fixos_ativo ON tipo_custos_fixos(ativo) WHERE ativo = true;

-- ============================================
-- CUSTOS FIXOS (sem vínculo com eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS custos_fixos (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_custo_fixo_id VARCHAR(255) NOT NULL REFERENCES tipo_custos_fixos(id) ON DELETE RESTRICT,
  valor DECIMAL(10,2) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  data_pagamento DATE NOT NULL,
  descricao TEXT,
  removido BOOLEAN NOT NULL DEFAULT false,
  data_remocao TIMESTAMPTZ,
  motivo_remocao TEXT,
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custos_fixos_user_id ON custos_fixos(user_id);
CREATE INDEX IF NOT EXISTS idx_custos_fixos_data_pagamento ON custos_fixos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_custos_fixos_tipo ON custos_fixos(tipo_custo_fixo_id);
CREATE INDEX IF NOT EXISTS idx_custos_fixos_ativos
  ON custos_fixos(user_id, removido) WHERE removido = false;

-- Trigger data_atualizacao (reutilizar função existente do projeto se houver)
-- CREATE TRIGGER ... update_updated_at_column ...

-- ============================================
-- ANEXOS DE CUSTO FIXO
-- ============================================
CREATE TABLE IF NOT EXISTS anexos_custo_fixo (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custo_fixo_id VARCHAR(255) NOT NULL REFERENCES custos_fixos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  tamanho BIGINT NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  data_upload TIMESTAMPTZ DEFAULT NOW(),
  data_cadastro TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anexos_custo_fixo_user_id ON anexos_custo_fixo(user_id);
CREATE INDEX IF NOT EXISTS idx_anexos_custo_fixo_custo ON anexos_custo_fixo(custo_fixo_id);
```

## Diferenças vs custos de evento

| Aspecto | `custos` | `custos_fixos` |
|---------|----------|-----------------|
| Evento | `evento_id` obrigatório | não existe |
| Tipo | `tipo_custo_id` → `tipo_custos` | `tipo_custo_fixo_id` → `tipo_custos_fixos` |
| Data | só `data_cadastro` | `data_pagamento` explícita |
| Quantidade | tem `quantidade` (default 1) | tem `quantidade` (default 1) — mesmo padrão |
| Anexo | exige `evento_id` | só `custo_fixo_id` |
