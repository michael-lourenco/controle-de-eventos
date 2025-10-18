import { 
  Cliente, 
  Evento, 
  Servico, 
  PacoteServico, 
  ContratoServico, 
  Pagamento, 
  Promoter, 
  Insumo,
  TipoCusto,
  CustoEvento,
  AnexoEvento,
  ResumoCustosEvento,
  StatusEvento,
  StatusPagamento,
  StatusContrato,
  TipoEvento,
  FormaPagamento
} from '@/types';

// Dados mockados baseados nas planilhas analisadas

export const clientes: Cliente[] = [
  {
    id: '1',
    nome: 'GIOVANNA',
    cpf: '12345678901',
    email: 'giovanna@email.com',
    telefone: '21999999999',
    endereco: 'Rua das Flores, 123',
    cep: '23000-000',
    instagram: '@giovanna',
    comoConheceu: 'Instagram',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '2',
    nome: 'DANIELLE',
    cpf: '12345678902',
    email: 'danielle@email.com',
    telefone: '21999999998',
    endereco: 'Rua das Palmeiras, 456',
    cep: '23000-001',
    instagram: '@danielle',
    comoConheceu: 'Indicação',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    nome: 'VINÍCIUS E NATHÁLIA',
    cpf: '12345678903',
    email: 'vinicius.nathalia@email.com',
    telefone: '21999999997',
    endereco: 'Rua dos Lírios, 789',
    cep: '23000-002',
    instagram: '@viniciusnathalia',
    comoConheceu: 'Facebook',
    dataCadastro: new Date('2023-01-01')
  }
];

export const servicos: Servico[] = [
  {
    id: '1',
    nome: 'TOTEM - 4 HORAS',
    descricao: 'Totem personalizado para fotos com 4 horas de duração',
    categoria: 'Totem',
    duracao: 4,
    precoBase: 1100,
    ativo: true
  },
  {
    id: '2',
    nome: 'P 360 - 4 HORAS',
    descricao: 'Plataforma 360 graus com 4 horas de duração',
    categoria: 'P360',
    duracao: 4,
    precoBase: 990,
    ativo: true
  },
  {
    id: '3',
    nome: 'LAMBE-LAMBE',
    descricao: 'Serviço de lambe-lambe para fotos instantâneas',
    categoria: 'Lambe-lambe',
    duracao: 4,
    precoBase: 1235,
    ativo: true
  },
  {
    id: '4',
    nome: 'INSTACLICK',
    descricao: 'Sistema de fotos instantâneas com hashtag personalizada',
    categoria: 'Instaclick',
    duracao: 4,
    precoBase: 800,
    ativo: true
  },
  {
    id: '5',
    nome: 'CLICKBOOK',
    descricao: 'Livro de fotos personalizado',
    categoria: 'Clickbook',
    duracao: 0,
    precoBase: 400,
    ativo: true
  },
  {
    id: '6',
    nome: 'PERSONALIZAÇÃO DO TOTEM',
    descricao: 'Personalização completa do totem',
    categoria: 'Personalização',
    duracao: 0,
    precoBase: 200,
    ativo: true
  }
];

export const pacotes: PacoteServico[] = [
  {
    id: '1',
    nome: 'PACOTE DIAMANTE (T + I + P + C)',
    descricao: 'Totem + Instaclick + Personalização + Clickbook',
    servicos: [servicos[0], servicos[3], servicos[5], servicos[4]],
    precoTotal: 1680,
    desconto: 0,
    ativo: true
  },
  {
    id: '2',
    nome: 'PACOTE OURO (T + I + P)',
    descricao: 'Totem + Instaclick + Personalização',
    servicos: [servicos[0], servicos[3], servicos[5]],
    precoTotal: 1390,
    desconto: 0,
    ativo: true
  },
  {
    id: '3',
    nome: 'PACOTE PRATA (T + I)',
    descricao: 'Totem + Instaclick',
    servicos: [servicos[0], servicos[3]],
    precoTotal: 1380,
    desconto: 0,
    ativo: true
  },
  {
    id: '4',
    nome: 'PACOTE BRONZE - ATÉ 220 IMP.',
    descricao: 'Pacote básico com até 220 impressões',
    servicos: [servicos[0]],
    precoTotal: 968,
    desconto: 0,
    ativo: true
  }
];

