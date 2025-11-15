import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { PlanoRepository } from '../repositories/plano-repository';
import { UserRepository } from '../repositories/user-repository';
import { PlanoService } from './plano-service';
import { StatusAssinatura } from '@/types/funcionalidades';
import crypto from 'crypto';

export interface HotmartWebhookPayload {
  event: string;
  data?: {
    subscription?: {
      code?: string;
      subscription_code?: string;
      plan?: {
        code?: string;
        plan_code?: string;
        name?: string;
      };
      buyer?: {
        email?: string;
        name?: string;
      };
      subscriber?: {
        email?: string;
        name?: string;
      };
      status?: string;
      trial?: {
        end_date?: string;
      };
      trial_period_end?: string;
      date_next_charge?: string;
      next_charge_date?: string;
      cancellation_date?: string;
      expiration_date?: string;
    };
  };
  subscription?: {
    code?: string;
    subscription_code?: string;
    plan?: {
      code?: string;
      plan_code?: string;
      name?: string;
    };
    buyer?: {
      email?: string;
      name?: string;
    };
    subscriber?: {
      email?: string;
      name?: string;
    };
    status?: string;
    trial?: {
      end_date?: string;
    };
    trial_period_end?: string;
    date_next_charge?: string;
    next_charge_date?: string;
    cancellation_date?: string;
    expiration_date?: string;
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

  async processarWebhook(payload: any): Promise<{ success: boolean; message: string }> {
    const event = payload.event;
    console.log(`📥 Webhook recebido: ${event}`, {
      timestamp: new Date().toISOString(),
      payloadKeys: Object.keys(payload)
    });

    try {
      // Normalizar estrutura do payload (suportar diferentes formatos do Hotmart)
      const subscription = payload.data?.subscription || payload.subscription;
      
      if (!subscription) {
        console.error('❌ Payload inválido: subscription não encontrado', payload);
        return { success: false, message: 'Payload inválido: subscription não encontrado' };
      }

      if (!event) {
        console.error('❌ Payload inválido: event não encontrado', payload);
        return { success: false, message: 'Payload inválido: event não encontrado' };
      }

      // Extrair dados normalizados (suportar diferentes formatos)
      const hotmartSubscriptionId = subscription.subscription_code || subscription.code;
      const codigoPlano = subscription.plan?.plan_code || subscription.plan?.code;
      const email = (subscription.buyer?.email || subscription.subscriber?.email)?.toLowerCase().trim();

      if (!hotmartSubscriptionId) {
        console.error('❌ Dados incompletos: subscription_id não encontrado', subscription);
        return { success: false, message: 'Dados incompletos: subscription_id não encontrado' };
      }

      if (!codigoPlano) {
        console.error('❌ Dados incompletos: código do plano não encontrado', subscription);
        return { success: false, message: 'Dados incompletos: código do plano não encontrado' };
      }

      if (!email) {
        console.error('❌ Dados incompletos: email não encontrado', subscription);
        return { success: false, message: 'Dados incompletos: email não encontrado' };
      }

      console.log(`🔍 Processando webhook:`, {
        event,
        hotmartSubscriptionId,
        codigoPlano,
        email
      });

      // Buscar usuário por email
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        console.warn(`⚠️ Usuário não encontrado para email: ${email}`);
        return { 
          success: false, 
          message: `Usuário não encontrado: ${email}. Verifique se o email está cadastrado no sistema.` 
        };
      }

      // Buscar plano pelo código Hotmart
      const plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
      if (!plano) {
        console.error(`❌ Plano não encontrado: ${codigoPlano}`);
        return { 
          success: false, 
          message: `Plano não encontrado: ${codigoPlano}. Verifique se o código do plano está correto no banco de dados.` 
        };
      }

      console.log(`✅ Dados validados:`, {
        userId: user.id,
        userName: user.nome,
        planoId: plano.id,
        planoNome: plano.nome
      });

      // Processar evento
      let result;
      switch (event) {
        case 'SUBSCRIPTION_PURCHASE':
          result = await this.processarCompra(user.id, plano.id, hotmartSubscriptionId, subscription);
          break;
        
        case 'SUBSCRIPTION_ACTIVATED':
          result = await this.processarAtivacao(hotmartSubscriptionId, subscription);
          break;
        
        case 'SUBSCRIPTION_CANCELLED':
          result = await this.processarCancelamento(hotmartSubscriptionId);
          break;
        
        case 'SUBSCRIPTION_EXPIRED':
          result = await this.processarExpiracao(hotmartSubscriptionId);
          break;
        
        case 'SUBSCRIPTION_RENEWED':
          result = await this.processarRenovacao(hotmartSubscriptionId, subscription);
          break;
        
        case 'SUBSCRIPTION_SUSPENDED':
          result = await this.processarSuspensao(hotmartSubscriptionId);
          break;
        
        default:
          console.warn(`⚠️ Evento não reconhecido: ${event}`);
          return { success: false, message: `Evento não reconhecido: ${event}` };
      }

      if (result.success) {
        console.log(`✅ Webhook processado com sucesso: ${event}`, {
          userId: user.id,
          email: email,
          planoId: plano.id,
          hotmartSubscriptionId
        });
      }

      return result;
    } catch (error: any) {
      console.error(`❌ Erro ao processar webhook ${event}:`, error);
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

    const nextCharge = subscription.date_next_charge || subscription.next_charge_date;
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      dataRenovacao: nextCharge ? new Date(nextCharge) : undefined
    });

    // Atualizar usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user && assinatura.planoId) {
      const plano = await this.planoRepo.findById(assinatura.planoId);
      if (plano) {
        await this.userRepo.update(user.id, {
          planoId: plano.id,
          planoNome: plano.nome,
          planoCodigoHotmart: plano.codigoHotmart,
          funcionalidadesHabilitadas: plano.funcionalidades,
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
        planoId: undefined,
        planoNome: undefined,
        planoCodigoHotmart: undefined,
        funcionalidadesHabilitadas: [],
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

    const nextCharge = subscription.date_next_charge || subscription.next_charge_date;
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      dataRenovacao: nextCharge ? new Date(nextCharge) : undefined
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

  /**
   * Valida a assinatura HMAC SHA256 do webhook do Hotmart
   * O Hotmart envia o HMAC no header e precisamos recalcular usando o secret
   */
  validarAssinatura(payload: any, signature: string, secret: string): boolean {
    try {
      if (!signature || !secret) {
        console.warn('⚠️ Validação HMAC: signature ou secret não fornecidos');
        return false;
      }

      // Converter payload para string JSON (ordem de chaves preservada)
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      // Criar HMAC SHA256
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadString);
      const expectedSignature = hmac.digest('hex');
      
      // Comparar assinaturas (comparação segura contra timing attacks)
      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      
      // Verificar se os tamanhos são iguais antes de comparar
      if (signatureBuffer.length !== expectedBuffer.length) {
        console.error('❌ HMAC: Tamanhos diferentes', {
          received: signatureBuffer.length,
          expected: expectedBuffer.length
        });
        return false;
      }
      
      const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
      
      if (!isValid) {
        console.error('❌ HMAC: Assinatura inválida', {
          received: signature.substring(0, 20) + '...',
          expected: expectedSignature.substring(0, 20) + '...'
        });
      } else {
        console.log('✅ HMAC: Assinatura válida');
      }
      
      return isValid;
    } catch (error: any) {
      console.error('❌ Erro ao validar assinatura HMAC:', error);
      return false;
    }
  }
}

