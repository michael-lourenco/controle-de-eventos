import { FuncionalidadeRepository } from '../repositories/funcionalidade-repository';
import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { UserRepository } from '../repositories/user-repository';
import { Funcionalidade, LimitesUsuario } from '@/types/funcionalidades';
import { EventoRepository } from '../repositories/evento-repository';
import { ClienteRepository } from '../repositories/cliente-repository';

export class FuncionalidadeService {
  private funcionalidadeRepo: FuncionalidadeRepository;
  private assinaturaRepo: AssinaturaRepository;
  private userRepo: UserRepository;
  private eventoRepo: EventoRepository;
  private clienteRepo: ClienteRepository;

  constructor() {
    this.funcionalidadeRepo = new FuncionalidadeRepository();
    this.assinaturaRepo = new AssinaturaRepository();
    this.userRepo = new UserRepository();
    this.eventoRepo = new EventoRepository();
    this.clienteRepo = new ClienteRepository();
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
}

