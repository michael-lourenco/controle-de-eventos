// Tipos baseados na análise das planilhas CLICK-SE

export interface User {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'user';
  ativo: boolean;
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface CanalEntrada {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCadastro: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  instagram?: string;
  canalEntradaId?: string;
  canalEntrada?: CanalEntrada;
  dataCadastro: Date;
}

export interface Evento {
  id: string;
  nomeEvento?: string;
  clienteId: string;
  cliente: Cliente;
  dataEvento: Date;
  diaSemana: string;
  local: string;
  endereco: string;
  tipoEvento: 'Casamento' | 'Aniversário infantil' | 'Aniversário adulto' | '15 anos' | 'Outros';
  saida: string;
  chegadaNoLocal: string;
  horarioInicio: string;
  horarioDesmontagem: string;
  tempoEvento: string;
  contratante: string;
  numeroConvidados: number;
  quantidadeMesas?: number;
  hashtag?: string;
  numeroImpressoes?: number;
  cerimonialista?: {
    nome?: string;
    telefone?: string;
  };
  observacoes?: string;
  status: 'Agendado' | 'Confirmado' | 'Em andamento' | 'Concluído' | 'Cancelado';
  valorTotal: number; // Valor total a ser pago pelo evento
  diaFinalPagamento: Date; // Dia final para pagamento completo
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
  userId: string; // ID do usuário que criou o pagamento
  eventoId: string;
  valor: number;
  dataPagamento: Date;
  formaPagamento: 'Dinheiro' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX' | 'Transferência';
  status: 'Pago' | 'Pendente' | 'Atrasado' | 'Cancelado';
  observacoes?: string;
  comprovante?: string; // Campo texto mantido para compatibilidade
  anexoId?: string; // Referência para subcollection de anexos
  dataCadastro: Date;
  dataAtualizacao: Date;
}

export interface AnexoPagamento {
  id: string;
  userId: string;
  eventoId: string;
  pagamentoId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  s3Key: string;
  url: string;
  dataUpload: Date;
  dataCadastro: Date;
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
  eventosHojeLista: Evento[];
  eventosMes: number;
  receitaMes: number;
  receitaAno: number;
  pagamentosPendentes: number;
  valorPendente: number;
  valorAtrasado: number;
  eventosProximos: Evento[];
  pagamentosVencendo: Pagamento[];
  resumoFinanceiro: {
    receitaTotal: number;
    receitaMes: number;
    valorPendente: number;
    valorAtrasado: number;
    totalEventos: number;
    eventosConcluidos: number;
  };
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

export interface TipoCusto {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCadastro: Date;
}

export interface CustoEvento {
  id: string;
  eventoId: string;
  evento: Evento;
  tipoCustoId: string;
  tipoCusto: TipoCusto;
  valor: number;
  quantidade?: number;
  observacoes?: string;
  dataCadastro: Date;
}

export interface AnexoEvento {
  id: string;
  eventoId: string;
  evento: Evento;
  nome: string;
  tipo: 'PDF' | 'Imagem' | 'Documento' | 'Outro';
  url: string;
  tamanho: number; // em bytes
  dataUpload: Date;
}

export interface ResumoCustosEvento {
  custos: CustoEvento[];
  total: number;
  porCategoria: Record<string, number>;
  quantidadeItens: number;
}

export interface TipoServico {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  dataCadastro: Date;
}

export interface ServicoEvento {
  id: string;
  eventoId: string;
  tipoServicoId: string;
  tipoServico: TipoServico;
  observacoes?: string;
  dataCadastro: Date;
}

export interface ResumoServicosEvento {
  servicos: ServicoEvento[];
  quantidadeItens: number;
  porCategoria: Record<string, number>;
}

export interface RelatorioPerformanceEventos {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumoGeral: {
    totalEventos: number;
    eventosConcluidos: number;
    eventosCancelados: number;
    taxaConclusao: number;
    taxaCancelamento: number;
  };
  eventosPorStatus: Array<{
    status: string;
    quantidade: number;
    percentual: number;
  }>;
  eventosPorTipo: Array<{
    tipo: string;
    quantidade: number;
    percentual: number;
  }>;
  eventosPorMes: Array<{
    mes: string;
    ano: number;
    quantidade: number;
    receita: number;
  }>;
  eventosPorTrimestre: Array<{
    trimestre: string;
    ano: number;
    quantidade: number;
    receita: number;
  }>;
  sazonalidade: {
    mesMaisMovimentado: string;
    mesMenosMovimentado: string;
    trimestreMaisMovimentado: string;
    tipoEventoMaisPopular: string;
    tipoEventoMenosPopular: string;
  };
  tendencias: {
    crescimentoMensal: number;
    crescimentoTrimestral: number;
    previsaoProximoMes: number;
  };
}

export interface RelatorioFluxoCaixa {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumoGeral: {
    receitaTotal: number;
    despesaTotal: number;
    saldoAtual: number;
    saldoAnterior: number;
    variacaoSaldo: number;
    percentualVariacao: number;
  };
  fluxoMensal: Array<{
    mes: string;
    ano: number;
    receitas: number;
    despesas: number;
    saldo: number;
    saldoAcumulado: number;
  }>;
  receitasPorFormaPagamento: Array<{
    formaPagamento: string;
    valor: number;
    percentual: number;
  }>;
  despesasPorCategoria: Array<{
    categoria: string;
    valor: number;
    percentual: number;
  }>;
  projecao: {
    proximos3Meses: Array<{
      mes: string;
      receitaProjetada: number;
      despesaProjetada: number;
      saldoProjetado: number;
    }>;
    tendencia: 'crescimento' | 'declinio' | 'estavel';
    confiabilidade: number; // 0-100
  };
  alertas: Array<{
    tipo: 'saldo_negativo' | 'declinio_receita' | 'aumento_despesas' | 'inadimplencia';
    mensagem: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
}

export interface RelatorioServicos {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumoGeral: {
    totalServicos: number;
    tiposServicosUnicos: number;
    eventosComServicos: number;
    eventosSemServicos: number;
    taxaUtilizacaoServicos: number;
  };
  servicosPorTipo: Array<{
    tipoServico: string;
    quantidade: number;
    percentual: number;
    eventosUtilizando: number;
  }>;
  servicosPorEvento: Array<{
    eventoId: string;
    clienteNome: string;
    dataEvento: Date;
    tipoEvento: string;
    quantidadeServicos: number;
    tiposServicos: string[];
  }>;
  servicosPorMes: Array<{
    mes: string;
    ano: number;
    quantidadeServicos: number;
    tiposUnicos: number;
  }>;
  servicosPorTipoEvento: Array<{
    tipoEvento: string;
    quantidadeServicos: number;
    tiposMaisUtilizados: Array<{
      tipoServico: string;
      quantidade: number;
    }>;
  }>;
  tendencias: {
    servicoMaisUtilizado: string;
    servicoMenosUtilizado: string;
    crescimentoUtilizacao: number;
    tiposEmAlta: string[];
  };
  alertas: Array<{
    tipo: 'evento_sem_servicos' | 'servico_pouco_utilizado' | 'alta_concentracao';
    mensagem: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
}

export interface RelatorioCanaisEntrada {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumoGeral: {
    totalClientes: number;
    canaisAtivos: number;
    clientesSemCanal: number;
    taxaPreenchimento: number;
  };
  clientesPorCanal: Array<{
    canalId: string;
    canalNome: string;
    quantidade: number;
    percentual: number;
    valorTotalEventos: number;
    ticketMedio: number;
  }>;
  clientesPorMes: Array<{
    mes: string;
    ano: number;
    totalClientes: number;
    porCanal: Record<string, number>;
  }>;
  conversaoPorCanal: Array<{
    canalNome: string;
    totalLeads: number;
    eventosGerados: number;
    taxaConversao: number;
    receitaGerada: number;
  }>;
  tendencias: {
    canalMaisEfetivo: string;
    canalMenosEfetivo: string;
    crescimentoLeads: number;
    canaisEmAlta: string[];
  };
  alertas: Array<{
    tipo: 'canal_inativo' | 'baixa_conversao' | 'clientes_sem_canal';
    mensagem: string;
    severidade: 'baixa' | 'media' | 'alta';
  }>;
}