export const promoters: Promoter[] = [
  {
    id: '1',
    nome: 'JÚLIO',
    telefone: '21999999999',
    email: 'julio@email.com',
    especialidades: ['Totem', 'P360', 'Lambe-lambe'],
    custoHora: 62.5,
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '2',
    nome: 'MARLON',
    telefone: '21999999998',
    email: 'marlon@email.com',
    especialidades: ['Totem', 'Instaclick', 'Lambe-lambe'],
    custoHora: 50,
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    nome: 'LETÍCIA',
    telefone: '21999999997',
    email: 'leticia@email.com',
    especialidades: ['Totem', 'Instaclick', 'Clickbook'],
    custoHora: 45,
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    nome: 'MAYARA',
    telefone: '21999999996',
    email: 'mayara@email.com',
    especialidades: ['P360', 'Lambe-lambe', 'Instaclick'],
    custoHora: 40,
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '5',
    nome: 'TATIANA',
    telefone: '21999999995',
    email: 'tatiana@email.com',
    especialidades: ['P360', 'Totem'],
    custoHora: 35,
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  }
];

export const insumos: Insumo[] = [
  {
    id: '1',
    nome: 'Papel Fotográfico',
    descricao: 'Papel para impressão de fotos instantâneas',
    custo: 0.5,
    unidade: 'unidade',
    ativo: true
  },
  {
    id: '2',
    nome: 'Tinta para Impressora',
    descricao: 'Tinta especial para impressão de fotos',
    custo: 25,
    unidade: 'cartucho',
    ativo: true
  },
  {
    id: '3',
    nome: 'Energia Elétrica',
    descricao: 'Consumo de energia elétrica dos equipamentos',
    custo: 0.8,
    unidade: 'kWh',
    ativo: true
  }
];

export const tiposCusto: TipoCusto[] = [
  {
    id: '1',
    nome: 'TOTEM',
    descricao: 'Custo do serviço de totem',
    categoria: 'Serviço',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '2',
    nome: 'PROMOTER',
    descricao: 'Custo com promoters',
    categoria: 'Promoter',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    nome: 'MOTORISTA',
    descricao: 'Custo com motorista',
    categoria: 'Motorista',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    nome: 'FRETE',
    descricao: 'Custo de frete',
    categoria: 'Frete',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '5',
    nome: 'INSUMOS',
    descricao: 'Custo com insumos',
    categoria: 'Insumos',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '6',
    nome: 'IMPOSTOS',
    descricao: 'Custo com impostos',
    categoria: 'Impostos',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '7',
    nome: 'P360',
    descricao: 'Custo do serviço P360',
    categoria: 'Serviço',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '8',
    nome: 'LAMBE-LAMBE',
    descricao: 'Custo do serviço lambe-lambe',
    categoria: 'Serviço',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '9',
    nome: 'INSTACLICK',
    descricao: 'Custo do serviço Instaclick',
    categoria: 'Serviço',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '10',
    nome: 'CLICKBOOK',
    descricao: 'Custo do serviço Clickbook',
    categoria: 'Serviço',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  }
];


