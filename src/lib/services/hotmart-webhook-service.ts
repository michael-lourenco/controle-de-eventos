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

  async processarWebhook(payload: any, isSandbox: boolean = false): Promise<{ success: boolean; message: string }> {
    const event = payload.event;
    const receivedPrefix = isSandbox ? '🧪 [SANDBOX]' : '📥';
    console.log(`${receivedPrefix} Webhook recebido: ${event}`, {
      timestamp: new Date().toISOString(),
      payloadKeys: Object.keys(payload),
      environment: isSandbox ? 'sandbox' : 'production'
    });

    try {
      // Normalizar estrutura do payload (suportar diferentes formatos do Hotmart)
      const subscription = payload.data?.subscription || payload.subscription;
      
      if (!subscription) {
        const errorMsg = 'Payload inválido: subscription não encontrado';
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, payload);
        return { success: false, message: errorMsg };
      }

      if (!event) {
        const errorMsg = 'Payload inválido: event não encontrado';
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, payload);
        return { success: false, message: errorMsg };
      }

      // Extrair dados normalizados (suportar diferentes formatos)
      const hotmartSubscriptionId = subscription.subscription_code || subscription.code;
      const codigoPlano = subscription.plan?.plan_code || subscription.plan?.code;
      const email = (subscription.buyer?.email || subscription.subscriber?.email)?.toLowerCase().trim();

      if (!hotmartSubscriptionId) {
        const errorMsg = 'Dados incompletos: subscription_id não encontrado';
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, subscription);
        return { success: false, message: errorMsg };
      }

      if (!codigoPlano) {
        const errorMsg = 'Dados incompletos: código do plano não encontrado';
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, subscription);
        return { success: false, message: errorMsg };
      }

      if (!email) {
        const errorMsg = 'Dados incompletos: email não encontrado';
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, subscription);
        return { success: false, message: errorMsg };
      }

      const logPrefix = isSandbox ? '🔍 [SANDBOX]' : '🔍';
      console.log(`${logPrefix} Processando webhook:`, {
        event,
        hotmartSubscriptionId,
        codigoPlano,
        email,
        environment: isSandbox ? 'sandbox' : 'production'
      });

      // Buscar usuário por email
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        const errorMsg = `Usuário não encontrado: ${email}. Verifique se o email está cadastrado no sistema.`;
        if (isSandbox) {
          console.warn(`⚠️ [SANDBOX] ${errorMsg}`);
        } else {
          console.warn(`⚠️ ${errorMsg}`);
        }
        return { 
          success: false, 
          message: errorMsg
        };
      }

      // Buscar plano pelo código Hotmart
      const plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
      if (!plano) {
        const errorMsg = `Plano não encontrado: ${codigoPlano}. Verifique se o código do plano está correto no banco de dados.`;
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`);
        return { 
          success: false, 
          message: errorMsg
        };
      }

      const successPrefix = isSandbox ? '✅ [SANDBOX]' : '✅';
      console.log(`${successPrefix} Dados validados:`, {
        userId: user.id,
        userName: user.nome,
        planoId: plano.id,
        planoNome: plano.nome,
        environment: isSandbox ? 'sandbox' : 'production'
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
          const errorMsg = `Evento não reconhecido: ${event}`;
          console.warn(`${isSandbox ? '⚠️ [SANDBOX]' : '⚠️'} ${errorMsg}`);
          return { success: false, message: errorMsg };
      }

      if (result.success) {
        const finalPrefix = isSandbox ? '✅ [SANDBOX]' : '✅';
        console.log(`${finalPrefix} Webhook processado com sucesso: ${event}`, {
          userId: user.id,
          email: email,
          planoId: plano.id,
          hotmartSubscriptionId,
          environment: isSandbox ? 'sandbox' : 'production'
        });
      }

      return result;
    } catch (error: any) {
      const errorPrefix = isSandbox ? '❌ [SANDBOX]' : '❌';
      console.error(`${errorPrefix} Erro ao processar webhook ${event}:`, error);
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
   * Segundo a documentação oficial: https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/
   * O Hotmart envia o HMAC no header 'x-hotmart-hmac-sha256' e precisamos recalcular usando o secret
   * O HMAC é calculado sobre o body RAW (string JSON original)
   */
  validarAssinatura(payloadBody: string, signature: string, secret: string): boolean {
    try {
      if (!signature || !secret) {
        console.warn('⚠️ Validação HMAC: signature ou secret não fornecidos');
        return false;
      }

      // Segundo a documentação do Hotmart, o HMAC é calculado sobre o body RAW
      // Não fazer JSON.stringify novamente, usar o body como recebido
      const payloadString = typeof payloadBody === 'string' 
        ? payloadBody 
        : JSON.stringify(payloadBody);
      
      // Criar HMAC SHA256 (conforme documentação oficial do Hotmart)
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadString, 'utf8');
      const expectedSignature = hmac.digest('hex');
      
      // O Hotmart envia a assinatura em hexadecimal
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

