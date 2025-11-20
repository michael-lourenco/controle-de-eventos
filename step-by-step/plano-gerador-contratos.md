# 📄 Plano de Ação: Gerador de Contratos

## 📋 Resumo Executivo

Implementação de um sistema completo de geração de contratos com:
- Criação a partir de eventos ou menu dedicado
- Campos fixos (configuráveis) e dinâmicos
- Modelos de contrato pré-definidos
- Geração de PDF
- Armazenamento e histórico

---

## 🎯 Objetivos

1. **Gerar contratos** a partir de eventos ou criação manual
2. **Preencher dados** automaticamente quando vinculado a evento
3. **Permitir edição** de campos fixos e dinâmicos
4. **Escolher modelo** de contrato pré-definido
5. **Gerar PDF** do contrato finalizado
6. **Armazenar contratos** gerados com histórico

---

## 📊 Fase 1: Estrutura de Dados

### 1.1. Tipos TypeScript (`src/types/index.ts`)

```typescript
/**
 * Modelo de Contrato - Template pré-definido
 */
export interface ModeloContrato {
  id: string;
  nome: string; // Ex: "Contrato de Prestação de Serviços - Eventos"
  descricao?: string;
  template: string; // HTML/Markdown com placeholders {{campo}}
  campos: CampoContrato[]; // Campos que o template utiliza
  ativo: boolean;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

/**
 * Campo do Contrato - Define campos disponíveis
 */
export interface CampoContrato {
  id: string;
  chave: string; // Ex: "nome_contratante", "valor_total"
  label: string; // Ex: "Nome do Contratante"
  tipo: 'text' | 'number' | 'date' | 'currency' | 'textarea' | 'select';
  obrigatorio: boolean;
  valorPadrao?: string; // Para campos fixos
  opcoes?: string[]; // Para tipo select
  ordem: number; // Ordem de exibição no formulário
}

/**
 * Configuração de Campos Fixos - Dados da empresa
 */
export interface ConfiguracaoContrato {
  id: string;
  userId: string;
  // Dados da Empresa (fixos, mas editáveis)
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
    site?: string;
  };
  dadosBancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipo: 'corrente' | 'poupanca';
    pix?: string;
  };
  dataCadastro: Date;
  dataAtualizacao: Date;
}

/**
 * Contrato Gerado
 */
export interface Contrato {
  id: string;
  userId: string;
  eventoId?: string; // Opcional - se gerado a partir de evento
  evento?: Evento; // Populado quando eventoId existe
  modeloContratoId: string;
  modeloContrato?: ModeloContrato;
  
  // Dados preenchidos no contrato
  dadosPreenchidos: Record<string, any>; // { "nome_contratante": "João Silva", ... }
  
  // Status
  status: 'rascunho' | 'gerado' | 'assinado' | 'cancelado';
  
  // Arquivos
  pdfUrl?: string; // URL do PDF gerado (S3)
  pdfPath?: string; // Caminho no S3
  
  // Metadados
  numeroContrato?: string; // Ex: "CON-2025-001"
  dataGeracao: Date;
  dataAssinatura?: Date;
  assinadoPor?: string; // Nome de quem assinou
  observacoes?: string;
  
  // Auditoria
  dataCadastro: Date;
  dataAtualizacao: Date;
  criadoPor: string; // userId
}
```

### 1.2. Collections Firestore (`src/lib/firestore/collections.ts`)

```typescript
export const COLLECTIONS = {
  // ... existentes
  
  // Novas collections
  MODELOS_CONTRATO: 'modelos_contrato', // Collection global (todos usuários)
  CONFIGURACAO_CONTRATO: 'configuracao_contrato', // Subcollection de users
  CONTRATOS: 'contratos', // Subcollection de users
} as const;
```

---

## 🏗️ Fase 2: Repositórios

### 2.1. ModeloContratoRepository (`src/lib/repositories/modelo-contrato-repository.ts`)

**Responsabilidades:**
- CRUD de modelos de contrato
- Listar modelos ativos
- Buscar modelo por ID
- Validar template (verificar placeholders)

**Métodos:**
```typescript
- findAll(): Promise<ModeloContrato[]>
- findById(id: string): Promise<ModeloContrato | null>
- findAtivos(): Promise<ModeloContrato[]>
- create(data: Omit<ModeloContrato, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<ModeloContrato>
- update(id: string, data: Partial<ModeloContrato>): Promise<ModeloContrato>
- delete(id: string): Promise<void>
- validarTemplate(template: string, campos: CampoContrato[]): { valido: boolean; erros: string[] }
```

### 2.2. ConfiguracaoContratoRepository (`src/lib/repositories/configuracao-contrato-repository.ts`)

**Responsabilidades:**
- Gerenciar configuração de campos fixos por usuário
- Uma configuração por usuário (singleton)

