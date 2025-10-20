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
    endereco: 'Rua das Rosas, 789',
    cep: '23000-002',
    instagram: '@viniciusnathalia',
    comoConheceu: 'Facebook',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    nome: 'MARIA E JOÃO',
    cpf: '12345678904',
    email: 'maria.joao@email.com',
    telefone: '21999999996',
    endereco: 'Rua das Margaridas, 321',
    cep: '23000-003',
    instagram: '@mariajoao',
    comoConheceu: 'Google',
    dataCadastro: new Date('2023-01-01')
  }
];

export const eventos: Evento[] = [
  {
    id: '1',
    clienteId: '1',
    cliente: clientes[0],
    dataEvento: new Date('2023-01-15'),
    diaSemana: 'Domingo',
    local: 'Salão de Festas Jardim',
    endereco: 'Rua das Flores, 123',
    tipoEvento: 'Aniversário adulto',
    horarioInicio: '14:00',
    horarioInicioServico: '13:00',
    horarioTerminoServico: '22:00',
    horarioDesmontagem: '23:00',
    tempoEvento: '8 horas',
    contratante: 'Giovanna',
    numeroConvidados: 50,
    observacoes: 'Festa de aniversário de 15 anos',
    status: 'Confirmado',
    valorTotal: 2000,
    diaFinalPagamento: new Date('2023-01-15'),
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  },
  {
    id: '2',
    clienteId: '2',
    cliente: clientes[1],
    dataEvento: new Date('2023-02-15'),
    diaSemana: 'Quarta-feira',
    local: 'Casa da Danielle',
    endereco: 'Rua das Palmeiras, 456',
    tipoEvento: 'Casamento',
    horarioInicio: '16:00',
    horarioInicioServico: '15:00',
    horarioTerminoServico: '02:00',
    horarioDesmontagem: '03:00',
    tempoEvento: '10 horas',
    contratante: 'Danielle',
    numeroConvidados: 100,
    observacoes: 'Cerimônia e recepção',
    status: 'Confirmado',
    valorTotal: 5000,
    diaFinalPagamento: new Date('2023-02-15'),
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  },
  {
    id: '3',
    clienteId: '3',
    cliente: clientes[2],
    dataEvento: new Date('2023-03-15'),
    diaSemana: 'Quarta-feira',
    local: 'Salão de Festas Central',
    endereco: 'Rua das Rosas, 789',
    tipoEvento: 'Casamento',
    horarioInicio: '18:00',
    horarioInicioServico: '17:00',
    horarioTerminoServico: '04:00',
    horarioDesmontagem: '05:00',
    tempoEvento: '11 horas',
    contratante: 'Vinícius e Nathália',
    numeroConvidados: 150,
    observacoes: 'Cerimônia religiosa e recepção',
    status: 'Confirmado',
    valorTotal: 8000,
    diaFinalPagamento: new Date('2023-03-15'),
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  },
  {
    id: '4',
    clienteId: '4',
    cliente: clientes[3],
    dataEvento: new Date('2023-04-15'),
    diaSemana: 'Sábado',
    local: 'Fazenda dos Sonhos',
    endereco: 'Rua das Margaridas, 321',
    tipoEvento: 'Casamento',
    horarioInicio: '17:00',
    horarioInicioServico: '16:00',
    horarioTerminoServico: '03:00',
    horarioDesmontagem: '04:00',
    tempoEvento: '11 horas',
    contratante: 'Maria e João',
    numeroConvidados: 200,
    observacoes: 'Cerimônia ao ar livre e recepção',
    status: 'Confirmado',
    valorTotal: 12000,
    diaFinalPagamento: new Date('2023-04-15'),
    dataCadastro: new Date('2023-01-01'),
    dataAtualizacao: new Date('2023-01-01')
  }
];

export const pagamentos: Pagamento[] = [
  {
    id: '1',
    userId: 'user1',
    eventoId: '1',
    valor: 500,
    dataPagamento: new Date('2023-01-05'),
    formaPagamento: 'PIX',
    status: 'Pago',
    observacoes: 'Primeiro pagamento',
    dataCadastro: new Date('2023-01-05'),
    dataAtualizacao: new Date('2023-01-05')
  },
  {
    id: '2',
    userId: 'user1',
    eventoId: '1',
    valor: 800,
    dataPagamento: new Date('2023-01-10'),
    formaPagamento: 'Depósito bancário',
    status: 'Pago',
    observacoes: 'Segundo pagamento',
    dataCadastro: new Date('2023-01-10'),
    dataAtualizacao: new Date('2023-01-10')
  },
  {
    id: '3',
    userId: 'user1',
    eventoId: '1',
    valor: 700,
    dataPagamento: new Date('2023-01-15'),
    formaPagamento: 'Cartão de crédito',
    status: 'Pago',
    observacoes: 'Terceiro pagamento',
    dataCadastro: new Date('2023-01-15'),
    dataAtualizacao: new Date('2023-01-15')
  },
  {
    id: '4',
    userId: 'user1',
    eventoId: '2',
    valor: 600,
    dataPagamento: new Date('2023-01-08'),
    formaPagamento: 'PIX',
    status: 'Pago',
    observacoes: 'Primeiro pagamento',
    dataCadastro: new Date('2023-01-08'),
    dataAtualizacao: new Date('2023-01-08')
  },
  {
    id: '5',
    userId: 'user1',
    eventoId: '2',
    valor: 400,
    dataPagamento: new Date('2023-01-18'),
    formaPagamento: 'Transferência',
    status: 'Pago',
    observacoes: 'Segundo pagamento',
    dataCadastro: new Date('2023-01-18'),
    dataAtualizacao: new Date('2023-01-18')
  }
];

export const tiposCusto: TipoCusto[] = [
  {
    id: '1',
    nome: 'Decoração',
    descricao: 'Itens de decoração para eventos',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '2',
    nome: 'Alimentação',
    descricao: 'Catering e alimentação',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    nome: 'Som e Iluminação',
    descricao: 'Equipamentos de som e iluminação',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    nome: 'Fotografia',
    descricao: 'Serviços de fotografia e filmagem',
    ativo: true,
    dataCadastro: new Date('2023-01-01')
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
    observacoes: 'Custo base do buffet',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '3',
    eventoId: '2',
    evento: eventos[1],
    tipoCustoId: '1',
    tipoCusto: tiposCusto[0],
    valor: 80,
    quantidade: 1,
    observacoes: 'Decoração especial para casamento',
    dataCadastro: new Date('2023-01-01')
  },
  {
    id: '4',
    eventoId: '2',
    evento: eventos[1],
    tipoCustoId: '3',
    tipoCusto: tiposCusto[2],
    valor: 120,
    quantidade: 1,
    observacoes: 'Som e iluminação profissional',
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

// Dados adicionais para completar as interfaces
export const servicos: Servico[] = [];
export const pacotesServico: PacoteServico[] = [];
export const contratos: ContratoServico[] = [];
export const promoters: Promoter[] = [];
export const insumos: Insumo[] = [];
export const resumosCustosEvento: ResumoCustosEvento[] = [];
