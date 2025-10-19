// Definição das collections do Firestore com prefixo controle_

export const COLLECTIONS = {
  // Usuários do sistema (NextAuth)
  USERS: 'controle_users',
  
  // Entidades principais
  CLIENTES: 'controle_clientes',
  EVENTOS: 'controle_eventos',
  PAGAMENTOS: 'controle_pagamentos',
  
  // Custos e tipos
  TIPO_CUSTOS: 'controle_tipo_custos',
  CUSTOS: 'controle_custos',
  HISTORICO_PAGAMENTOS: 'controle_historico_pagamentos',
  
  // Serviços e contratos
  SERVICOS: 'controle_servicos',
  PACOTES_SERVICOS: 'controle_pacotes_servicos',
  CONTRATOS_SERVICOS: 'controle_contratos_servicos',
  
  // Profissionais e recursos
  PROMOTERS: 'controle_promoters',
  INSUMOS: 'controle_insumos',
  
  // Anexos e documentos
  ANEXOS_EVENTOS: 'controle_anexos_eventos',
} as const;

// Estrutura das collections para documentação
export const COLLECTION_SCHEMAS = {
  [COLLECTIONS.USERS]: {
    id: 'string',
    email: 'string',
    name: 'string',
    role: 'string',
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  },
  
  [COLLECTIONS.CLIENTES]: {
    id: 'string',
    nome: 'string',
    cpf: 'string',
    email: 'string',
    telefone: 'string',
    endereco: 'string',
    cep: 'string',
    instagram: 'string?',
    comoConheceu: 'string?',
    dataCadastro: 'timestamp'
  },
  
  [COLLECTIONS.EVENTOS]: {
    id: 'string',
    clienteId: 'string',
    dataEvento: 'timestamp',
    diaSemana: 'string',
    local: 'string',
    endereco: 'string',
    tipoEvento: 'string',
    horarioInicio: 'string',
    horarioInicioServico: 'string',
    horarioTerminoServico: 'string',
    horarioDesmontagem: 'string',
    tempoEvento: 'string',
    contratante: 'string',
    numeroConvidados: 'number',
    quantidadeMesas: 'number?',
    hashtag: 'string?',
    numeroImpressoes: 'number?',
    cerimonialista: 'object?',
    observacoes: 'string?',
    status: 'string',
    valorTotal: 'number',
    diaFinalPagamento: 'timestamp',
    dataCadastro: 'timestamp',
    dataAtualizacao: 'timestamp'
  },
  
  [COLLECTIONS.PAGAMENTOS]: {
    id: 'string',
    eventoId: 'string',
    valor: 'number',
    dataPagamento: 'timestamp',
    formaPagamento: 'string',
    status: 'string',
    observacoes: 'string?',
    comprovante: 'string?',
    dataCadastro: 'timestamp',
    dataAtualizacao: 'timestamp'
  },
  
  [COLLECTIONS.TIPO_CUSTOS]: {
    id: 'string',
    nome: 'string',
    descricao: 'string',
    ativo: 'boolean',
    dataCadastro: 'timestamp'
  },
  
  [COLLECTIONS.CUSTOS]: {
    id: 'string',
    eventoId: 'string',
    tipoCustoId: 'string',
    valor: 'number',
    quantidade: 'number?',
    observacoes: 'string?',
    dataCadastro: 'timestamp'
  },
  
  [COLLECTIONS.ANEXOS_EVENTOS]: {
    id: 'string',
    eventoId: 'string',
    nome: 'string',
    tipo: 'string',
    url: 'string',
    tamanho: 'number',
    dataUpload: 'timestamp'
  }
} as const;
