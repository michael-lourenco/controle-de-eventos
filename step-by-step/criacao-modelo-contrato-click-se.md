# Criação do Modelo de Contrato Click-se Fotos Instantâneas

## Data: 2025-01-21

## Resumo
Foi criado um novo modelo de contrato baseado exatamente no conteúdo do contrato exemplo presente em `exemplos_contratos/Click-se Contrato - Viviane - Isabella - 21-02-2026.pdf`.

## Processo

### 1. Extração do Conteúdo
- Utilizada biblioteca Python `pdfplumber` para extrair o texto do PDF
- Conteúdo completo do contrato foi analisado e estruturado

### 2. Estrutura do Modelo Criado

**Nome:** `Contrato Click-se Fotos Instantâneas`
**Descrição:** Modelo baseado no contrato padrão Click-se para totens fotográficos

#### Cláusulas Incluídas (exatamente como no original):

1. **CLÁUSULA PRIMEIRA - DO OBJETO**
   - Descrição dos serviços (totem fotográfico)
   - Serviços incluídos (variável: `{{servicos_incluidos}}`)
   - Álbum de assinaturas (condicional: `{{#if album_assinaturas}}`)

2. **CLÁUSULA SEGUNDA - DAS OBRIGAÇÕES DA CONTRATANTE**
   - Tensão elétrica (variável: `{{tensao_eletrica}}`)
   - Espaço útil (variável: `{{espaco_util}}m²`)
   - Obrigações padrão mantidas como no original

3. **CLÁUSULA TERCEIRA – DA REMUNERAÇÃO**
   - Valor formatado (variável: `{{valor_total_formatado}}`)
   - Valor por extenso (variável: `{{valor_total_extenso}}`)
   - Forma de pagamento (variável: `{{forma_pagamento}}`)

4. **CLÁUSULA QUARTA – DA VIGÊNCIA**
   - Data do evento (variável: `{{data_evento}}`)
   - Duração do serviço (variável: `{{duracao_servico}}` horas)
   - Horários de início e término (variáveis: `{{horario_inicio}}`, `{{horario_termino}}`)
   - Local do evento (variável: `{{local_evento}}`)
   - Tolerância para atraso (variável: `{{tolerancia_atraso}}` minutos)

5. **CLÁUSULA QUINTA – DA RESCISÃO**
   - Prazo para rescisão (variável: `{{prazo_rescisao}}` dias)
   - Condições de desistência (variável: `{{condicoes_desistencia}}`)
   - Parágrafos mantidos exatamente como no original

6. **CLÁUSULA SEXTA – DO REGIME JURÍDICO**
   - Texto completo mantido como no original
   - Parágrafo único incluído

7. **CLÁUSULA SÉTIMA – DO FORO DE ELEIÇÃO**
   - Foro de eleição (variável: `{{foro_eleito}}`)

### 3. Campos Variáveis Criados

Total de **27 campos** configurados:

#### Dados do Contratante:
- `nome_contratante` (obrigatório)
- `cpf_contratante` (obrigatório)
- `telefone_contratante` (obrigatório)
- `email_contratante` (obrigatório)
- `endereco_contratante` (obrigatório)
- `cep_contratante` (obrigatório)

#### Dados da Empresa (Contratado):
- `nome_fantasia` (obrigatório)
- `cnpj` (obrigatório)
- `endereco_empresa` (obrigatório)
- `cidade_empresa` (obrigatório)

#### Dados do Serviço:
- `servicos_incluidos` (obrigatório, textarea)
- `tensao_eletrica` (obrigatório)
- `espaco_util` (obrigatório, number)
- `duracao_servico` (obrigatório, number)
- `horario_inicio` (obrigatório)
- `horario_termino` (obrigatório)
- `local_evento` (obrigatório)
- `tolerancia_atraso` (opcional, number)

#### Dados Financeiros:
- `valor_total_formatado` (obrigatório, currency)
- `valor_total_extenso` (obrigatório)
- `forma_pagamento` (obrigatório, textarea)

#### Dados do Evento:
- `data_evento` (obrigatório, date)

#### Outros:
- `prazo_rescisao` (opcional, number)
- `condicoes_desistencia` (opcional, textarea)
- `foro_eleito` (opcional)
- `data_contrato` (obrigatório, date)
- `album_assinaturas` (opcional) - usado para condicional

## Arquivos Modificados

### `src/lib/seed/modelos-contrato.ts`
- Adicionado novo modelo "Contrato Click-se Fotos Instantâneas" ao array de modelos
- Modelo criado antes do modelo genérico existente
- Todos os 27 campos configurados com tipos e obrigatoriedade apropriados

## Características Especiais

1. **Uso de Condicionais Handlebars**: O modelo usa `{{#if album_assinaturas}}` para incluir condicionalmente a menção ao álbum de assinaturas

2. **Formatação HTML**: O template usa HTML inline com estilos CSS para manter formatação consistente:
   - Títulos centralizados e em negrito
   - Textos justificados nas cláusulas
   - Espaçamento apropriado entre seções
   - Assinaturas formatadas com linhas e espaçamento

3. **Fidelidade ao Original**: O modelo segue exatamente a estrutura, redação e ordem das cláusulas do contrato original

## Próximos Passos

1. O modelo estará disponível após executar o seed (quando inicializar modelos)
2. Os campos podem ser preenchidos automaticamente a partir dos dados do evento e da configuração da empresa
3. Pode ser necessário ajustar o `ContratoService.preencherDadosDoEvento()` para mapear os novos campos específicos deste modelo

## Observações

- O modelo mantém toda a legalidade e estrutura jurídica do contrato original
- Todos os textos fixos foram preservados exatamente como no original
- Apenas os dados variáveis foram substituídos por placeholders (`{{variavel}}`)
- O formato de assinaturas no final do documento foi mantido idêntico ao original

