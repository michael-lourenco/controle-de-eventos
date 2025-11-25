import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { PlanoRepository } from '../repositories/plano-repository';
import { UserRepository } from '../repositories/user-repository';
import { PlanoService } from './plano-service';
import { AssinaturaService } from './assinatura-service';
import { StatusAssinatura, Assinatura as AssinaturaType, Plano } from '@/types/funcionalidades';
import { UserAssinatura } from '@/types';
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
  private assinaturaService: AssinaturaService;

  constructor() {
    this.assinaturaRepo = new AssinaturaRepository();
    this.planoRepo = new PlanoRepository();
    this.userRepo = new UserRepository();
    this.planoService = new PlanoService();
    this.assinaturaService = new AssinaturaService();
  }

  async processarWebhook(payload: any, isSandbox: boolean = false): Promise<{ success: boolean; message: string }> {
    const rawEvent = payload.event;
    // Normalizar nome do evento (evitar diferenças de caixa/variações do sandbox)
    const event = typeof rawEvent === 'string' ? rawEvent.trim().toUpperCase() : '';

    try {
      // Mapeamento para alinhar nomenclatura do Hotmart aos nossos handlers
      // Mantém compatibilidade com SUBSCRIPTION_* e adiciona PURCHASE_*
      const mapEventToAction = (evt: string): 'purchase' | 'activated' | 'renewed' | 'cancelled' | 'expired' | 'suspended' | 'switch_plan' | 'update_charge_date' | 'chargeback' | 'protest' | 'refunded' | 'delayed' | 'unknown' => {
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
          case 'PURCHASE_CHARGEBACK':
            return 'chargeback';
          case 'PURCHASE_PROTEST':
            return 'protest';
          case 'PURCHASE_REFUNDED':
            return 'refunded';
          case 'PURCHASE_DELAYED':
            return 'delayed';
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
          case 'SUBSCRIPTION_CANCELLATION':
            return 'cancelled';
          case 'SUBSCRIPTION_EXPIRED':
            return 'expired';
          case 'SUBSCRIPTION_SUSPENDED':
            return 'suspended';
          // Eventos especiais
          case 'SWITCH_PLAN':
            return 'switch_plan';
          case 'UPDATE_SUBSCRIPTION_CHARGE_DATE':
            return 'update_charge_date';
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
        }
      }
      
      if (!subscription) {
        const errorMsg = 'Payload inválido: subscription não encontrado';
        return { success: false, message: errorMsg };
      }

      if (!event) {
        const errorMsg = 'Payload inválido: event não encontrado';
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

      // Extrair email de múltiplas fontes possíveis
      const emailRaw = (
        subscription.buyer?.email ||
        payload.data?.buyer?.email ||
        payload.data?.user?.email ||
        payload.data?.subscriber?.email ||
        subscription.subscriber?.email ||
        subscription.user?.email ||
        payload.data?.subscription?.user?.email
      );
      
      const email = emailRaw?.toLowerCase().trim();

      // Regra de sandbox: se o código do plano for "123", aplicar o plano BASICO_MENSAL
      if (codigoPlano === '123') {
        codigoPlano = 'BASICO_MENSAL';
      }
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
        return { success: false, message: errorMsg };
      }

      if (!email) {
        const errorMsg = 'Dados incompletos: email não encontrado';
        return { success: false, message: errorMsg };
      }

      // Determinar ação antes de validar plano (alguns eventos não precisam)
      const action = mapEventToAction(event);
      const eventosQueNaoPrecisamPlano = [
        'switch_plan', // SWITCH_PLAN busca o plano do array plans, não de subscription.plan
        'update_charge_date',
        'chargeback',
        'protest',
        'refunded',
        'delayed',
        'cancelled',
        'expired',
        'suspended',
        'activated',
        'renewed'
      ];

      // Buscar usuário por email (necessário para todos os eventos)
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        const errorMsg = 'Usuário não encontrado. Verifique se o email está cadastrado no sistema e se está em lowercase.';
        return { 
          success: false, 
          message: errorMsg
        };
      }

      // Buscar plano apenas se necessário
      let plano: any = null;
      if (!eventosQueNaoPrecisamPlano.includes(action)) {
        if (!codigoPlano) {
          const errorMsg = 'Dados incompletos: código do plano não encontrado';
          return { success: false, message: errorMsg };
        }

        plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
        if (!plano) {
          const errorMsg = 'Plano não encontrado. Verifique se o código do plano está correto no banco de dados.';
          return { 
            success: false, 
            message: errorMsg
          };
        }
      }

      // Processar evento
      let result;
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
          result = await this.processarCancelamento(hotmartSubscriptionId, email);
          break;
        case 'expired':
          result = await this.processarExpiracao(hotmartSubscriptionId, email);
          break;
        case 'suspended':
          result = await this.processarSuspensao(hotmartSubscriptionId);
          break;
        case 'switch_plan':
          // Para SWITCH_PLAN, precisamos buscar o novo plano do payload
          try {
            const novoPlanoCodigo = this.extrairNovoPlanoDoSwitchPlan(payload);
            if (!novoPlanoCodigo) {
              const errorMsg = 'SWITCH_PLAN: Código do novo plano não encontrado no payload';
              return { success: false, message: errorMsg };
            }
            
            const novoPlano = await this.planoRepo.findByCodigoHotmart(novoPlanoCodigo);
            
            if (!novoPlano) {
              const errorMsg = 'SWITCH_PLAN: Novo plano não encontrado. Verifique se o código do plano está correto no banco de dados.';
              return { success: false, message: errorMsg };
            }
            
            if (!novoPlano.id) {
              const errorMsg = 'SWITCH_PLAN: Plano encontrado mas sem ID válido';
              return { success: false, message: errorMsg };
            }
            
            result = await this.processarTrocaPlano(hotmartSubscriptionId, novoPlano.id, payload);
          } catch (error: any) {
            const errorMsg = 'SWITCH_PLAN: Erro ao processar troca de plano';
            return { success: false, message: errorMsg };
          }
          break;
        case 'update_charge_date':
          result = await this.processarAtualizacaoDataCobranca(hotmartSubscriptionId, payload);
          break;
        case 'chargeback':
          result = await this.processarChargeback(hotmartSubscriptionId);
          break;
        case 'protest':
          result = await this.processarProtesto(hotmartSubscriptionId);
          break;
        case 'refunded':
          result = await this.processarReembolso(hotmartSubscriptionId);
          break;
        case 'delayed':
          result = await this.processarPagamentoAtrasado(hotmartSubscriptionId, payload);
          break;
        case 'unknown':
        default:
          const errorMsg = 'Evento não reconhecido ou não suportado';
          return { success: false, message: errorMsg };
      }

      return result;
    } catch (error: any) {
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

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    return { success: true, message: 'Assinatura ativada com sucesso' };
  }

  private async processarCancelamento(
    hotmartSubscriptionId: string,
    email: string
  ): Promise<{ success: boolean; message: string }> {
    // Buscar assinatura primeiro pelo email do usuário
    let assinatura = null;
    
    if (email) {
      const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
      if (user) {
        assinatura = await this.assinaturaRepo.findByUserId(user.id);
      }
    }
    
    // Se não encontrou pelo email, tentar pelo hotmartSubscriptionId como fallback
    if (!assinatura && hotmartSubscriptionId) {
      assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    }
    
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Cancelar mas manter ativa até o fim do período
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'cancelled');

    return { success: true, message: 'Assinatura cancelada (mantida ativa até fim do período)' };
  }

  private async processarExpiracao(
    hotmartSubscriptionId: string,
    email: string
  ): Promise<{ success: boolean; message: string }> {
    // Buscar assinatura primeiro pelo email do usuário
    let assinatura = null;
    
    if (email) {
      const user = await this.userRepo.findByEmail(email.toLowerCase().trim());
      if (user) {
        assinatura = await this.assinaturaRepo.findByUserId(user.id);
      }
    }
    
    // Se não encontrou pelo email, tentar pelo hotmartSubscriptionId como fallback
    if (!assinatura && hotmartSubscriptionId) {
      assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    }
    
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'expired', {
      dataFim: new Date(),
      funcionalidadesHabilitadas: []
    });

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

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

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    return { success: true, message: 'Assinatura suspensa - Funcionalidades desabilitadas' };
  }

  private async processarTrocaPlano(
    hotmartSubscriptionId: string,
    novoPlanoId: string,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    if (!assinatura.id) {
      return { success: false, message: 'Assinatura inválida: sem ID' };
    }

    const novoPlano = await this.planoRepo.findById(novoPlanoId);
    if (!novoPlano) {
      return { success: false, message: 'Novo plano não encontrado' };
    }

    if (!novoPlano.id) {
      return { success: false, message: 'Novo plano inválido: sem ID' };
    }

    if (!novoPlano.nome) {
      return { success: false, message: 'Novo plano inválido: sem nome' };
    }

    if (!novoPlano.codigoHotmart) {
      return { success: false, message: 'Novo plano inválido: sem codigoHotmart' };
    }

    const planoAnterior = assinatura.planoId ? await this.planoRepo.findById(assinatura.planoId) : null;
    const switchPlanDate = payload.data?.switch_plan_date ? new Date(payload.data.switch_plan_date) : new Date();

    // Atualizar assinatura com novo plano
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      planoId: novoPlano.id,
      funcionalidadesHabilitadas: novoPlano.funcionalidades || []
    });

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: switchPlanDate,
      acao: 'Troca de plano',
      detalhes: {
        planoAnterior: planoAnterior?.nome || 'N/A',
        planoNovo: novoPlano.nome,
        planoAnteriorId: planoAnterior?.id || null,
        planoNovoId: novoPlano.id
      }
    });

    return { success: true, message: `Plano alterado de ${planoAnterior?.nome || 'N/A'} para ${novoPlano.nome}` };
  }

  private async processarAtualizacaoDataCobranca(
    hotmartSubscriptionId: string,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    const subscription = payload.data?.subscription || payload.subscription;
    const novaDataCobranca = subscription?.dateNextCharge || subscription?.date_next_charge;
    
    if (!novaDataCobranca) {
      return { success: false, message: 'Nova data de cobrança não encontrada no payload' };
    }

    const dataAnterior = assinatura.dataRenovacao;
    const dataNova = new Date(novaDataCobranca);

    await this.assinaturaRepo.atualizarStatus(assinatura.id, assinatura.status, {
      dataRenovacao: dataNova
    });

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: new Date(),
      acao: 'Data de cobrança atualizada',
      detalhes: {
        dataAnterior: dataAnterior?.toISOString() || 'N/A',
        dataNova: dataNova.toISOString(),
        oldChargeDay: payload.data?.subscription?.oldChargeDay,
        newChargeDay: payload.data?.subscription?.newChargeDay
      }
    });

    return { success: true, message: `Data de cobrança atualizada para ${dataNova.toLocaleDateString('pt-BR')}` };
  }

  private async processarChargeback(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Suspender imediatamente devido a chargeback
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'suspended', {
      funcionalidadesHabilitadas: []
    });

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: new Date(),
      acao: 'Chargeback - Assinatura suspensa',
      detalhes: {
        motivo: 'Chargeback detectado no pagamento',
        statusAnterior: assinatura.status
      }
    });

    return { success: true, message: 'Chargeback processado - Assinatura suspensa' };
  }

  private async processarProtesto(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Suspender devido a protesto
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'suspended', {
      funcionalidadesHabilitadas: []
    });

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: new Date(),
      acao: 'Protesto - Assinatura suspensa',
      detalhes: {
        motivo: 'Boleto protestado',
        statusAnterior: assinatura.status
      }
    });

    return { success: true, message: 'Protesto processado - Assinatura suspensa' };
  }

  private async processarReembolso(
    hotmartSubscriptionId: string
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Cancelar imediatamente devido a reembolso
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'cancelled', {
      dataFim: new Date(),
      funcionalidadesHabilitadas: []
    });

    // Sincronizar usando o serviço que já atualiza a estrutura consolidada
    await this.assinaturaService.sincronizarPlanoUsuario(assinatura.userId);

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: new Date(),
      acao: 'Reembolso - Assinatura cancelada',
      detalhes: {
        motivo: 'Pagamento reembolsado',
        statusAnterior: assinatura.status
      }
    });

    return { success: true, message: 'Reembolso processado - Assinatura cancelada' };
  }

  private async processarPagamentoAtrasado(
    hotmartSubscriptionId: string,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    const assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    if (!assinatura) {
      return { success: false, message: 'Assinatura não encontrada' };
    }

    // Marcar como suspensa temporariamente (pode ser reativada quando pagamento for efetuado)
    // Não removemos funcionalidades imediatamente, apenas suspendemos
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'suspended');

    // Registrar no histórico
    await this.assinaturaRepo.addHistorico(assinatura.id, {
      data: new Date(),
      acao: 'Pagamento atrasado - Assinatura suspensa temporariamente',
      detalhes: {
        motivo: 'Pagamento em atraso',
        statusAnterior: assinatura.status,
        observacao: 'Assinatura será reativada quando pagamento for confirmado'
      }
    });

    return { success: true, message: 'Pagamento atrasado processado - Assinatura suspensa temporariamente' };
  }

  /**
   * Extrai o código do novo plano do payload SWITCH_PLAN
   */
  private extrairNovoPlanoDoSwitchPlan(payload: any): string | null {
    const plans = payload.data?.plans || [];
    // Encontrar o plano marcado como current: true
    const planoAtual = plans.find((p: any) => p.current === true);
    
    if (planoAtual) {
      // Tentar extrair código do plano
      return planoAtual.name || 
             planoAtual.id?.toString() || 
             planoAtual.plan_code || 
             planoAtual.code || 
             null;
    }
    
    // Se não encontrar, tentar pelo primeiro plano da lista
    if (plans.length > 0) {
      const primeiroPlano = plans[0];
      return primeiroPlano.name || 
             primeiroPlano.id?.toString() || 
             primeiroPlano.plan_code || 
             primeiroPlano.code || 
             null;
    }
    
    return null;
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
        return false;
      }
      
      return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error: any) {
      return false;
    }
  }
}

