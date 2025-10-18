# Sistema de Custos e Anexos por Evento - Documentação Step-by-Step

## Visão Geral

Este documento detalha a implementação do sistema de custos e anexos para eventos, permitindo o controle completo dos custos de prestação de serviço e o anexo de contratos PDF para verificação rápida.

## Estrutura Implementada

### 1. Tipos de Dados (`src/types/index.ts`)

#### TipoCusto
- **id**: Identificador único
- **nome**: Nome do tipo de custo (ex: TOTEM, PROMOTER, MOTORISTA)
- **descricao**: Descrição opcional
- **categoria**: Categoria do custo (Serviço, Promoter, Motorista, Frete, Insumos, Impostos, Outros)
- **ativo**: Status ativo/inativo
- **dataCadastro**: Data de criação

#### CustoEvento
- **id**: Identificador único
- **eventoId**: ID do evento vinculado
- **evento**: Objeto do evento
- **tipoCustoId**: ID do tipo de custo
- **tipoCusto**: Objeto do tipo de custo
- **valor**: Valor do custo
- **quantidade**: Quantidade (opcional)
- **observacoes**: Observações adicionais
- **dataCadastro**: Data de criação

#### AnexoEvento
- **id**: Identificador único
- **eventoId**: ID do evento vinculado
- **evento**: Objeto do evento
- **nome**: Nome do arquivo
- **tipo**: Tipo do arquivo (PDF, Imagem, Documento, Outro)
- **url**: URL do arquivo
- **tamanho**: Tamanho em bytes
- **dataUpload**: Data do upload

#### ResumoCustosEvento
- **custos**: Array de custos
- **total**: Valor total dos custos
- **porCategoria**: Soma por categoria
- **quantidadeItens**: Quantidade de itens

### 2. Dados Mockados (`src/lib/mockData.ts`)

#### Tipos de Custo Pré-definidos
- **TOTEM** - Serviço
- **PROMOTER** - Promoter
- **MOTORISTA** - Motorista
- **FRETE** - Frete
- **INSUMOS** - Insumos
- **IMPOSTOS** - Impostos
- **P360** - Serviço
- **LAMBE-LAMBE** - Serviço
- **INSTACLICK** - Serviço
- **CLICKBOOK** - Serviço

#### Exemplo de Custos de Evento
```
TOTEM - 40
PROMOTER - 50
PROMOTER - 100
PROMOTER - 20
MOTORISTA - 100
FRETE - 60
INSUMOS - 40
IMPOSTOS - 30
TOTAL - 440
```

### 3. Funções CRUD Implementadas

#### Tipos de Custo
- `createTipoCusto()` - Cria novo tipo de custo
- `updateTipoCusto()` - Atualiza tipo de custo
- `deleteTipoCusto()` - Remove tipo de custo
- `getTipoCustoById()` - Busca tipo por ID

#### Custos de Evento
- `createCustoEvento()` - Cria novo custo
- `updateCustoEvento()` - Atualiza custo existente
- `deleteCustoEvento()` - Remove custo
- `getCustosByEventoId()` - Busca custos por evento
- `getCustoEventoById()` - Busca custo por ID
- `getResumoCustosEvento()` - Calcula resumo de custos

#### Anexos de Evento
- `createAnexoEvento()` - Cria novo anexo
- `updateAnexoEvento()` - Atualiza anexo
- `deleteAnexoEvento()` - Remove anexo
- `getAnexosByEventoId()` - Busca anexos por evento

### 4. Componentes Criados

#### CustoForm (`src/components/forms/CustoForm.tsx`)
**Função:** Formulário para cadastro e edição de custos
**Características:**
- Suporte a tipo de custo existente ou novo
- Validação completa de campos
- Criação de tipos de custo em tempo real
- Campos organizados em seções lógicas

**Seções:**
1. **Tipo de Custo** - Seleção ou criação de tipo
2. **Dados do Custo** - Valor, quantidade e observações

#### CustosEvento (`src/components/CustosEvento.tsx`)
**Função:** Gerenciamento completo de custos do evento
**Características:**
- Resumo financeiro visual
- Lista de custos com categorias
- Ações CRUD completas
- Cálculos automáticos

**Funcionalidades:**
- **Resumo:** Cards com total, quantidade de itens e categorias
- **Lista:** Custos organizados por categoria
- **Ações:** Criar, editar e excluir custos
- **Categorias:** Indicadores visuais coloridos

#### AnexosEvento (`src/components/AnexosEvento.tsx`)
**Função:** Gerenciamento de anexos (PDF do contrato)
**Características:**
- Upload de arquivos PDF
- Visualização de anexos
- Controle de tamanho e tipo
- Interface drag & drop

**Funcionalidades:**
- **Upload:** Área de upload com drag & drop
- **Lista:** Anexos com informações detalhadas
- **Visualização:** Abertura de arquivos em nova aba
- **Controle:** Exclusão de anexos

### 5. Integração com Página de Evento

#### Atualizações em `src/app/eventos/[id]/page.tsx`
- Carregamento de custos e anexos
- Estados reativos para atualizações
- Handlers para mudanças nos dados
- Integração com componentes

## Fluxo de Navegação

### 1. Visualização de Custos
```
/eventos → Visualizar Evento → /eventos/[id] → Seção Custos
```