export const eventos: Evento[] = [
  {
    id: '1',
    clienteId: '1',
    cliente: clientes[0],
    dataEvento: new Date('2023-01-07'),
    diaSemana: 'SÁBADO',
    local: 'ESPAÇO DAS PALMEIRAS - C G',
    endereco: 'Estr. do Lameirão Pequeno, 550 - Campo Grande, Rio de Janeiro - RJ, 23017-325',
    tipoEvento: TipoEvento.CASAMENTO,
    horarioInicio: '19:30',
    horarioInicioServico: '17:30',
    horarioTerminoServico: '22:30',
    horarioDesmontagem: '22:30',
    tempoEvento: '3 HORAS',
    contratante: 'GIOVANNA',
    numeroConvidados: 150,
    hashtag: '#giovanna2023',
    numeroImpressoes: 500,
    status: StatusEvento.CONCLUIDO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-07')
  },
  {
    id: '2',
    clienteId: '2',
    cliente: clientes[1],
    dataEvento: new Date('2023-01-07'),
    diaSemana: 'SÁBADO',
    local: 'SALÃO DE FESTAS',
    endereco: 'Rua das Flores, 123 - Centro',
    tipoEvento: TipoEvento.CASAMENTO,
    horarioInicio: '20:00',
    horarioInicioServico: '18:00',
    horarioTerminoServico: '23:00',
    horarioDesmontagem: '23:00',
    tempoEvento: '5 HORAS',
    contratante: 'DANIELLE',
    numeroConvidados: 100,
    hashtag: '#danielle2023',
    numeroImpressoes: 300,
    status: StatusEvento.CONCLUIDO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-07')
  }
];

export const custosEvento: CustoEvento[] = [
  {
    id: '1',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '1',
    tipoCusto: tiposCusto[0],
    valor: 40,
    quantidade: 1,
    observacoes: 'Custo base do totem',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '2',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '2',
    tipoCusto: tiposCusto[1],
    valor: 50,
    quantidade: 1,
    observacoes: 'Júlio - 4 horas',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '2',
    tipoCusto: tiposCusto[1],
    valor: 100,
    quantidade: 1,
    observacoes: 'Marlon - 4 horas',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '2',
    tipoCusto: tiposCusto[1],
    valor: 20,
    quantidade: 1,
    observacoes: 'Letícia - 2 horas',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '5',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '3',
    tipoCusto: tiposCusto[2],
    valor: 100,
    quantidade: 1,
    observacoes: 'Transporte dos equipamentos',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '6',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '4',
    tipoCusto: tiposCusto[3],
    valor: 60,
    quantidade: 1,
    observacoes: 'Frete para o local do evento',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '7',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '5',
    tipoCusto: tiposCusto[4],
    valor: 40,
    quantidade: 1,
    observacoes: 'Papel fotográfico e tinta',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '8',
    eventoId: '1',
    evento: eventos[0],
    tipoCustoId: '6',
    tipoCusto: tiposCusto[5],
    valor: 30,
    quantidade: 1,
    observacoes: 'Impostos sobre o serviço',
    dataCadastro: new Date('2023-01-01')
  }
];

export const anexosEvento: AnexoEvento[] = [
  {
    id: '1',
    eventoId: '1',
    evento: eventos[0],
    nome: 'Contrato_Giovanna_2023.pdf',
    tipo: 'PDF',
    url: '/uploads/contratos/contrato_giovanna_2023.pdf',
    tamanho: 245760, // 240KB
    dataUpload: new Date('2023-01-01')
  },
  {
    id: '2',
    eventoId: '2',
    evento: eventos[1],
    nome: 'Contrato_Danielle_2023.pdf',
    tipo: 'PDF',
    url: '/uploads/contratos/contrato_danielle_2023.pdf',
    tamanho: 189440, // 185KB
    dataUpload: new Date('2023-01-01')
  }
];

