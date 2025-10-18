// Tipos baseados na análise das planilhas CLICK-SE

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  instagram?: string;
  comoConheceu?: string;
  dataCadastro: Date;
}

export interface Evento {
  id: string;
  clienteId: string;
  cliente: Cliente;
  dataEvento: Date;
  diaSemana: string;
  local: string;
  endereco: string;
  tipoEvento: 'Casamento' | 'Aniversário infantil' | 'Aniversário adulto' | '15 anos' | 'Outros';
  horarioInicio: string;
  horarioInicioServico: string;
  horarioTerminoServico: string;
  horarioDesmontagem: string;
  tempoEvento: string;
  nomesNoivosAniversariante: string;
  numeroConvidados: number;
  quantidadeMesas?: number;
  hashtag?: string;
  numeroImpressoes?: number;
  cerimonialista?: {
    nome: string;
    telefone: string;
  };
  observacoes?: string;
  status: 'Agendado' | 'Confirmado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'Totem' | 'Instaclick' | 'P360' | 'Lambe-lambe' | 'Clickbook' | 'Personalização' | 'Pacote';
  duracao: number; // em horas
  precoBase: number;
  ativo: boolean;
}

export interface PacoteServico {
  id: string;
  nome: string;
  descricao: string;
  servicos: Servico[];
  precoTotal: number;
  desconto?: number;
  ativo: boolean;
}

export interface ContratoServico {
  id: string;
  eventoId: string;
  evento: Evento;
  servicoId?: string;
  servico?: Servico;
  pacoteId?: string;
  pacote?: PacoteServico;
  servicosContratados: Servico[];
  valorTotal: number;
  valorSinal: number;
  valorRestante: number;
  formaPagamento: 'À vista' | 'Parcelado' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX';
  parcelas?: number;
  dataInicioParcelas?: Date;
  diaVencimento?: number;
  observacoes?: string;
  status: 'Pendente' | 'Ativo' | 'Pausado' | 'Cancelado' | 'Concluído';
  dataContrato: Date;
  dataAtualizacao: Date;
}

export interface Pagamento {
  id: string;
  contratoId: string;
  contrato: ContratoServico;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  formaPagamento: 'Dinheiro' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX' | 'Transferência';
  numeroParcela?: number;
  totalParcelas?: number;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  observacoes?: string;
  comprovante?: string;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface Promoter {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  especialidades: string[];
  custoHora: number;
  ativo: boolean;
  dataCadastro: Date;
}

export interface AtribuicaoEvento {
  id: string;
  eventoId: string;
  evento: Evento;
  promoterId: string;
  promoter: Promoter;
  custo: number;
  observacoes?: string;
  dataAtribuicao: Date;
}

export interface Insumo {
  id: string;
  nome: string;
  descricao: string;
  custo: number;
  unidade: string;
  ativo: boolean;
}

export interface InsumoEvento {
  id: string;
  eventoId: string;
  evento: Evento;
  insumoId: string;
  insumo: Insumo;
  quantidade: number;
  custoTotal: number;
  dataAtribuicao: Date;
}

export interface RelatorioFinanceiro {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  receitas: {
    total: number;
    porFormaPagamento: Record<string, number>;
    porMes: Record<string, number>;
  };
  despesas: {
    total: number;
    promoters: number;
    insumos: number;
    outros: number;
  };
  lucro: number;
  margem: number;
}

export interface DashboardData {
  eventosHoje: number;
  eventosMes: number;
  receitaMes: number;
  receitaAno: number;
  pagamentosPendentes: number;
  valorPendente: number;
  eventosProximos: Evento[];
  pagamentosVencendo: Pagamento[];
  graficos: {
    receitaMensal: Array<{ mes: string; valor: number }>;
    eventosPorTipo: Array<{ tipo: string; quantidade: number }>;
    statusPagamentos: Array<{ status: string; quantidade: number }>;
  };
}

// Enums para facilitar o uso
export enum StatusEvento {
  AGENDADO = 'Agendado',
  CONFIRMADO = 'Confirmado',
  EM_ANDAMENTO = 'Em andamento',
  CONCLUIDO = 'Concluído',
  CANCELADO = 'Cancelado'
}

export enum StatusPagamento {
  PENDENTE = 'Pendente',
  PAGO = 'Pago',
  ATRASADO = 'Atrasado',
  CANCELADO = 'Cancelado'
}

export enum StatusContrato {
  PENDENTE = 'Pendente',
  ATIVO = 'Ativo',
  PAUSADO = 'Pausado',
  CANCELADO = 'Cancelado',
  CONCLUIDO = 'Concluído'
}

export enum TipoEvento {
  CASAMENTO = 'Casamento',
  ANIVERSARIO_INFANTIL = 'Aniversário infantil',
  ANIVERSARIO_ADULTO = 'Aniversário adulto',
  QUINZE_ANOS = '15 anos',
  OUTROS = 'Outros'
}

export enum FormaPagamento {
  A_VISTA = 'À vista',
  PARCELADO = 'Parcelado',
  CARTAO_CREDITO = 'Cartão de crédito',
  DEPOSITO_BANCARIO = 'Depósito bancário',
  PIX = 'PIX'
}