### 2. Adição de Custo
```
/eventos/[id] → Novo Custo → Formulário → Salvar → Atualiza Lista
```

### 3. Edição de Custo
```
/eventos/[id] → Editar Custo → Formulário → Salvar → Atualiza Lista
```

### 4. Upload de Contrato
```
/eventos/[id] → Upload PDF → Selecionar Arquivo → Upload → Lista Anexos
```

## Categorias de Custos

### Categorias Disponíveis
- **Serviço** - Custos relacionados aos serviços (TOTEM, P360, etc.)
- **Promoter** - Custos com promoters
- **Motorista** - Custos com motorista
- **Frete** - Custos de frete
- **Insumos** - Custos com insumos
- **Impostos** - Custos com impostos
- **Outros** - Outros custos diversos

### Indicadores Visuais
- **Azul** - Serviços
- **Verde** - Promoters
- **Amarelo** - Motorista
- **Roxo** - Frete
- **Laranja** - Insumos
- **Vermelho** - Impostos
- **Cinza** - Outros

## Resumo Financeiro

### Métricas Exibidas
1. **Valor Total** - Soma de todos os custos
2. **Quantidade de Itens** - Número total de custos
3. **Categorias** - Número de categorias utilizadas
4. **Custos por Categoria** - Distribuição visual por categoria

## Upload de Arquivos

### Tipos Suportados
- **PDF** - Contratos e documentos
- **Imagem** - Fotos e imagens
- **Documento** - Outros documentos
- **Outro** - Outros tipos de arquivo

### Funcionalidades
- **Drag & Drop** - Arrastar arquivos para upload
- **Validação** - Verificação de tipo e tamanho
- **Preview** - Visualização antes do upload
- **Progresso** - Indicador de progresso do upload

## Validações Implementadas

### Campos Obrigatórios
- **Tipo de Custo** - Seleção obrigatória
- **Valor** - Deve ser maior que zero
- **Nome do Tipo** - Para novos tipos de custo

### Validações de Formato
- Valores numéricos positivos
- Quantidades inteiras positivas
- Nomes de arquivo válidos

### Validações de Negócio
- Tipo de custo deve existir ou ser criado
- Quantidade deve ser maior que zero
- Arquivos devem ser do tipo correto

## Responsividade

### Mobile
- Cards empilhados verticalmente
- Formulários em coluna única
- Botões de ação adaptados
- Upload otimizado para touch

### Desktop
- Grid responsivo para resumo
- Formulários em 2 colunas
- Layout otimizado para tela grande
- Upload com drag & drop

## Acessibilidade

### Recursos Implementados
- Labels associados aos campos
- Navegação por teclado
- Contraste adequado
- Textos descritivos
- Estados de foco visíveis
- Ícones semânticos

## Integração com Sistema Existente

### Compatibilidade
- Usa tipos existentes do sistema
- Integra com dados mockados
- Mantém consistência visual
- Segue padrões estabelecidos

### Dependências
- **Eventos:** Base para vinculação
- **Tipos de Custo:** Catálogo de custos
- **Anexos:** Arquivos do evento

## Tratamento de Erros

### Validação de Formulário
- Mensagens de erro específicas
- Validação em tempo real
- Prevenção de envio com dados inválidos

### Upload de Arquivos
- Validação de tipo de arquivo
- Verificação de tamanho
- Tratamento de erros de upload

### Estados de Carregamento
- Indicadores visuais
- Mensagens informativas
- Feedback ao usuário

## Funcionalidades Avançadas

### Cálculos Automáticos
- Resumo financeiro em tempo real
- Soma por categoria
- Contadores de itens

### Criação Dinâmica
- Criação de tipos de custo em tempo real
- Validação de nomes únicos
- Categorização automática

### Upload Inteligente
- Detecção automática de tipo
- Validação de formato
- Preview de arquivos

## Próximos Passos Sugeridos

### Melhorias de UX
1. **Filtros Avançados** - Filtrar custos por categoria, valor, período
2. **Exportação** - Exportar relatório de custos em PDF/Excel
3. **Templates** - Templates de custos para eventos similares
4. **Gráficos** - Visualização gráfica da distribuição de custos

### Funcionalidades Avançadas
1. **Orçamento** - Comparação custos vs orçamento
2. **Aprovação** - Fluxo de aprovação de custos
3. **Relatórios** - Relatórios detalhados de custos
4. **Integração** - Integração com sistemas de contabilidade

### Melhorias Técnicas
1. **Testes Unitários** - Cobertura de testes para cálculos
2. **Otimização de Performance** - Cache de cálculos
3. **Auditoria** - Log de alterações em custos
4. **API** - Endpoints para integração externa

## Conclusão

O sistema de custos e anexos foi implementado com sucesso, oferecendo:

1. **Controle Completo** - Gestão total dos custos de prestação
2. **Interface Intuitiva** - Formulários organizados e visuais claros
3. **Validação Robusta** - Prevenção de erros e dados inválidos
4. **Responsividade** - Funciona em todos os dispositivos
5. **Acessibilidade** - Usável por todos os usuários
6. **Integração Perfeita** - Vinculação completa com eventos

O sistema permite o controle financeiro detalhado de cada evento, facilitando o cálculo de custos e a definição de preços adequados, além de manter os contratos PDF organizados para verificação rápida.