export const contratos: ContratoServico[] = [
  {
    id: '1',
    eventoId: '1',
    evento: eventos[0],
    pacoteId: '1',
    pacote: pacotes[0],
    servicosContratados: pacotes[0].servicos,
    valorTotal: 3060,
    valorSinal: 312,
    valorRestante: 500,
    formaPagamento: FormaPagamento.PARCELADO,
    parcelas: 10,
    dataInicioParcelas: new Date('2023-02-01'),
    diaVencimento: 7,
    status: StatusContrato.ATIVO,
    dataContrato: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  },
  {
    id: '2',
    eventoId: '2',
    evento: eventos[1],
    servicoId: '2',
    servico: servicos[1],
    servicosContratados: [servicos[1]],
    valorTotal: 2400,
    valorSinal: 520,
    valorRestante: 1880,
    formaPagamento: FormaPagamento.PARCELADO,
    parcelas: 6,
    dataInicioParcelas: new Date('2023-02-01'),
    diaVencimento: 7,
    status: StatusContrato.ATIVO,
    dataContrato: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  }
];

export const pagamentos: Pagamento[] = [
  {
    id: '1',
    contratoId: '1',
    contrato: contratos[0],
    valor: 312,
    dataVencimento: new Date('2023-01-07'),
    dataPagamento: new Date('2023-01-07'),
    formaPagamento: 'Depósito bancário',
    numeroParcela: 1,
    totalParcelas: 10,
    status: StatusPagamento.PAGO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-07')
  },
  {
    id: '2',
    contratoId: '1',
    contrato: contratos[0],
    valor: 312,
    dataVencimento: new Date('2023-02-07'),
    dataPagamento: new Date('2023-02-07'),
    formaPagamento: 'Depósito bancário',
    numeroParcela: 2,
    totalParcelas: 10,
    status: StatusPagamento.PAGO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-02-07')
  },
  {
    id: '3',
    contratoId: '1',
    contrato: contratos[0],
    valor: 312,
    dataVencimento: new Date('2023-03-07'),
    dataPagamento: new Date('2023-03-07'),
    formaPagamento: 'Depósito bancário',
    numeroParcela: 3,
    totalParcelas: 10,
    status: StatusPagamento.PAGO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-03-07')
  },
  {
    id: '4',
    contratoId: '1',
    contrato: contratos[0],
    valor: 312,
    dataVencimento: new Date('2023-04-07'),
    formaPagamento: 'Depósito bancário',
    numeroParcela: 4,
    totalParcelas: 10,
    status: StatusPagamento.PENDENTE,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  },
  {
    id: '5',
    contratoId: '2',
    contrato: contratos[1],
    valor: 520,
    dataVencimento: new Date('2023-01-07'),
    dataPagamento: new Date('2023-01-07'),
    formaPagamento: 'PIX',
    numeroParcela: 1,
    totalParcelas: 6,
    status: StatusPagamento.PAGO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-07')
  },
  {
    id: '6',
    contratoId: '2',
    contrato: contratos[1],
    valor: 400,
    dataVencimento: new Date('2023-02-07'),
    formaPagamento: 'PIX',
    numeroParcela: 2,
    totalParcelas: 6,
    status: StatusPagamento.PENDENTE,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  }
];

// Funções utilitárias para trabalhar com os dados mockados
export const getClienteById = (id: string): Cliente | undefined => {
  return clientes.find(cliente => cliente.id === id);
};

export const getEventoById = (id: string): Evento | undefined => {
  return eventos.find(evento => evento.id === id);
};

export const getContratoById = (id: string): ContratoServico | undefined => {
  return contratos.find(contrato => contrato.id === id);
};

export const getPagamentosByContratoId = (contratoId: string): Pagamento[] => {
  return pagamentos.filter(pagamento => pagamento.contratoId === contratoId);
};

export const getEventosByClienteId = (clienteId: string): Evento[] => {
  return eventos.filter(evento => evento.clienteId === clienteId);
};

export const getPagamentosPendentes = (): Pagamento[] => {
  return pagamentos.filter(pagamento => pagamento.status === StatusPagamento.PENDENTE);
};

export const getPagamentosAtrasados = (): Pagamento[] => {
  const hoje = new Date();
  return pagamentos.filter(pagamento => 
    pagamento.status === StatusPagamento.PENDENTE && 
    pagamento.dataVencimento < hoje
  );
};