**Métodos:**
```typescript
- findByUserId(userId: string): Promise<ConfiguracaoContrato | null>
- createOrUpdate(userId: string, data: Partial<ConfiguracaoContrato>): Promise<ConfiguracaoContrato>
- getCamposFixos(userId: string): Promise<Record<string, any>>
```

### 2.3. ContratoRepository (`src/lib/repositories/contrato-repository.ts`)

**Responsabilidades:**
- CRUD de contratos
- Buscar contratos por evento
- Gerar número de contrato sequencial
- Listar com filtros

**Métodos:**
```typescript
- findAll(userId: string): Promise<Contrato[]>
- findById(id: string, userId: string): Promise<Contrato | null>
- findByEventoId(eventoId: string, userId: string): Promise<Contrato[]>
- create(data: Omit<Contrato, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Promise<Contrato>
- update(id: string, data: Partial<Contrato>, userId: string): Promise<Contrato>
- delete(id: string, userId: string): Promise<void>
- gerarNumeroContrato(userId: string): Promise<string> // CON-2025-001, CON-2025-002...
- contarPorStatus(userId: string): Promise<Record<string, number>>
```

---

## 🎨 Fase 3: Interface do Usuário

### 3.1. Página de Contratos (`src/app/contratos/page.tsx`)

**Funcionalidades:**
- Lista de contratos gerados
- Filtros: status, data, evento
- Botão "Novo Contrato"
- Visualização rápida (card com resumo)
- Ações: visualizar, editar, baixar PDF, excluir

**Componentes:**
- `ContratosList` - Lista de contratos
- `ContratoCard` - Card individual
- `FiltrosContratos` - Filtros de busca

### 3.2. Página de Criação/Edição (`src/app/contratos/novo/page.tsx` e `/contratos/[id]/page.tsx`)

**Fluxo:**
1. **Selecionar origem:**
   - Opção 1: "Criar a partir de evento" → Selecionar evento
   - Opção 2: "Criar manualmente" → Pular para passo 2

2. **Selecionar modelo:**
   - Lista de modelos disponíveis
   - Preview do modelo (opcional)

3. **Preencher dados:**
   - **Campos fixos** (pré-preenchidos, editáveis):
     - Dados da empresa (da configuração)
     - Se veio de evento: dados do evento/cliente
   - **Campos dinâmicos** (preencher):
     - Formulário dinâmico baseado nos campos do modelo
     - Validação de campos obrigatórios

4. **Preview do contrato:**
   - Visualização com dados preenchidos
   - Placeholders substituídos

5. **Gerar PDF:**
   - Botão "Gerar Contrato"
   - Processar template
   - Gerar PDF
   - Salvar no S3
   - Salvar contrato no Firestore

**Componentes:**
- `ContratoForm` - Formulário principal
- `SelecaoEvento` - Seleção de evento (se aplicável)
- `SelecaoModelo` - Seleção de modelo
- `CamposContrato` - Formulário dinâmico de campos
- `PreviewContrato` - Preview do contrato
- `GeracaoPDF` - Processo de geração

### 3.3. Integração com Eventos

**Na página de evento (`src/app/eventos/[id]/page.tsx`):**
- Botão "Gerar Contrato" na seção de ações
- Ao clicar, redireciona para `/contratos/novo?eventoId={id}`
- Pré-preenche dados do evento

**Na lista de eventos (`src/app/eventos/page.tsx`):**
- Ação rápida "Gerar Contrato" no menu de ações do card

### 3.4. Menu de Navegação (`src/components/Layout.tsx`)

Adicionar item:
```typescript
{ name: 'Contratos', href: '/contratos', icon: DocumentTextIcon },
```

---

## 🔧 Fase 4: Serviços

### 4.1. ContratoService (`src/lib/services/contrato-service.ts`)

**Responsabilidades:**
- Lógica de negócio de contratos
- Processamento de templates
- Integração com geração de PDF

**Métodos:**
```typescript
- preencherDadosDoEvento(evento: Evento, modelo: ModeloContrato): Promise<Record<string, any>>
- processarTemplate(template: string, dados: Record<string, any>): string
- validarDadosPreenchidos(dados: Record<string, any>, campos: CampoContrato[]): { valido: boolean; erros: string[] }
- gerarNumeroContrato(userId: string): Promise<string>
```

### 4.2. PDFService (`src/lib/services/pdf-service.ts`)

**Responsabilidades:**
- Gerar PDF a partir de HTML
- Upload para S3
- Estilização do PDF

**Tecnologia sugerida:**
- `puppeteer` ou `@react-pdf/renderer` ou `pdfkit`
- Recomendação: `puppeteer` (mais flexível para HTML complexo)

