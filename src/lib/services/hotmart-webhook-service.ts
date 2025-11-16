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
    const rawEvent = payload.event;
    // Normalizar nome do evento (evitar diferenças de caixa/variações do sandbox)
    const event = typeof rawEvent === 'string' ? rawEvent.trim().toUpperCase() : '';
    const receivedPrefix = isSandbox ? '🧪 [SANDBOX]' : '📥';
    console.log(`${receivedPrefix} Webhook recebido: ${event}`, {
      timestamp: new Date().toISOString(),
      payloadKeys: Object.keys(payload),
      environment: isSandbox ? 'sandbox' : 'production'
    });

    try {
      // Mapeamento para alinhar nomenclatura do Hotmart aos nossos handlers
      // Mantém compatibilidade com SUBSCRIPTION_* e adiciona PURCHASE_*
      const mapEventToAction = (evt: string): 'purchase' | 'activated' | 'renewed' | 'cancelled' | 'expired' | 'suspended' | 'unknown' => {
        switch (evt) {
          // Hotmart PURCHASE_* (relevantes para assinatura)
          case 'PURCHASE_APPROVED':
          case 'PURCHASE_COMPLETED':
          case 'PURCHASE_FINISHED':
            return 'purchase';
          case 'PURCHASE_CANCELED':
          case 'PURCHASE_CANCELLED':
            return 'cancelled';
          case 'PURCHASE_EXPIRED':
            return 'expired';
          // Alguns ambientes enviam atualização/recorrência
          case 'PURCHASE_BILLET_PRINTED':
          case 'PURCHASE_UPDATED':
          case 'PURCHASE_CHARGED':
            // Podemos tratar como 'renewed' quando acompanhadas de subscription.next_charge_date
            return 'renewed';
          // Nomenclatura anterior SUBSCRIPTION_*
          case 'SUBSCRIPTION_PURCHASE':
            return 'purchase';
          case 'SUBSCRIPTION_ACTIVATED':
            return 'activated';
          case 'SUBSCRIPTION_RENEWED':
            return 'renewed';
          case 'SUBSCRIPTION_CANCELLED':
          case 'SUBSCRIPTION_CANCELED':
            return 'cancelled';
          case 'SUBSCRIPTION_EXPIRED':
            return 'expired';
          case 'SUBSCRIPTION_SUSPENDED':
            return 'suspended';
          default:
            return 'unknown';
        }
      };

      // Normalizar estrutura do payload (suportar diferentes formatos do Hotmart)
      let subscription = payload.data?.subscription || payload.subscription;
      
      // Fallback SANDBOX: alguns eventos do sandbox vêm sem data.subscription
      // Ex.: { data: { subscriber: { code }, plan: { id|name }, user: { email } }, event: 'PURCHASE_*' }
      if (!subscription && isSandbox && payload.data) {
        const d = payload.data;
        // Tentar sintetizar um objeto subscription mínimo para nosso fluxo
        const synthesized = {
          subscription_code: d.subscriber?.code || d.subscriber_code || d.subscription_code || d.id,
          plan: {
            // Preferimos plan_code/code; se vier apenas id/name, tentamos montar uma string estável
            plan_code: d.plan?.plan_code || d.plan?.code || d.plan?.id || d.plan?.name
          },
          buyer: {
            email: d.user?.email || d.buyer?.email || d.subscriber?.email
          },
          status: d.status || 'ACTIVE',
          date_next_charge: d.next_charge_date || d.date_next_charge
        };
        // Apenas use se houver pelo menos subscription_code e email
        if (synthesized.subscription_code && synthesized.buyer.email) {
          subscription = synthesized as any;
          console.log(`${isSandbox ? 'ℹ️ [SANDBOX]' : 'ℹ️'} Subscription sintetizada a partir do payload alternativo`);
        }
      }
      
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
      // Preferir campos conforme payload v2 do Hotmart (exemplo enviado):
      // subscription.subscriber.code (ID da assinatura)
      // subscription.plan.id | subscription.plan.name (identificação do plano)
      // buyer.email | user.email
      let hotmartSubscriptionId =
        subscription.subscriber?.code ||
        subscription.subscription_code ||
        subscription.code ||
        payload.data?.subscriber?.code;

      let codigoPlano =
        subscription.plan?.plan_code ||
        subscription.plan?.code ||
        (subscription.plan?.id ? String(subscription.plan.id) : undefined) ||
        (typeof subscription.plan?.name === 'string' ? subscription.plan.name : undefined) ||
        (payload.data?.plan?.id ? String(payload.data?.plan?.id) : undefined) ||
        (typeof payload.data?.plan?.name === 'string' ? payload.data?.plan?.name : undefined);

      const email = (
        subscription.buyer?.email ||
        payload.data?.buyer?.email ||
        payload.data?.user?.email ||
        subscription.subscriber?.email
      )?.toLowerCase().trim();

      // Fallbacks para shape do Sandbox v2: subscription.subscriber.code e plan.id/name
      if (!hotmartSubscriptionId) {
        hotmartSubscriptionId = subscription.subscriber?.code || subscription.subscriber_code || payload.data?.subscriber?.code;
      }
      if (!codigoPlano) {
        // Se vier id/name apenas, use id; como último recurso, name
        codigoPlano = subscription.plan?.id || subscription.plan?.name || payload.data?.plan?.id || payload.data?.plan?.name;
        if (codigoPlano && typeof codigoPlano !== 'string') {
          codigoPlano = String(codigoPlano);
        }
      }

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
      const action = mapEventToAction(event);
      switch (action) {
        case 'purchase':
          result = await this.processarCompra(user.id, plano.id, hotmartSubscriptionId, subscription);
          break;
        case 'activated':
          result = await this.processarAtivacao(hotmartSubscriptionId, subscription);
          break;
        case 'renewed':
          result = await this.processarRenovacao(hotmartSubscriptionId, subscription);
          break;
        case 'cancelled':
          result = await this.processarCancelamento(hotmartSubscriptionId);
          break;
        case 'expired':
          result = await this.processarExpiracao(hotmartSubscriptionId);
          break;
        case 'suspended':
          result = await this.processarSuspensao(hotmartSubscriptionId);
          break;
        case 'unknown':
        default:
          const errorMsg = `Evento não reconhecido ou não suportado: ${event}`;
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

