import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { PlanoRepository } from '../repositories/plano-repository';
import { UserRepository } from '../repositories/user-repository';
import { PlanoService } from './plano-service';
import { StatusAssinatura } from '@/types/funcionalidades';

export interface HotmartWebhookPayload {
  event: string;
  data: {
    subscription?: {
      code: string;
      plan: {
        code: string;
      };
      buyer: {
        email: string;
        name: string;
      };
      status: string;
      trial_period_end?: string;
      date_next_charge?: string;
    };
  };
}

export class HotmartWebhookService {
  private assinaturaRepo: AssinaturaRepository;
  private planoRepo: PlanoRepository;
  private userRepo: UserRepository;
  private planoService: PlanoService;

  constructor() {
    this.assinaturaRepo = new AssinaturaRepository();
    this.planoRepo = new PlanoRepository();
    this.userRepo = new UserRepository();
    this.planoService = new PlanoService();
  }

  async processarWebhook(payload: HotmartWebhookPayload): Promise<{ success: boolean; message: string }> {
    try {
      // Validar estrutura do payload
      if (!payload.event || !payload.data?.subscription) {
        return { success: false, message: 'Payload inválido' };
      }

      const { subscription } = payload.data;
      const codigoPlano = subscription.plan.code;
      const email = subscription.buyer.email;
      const hotmartSubscriptionId = subscription.code;

      // Buscar usuário por email
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        return { success: false, message: `Usuário não encontrado: ${email}` };
      }

      // Buscar plano pelo código Hotmart
      const plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
      if (!plano) {
        return { success: false, message: `Plano não encontrado: ${codigoPlano}` };
      }

      // Processar evento
      switch (payload.event) {
        case 'SUBSCRIPTION_PURCHASE':
          return await this.processarCompra(user.id, plano.id, hotmartSubscriptionId, subscription);
        
        case 'SUBSCRIPTION_ACTIVATED':
          return await this.processarAtivacao(hotmartSubscriptionId, subscription);
        
        case 'SUBSCRIPTION_CANCELLED':
          return await this.processarCancelamento(hotmartSubscriptionId);
        
        case 'SUBSCRIPTION_EXPIRED':
          return await this.processarExpiracao(hotmartSubscriptionId);
        
        case 'SUBSCRIPTION_RENEWED':
          return await this.processarRenovacao(hotmartSubscriptionId, subscription);
        
        case 'SUBSCRIPTION_SUSPENDED':
          return await this.processarSuspensao(hotmartSubscriptionId);
        
        default:
          return { success: false, message: `Evento não reconhecido: ${payload.event}` };
      }
    } catch (error: any) {
      console.error('Erro ao processar webhook:', error);
      return { success: false, message: error.message || 'Erro ao processar webhook' };
    }
  }

  private async processarCompra(
    userId: string, 
    planoId: string, 
    hotmartSubscriptionId: string,
    subscription: any
  ): Promise<{ success: boolean; message: string }> {
    const status: StatusAssinatura = subscription.status === 'TRIAL' ? 'trial' : 'active';
    
    await this.planoService.aplicarPlanoUsuario(userId, planoId, hotmartSubscriptionId, status);

    return { 
      success: true, 
      message: `Assinatura criada com sucesso - Status: ${status}` 
    };
  }

  private async processarAtivacao(
    hotmartSubscriptionId: string,
    subscription: any
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      dataRenovacao: subscription.date_next_charge ? new Date(subscription.date_next_charge) : undefined
    });

    // Atualizar usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user && assinatura.planoId) {
      const plano = await this.planoRepo.findById(assinatura.planoId);
      if (plano) {
        await this.userRepo.update(user.id, {
          funcionalidadesHabilitadas: plano.funcionalidades,
          planoAtual: plano.nome,
          dataExpiraAssinatura: undefined,
          dataAtualizacao: new Date()
        });
      }
    }

    return { success: true, message: 'Assinatura ativada com sucesso' };
  }

  private async processarCancelamento(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Cancelar mas manter ativa até o fim do período
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'cancelled');

    return { success: true, message: 'Assinatura cancelada (mantida ativa até fim do período)' };
  }

  private async processarExpiracao(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'expired', {
      dataFim: new Date(),
      funcionalidadesHabilitadas: []
    });

    // Remover funcionalidades do usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user) {
      await this.userRepo.update(user.id, {
        funcionalidadesHabilitadas: [],
        planoAtual: undefined,
        dataExpiraAssinatura: undefined,
        dataAtualizacao: new Date()
      });
    }

    return { success: true, message: 'Assinatura expirada - Funcionalidades desabilitadas' };
  }

  private async processarRenovacao(
    hotmartSubscriptionId: string,
    subscription: any
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      dataRenovacao: subscription.date_next_charge ? new Date(subscription.date_next_charge) : undefined
    });

    return { success: true, message: 'Assinatura renovada com sucesso' };
  }

  private async processarSuspensao(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'suspended', {
      funcionalidadesHabilitadas: []
    });

    // Remover funcionalidades do usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user) {
      await this.userRepo.update(user.id, {
        funcionalidadesHabilitadas: [],
        dataAtualizacao: new Date()
      });
    }

    return { success: true, message: 'Assinatura suspensa - Funcionalidades desabilitadas' };
  }

  // Método para validar HMAC (quando integrar com Hotmart real)
  validarAssinatura(payload: any, signature: string, secret: string): boolean {
    // TODO: Implementar validação HMAC real quando integrar
    // Por enquanto, sempre retorna true para modo mockado
    return true;
  }
}

