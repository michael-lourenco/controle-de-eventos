import { repositoryFactory } from './repositories/repository-factory';
import { 
  Cliente, 
  Evento, 
  Pagamento, 
  TipoCusto, 
  CustoEvento, 
  AnexoEvento,
  DashboardData,
  ResumoCustosEvento
} from '@/types';
import { initializeAllCollections, initializeTiposCusto } from './collections-init';

export class DataService {
  private clienteRepo = repositoryFactory.getClienteRepository();
  private eventoRepo = repositoryFactory.getEventoRepository();
  private pagamentoRepo = repositoryFactory.getPagamentoRepository();
  private tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
  private custoEventoRepo = repositoryFactory.getCustoEventoRepository();

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
    return this.clienteRepo.findByUserId(userId);
  }

  async getClienteById(id: string): Promise<Cliente | null> {
    return this.clienteRepo.findById(id);
  }

  async createCliente(
    cliente: Omit<Cliente, 'id' | 'userId' | 'dataCadastro'>,
    userId: string
  ): Promise<Cliente> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar cliente');
    }
    const clienteWithMeta = {
      ...cliente,
      dataCadastro: new Date()
    } as Omit<Cliente, 'id'>;
    return this.clienteRepo.create({
      ...clienteWithMeta,
      userId
    } as Omit<Cliente, 'id'>);
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return this.clienteRepo.update(id, cliente);
  }

  async deleteCliente(id: string): Promise<void> {
    return this.clienteRepo.delete(id);
  }

  async searchClientesByName(name: string): Promise<Cliente[]> {
    return this.clienteRepo.searchByName(name);
  }

  // Métodos para Eventos
  async getEventos(userId: string): Promise<Evento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar eventos');
    }
    return this.eventoRepo.findByUserId(userId);
  }

  async getEventoById(id: string): Promise<Evento | null> {
    return this.eventoRepo.findById(id);
  }

  async createEvento(
    evento: Omit<Evento, 'id' | 'userId' | 'dataCadastro' | 'dataAtualizacao'>,
    userId: string
  ): Promise<Evento> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar evento');
    }
    console.log('DataService: Criando evento:', evento);
    try {
      const eventoWithMeta = {
        ...evento,
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      } as Omit<Evento, 'id'>;
      const resultado = await this.eventoRepo.create({
        ...eventoWithMeta,
        userId
      } as Omit<Evento, 'id'>);
      console.log('DataService: Evento criado com sucesso:', resultado);
      return resultado;
    } catch (error) {
      console.error('DataService: Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvento(id: string, evento: Partial<Evento>): Promise<Evento> {
    return this.eventoRepo.update(id, evento);
  }

  async deleteEvento(id: string): Promise<void> {
    return this.eventoRepo.delete(id);
  }

  async getEventosHoje(): Promise<Evento[]> {
    return this.eventoRepo.getEventosHoje();
  }

  async getProximosEventos(limit?: number): Promise<Evento[]> {
    return this.eventoRepo.getProximosEventos(limit);
  }

  async getEventosPorMes(mes: number, ano: number): Promise<Evento[]> {
    return this.eventoRepo.getEventosPorMes(mes, ano);
  }

  async getEventosPorStatus(status: string): Promise<Evento[]> {
    return this.eventoRepo.findByStatus(status);
  }

  async getEventosPorTipo(tipoEvento: string): Promise<Evento[]> {
    return this.eventoRepo.findByTipoEvento(tipoEvento);
  }

  async searchEventosByLocal(local: string): Promise<Evento[]> {
    return this.eventoRepo.searchByLocal(local);
  }

  async getEventosPorPeriodo(inicio: Date, fim: Date): Promise<Evento[]> {
    return this.eventoRepo.getEventosPorPeriodo(inicio, fim);
  }

  // Métodos para Pagamentos
  async getPagamentos(): Promise<Pagamento[]> {
    return this.pagamentoRepo.findAll();
  }

  async getPagamentoById(id: string): Promise<Pagamento | null> {
    return this.pagamentoRepo.findById(id);
  }

  async createPagamento(eventoId: string, pagamento: Omit<Pagamento, 'id'>): Promise<Pagamento> {
    return this.pagamentoRepo.createPagamento(eventoId, pagamento);
  }

  async updatePagamento(eventoId: string, pagamentoId: string, pagamento: Partial<Pagamento>): Promise<Pagamento> {
    return this.pagamentoRepo.updatePagamento(eventoId, pagamentoId, pagamento);
  }

  async deletePagamento(eventoId: string, pagamentoId: string): Promise<void> {
    return this.pagamentoRepo.deletePagamento(eventoId, pagamentoId);
  }

  async getPagamentosPorEvento(eventoId: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByEventoId(eventoId);
  }

  async getPagamentosPorStatus(status: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByStatus(status);
  }

  async getPagamentosPorForma(formaPagamento: string): Promise<Pagamento[]> {
    return this.pagamentoRepo.findByFormaPagamento(formaPagamento);
  }

  async getPagamentosPorMes(mes: number, ano: number): Promise<Pagamento[]> {
    return this.pagamentoRepo.getPagamentosPorMes(mes, ano);
  }

  async getTotalRecebidoPorPeriodo(inicio: Date, fim: Date): Promise<number> {
    return this.pagamentoRepo.getTotalRecebidoPorPeriodo(inicio, fim);
  }

  async getResumoFinanceiroPorEvento(eventoId: string, valorTotalEvento: number, dataFinalPagamento?: Date): Promise<{
    totalPago: number;
    valorPendente: number;
    valorAtrasado: number;
    quantidadePagamentos: number;
    isAtrasado: boolean;
  }> {
    return this.pagamentoRepo.getResumoFinanceiroPorEvento(eventoId, valorTotalEvento, dataFinalPagamento);
  }

  // Métodos para Tipos de Custo
  async getTiposCusto(userId: string): Promise<TipoCusto[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de custo');
    }
    try {
      // Garantir que os tipos de custo estejam inicializados
      await initializeTiposCusto();
      
      // Buscar tipos do usuário + tipos do sistema
      const [tiposUsuario, tiposSistema] = await Promise.all([
        this.tipoCustoRepo.findByUserId(userId),
        this.tipoCustoRepo.findByUserId('system')
      ]);
      return [...tiposUsuario, ...tiposSistema];
    } catch (error) {
      console.error('Erro ao carregar tipos de custo:', error);
      return [];
    }
  }

  async getTipoCustoById(id: string): Promise<TipoCusto | null> {
    return this.tipoCustoRepo.findById(id);
  }

  async createTipoCusto(tipoCusto: Omit<TipoCusto, 'id' | 'userId' | 'dataCadastro'>, userId: string): Promise<TipoCusto> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar tipo de custo');
    }
    return this.tipoCustoRepo.create({
      ...tipoCusto,
      userId,
      dataCadastro: new Date()
    } as Omit<TipoCusto, 'id'>);
  }

  async updateTipoCusto(id: string, tipoCusto: Partial<TipoCusto>): Promise<TipoCusto> {
    return this.tipoCustoRepo.update(id, tipoCusto);
  }

  async deleteTipoCusto(id: string): Promise<void> {
    return this.tipoCustoRepo.delete(id);
  }

  async getTiposCustoAtivos(): Promise<TipoCusto[]> {
    return this.tipoCustoRepo.getAtivos();
  }

  // Métodos para Custos de Evento
  async getCustosEvento(): Promise<CustoEvento[]> {
    return this.custoEventoRepo.findAll();
  }

  async getCustoEventoById(id: string): Promise<CustoEvento | null> {
    return this.custoEventoRepo.findById(id);
  }

  async createCustoEvento(eventoId: string, custoEvento: Omit<CustoEvento, 'id'>): Promise<CustoEvento> {
    return this.custoEventoRepo.createCustoEvento(eventoId, custoEvento);
  }

  async updateCustoEvento(eventoId: string, custoId: string, custoEvento: Partial<CustoEvento>): Promise<CustoEvento> {
    return this.custoEventoRepo.updateCustoEvento(eventoId, custoId, custoEvento);
  }

  async deleteCustoEvento(eventoId: string, custoId: string): Promise<void> {
    return this.custoEventoRepo.deleteCustoEvento(eventoId, custoId);
  }

  async getCustosPorEvento(eventoId: string): Promise<CustoEvento[]> {
    return this.custoEventoRepo.findByEventoId(eventoId);
  }

  async getTotalCustosPorEvento(eventoId: string): Promise<number> {
    return this.custoEventoRepo.getTotalCustosPorEvento(eventoId);
  }

  async getResumoCustosPorEvento(eventoId: string): Promise<ResumoCustosEvento> {
    return this.custoEventoRepo.getResumoCustosPorEvento(eventoId);
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
      const [
        eventos,
        pagamentos,
        todosEventos
      ] = await Promise.all([
        this.getEventos(userId).catch(() => []),
        this.getPagamentos().catch(() => []),
        this.getEventos(userId).catch(() => [])
      ]);

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

      // Calcular pagamentos pendentes (todos os pagamentos são 'Pago' agora)
      const pagamentosPendentes = []; // Não há mais pagamentos pendentes
      const valorPendente = 0; // Calculado dinamicamente por evento

      // Calcular pagamentos atrasados (todos os pagamentos são 'Pago' agora)
      const pagamentosAtrasados = []; // Não há mais pagamentos atrasados
      const valorAtrasado = 0; // Calculado dinamicamente por evento

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

      return {
        eventosHoje: eventosHoje.length,
        eventosHojeLista: eventosHoje,
        eventosMes: eventosMes.length,
        receitaMes,
        receitaAno,
        pagamentosPendentes: pagamentosPendentes.length,
        valorPendente,
        valorAtrasado,
        eventosProximos,
        pagamentosVencendo: [], // Implementar lógica para pagamentos vencendo
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