export const getEventosHoje = (): Evento[] => {
  const hoje = new Date();
  return eventos.filter(evento => {
    const dataEvento = new Date(evento.dataEvento);
    return dataEvento.toDateString() === hoje.toDateString();
  });
};

export const getEventosProximos = (dias: number = 7): Evento[] => {
  const hoje = new Date();
  const dataLimite = new Date();
  dataLimite.setDate(hoje.getDate() + dias);
  
  return eventos.filter(evento => {
    const dataEvento = new Date(evento.dataEvento);
    return dataEvento >= hoje && dataEvento <= dataLimite;
  });
};

export const calcularValorTotalPendente = (): number => {
  return pagamentos
    .filter(pagamento => pagamento.status === StatusPagamento.PENDENTE)
    .reduce((total, pagamento) => total + pagamento.valor, 0);
};

export const calcularReceitaMes = (ano: number, mes: number): number => {
  return pagamentos
    .filter(pagamento => {
      if (pagamento.status !== StatusPagamento.PAGO || !pagamento.dataPagamento) return false;
      const dataPagamento = new Date(pagamento.dataPagamento);
      return dataPagamento.getFullYear() === ano && dataPagamento.getMonth() === mes - 1;
    })
    .reduce((total, pagamento) => total + pagamento.valor, 0);
};

export const calcularReceitaAno = (ano: number): number => {
  return pagamentos
    .filter(pagamento => {
      if (pagamento.status !== StatusPagamento.PAGO || !pagamento.dataPagamento) return false;
      const dataPagamento = new Date(pagamento.dataPagamento);
      return dataPagamento.getFullYear() === ano;
    })
    .reduce((total, pagamento) => total + pagamento.valor, 0);
};

// Funções CRUD para Eventos
export const createEvento = (eventoData: Omit<Evento, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Evento => {
  const novoEvento: Evento = {
    ...eventoData,
    id: (eventos.length + 1).toString(),
    dataCadastro: new Date(),
    dataAtualizacao: new Date()
  };
  
  eventos.push(novoEvento);
  return novoEvento;
};

export const updateEvento = (id: string, eventoData: Partial<Omit<Evento, 'id' | 'dataCadastro'>>): Evento | null => {
  const index = eventos.findIndex(evento => evento.id === id);
  if (index === -1) return null;
  
  eventos[index] = {
    ...eventos[index],
    ...eventoData,
    dataAtualizacao: new Date()
  };
  
  return eventos[index];
};

export const deleteEvento = (id: string): boolean => {
  const index = eventos.findIndex(evento => evento.id === id);
  if (index === -1) return false;
  
  eventos.splice(index, 1);
  return true;
};

// Funções CRUD para Clientes
export const createCliente = (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>): Cliente => {
  const novoCliente: Cliente = {
    ...clienteData,
    id: (clientes.length + 1).toString(),
    dataCadastro: new Date()
  };
  
  clientes.push(novoCliente);
  return novoCliente;
};

export const updateCliente = (id: string, clienteData: Partial<Omit<Cliente, 'id' | 'dataCadastro'>>): Cliente | null => {
  const index = clientes.findIndex(cliente => cliente.id === id);
  if (index === -1) return null;
  
  clientes[index] = {
    ...clientes[index],
    ...clienteData
  };
  
  return clientes[index];
};

export const deleteCliente = (id: string): boolean => {
  const index = clientes.findIndex(cliente => cliente.id === id);
  if (index === -1) return false;
  
  clientes.splice(index, 1);
  return true;
};

// Função para buscar clientes por nome (para autocomplete)
export const searchClientes = (query: string): Cliente[] => {
  return clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(query.toLowerCase()) ||
    cliente.email.toLowerCase().includes(query.toLowerCase())
  );
};

