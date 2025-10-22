import { repositoryFactory } from './repositories/repository-factory';
import { 
  Cliente, 
  Evento, 
  Pagamento, 
  TipoCusto, 
  CustoEvento, 
  TipoServico,
  ServicoEvento,
  AnexoEvento,
  DashboardData,
  ResumoCustosEvento,
  ResumoServicosEvento
} from '@/types';
import { initializeAllCollections, initializeTiposCusto } from './collections-init';

export class DataService {
  private clienteRepo = repositoryFactory.getClienteRepository();
  private eventoRepo = repositoryFactory.getEventoRepository();
  private pagamentoRepo = repositoryFactory.getPagamentoRepository();
  private tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
  private custoEventoRepo = repositoryFactory.getCustoEventoRepository();
  private tipoServicoRepo = repositoryFactory.getTipoServicoRepository();
  private servicoEventoRepo = repositoryFactory.getServicoEventoRepository();

  // Método para inicializar collections automaticamente
  private async ensureCollectionsInitialized(): Promise<void> {
    try {
      await initializeAllCollections();
    } catch (error) {
      console.error('Erro ao inicializar collections:', error);
      // Não lançar erro para não quebrar a aplicação
    }
  }

  // Métodos para Clientes
  async getClientes(userId: string): Promise<Cliente[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar clientes');
    }
    return this.clienteRepo.findAll(userId);
  }

  async getClienteById(id: string, userId: string): Promise<Cliente | null> {
    return this.clienteRepo.getClienteById(id, userId);
  }

  async createCliente(
    cliente: Omit<Cliente, 'id' | 'dataCadastro'>,
    userId: string
  ): Promise<Cliente> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar cliente');
    }
    return this.clienteRepo.createCliente(cliente, userId);
  }

  async updateCliente(id: string, cliente: Partial<Cliente>, userId: string): Promise<Cliente> {
    return this.clienteRepo.updateCliente(id, cliente, userId);
  }

  async deleteCliente(id: string, userId: string): Promise<void> {
    return this.clienteRepo.deleteCliente(id, userId);
  }

  async searchClientesByName(name: string, userId: string): Promise<Cliente[]> {
    return this.clienteRepo.searchByName(name, userId);
  }

  // Métodos para Eventos
  async getEventos(userId: string): Promise<Evento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar eventos');
    }
    return this.eventoRepo.findAll(userId);
  }

  async getEventoById(id: string, userId: string): Promise<Evento | null> {
    return this.eventoRepo.getEventoById(id, userId);
  }

  async createEvento(
    evento: Omit<Evento, 'id' | 'dataCadastro' | 'dataAtualizacao'>,
    userId: string
  ): Promise<Evento> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar evento');
    }
    console.log('DataService: Criando evento:', evento);
    try {
      const resultado = await this.eventoRepo.createEvento(evento, userId);
      console.log('DataService: Evento criado com sucesso:', resultado);
      return resultado;
    } catch (error) {
      console.error('DataService: Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvento(id: string, evento: Partial<Evento>, userId: string): Promise<Evento> {
    return this.eventoRepo.updateEvento(id, evento, userId);
  }

  async deleteEvento(id: string, userId: string): Promise<void> {
    return this.eventoRepo.deleteEvento(id, userId);
  }

  async getEventosHoje(userId: string): Promise<Evento[]> {
    return this.eventoRepo.getEventosHoje(userId);
  }

  async getProximosEventos(userId: string, limit?: number): Promise<Evento[]> {
    return this.eventoRepo.getProximosEventos(userId, limit);
  }

  async getEventosPorMes(mes: number, ano: number, userId: string): Promise<Evento[]> {
    return this.eventoRepo.getEventosPorMes(mes, ano, userId);
  }

  async getEventosPorStatus(status: string, userId: string): Promise<Evento[]> {
    return this.eventoRepo.findByStatus(status, userId);
  }

  async getEventosPorTipo(tipoEvento: string, userId: string): Promise<Evento[]> {
    return this.eventoRepo.findByTipoEvento(tipoEvento, userId);
  }

  async searchEventosByLocal(local: string, userId: string): Promise<Evento[]> {
    return this.eventoRepo.searchByLocal(local, userId);
  }

  async getEventosPorPeriodo(inicio: Date, fim: Date, userId: string): Promise<Evento[]> {
    return this.eventoRepo.getEventosPorPeriodo(inicio, fim, userId);
  }

  // Métodos para Pagamentos
  async getPagamentos(userId: string, eventoId: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByEventoId(userId, eventoId);
  }

  async getPagamentoById(userId: string, eventoId: string, pagamentoId: string): Promise<Pagamento | null> {
    return this.pagamentoRepo.findById(pagamentoId, eventoId);
  }

  async createPagamento(userId: string, eventoId: string, pagamento: Omit<Pagamento, 'id'>): Promise<Pagamento> {
    return this.pagamentoRepo.createPagamento(userId, eventoId, pagamento);
  }

  async updatePagamento(userId: string, eventoId: string, pagamentoId: string, pagamento: Partial<Pagamento>): Promise<Pagamento> {
    return this.pagamentoRepo.updatePagamento(userId, eventoId, pagamentoId, pagamento);
  }

  async deletePagamento(userId: string, eventoId: string, pagamentoId: string): Promise<void> {
    return this.pagamentoRepo.deletePagamento(userId, eventoId, pagamentoId);
  }

  async getPagamentosPorEvento(userId: string, eventoId: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByEventoId(userId, eventoId);
  }

  async getPagamentosPorStatus(userId: string, eventoId: string, status: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByStatus(userId, eventoId, status);
  }

  async getPagamentosPorForma(userId: string, eventoId: string, formaPagamento: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByFormaPagamento(userId, eventoId, formaPagamento);
  }

  async getPagamentosPorMes(userId: string, eventoId: string, mes: number, ano: number): Promise<Pagamento[]> {
    return this.pagamentoRepo.getPagamentosPorMes(userId, eventoId, mes, ano);
  }

  async getTotalRecebidoPorPeriodo(userId: string, eventoId: string, inicio: Date, fim: Date): Promise<number> {
    return this.pagamentoRepo.getTotalRecebidoPorPeriodo(userId, eventoId, inicio, fim);
  }

  // Método para buscar todos os pagamentos de todos os eventos do usuário
  async getAllPagamentos(userId: string): Promise<Pagamento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar pagamentos');
    }
    
    try {
      // Buscar todos os eventos do usuário
      const eventos = await this.getEventos(userId);
      const todosPagamentos: Pagamento[] = [];
      
      // Buscar pagamentos de todos os eventos
      for (const evento of eventos) {
        try {
          const pagamentosEvento = await this.getPagamentosPorEvento(userId, evento.id);
          // Adicionar informações do evento a cada pagamento
          const pagamentosComEvento = pagamentosEvento.map(pagamento => ({
            ...pagamento,
            evento: {
              id: evento.id,
              nome: evento.cliente.nome, // Usar nome do cliente como identificador do evento
              dataEvento: evento.dataEvento,
              local: evento.local,
              cliente: evento.cliente
            }
          }));
          todosPagamentos.push(...pagamentosComEvento);
        } catch (error) {
          console.error(`Erro ao buscar pagamentos do evento ${evento.id}:`, error);
        }
      }
      
      // Ordenar por data de pagamento (mais recente primeiro)
      return todosPagamentos.sort((a, b) => 
        new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar todos os pagamentos:', error);
      return [];
    }
  }

  async getResumoFinanceiroPorEvento(userId: string, eventoId: string, valorTotalEvento: number, dataFinalPagamento?: Date): Promise<{
    totalPago: number;
    valorPendente: number;
    valorAtrasado: number;
    quantidadePagamentos: number;
    isAtrasado: boolean;
  }> {
    return this.pagamentoRepo.getResumoFinanceiroPorEvento(userId, eventoId, valorTotalEvento, dataFinalPagamento);
  }

  // Métodos para Tipos de Custo
  async getTiposCusto(userId: string): Promise<TipoCusto[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de custo');
    }
    try {
      // Garantir que os tipos de custo estejam inicializados
      await initializeTiposCusto(userId);
      
      // Buscar apenas tipos do usuário (agora personalizados)
      return this.tipoCustoRepo.findAll(userId);
    } catch (error) {
      console.error('Erro ao carregar tipos de custo:', error);
      return [];
    }
  }

  async getTipoCustoById(id: string, userId: string): Promise<TipoCusto | null> {
    return this.tipoCustoRepo.getTipoCustoById(id, userId);
  }

  async createTipoCusto(tipoCusto: Omit<TipoCusto, 'id' | 'dataCadastro'>, userId: string): Promise<TipoCusto> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar tipo de custo');
    }
    return this.tipoCustoRepo.createTipoCusto(tipoCusto, userId);
  }

  async updateTipoCusto(id: string, tipoCusto: Partial<TipoCusto>, userId: string): Promise<TipoCusto> {
    return this.tipoCustoRepo.updateTipoCusto(id, tipoCusto, userId);
  }

  async deleteTipoCusto(id: string, userId: string): Promise<void> {
    return this.tipoCustoRepo.deleteTipoCusto(id, userId);
  }

  async getTiposCustoAtivos(userId: string): Promise<TipoCusto[]> {
    return this.tipoCustoRepo.getAtivos(userId);
  }

  // Métodos para Custos de Evento
  async getCustosEvento(userId: string, eventoId: string): Promise<CustoEvento[]> {
    return this.custoEventoRepo.findByEventoId(userId, eventoId);
  }

  async getCustoEventoById(userId: string, eventoId: string, custoId: string): Promise<CustoEvento | null> {
    return this.custoEventoRepo.findById(custoId, eventoId);
  }

  async createCustoEvento(userId: string, eventoId: string, custoEvento: Omit<CustoEvento, 'id'>): Promise<CustoEvento> {
    return this.custoEventoRepo.createCustoEvento(userId, eventoId, custoEvento);
  }

  async updateCustoEvento(userId: string, eventoId: string, custoId: string, custoEvento: Partial<CustoEvento>): Promise<CustoEvento> {
    return this.custoEventoRepo.updateCustoEvento(userId, eventoId, custoId, custoEvento);
  }

  async deleteCustoEvento(userId: string, eventoId: string, custoId: string): Promise<void> {
    return this.custoEventoRepo.deleteCustoEvento(userId, eventoId, custoId);
  }

  async getCustosPorEvento(userId: string, eventoId: string): Promise<CustoEvento[]> {
    return this.custoEventoRepo.findByEventoId(userId, eventoId);
  }

  async getTotalCustosPorEvento(userId: string, eventoId: string): Promise<number> {
    return this.custoEventoRepo.getTotalCustosPorEvento(userId, eventoId);
  }

  async getResumoCustosPorEvento(userId: string, eventoId: string): Promise<ResumoCustosEvento> {
    return this.custoEventoRepo.getResumoCustosPorEvento(userId, eventoId);
  }

  // Métodos para Tipos de Serviço
  async getTiposServico(userId: string): Promise<TipoServico[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de serviço');
    }
    try {
      await this.ensureCollectionsInitialized();
      return this.tipoServicoRepo.findAll(userId);
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      throw error;
    }
  }

  async getTipoServicoById(id: string, userId: string): Promise<TipoServico | null> {
    return this.tipoServicoRepo.getTipoServicoById(id, userId);
  }

  async createTipoServico(tipoServico: Omit<TipoServico, 'id' | 'dataCadastro'>, userId: string): Promise<TipoServico> {
    return this.tipoServicoRepo.createTipoServico(tipoServico, userId);
  }

  async updateTipoServico(id: string, tipoServico: Partial<TipoServico>, userId: string): Promise<TipoServico> {
    return this.tipoServicoRepo.updateTipoServico(id, tipoServico, userId);
  }

  async deleteTipoServico(id: string, userId: string): Promise<void> {
    return this.tipoServicoRepo.deleteTipoServico(id, userId);
  }

  async getTiposServicoAtivos(userId: string): Promise<TipoServico[]> {
    return this.tipoServicoRepo.getAtivos(userId);
  }

  // Métodos para Serviços de Evento
  async getServicosEvento(userId: string, eventoId: string): Promise<ServicoEvento[]> {
    return this.servicoEventoRepo.findByEventoId(userId, eventoId);
  }

  async getServicoEventoById(userId: string, eventoId: string, servicoId: string): Promise<ServicoEvento | null> {
    return this.servicoEventoRepo.findById(servicoId, eventoId);
  }

  async createServicoEvento(userId: string, eventoId: string, servicoEvento: Omit<ServicoEvento, 'id'>): Promise<ServicoEvento> {
    return this.servicoEventoRepo.createServicoEvento(userId, eventoId, servicoEvento);
  }

  async updateServicoEvento(userId: string, eventoId: string, servicoId: string, servicoEvento: Partial<ServicoEvento>): Promise<ServicoEvento> {
    return this.servicoEventoRepo.updateServicoEvento(userId, eventoId, servicoId, servicoEvento);
  }

  async deleteServicoEvento(userId: string, eventoId: string, servicoId: string): Promise<void> {
    return this.servicoEventoRepo.deleteServicoEvento(userId, eventoId, servicoId);
  }

  async getServicosPorEvento(userId: string, eventoId: string): Promise<ServicoEvento[]> {
    return this.servicoEventoRepo.findByEventoId(userId, eventoId);
  }

  async getTotalServicosPorEvento(userId: string, eventoId: string): Promise<number> {
    return this.servicoEventoRepo.getTotalServicosPorEvento(userId, eventoId);
  }

  async getResumoServicosPorEvento(userId: string, eventoId: string): Promise<ResumoServicosEvento> {
    return this.servicoEventoRepo.getResumoServicosPorEvento(userId, eventoId);
  }

  // Métodos para Dashboard
  async getDashboardData(userId: string): Promise<DashboardData> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar dados do dashboard');
    }
    try {
      // Garantir que as collections estejam inicializadas
      await this.ensureCollectionsInitialized();
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      const inicioAno = new Date(hoje.getFullYear(), 0, 1);
      const fimAno = new Date(hoje.getFullYear(), 11, 31);

      // Buscar dados com tratamento de erro para collections vazias
      const eventos = await this.getEventos(userId).catch(() => []);
      
      // Para pagamentos, precisamos buscar de todos os eventos
      const todosEventos = await this.getEventos(userId).catch(() => []);
      const pagamentos = [];
      
      // Buscar pagamentos de todos os eventos
      for (const evento of todosEventos) {
        try {
          const pagamentosEvento = await this.getPagamentosPorEvento(userId, evento.id);
          pagamentos.push(...pagamentosEvento);
        } catch (error) {
          console.error(`Erro ao buscar pagamentos do evento ${evento.id}:`, error);
        }
      }

      // Calcular eventos de hoje
      const eventosHoje = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento.toDateString() === hoje.toDateString();
      });

      // Calcular eventos do mês
      const eventosMes = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento >= inicioMes && dataEvento <= fimMes;
      });

      // Calcular eventos próximos (próximos 7 dias)
      const proximos7Dias = new Date();
      proximos7Dias.setDate(hoje.getDate() + 7);
      const eventosProximos = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento >= hoje && dataEvento <= proximos7Dias;
      });

      // Calcular pagamentos do mês
      const pagamentosMes = pagamentos.filter(pagamento => {
        if (pagamento.dataPagamento) {
          const dataPagamento = new Date(pagamento.dataPagamento);
          return dataPagamento >= inicioMes && dataPagamento <= fimMes;
        }
        return false;
      });

      // Calcular pagamentos do ano
      const pagamentosAno = pagamentos.filter(pagamento => {
        if (pagamento.dataPagamento) {
          const dataPagamento = new Date(pagamento.dataPagamento);
          return dataPagamento >= inicioAno && dataPagamento <= fimAno;
        }
        return false;
      });

      const receitaMes = pagamentosMes
        .filter(p => p.status === 'Pago')
        .reduce((total, p) => total + p.valor, 0);

      const receitaAno = pagamentosAno
        .filter(p => p.status === 'Pago')
        .reduce((total, p) => total + p.valor, 0);

      // Calcular pagamentos pendentes e atrasados baseados nos eventos
      let valorPendente = 0;
      let valorAtrasado = 0;
      let pagamentosPendentes = 0;
      let pagamentosAtrasados = 0;

      // Para cada evento, calcular o resumo financeiro
      for (const evento of todosEventos) {
        try {
          const resumoEvento = await this.getResumoFinanceiroPorEvento(
            userId, 
            evento.id, 
            evento.valorTotal, 
            evento.diaFinalPagamento
          );
          
          valorPendente += resumoEvento.valorPendente;
          valorAtrasado += resumoEvento.valorAtrasado;
          
          if (resumoEvento.valorPendente > 0) {
            pagamentosPendentes++;
          }
          if (resumoEvento.valorAtrasado > 0) {
            pagamentosAtrasados++;
          }
        } catch (error) {
          console.error(`Erro ao calcular resumo financeiro do evento ${evento.id}:`, error);
        }
      }

      // Calcular gráficos
      const receitaMensal = [];
      const eventosPorTipo: Record<string, number> = {};
      const statusPagamentos: Record<string, number> = {};

      // Receita mensal dos últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
        const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
        
        const pagamentosDoMes = pagamentos.filter(pagamento => {
          if (pagamento.dataPagamento) {
            const dataPagamento = new Date(pagamento.dataPagamento);
            return dataPagamento >= inicioMes && dataPagamento <= fimMes;
          }
          return false;
        });
        
        const receita = pagamentosDoMes
          .filter(p => p.status === 'Pago')
          .reduce((total, p) => total + p.valor, 0);
        
        receitaMensal.push({
          mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
          valor: receita
        });
      }

      // Eventos por tipo
      todosEventos.forEach(evento => {
        eventosPorTipo[evento.tipoEvento] = (eventosPorTipo[evento.tipoEvento] || 0) + 1;
      });

      // Status dos pagamentos
      pagamentos.forEach(pagamento => {
        statusPagamentos[pagamento.status] = (statusPagamentos[pagamento.status] || 0) + 1;
      });

      // Calcular resumo financeiro geral
      const resumoFinanceiro = {
        receitaTotal: receitaAno,
        receitaMes,
        valorPendente,
        valorAtrasado,
        totalEventos: todosEventos.length,
        eventosConcluidos: todosEventos.filter(e => e.status === 'Concluído').length
      };

      return {
        eventosHoje: eventosHoje.length,
        eventosHojeLista: eventosHoje,
        eventosMes: eventosMes.length,
        receitaMes,
        receitaAno,
        pagamentosPendentes,
        valorPendente,
        valorAtrasado,
        eventosProximos,
        pagamentosVencendo: [], // Implementar lógica para pagamentos vencendo
        resumoFinanceiro,
        graficos: {
          receitaMensal,
          eventosPorTipo: Object.entries(eventosPorTipo).map(([tipo, quantidade]) => ({
            tipo,
            quantidade
          })),
          statusPagamentos: Object.entries(statusPagamentos).map(([status, quantidade]) => ({
            status,
            quantidade
          }))
        }
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      
      // Retornar dados vazios em caso de erro
      return {
        eventosHoje: 0,
        eventosHojeLista: [],
        eventosMes: 0,
        receitaMes: 0,
        receitaAno: 0,
        pagamentosPendentes: 0,
        valorPendente: 0,
        valorAtrasado: 0,
        eventosProximos: [],
        pagamentosVencendo: [],
        resumoFinanceiro: {
          receitaTotal: 0,
          receitaMes: 0,
          valorPendente: 0,
          valorAtrasado: 0,
          totalEventos: 0,
          eventosConcluidos: 0
        },
        graficos: {
          receitaMensal: [],
          eventosPorTipo: [],
          statusPagamentos: []
        }
      };
    }
  }
}

export const dataService = new DataService();
