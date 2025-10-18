import { 
  Cliente, 
  Evento, 
  Servico, 
  PacoteServico, 
  ContratoServico, 
  Pagamento, 
  Promoter, 
  Insumo,
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
    nomesNoivosAniversariante: 'GIOVANNA',
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
    nomesNoivosAniversariante: 'DANIELLE',
    numeroConvidados: 100,
    hashtag: '#danielle2023',
    numeroImpressoes: 300,
    status: StatusEvento.CONCLUIDO,
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-07')
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
