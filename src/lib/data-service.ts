import { repositoryFactory } from './repositories/repository-factory';
import { 
  Cliente, 
  Evento, 
  Pagamento, 
  TipoCusto, 
  CustoEvento, 
  TipoServico,
  ServicoEvento,
  CanalEntrada,
  AnexoEvento,
  DashboardData,
  ResumoCustosEvento,
  ResumoServicosEvento,
  TipoEvento,
  DEFAULT_TIPOS_EVENTO
} from '@/types';
import { initializeAllCollections, initializeTiposCusto } from './collections-init';
import { FuncionalidadeService } from './services/funcionalidade-service';

export class DataService {
  private clienteRepo = repositoryFactory.getClienteRepository();
  private eventoRepo = repositoryFactory.getEventoRepository();
  private pagamentoRepo = repositoryFactory.getPagamentoRepository();
  private tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
  private custoEventoRepo = repositoryFactory.getCustoEventoRepository();
  private tipoServicoRepo = repositoryFactory.getTipoServicoRepository();
  private servicoEventoRepo = repositoryFactory.getServicoEventoRepository();
  private canalEntradaRepo = repositoryFactory.getCanalEntradaRepository();
  private tipoEventoRepo = repositoryFactory.getTipoEventoRepository();
  private funcionalidadeService = new FuncionalidadeService();

  // Método para inicializar collections automaticamente
  private async ensureCollectionsInitialized(): Promise<void> {
    try {
      await initializeAllCollections();
    } catch (error) {
      console.error('Erro ao inicializar collections:', error);
      // Não lançar erro para não quebrar a aplicação
    }
  }

  private async ensureTiposEventoInitialized(userId: string): Promise<void> {
    if (!userId) {
      return;
    }

    try {
      const existentes = await this.tipoEventoRepo.findAll(userId);
      if (existentes.length === 0) {
        for (const tipo of DEFAULT_TIPOS_EVENTO) {
          await this.tipoEventoRepo.createTipoEvento(
            {
              nome: tipo.nome,
              descricao: tipo.descricao ?? '',
              ativo: true,
              dataCadastro: new Date()
            },
            userId
          );
        }
      }
    } catch (error) {
      console.error('Erro ao garantir tipos de evento padrões:', error);
    }
  }

  // Inicializar Canais de Entrada padrão
  private async ensureCanaisEntradaInitialized(userId: string): Promise<void> {
    if (!userId) return;
    try {
      const existentes = await this.canalEntradaRepo.findAll(userId);
      if (existentes.length === 0) {
        const defaults = [
          { nome: 'instagram', descricao: 'Origem: Instagram' },
          { nome: 'indicação', descricao: 'Origem: Indicação' },
          { nome: 'outros', descricao: 'Origem: Outros' }
        ];
        for (const item of defaults) {
          await this.canalEntradaRepo.createCanalEntrada(userId, {
            ...item,
            ativo: true,
            dataCadastro: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao garantir canais de entrada padrões:', error);
    }
  }

  // Inicializar Tipos de Serviço padrão
  private async ensureTiposServicoInitialized(userId: string): Promise<void> {
    if (!userId) return;
    try {
      const existentes = await this.tipoServicoRepo.findAll(userId);
      if (existentes.length === 0) {
        const defaults = [
          { nome: 'totem fotográfico', descricao: 'Serviço de totem fotográfico' },
          { nome: 'instaprint', descricao: 'Serviço de Instaprint' },
          { nome: 'outros', descricao: 'Outros serviços' }
        ];
        for (const item of defaults) {
          await this.tipoServicoRepo.createTipoServico(
            { ...item, dataCadastro: new Date(), ativo: true },
            userId
          );
        }
      }
    } catch (error) {
      console.error('Erro ao garantir tipos de serviço padrões:', error);
    }
  }

  // Métodos para Clientes
  async getClientes(userId: string): Promise<Cliente[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar clientes');
    }
    // Retornar apenas clientes não arquivados por padrão
    return this.clienteRepo.getAtivos(userId);
  }
  
  async getAllClientes(userId: string): Promise<Cliente[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar clientes');
    }
    // Retornar todos os clientes (incluindo arquivados) - usado em relatórios
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

    // Validar permissão e limite antes de criar
    const validacao = await this.funcionalidadeService.verificarPodeCriar(userId, 'clientes');
    if (!validacao.pode) {
      const erro = new Error(validacao.motivo || 'Não é possível criar cliente');
      (erro as any).status = 403;
      (erro as any).limite = validacao.limite;
      (erro as any).usado = validacao.usado;
      (erro as any).restante = validacao.restante;
      throw erro;
    }

    return this.clienteRepo.createCliente(cliente, userId);
  }

  async updateCliente(id: string, cliente: Partial<Cliente>, userId: string): Promise<Cliente> {
    return this.clienteRepo.updateCliente(id, cliente, userId);
  }

  async deleteCliente(id: string, userId: string): Promise<void> {
    return this.clienteRepo.deleteCliente(id, userId);
  }
  
  async desarquivarCliente(id: string, userId: string): Promise<void> {
    return this.clienteRepo.desarquivarCliente(id, userId);
  }
  
  async getClientesArquivados(userId: string): Promise<Cliente[]> {
    return this.clienteRepo.getArquivados(userId);
  }

  async searchClientesByName(name: string, userId: string): Promise<Cliente[]> {
    return this.clienteRepo.searchByName(name, userId);
  }

  // Métodos para Eventos
  async getEventos(userId: string): Promise<Evento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar eventos');
    }
    // Retornar apenas eventos não arquivados por padrão
    return this.eventoRepo.getAtivos(userId);
  }
  
