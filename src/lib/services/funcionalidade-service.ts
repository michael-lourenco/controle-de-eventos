import { FuncionalidadeRepository } from '../repositories/funcionalidade-repository';
import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { UserRepository } from '../repositories/user-repository';
import { Funcionalidade, LimitesUsuario } from '@/types/funcionalidades';
import { EventoRepository } from '../repositories/evento-repository';
import { ClienteRepository } from '../repositories/cliente-repository';
import { AssinaturaService, PlanoStatus } from './assinatura-service';

export class FuncionalidadeService {
  private funcionalidadeRepo: FuncionalidadeRepository;
  private assinaturaRepo: AssinaturaRepository;
  private userRepo: UserRepository;
  private eventoRepo: EventoRepository;
  private clienteRepo: ClienteRepository;
  private assinaturaService: AssinaturaService;

  constructor() {
    this.funcionalidadeRepo = new FuncionalidadeRepository();
    this.assinaturaRepo = new AssinaturaRepository();
    this.userRepo = new UserRepository();
    this.eventoRepo = new EventoRepository();
    this.clienteRepo = new ClienteRepository();
    this.assinaturaService = new AssinaturaService();
  }

  async verificarPermissao(userId: string, codigoFuncionalidade: string): Promise<boolean> {
    try {
      // Admin sempre tem todas as permissões
      const user = await this.userRepo.findById(userId);
      if (user?.role === 'admin') {
        return true;
      }

      // Buscar funcionalidade
      const funcionalidade = await this.funcionalidadeRepo.findByCodigo(codigoFuncionalidade);
      if (!funcionalidade || !funcionalidade.ativo) {
        return false;
      }

      // Verificar se usuário tem funcionalidade habilitada
      const assinatura = await this.assinaturaRepo.findByUserId(userId);
      
      if (!assinatura) {
        return false;
      }

      if (assinatura.status !== 'active' && assinatura.status !== 'trial') {
        return false;
      }

      return assinatura.funcionalidadesHabilitadas.includes(funcionalidade.id);
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  async obterFuncionalidadesHabilitadas(userId: string): Promise<Funcionalidade[]> {
    try {
      const assinatura = await this.assinaturaRepo.findByUserId(userId);
      
      if (!assinatura) {
        return [];
      }

      if (assinatura.status !== 'active' && assinatura.status !== 'trial') {
        return [];
      }

      const funcionalidades: Funcionalidade[] = [];
      for (const funcId of assinatura.funcionalidadesHabilitadas) {
        const func = await this.funcionalidadeRepo.findById(funcId);
        if (func && func.ativo) {
          funcionalidades.push(func);
        }
      }

      return funcionalidades;
    } catch (error) {
      console.error('Erro ao obter funcionalidades habilitadas:', error);
      return [];
    }
  }

  async obterLimitesUsuario(userId: string): Promise<LimitesUsuario> {
    try {
      const assinatura = await this.assinaturaRepo.findByUserId(userId);
      
      if (!assinatura) {
        return {
          eventosMesAtual: 0,
          clientesTotal: 0,
          usuariosConta: 1,
          armazenamentoUsado: 0
        };
      }

      // Buscar plano para obter limites
      let limiteEventos: number | undefined;
      let limiteClientes: number | undefined;
      let limiteUsuarios: number | undefined;

      if (assinatura.planoId) {
        const { PlanoRepository } = await import('../repositories/plano-repository');
        const planoRepo = new PlanoRepository();
        const plano = await planoRepo.findById(assinatura.planoId);
        limiteEventos = plano?.limiteEventos;
        limiteClientes = plano?.limiteClientes;
        limiteUsuarios = plano?.limiteUsuarios;
      }

      // Contar eventos do mês atual
      const eventos = await this.eventoRepo.findAll(userId);
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const eventosMesAtual = eventos.filter(e => 
        e.dataCadastro >= inicioMes && e.dataCadastro <= agora
      ).length;

      // Contar clientes
      const clientes = await this.clienteRepo.findAll(userId);
      const clientesTotal = clientes.length;

      // TODO: Implementar contagem de usuários por conta
      const usuariosConta = 1;

      // TODO: Implementar cálculo de armazenamento usado
      const armazenamentoUsado = 0;

      return {
        eventosMesAtual,
        eventosLimiteMes: limiteEventos,
        clientesTotal,
        clientesLimite: limiteClientes,
        usuariosConta,
        usuariosLimite: limiteUsuarios,
        armazenamentoUsado,
        armazenamentoLimite: limiteUsuarios ? undefined : undefined
      };
    } catch (error) {
      console.error('Erro ao obter limites do usuário:', error);
      return {
        eventosMesAtual: 0,
        clientesTotal: 0,
        usuariosConta: 1,
        armazenamentoUsado: 0
      };
    }
  }

  async verificarLimite(userId: string, tipoLimite: 'eventos' | 'clientes' | 'usuarios', valorAtual: number): Promise<boolean> {
    const limites = await this.obterLimitesUsuario(userId);
    
    switch (tipoLimite) {
      case 'eventos':
        if (!limites.eventosLimiteMes) return true; // Sem limite
        return valorAtual < limites.eventosLimiteMes;
      case 'clientes':
        if (!limites.clientesLimite) return true; // Sem limite
        return valorAtual < limites.clientesLimite;
      case 'usuarios':
        if (!limites.usuariosLimite) return true; // Sem limite
        return valorAtual < limites.usuariosLimite;
      default:
        return true;
    }
  }

  /**
   * Verifica se pode criar mais eventos
   */
  async verificarLimiteEventos(userId: string): Promise<{ pode: boolean; limite?: number; usado: number; restante?: number }> {
    const limites = await this.obterLimitesUsuario(userId);
    
    if (!limites.eventosLimiteMes) {
      return { pode: true, usado: limites.eventosMesAtual };
    }

    const restante = Math.max(0, limites.eventosLimiteMes - limites.eventosMesAtual);
    return {
      pode: limites.eventosMesAtual < limites.eventosLimiteMes,
      limite: limites.eventosLimiteMes,
      usado: limites.eventosMesAtual,
      restante
    };
  }

  /**
   * Verifica se pode criar mais clientes
   */
  async verificarLimiteClientes(userId: string): Promise<{ pode: boolean; limite?: number; usado: number; restante?: number }> {
    const limites = await this.obterLimitesUsuario(userId);
    
    if (!limites.clientesLimite) {
      return { pode: true, usado: limites.clientesTotal };
    }

    const restante = Math.max(0, limites.clientesLimite - limites.clientesTotal);
    return {
      pode: limites.clientesTotal < limites.clientesLimite,
      limite: limites.clientesLimite,
      usado: limites.clientesTotal,
      restante
    };
  }

  /**
   * Verifica acesso a relatórios
   */
  async verificarAcessoRelatorio(userId: string, tipoRelatorio: 'BASICOS' | 'AVANCADOS' | 'FLUXO_CAIXA'): Promise<boolean> {
    const codigos: Record<string, string> = {
      'BASICOS': 'RELATORIOS_BASICOS',
      'AVANCADOS': 'RELATORIOS_AVANCADOS',
      'FLUXO_CAIXA': 'FLUXO_CAIXA'
    };

    const codigoFuncionalidade = codigos[tipoRelatorio];
    if (!codigoFuncionalidade) {
      return false;
    }

    return this.verificarPermissao(userId, codigoFuncionalidade);
  }

  /**
   * Obtém status completo da assinatura
   */
  async obterStatusAssinatura(userId: string): Promise<PlanoStatus> {
    return this.assinaturaService.obterStatusPlanoUsuario(userId);
  }

  /**
   * Verifica se usuário pode realizar uma ação (permissão + limite)
   */
  async verificarPodeCriar(userId: string, tipo: 'eventos' | 'clientes'): Promise<{ 
    pode: boolean; 
    motivo?: string; 
    limite?: number; 
    usado?: number;
    restante?: number;
  }> {
    // Verificar permissão
    const codigoFuncionalidade = tipo === 'eventos' ? 'EVENTOS_LIMITADOS' : 'CLIENTES_LIMITADOS';
    const temPermissao = await this.verificarPermissao(userId, codigoFuncionalidade);
    
    if (!temPermissao) {
      return { 
        pode: false, 
        motivo: `Seu plano não permite criar ${tipo}` 
      };
    }

    // Verificar limite
    if (tipo === 'eventos') {
      const limiteEventos = await this.verificarLimiteEventos(userId);
      if (!limiteEventos.pode) {
        return {
          pode: false,
          motivo: `Limite de ${tipo} do mês atingido`,
          limite: limiteEventos.limite,
          usado: limiteEventos.usado,
          restante: limiteEventos.restante
        };
      }
      return limiteEventos;
    } else {
      const limiteClientes = await this.verificarLimiteClientes(userId);
      if (!limiteClientes.pode) {
        return {
          pode: false,
          motivo: `Limite de ${tipo} atingido`,
          limite: limiteClientes.limite,
          usado: limiteClientes.usado,
          restante: limiteClientes.restante
        };
      }
      return limiteClientes;
    }
  }
}