// Funções CRUD para Pagamentos
export const createPagamento = (pagamentoData: Omit<Pagamento, 'id' | 'dataCadastro' | 'dataAtualizacao'>): Pagamento => {
  const novoPagamento: Pagamento = {
    ...pagamentoData,
    id: (pagamentos.length + 1).toString(),
    dataCadastro: new Date(),
    dataAtualizacao: new Date()
  };
  
  pagamentos.push(novoPagamento);
  return novoPagamento;
};

export const updatePagamento = (id: string, pagamentoData: Partial<Omit<Pagamento, 'id' | 'dataCadastro'>>): Pagamento | null => {
  const index = pagamentos.findIndex(pagamento => pagamento.id === id);
  if (index === -1) return null;
  
  pagamentos[index] = {
    ...pagamentos[index],
    ...pagamentoData,
    dataAtualizacao: new Date()
  };
  
  return pagamentos[index];
};

export const deletePagamento = (id: string): boolean => {
  const index = pagamentos.findIndex(pagamento => pagamento.id === id);
  if (index === -1) return false;
  
  pagamentos.splice(index, 1);
  return true;
};

// Função para buscar pagamentos por evento
export const getPagamentosByEventoId = (eventoId: string): Pagamento[] => {
  return pagamentos.filter(pagamento => pagamento.contrato.eventoId === eventoId);
};

// Função para buscar contrato por evento
export const getContratoByEventoId = (eventoId: string): ContratoServico | null => {
  return contratos.find(contrato => contrato.eventoId === eventoId) || null;
};

// Função para buscar pagamento por ID
export const getPagamentoById = (id: string): Pagamento | undefined => {
  return pagamentos.find(pagamento => pagamento.id === id);
};

// Função para calcular resumo financeiro do evento
export const getResumoFinanceiroEvento = (eventoId: string) => {
  const contrato = getContratoByEventoId(eventoId);
  const pagamentosEvento = getPagamentosByEventoId(eventoId);
  
  if (!contrato) {
    return {
      valorTotal: 0,
      valorPago: 0,
      valorPendente: 0,
      valorAtrasado: 0,
      totalParcelas: 0,
      parcelasPagas: 0,
      parcelasPendentes: 0,
      parcelasAtrasadas: 0
    };
  }

  const valorPago = pagamentosEvento
    .filter(p => p.status === StatusPagamento.PAGO)
    .reduce((total, p) => total + p.valor, 0);

  const valorPendente = pagamentosEvento
    .filter(p => p.status === StatusPagamento.PENDENTE)
    .reduce((total, p) => total + p.valor, 0);

  const valorAtrasado = pagamentosEvento
    .filter(p => p.status === StatusPagamento.ATRASADO)
    .reduce((total, p) => total + p.valor, 0);

  const parcelasPagas = pagamentosEvento.filter(p => p.status === StatusPagamento.PAGO).length;
  const parcelasPendentes = pagamentosEvento.filter(p => p.status === StatusPagamento.PENDENTE).length;
  const parcelasAtrasadas = pagamentosEvento.filter(p => p.status === StatusPagamento.ATRASADO).length;

  return {
    valorTotal: contrato.valorTotal,
    valorPago,
    valorPendente,
    valorAtrasado,
    totalParcelas: contrato.parcelas || 0,
    parcelasPagas,
    parcelasPendentes,
    parcelasAtrasadas
  };
};

// Funções CRUD para Tipos de Custo
export const createTipoCusto = (tipoCustoData: Omit<TipoCusto, 'id' | 'dataCadastro'>): TipoCusto => {
  const novoTipoCusto: TipoCusto = {
    ...tipoCustoData,
    id: (tiposCusto.length + 1).toString(),
    dataCadastro: new Date()
  };
  
  tiposCusto.push(novoTipoCusto);
  return novoTipoCusto;
};