**Métodos:**
```typescript
- gerarPDF(html: string, opcoes?: PDFOptions): Promise<Buffer>
- uploadPDF(buffer: Buffer, userId: string, contratoId: string): Promise<{ url: string; path: string }>
- gerarPDFContrato(contrato: Contrato): Promise<{ url: string; path: string }>
```

**Dependência a adicionar:**
```json
"puppeteer": "^21.0.0"
// ou
"@react-pdf/renderer": "^3.0.0"
```

### 4.3. TemplateService (`src/lib/services/template-service.ts`)

**Responsabilidades:**
- Processar templates com placeholders
- Validar placeholders
- Substituir valores

**Métodos:**
```typescript
- processarPlaceholders(template: string, dados: Record<string, any>): string
- extrairPlaceholders(template: string): string[]
- validarPlaceholders(template: string, campos: CampoContrato[]): boolean
```

---

## 📡 Fase 5: API Routes

### 5.1. `/api/contratos` (GET, POST)

**GET:**
- Listar contratos do usuário
- Query params: `status`, `eventoId`, `dataInicio`, `dataFim`

**POST:**
- Criar novo contrato
- Body: `{ eventoId?, modeloContratoId, dadosPreenchidos, status }`

### 5.2. `/api/contratos/[id]` (GET, PUT, DELETE)

**GET:**
- Buscar contrato por ID

**PUT:**
- Atualizar contrato

**DELETE:**
- Excluir contrato (soft delete ou hard delete)

### 5.3. `/api/contratos/[id]/gerar-pdf` (POST)

**POST:**
- Gerar PDF do contrato
- Retorna URL do PDF gerado

### 5.4. `/api/modelos-contrato` (GET)

**GET:**
- Listar modelos disponíveis
- Apenas modelos ativos

### 5.5. `/api/configuracao-contrato` (GET, PUT)

**GET:**
- Buscar configuração do usuário

**PUT:**
- Criar ou atualizar configuração

### 5.6. `/api/contratos/preview` (POST)

**POST:**
- Preview do contrato sem salvar
- Body: `{ modeloContratoId, dadosPreenchidos }`
- Retorna HTML processado

---

## 🎯 Fase 6: Modelos Pré-definidos

### 6.1. Modelos Iniciais

Criar script de inicialização (`src/lib/seed/modelos-contrato.ts`):

**Modelo 1: Contrato de Prestação de Serviços - Eventos**
- Campos: dados empresa, dados cliente, dados evento, valor, condições de pagamento, cláusulas

**Modelo 2: Contrato Simples**
- Versão simplificada com campos essenciais

**Modelo 3: Termo de Compromisso**
- Para eventos confirmados

### 6.2. Estrutura de Template

**Formato sugerido: HTML com placeholders:**
```html
<h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

<p>
  <strong>CONTRATANTE:</strong> {{nome_contratante}}<br>
  <strong>CPF/CNPJ:</strong> {{cpf_contratante}}<br>
  <strong>ENDEREÇO:</strong> {{endereco_contratante}}
</p>

<p>
  <strong>CONTRATADO:</strong> {{razao_social}}<br>
  <strong>CNPJ:</strong> {{cnpj}}<br>
  <strong>ENDEREÇO:</strong> {{endereco_empresa}}
</p>

<h2>OBJETO</h2>
<p>O presente contrato tem por objeto a prestação de serviços de {{tipo_servico}}...</p>

<h2>VALOR</h2>
<p>O valor total do contrato é de <strong>R$ {{valor_total}}</strong>...</p>
```

---

## ✅ Fase 7: Validações e Regras de Negócio

### 7.1. Validações

- **Campos obrigatórios:** Validar antes de gerar PDF
- **Template válido:** Todos os placeholders devem ter valores
- **Evento válido:** Se vinculado a evento, evento deve existir
- **Modelo ativo:** Apenas modelos ativos podem ser usados

### 7.2. Regras

- **Número de contrato:** Sequencial por usuário, formato CON-YYYY-NNN
- **Status:** rascunho → gerado → assinado
- **PDF:** Gerado apenas quando status = 'gerado'
- **Edição:** Permitir edição apenas em rascunho
- **Exclusão:** Soft delete ou hard delete (definir política)

---

## 🚀 Melhorias e Considerações Adicionais

### 8.1. Funcionalidades Futuras (Não na primeira versão)

1. **Criação de Modelos pelo Usuário:**
   - Editor de templates
   - Preview em tempo real
   - Biblioteca de modelos personalizados

2. **Assinatura Digital:**
   - Integração com serviços de assinatura (DocuSign, ClickSign)
   - Assinatura eletrônica simples

3. **Histórico de Versões:**
   - Manter versões anteriores do contrato
   - Comparar versões

4. **Notificações:**
   - Email quando contrato é gerado
   - Lembrete de assinatura pendente

5. **Relatórios:**
   - Contratos por período
   - Status de contratos
   - Valores contratados