  async getAllEventos(userId: string): Promise<Evento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar eventos');
    }
    // Retornar todos os eventos (incluindo arquivados) - usado em relatórios
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

    // Validar permissão e limite antes de criar
    const validacao = await this.funcionalidadeService.verificarPodeCriar(userId, 'eventos');
    if (!validacao.pode) {
      const erro = new Error(validacao.motivo || 'Não é possível criar evento');
      (erro as any).status = 403;
      (erro as any).limite = validacao.limite;
      (erro as any).usado = validacao.usado;
      (erro as any).restante = validacao.restante;
      throw erro;
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
  
  async desarquivarEvento(id: string, userId: string): Promise<void> {
    return this.eventoRepo.desarquivarEvento(id, userId);
  }
  
  async getEventosArquivados(userId: string): Promise<Evento[]> {
    return this.eventoRepo.getArquivados(userId);
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
    // Validar permissão para registrar pagamentos
    const temPermissao = await this.funcionalidadeService.verificarPermissao(userId, 'PAGAMENTOS_REGISTRAR');
    if (!temPermissao) {
      const erro = new Error('Seu plano não permite registrar pagamentos');
      (erro as any).status = 403;
      throw erro;
    }

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
      
      // Buscar apenas tipos ativos por padrão
      return this.tipoCustoRepo.getAtivos(userId);
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

    // Validar permissão para gerenciar custos
    const temPermissao = await this.funcionalidadeService.verificarPermissao(userId, 'CUSTOS_GERENCIAR');
    if (!temPermissao) {
      const erro = new Error('Seu plano não permite gerenciar custos');
      (erro as any).status = 403;
      throw erro;
    }

    return this.tipoCustoRepo.createTipoCusto(tipoCusto, userId);
  }

  async updateTipoCusto(id: string, tipoCusto: Partial<TipoCusto>, userId: string): Promise<TipoCusto> {
    return this.tipoCustoRepo.updateTipoCusto(id, tipoCusto, userId);
  }

  async deleteTipoCusto(id: string, userId: string): Promise<void> {
    return this.tipoCustoRepo.deleteTipoCusto(id, userId);
  }
  
  async reativarTipoCusto(id: string, userId: string): Promise<void> {
    return this.tipoCustoRepo.reativarTipoCusto(id, userId);
  }
  
  async getTiposCustoAtivos(userId: string): Promise<TipoCusto[]> {
    return this.tipoCustoRepo.getAtivos(userId);
  }
  
  async getTiposCustoInativos(userId: string): Promise<TipoCusto[]> {
    return this.tipoCustoRepo.getInativos(userId);
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

  // Método para buscar todos os custos de todos os eventos do usuário
  async getAllCustos(userId: string): Promise<CustoEvento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar custos');
    }
    
    try {
      // Buscar todos os eventos do usuário
      const eventos = await this.getEventos(userId);
      const todosCustos: CustoEvento[] = [];
      
      // Buscar custos de todos os eventos
      for (const evento of eventos) {
        try {
          const custosEvento = await this.getCustosPorEvento(userId, evento.id);
          todosCustos.push(...custosEvento);
        } catch (error) {
          console.error(`Erro ao buscar custos do evento ${evento.id}:`, error);
        }
      }
      
      // Ordenar por data de cadastro (mais recente primeiro)
      return todosCustos.sort((a, b) => 
        new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar todos os custos:', error);
      return [];
    }
  }

  // Métodos para Tipos de Serviço
  async getTiposServico(userId: string): Promise<TipoServico[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de serviço');
    }
    try {
      await this.ensureCollectionsInitialized();
      await this.ensureTiposServicoInitialized(userId);
      // Buscar apenas tipos ativos por padrão
      return this.tipoServicoRepo.getAtivos(userId);
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      throw error;
    }
  }
  
  async getAllTiposServico(userId: string): Promise<TipoServico[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de serviço');
    }
    try {
      await this.ensureCollectionsInitialized();
      await this.ensureTiposServicoInitialized(userId);
      // Retornar todos (incluindo inativos) - usado em relatórios
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
    // Validar permissão para gerenciar serviços
    const temPermissao = await this.funcionalidadeService.verificarPermissao(userId, 'SERVICOS_GERENCIAR');
    if (!temPermissao) {
      const erro = new Error('Seu plano não permite gerenciar serviços');
      (erro as any).status = 403;
      throw erro;
    }

    return this.tipoServicoRepo.createTipoServico(tipoServico, userId);
  }

  async updateTipoServico(id: string, tipoServico: Partial<TipoServico>, userId: string): Promise<TipoServico> {
    return this.tipoServicoRepo.updateTipoServico(id, tipoServico, userId);
  }

  async deleteTipoServico(id: string, userId: string): Promise<void> {
    return this.tipoServicoRepo.deleteTipoServico(id, userId);
  }
  
  async reativarTipoServico(id: string, userId: string): Promise<void> {
    return this.tipoServicoRepo.reativarTipoServico(id, userId);
  }
  
  async getTiposServicoInativos(userId: string): Promise<TipoServico[]> {
    return this.tipoServicoRepo.getInativos(userId);
  }

  async getTiposServicoAtivos(userId: string): Promise<TipoServico[]> {
    await this.ensureTiposServicoInitialized(userId);
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
    // Validar permissão para gerenciar serviços
    const temPermissao = await this.funcionalidadeService.verificarPermissao(userId, 'SERVICOS_GERENCIAR');
    if (!temPermissao) {
      const erro = new Error('Seu plano não permite gerenciar serviços');
      (erro as any).status = 403;
      throw erro;
    }

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

      // Buscar apenas eventos (UMA QUERY) - SIMPLIFICADO
      const eventos = await this.getEventos(userId).catch(() => []);
      
      // ========== CÁLCULOS COMPLEXOS COMENTADOS (lento com muitos eventos) ==========
      // 
      // // Para pagamentos, precisamos buscar de todos os eventos
      // // COMENTADO: Isso faz N queries ao banco (uma para cada evento) - MUITO LENTO
      // const todosEventos = await this.getEventos(userId).catch(() => []);
      // const pagamentos = [];
      // 
      // // Buscar pagamentos de todos os eventos
      // // COMENTADO: Loop que faz N queries ao banco
      // for (const evento of todosEventos) {
      //   try {
      //     const pagamentosEvento = await this.getPagamentosPorEvento(userId, evento.id);
      //     pagamentos.push(...pagamentosEvento);
      //   } catch (error) {
      //     console.error(`Erro ao buscar pagamentos do evento ${evento.id}:`, error);
      //   }
      // }

      // Calcular eventos de hoje (filtro simples - RÁPIDO)
      const eventosHoje = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento.toDateString() === hoje.toDateString();
      });

      // Calcular eventos do mês (filtro simples - RÁPIDO)
      const eventosMes = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento >= inicioMes && dataEvento <= fimMes;
      });

      // Calcular eventos próximos (próximos 7 dias incluindo hoje) - RÁPIDO
      const proximos7Dias = new Date();
      proximos7Dias.setDate(hoje.getDate() + 7);
      proximos7Dias.setHours(23, 59, 59, 999);
      
      // Ajustar hoje para início do dia para incluir eventos de hoje
      const hojeInicio = new Date(hoje);
      hojeInicio.setHours(0, 0, 0, 0);
      
      const eventosProximos = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento >= hojeInicio && dataEvento <= proximos7Dias;
      });

      // ========== CÁLCULOS DE PAGAMENTOS COMENTADOS (requer buscar pagamentos) ==========
      // 
      // // Calcular pagamentos do mês
      // // COMENTADO: Requer buscar todos os pagamentos primeiro
      // const pagamentosMes = pagamentos.filter(pagamento => {
      //   if (pagamento.dataPagamento) {
      //     const dataPagamento = new Date(pagamento.dataPagamento);
      //     return dataPagamento >= inicioMes && dataPagamento <= fimMes;
      //   }
      //   return false;
      // });
      // 
      // // Calcular pagamentos do ano
      // // COMENTADO: Requer buscar todos os pagamentos primeiro
      // const pagamentosAno = pagamentos.filter(pagamento => {
      //   if (pagamento.dataPagamento) {
      //     const dataPagamento = new Date(pagamento.dataPagamento);
      //     return dataPagamento >= inicioAno && dataPagamento <= fimAno;
      //   }
      //   return false;
      // });
      // 
      // const receitaMes = pagamentosMes
      //   .filter(p => p.status === 'Pago')
      //   .reduce((total, p) => total + p.valor, 0);
      // 
      // const receitaAno = pagamentosAno
      //   .filter(p => p.status === 'Pago')
      //   .reduce((total, p) => total + p.valor, 0);

      // ========== VALORES SIMPLES BASEADOS APENAS NOS EVENTOS ==========
      // Receita do mês: soma de valorTotal dos eventos concluídos do mês (SIMPLIFICADO)
      const eventosConcluidosMes = eventosMes.filter(e => e.status === 'Concluído');
      const receitaMes = eventosConcluidosMes.reduce((total, e) => total + (e.valorTotal || 0), 0);

      // Receita do ano: soma de valorTotal dos eventos concluídos do ano (SIMPLIFICADO)
      const eventosConcluidosAno = eventos.filter(evento => {
        const dataEvento = new Date(evento.dataEvento);
        return dataEvento >= inicioAno && dataEvento <= fimAno && evento.status === 'Concluído';
      });
      const receitaAno = eventosConcluidosAno.reduce((total, e) => total + (e.valorTotal || 0), 0);

      // Receita total: receita do ano (SIMPLIFICADO)
      const receitaTotal = receitaAno;

      // ========== CÁLCULOS COMPLEXOS DE PAGAMENTOS PENDENTES/ATRASADOS COMENTADOS ==========
      // 
      // // Calcular pagamentos pendentes e atrasados baseados nos eventos
      // // COMENTADO: Requer buscar pagamentos de cada evento (N queries) - MUITO LENTO
      // let valorPendente = 0;
      // let valorAtrasado = 0;
      // let pagamentosPendentes = 0;
      // let pagamentosAtrasados = 0;
      // 
      // // Para cada evento, calcular o resumo financeiro
      // // COMENTADO: Loop que faz N queries ao banco - MUITO LENTO com muitos eventos
      // for (const evento of todosEventos) {
      //   try {
      //     const resumoEvento = await this.getResumoFinanceiroPorEvento(
      //       userId, 
      //       evento.id, 
      //       evento.valorTotal, 
      //       evento.diaFinalPagamento
      //     );
      //     
      //     valorPendente += resumoEvento.valorPendente;
      //     valorAtrasado += resumoEvento.valorAtrasado;
      //     
      //     if (resumoEvento.valorPendente > 0) {
      //       pagamentosPendentes++;
      //     }
      //     if (resumoEvento.valorAtrasado > 0) {
      //       pagamentosAtrasados++;
      //     }
      //   } catch (error) {
      //     console.error(`Erro ao calcular resumo financeiro do evento ${evento.id}:`, error);
      //   }
      // }

      // Valores simplificados baseados apenas nos eventos (SEM buscar pagamentos)
      // Valor pendente: soma de valorTotal dos eventos não concluídos (SIMPLIFICADO)
      const eventosNaoConcluidos = eventos.filter(e => e.status !== 'Concluído');
      const valorPendente = eventosNaoConcluidos.reduce((total, e) => total + (e.valorTotal || 0), 0);
      const pagamentosPendentes = eventosNaoConcluidos.length;

      // Valor atrasado: 0 (não pode ser calculado sem buscar pagamentos)
      // COMENTADO: Para calcular valor atrasado, seria necessário:
      // 1. Buscar pagamentos de cada evento
      // 2. Comparar valorTotal com totalPago
      // 3. Verificar se dataFinalPagamento passou
      // Isso requer N queries ao banco - MUITO LENTO
      const valorAtrasado = 0;

      // ========== CÁLCULOS DE GRÁFICOS COMENTADOS (requer buscar pagamentos) ==========
      // 
      // // Calcular gráficos
      // // COMENTADO: Requer buscar todos os pagamentos primeiro
      // const receitaMensal = [];
      // const eventosPorTipo: Record<string, number> = {};
      // const statusPagamentos: Record<string, number> = {};
      // 
      // // Receita mensal dos últimos 12 meses
      // // COMENTADO: Loop complexo que processa pagamentos de 12 meses
      // for (let i = 11; i >= 0; i--) {
      //   const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      //   const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
      //   const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0);
      //   
      //   const pagamentosDoMes = pagamentos.filter(pagamento => {
      //     if (pagamento.dataPagamento) {
      //       const dataPagamento = new Date(pagamento.dataPagamento);
      //       return dataPagamento >= inicioMes && dataPagamento <= fimMes;
      //     }
      //     return false;
      //   });
      //   
      //   const receita = pagamentosDoMes
      //     .filter(p => p.status === 'Pago')
      //     .reduce((total, p) => total + p.valor, 0);
      //   
      //   receitaMensal.push({
      //     mes: mes.toLocaleDateString('pt-BR', { month: 'short' }),
      //     valor: receita
      //   });
      // }
      // 
      // // Eventos por tipo
      // // COMENTADO: Pode ser calculado simplesmente, mas mantido comentado por enquanto
      // todosEventos.forEach(evento => {
      //   eventosPorTipo[evento.tipoEvento] = (eventosPorTipo[evento.tipoEvento] || 0) + 1;
      // });
      // 
      // // Status dos pagamentos
      // // COMENTADO: Requer buscar todos os pagamentos primeiro
      // pagamentos.forEach(pagamento => {
      //   statusPagamentos[pagamento.status] = (statusPagamentos[pagamento.status] || 0) + 1;
      // });

      // Gráficos simplificados (apenas eventos por tipo - RÁPIDO)
      const eventosPorTipo: Record<string, number> = {};
      eventos.forEach(evento => {
        eventosPorTipo[evento.tipoEvento] = (eventosPorTipo[evento.tipoEvento] || 0) + 1;
      });

      // Calcular resumo financeiro geral (valores simplificados)
      const resumoFinanceiro = {
        receitaTotal,
        receitaMes,
        valorPendente,
        valorAtrasado,
        totalEventos: eventos.length,
        eventosConcluidos: eventos.filter(e => e.status === 'Concluído').length
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
        pagamentosVencendo: [], // COMENTADO: Requer buscar pagamentos
        resumoFinanceiro,
        graficos: {
          receitaMensal: [], // COMENTADO: Requer buscar pagamentos de 12 meses
          eventosPorTipo: Object.entries(eventosPorTipo).map(([tipo, quantidade]) => ({
            tipo,
            quantidade
          })),
          statusPagamentos: [] // COMENTADO: Requer buscar todos os pagamentos
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

  // Métodos para Canais de Entrada
  async getCanaisEntrada(userId: string): Promise<CanalEntrada[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar canais de entrada');
    }
    try {
      await this.ensureCanaisEntradaInitialized(userId);
      return await this.canalEntradaRepo.findAll(userId);
    } catch (error) {
      console.error('Erro ao buscar canais de entrada:', error);
      // Retornar lista vazia se a subcollection não existe ainda
      return [];
    }
  }

  async getCanaisEntradaAtivos(userId: string): Promise<CanalEntrada[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar canais de entrada ativos');
    }
    await this.ensureCanaisEntradaInitialized(userId);
    return this.canalEntradaRepo.getAtivos(userId);
  }

  async getCanalEntradaById(id: string, userId: string): Promise<CanalEntrada | null> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para buscar canal de entrada');
    }
    return this.canalEntradaRepo.getCanalEntradaById(userId, id);
  }

  async createCanalEntrada(canal: Omit<CanalEntrada, 'id'>, userId: string): Promise<CanalEntrada> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar canal de entrada');
    }

    // Validar se usuário tem plano ativo - usar validação de funcionalidade genérica
    // Como não existe funcionalidade específica para canais de entrada, verificamos se tem plano ativo
    const statusPlano = await this.funcionalidadeService.obterStatusAssinatura(userId);
    if (!statusPlano.ativo) {
      const erro = new Error('Seu plano não permite gerenciar canais de entrada');
      (erro as any).status = 403;
      throw erro;
    }

    return this.canalEntradaRepo.createCanalEntrada(userId, canal);
  }

  async updateCanalEntrada(id: string, canal: Partial<CanalEntrada>, userId: string): Promise<CanalEntrada> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para atualizar canal de entrada');
    }
    return this.canalEntradaRepo.updateCanalEntrada(userId, id, canal);
  }

  async deleteCanalEntrada(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para deletar canal de entrada');
    }
    return this.canalEntradaRepo.deleteCanalEntrada(userId, id);
  }
  
  async reativarCanalEntrada(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para reativar canal de entrada');
    }
    return this.canalEntradaRepo.reativarCanalEntrada(userId, id);
  }
  
  async getCanaisEntradaInativos(userId: string): Promise<CanalEntrada[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar canais de entrada inativos');
    }
    return this.canalEntradaRepo.getInativos(userId);
  }

  async searchCanaisEntrada(searchTerm: string, userId: string): Promise<CanalEntrada[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar canais de entrada');
    }
    return this.canalEntradaRepo.searchByName(userId, searchTerm);
  }

  // Métodos para Tipos de Evento
  async getTiposEvento(userId: string): Promise<TipoEvento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de evento');
    }
    await this.ensureTiposEventoInitialized(userId);
    const tipos = await this.tipoEventoRepo.findAll(userId);
    return tipos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async getTiposEventoAtivos(userId: string): Promise<TipoEvento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de evento');
    }
    await this.ensureTiposEventoInitialized(userId);
    const tipos = await this.tipoEventoRepo.getAtivos(userId);
    return tipos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  async getTipoEventoById(id: string, userId: string): Promise<TipoEvento | null> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para buscar tipo de evento');
    }
    return this.tipoEventoRepo.getTipoEventoById(id, userId);
  }

  async createTipoEvento(tipoEvento: Omit<TipoEvento, 'id' | 'dataCadastro'>, userId: string): Promise<TipoEvento> {
    if (!userId) {
      throw new Error('userId é obrigatório para criar tipo de evento');
    }

    // Validar se usuário tem plano ativo - usar validação de funcionalidade genérica
    // Como não existe funcionalidade específica para tipos de evento, verificamos se tem plano ativo
    const statusPlano = await this.funcionalidadeService.obterStatusAssinatura(userId);
    if (!statusPlano.ativo) {
      const erro = new Error('Seu plano não permite gerenciar tipos de evento');
      (erro as any).status = 403;
      throw erro;
    }

    return this.tipoEventoRepo.createTipoEvento(
      {
        ...tipoEvento,
        dataCadastro: new Date()
      },
      userId
    );
  }

  async updateTipoEvento(id: string, tipoEvento: Partial<TipoEvento>, userId: string): Promise<TipoEvento> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para atualizar tipo de evento');
    }
    return this.tipoEventoRepo.updateTipoEvento(id, tipoEvento, userId);
  }

  async deleteTipoEvento(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para deletar tipo de evento');
    }
    return this.tipoEventoRepo.deleteTipoEvento(id, userId);
  }
  
  async reativarTipoEvento(id: string, userId: string): Promise<void> {
    if (!id || !userId) {
      throw new Error('id e userId são obrigatórios para reativar tipo de evento');
    }
    return this.tipoEventoRepo.reativarTipoEvento(id, userId);
  }
  
  async getTiposEventoInativos(userId: string): Promise<TipoEvento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de evento inativos');
    }
    await this.ensureTiposEventoInitialized(userId);
    const tipos = await this.tipoEventoRepo.getInativos(userId);
    return tipos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  // Métodos para serviços
  async getAllServicos(userId: string): Promise<ServicoEvento[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar serviços');
    }
    
    // Buscar todos os eventos do usuário
    const eventos = await this.eventoRepo.findAll(userId);
    const todosServicos: ServicoEvento[] = [];
    
    // Para cada evento, buscar seus serviços
    for (const evento of eventos) {
      const servicos = await this.servicoEventoRepo.findByEventoId(userId, evento.id);
      todosServicos.push(...servicos);
    }
    
    return todosServicos;
  }

  async getTiposServicos(userId: string): Promise<TipoServico[]> {
    if (!userId) {
      throw new Error('userId é obrigatório para buscar tipos de serviços');
    }
    return this.tipoServicoRepo.findAll(userId);
  }
}

export const dataService = new DataService();