export const updateTipoCusto = (id: string, tipoCustoData: Partial<Omit<TipoCusto, 'id' | 'dataCadastro'>>): TipoCusto | null => {
  const index = tiposCusto.findIndex(tipo => tipo.id === id);
  if (index === -1) return null;
  
  tiposCusto[index] = {
    ...tiposCusto[index],
    ...tipoCustoData
  };
  
  return tiposCusto[index];
};

export const deleteTipoCusto = (id: string): boolean => {
  const index = tiposCusto.findIndex(tipo => tipo.id === id);
  if (index === -1) return false;
  
  tiposCusto.splice(index, 1);
  return true;
};

// Funções CRUD para Custos de Evento
export const createCustoEvento = (custoData: Omit<CustoEvento, 'id' | 'dataCadastro'>): CustoEvento => {
  const novoCusto: CustoEvento = {
    ...custoData,
    id: (custosEvento.length + 1).toString(),
    dataCadastro: new Date()
  };
  
  custosEvento.push(novoCusto);
  return novoCusto;
};

export const updateCustoEvento = (id: string, custoData: Partial<Omit<CustoEvento, 'id' | 'dataCadastro'>>): CustoEvento | null => {
  const index = custosEvento.findIndex(custo => custo.id === id);
  if (index === -1) return null;
  
  custosEvento[index] = {
    ...custosEvento[index],
    ...custoData
  };
  
  return custosEvento[index];
};

export const deleteCustoEvento = (id: string): boolean => {
  const index = custosEvento.findIndex(custo => custo.id === id);
  if (index === -1) return false;
  
  custosEvento.splice(index, 1);
  return true;
};

// Função para buscar custos por evento
export const getCustosByEventoId = (eventoId: string): CustoEvento[] => {
  return custosEvento.filter(custo => custo.eventoId === eventoId);
};

// Função para calcular resumo de custos do evento
export const getResumoCustosEvento = (eventoId: string): ResumoCustosEvento => {
  const custos = getCustosByEventoId(eventoId);
  
  const total = custos.reduce((sum, custo) => sum + custo.valor, 0);
  
  const porCategoria = custos.reduce((acc, custo) => {
    const categoria = custo.tipoCusto.categoria;
    acc[categoria] = (acc[categoria] || 0) + custo.valor;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    custos,
    total,
    porCategoria,
    quantidadeItens: custos.length
  };
};

// Funções CRUD para Anexos de Evento
export const createAnexoEvento = (anexoData: Omit<AnexoEvento, 'id' | 'dataUpload'>): AnexoEvento => {
  const novoAnexo: AnexoEvento = {
    ...anexoData,
    id: (anexosEvento.length + 1).toString(),
    dataUpload: new Date()
  };
  
  anexosEvento.push(novoAnexo);
  return novoAnexo;
};

export const updateAnexoEvento = (id: string, anexoData: Partial<Omit<AnexoEvento, 'id' | 'dataUpload'>>): AnexoEvento | null => {
  const index = anexosEvento.findIndex(anexo => anexo.id === id);
  if (index === -1) return null;
  
  anexosEvento[index] = {
    ...anexosEvento[index],
    ...anexoData
  };
  
  return anexosEvento[index];
};

export const deleteAnexoEvento = (id: string): boolean => {
  const index = anexosEvento.findIndex(anexo => anexo.id === id);
  if (index === -1) return false;
  
  anexosEvento.splice(index, 1);
  return true;
};

// Função para buscar anexos por evento
export const getAnexosByEventoId = (eventoId: string): AnexoEvento[] => {
  return anexosEvento.filter(anexo => anexo.eventoId === eventoId);
};

// Função para buscar tipo de custo por ID
export const getTipoCustoById = (id: string): TipoCusto | undefined => {
  return tiposCusto.find(tipo => tipo.id === id);
};

// Função para buscar custo por ID
export const getCustoEventoById = (id: string): CustoEvento | undefined => {
  return custosEvento.find(custo => custo.id === id);
};