6. **Campos Calculados:**
   - Cálculos automáticos (descontos, impostos)
   - Fórmulas no template

7. **Anexos:**
   - Anexar documentos ao contrato
   - Termos adicionais

8. **Renovação Automática:**
   - Contratos recorrentes
   - Renovação automática

### 8.2. Melhorias Técnicas

1. **Cache de Templates:**
   - Cachear templates processados
   - Melhorar performance

2. **Queue para Geração de PDF:**
   - Processar PDFs em background
   - Evitar timeout em PDFs grandes

3. **Compressão de PDF:**
   - Otimizar tamanho dos arquivos
   - Reduzir custos de armazenamento

4. **Preview em Tempo Real:**
   - Atualizar preview conforme usuário digita
   - Melhor UX

5. **Exportação:**
   - Exportar para Word
   - Exportar para HTML

6. **Busca Avançada:**
   - Buscar por conteúdo do contrato
   - Filtros complexos

### 8.3. Segurança

1. **Validação de Dados:**
   - Sanitizar HTML do template
   - Validar tipos de dados

2. **Permissões:**
   - Apenas usuário dono pode ver/editar contratos
   - Admin pode ver todos (se necessário)

3. **Auditoria:**
   - Log de alterações
   - Quem gerou, quando, IP

### 8.4. UX/UI

1. **Wizard de Criação:**
   - Passo a passo guiado
   - Progress indicator

2. **Templates Visuais:**
   - Preview visual dos modelos
   - Thumbnails

3. **Drag and Drop:**
   - Reordenar campos
   - Arrastar elementos no template (futuro)

4. **Salvamento Automático:**
   - Salvar rascunho automaticamente
   - Recuperar rascunho não finalizado

---

## 📦 Dependências Necessárias

```json
{
  "dependencies": {
    "puppeteer": "^21.0.0", // Para geração de PDF
    // ou
    "@react-pdf/renderer": "^3.0.0", // Alternativa mais leve
    "html-pdf-node": "^1.0.8" // Alternativa simples
  }
}
```

**Recomendação:** `puppeteer` para máxima flexibilidade, mas requer mais recursos.

---

## 📝 Checklist de Implementação

### Fase 1: Estrutura de Dados
- [ ] Criar tipos TypeScript
- [ ] Adicionar collections no Firestore
- [ ] Criar schemas de validação

### Fase 2: Repositórios
- [ ] ModeloContratoRepository
- [ ] ConfiguracaoContratoRepository
- [ ] ContratoRepository
- [ ] Adicionar ao RepositoryFactory

### Fase 3: Serviços
- [ ] ContratoService
- [ ] PDFService
- [ ] TemplateService
- [ ] Integrar com DataService

### Fase 4: API Routes
- [ ] `/api/contratos` (GET, POST)
- [ ] `/api/contratos/[id]` (GET, PUT, DELETE)
- [ ] `/api/contratos/[id]/gerar-pdf` (POST)
- [ ] `/api/modelos-contrato` (GET)
- [ ] `/api/configuracao-contrato` (GET, PUT)
- [ ] `/api/contratos/preview` (POST)

### Fase 5: Interface
- [ ] Página de listagem (`/contratos`)
- [ ] Página de criação (`/contratos/novo`)
- [ ] Página de edição (`/contratos/[id]`)
- [ ] Componentes de formulário
- [ ] Preview de contrato
- [ ] Integração com eventos

### Fase 6: Modelos
- [ ] Script de seed de modelos
- [ ] Criar 3 modelos iniciais
- [ ] Testar templates

### Fase 7: Testes
- [ ] Testar criação a partir de evento
- [ ] Testar criação manual
- [ ] Testar geração de PDF
- [ ] Testar validações
- [ ] Testar edição

---

## 🎯 Priorização

**MVP (Primeira Versão):**
1. Estrutura de dados básica
2. 1 modelo de contrato simples
3. Criação manual de contratos
4. Geração de PDF básica
5. Listagem e visualização

**Fase 2:**
1. Criação a partir de eventos
2. Múltiplos modelos
3. Campos fixos configuráveis
4. Preview melhorado

**Fase 3:**
1. Editor de modelos
2. Assinatura digital
3. Histórico de versões

---

## 📊 Estimativa de Esforço

- **Fase 1-2 (Dados + Repositórios):** 4-6 horas
- **Fase 3 (Serviços):** 6-8 horas
- **Fase 4 (API):** 4-6 horas
- **Fase 5 (Interface):** 8-12 horas
- **Fase 6 (Modelos):** 2-4 horas
- **Fase 7 (Testes):** 4-6 horas

**Total estimado:** 28-42 horas

---

**Data de criação:** 2025-01-XX  
**Autor:** Auto (Cursor AI)  
**Status:** Planejamento

