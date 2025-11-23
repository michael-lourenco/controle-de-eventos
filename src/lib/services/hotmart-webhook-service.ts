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

      // Extrair email de múltiplas fontes possíveis
      const emailRaw = (
        subscription.buyer?.email ||
        payload.data?.buyer?.email ||
        payload.data?.user?.email ||
        subscription.subscriber?.email ||
        subscription.user?.email ||
        payload.data?.subscription?.user?.email
      );
      
      const email = emailRaw?.toLowerCase().trim();

      // Log detalhado para debug
      if (!email) {
        console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} Email não encontrado no payload. Estrutura disponível:`, {
          'subscription.buyer?.email': subscription.buyer?.email,
          'payload.data?.buyer?.email': payload.data?.buyer?.email,
          'payload.data?.user?.email': payload.data?.user?.email,
          'subscription.subscriber?.email': subscription.subscriber?.email,
          'subscription.user?.email': subscription.user?.email,
          'payload.data?.subscription?.user?.email': payload.data?.subscription?.user?.email,
          'subscription': JSON.stringify(subscription, null, 2),
          'payload.data': JSON.stringify(payload.data, null, 2)
        });
      }

      // Regra de sandbox: se o código do plano for "123", aplicar o plano BASICO_MENSAL
      if (codigoPlano === '123') {
        console.log(`${isSandbox ? 'ℹ️ [SANDBOX]' : 'ℹ️'} Mapeando codigoPlano=123 para BASICO_MENSAL`);
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
        codigoPlano: codigoPlano || 'N/A',
        email,
        environment: isSandbox ? 'sandbox' : 'production'
      });

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
      console.log(`${isSandbox ? '🔍 [SANDBOX]' : '🔍'} Buscando usuário com email normalizado: "${email}"`);
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        const errorMsg = `Usuário não encontrado: ${email}. Verifique se o email está cadastrado no sistema e se está em lowercase.`;
        if (isSandbox) {
          console.warn(`⚠️ [SANDBOX] ${errorMsg}`);
          console.warn(`⚠️ [SANDBOX] Tentando buscar todos os usuários para debug...`);
          // Debug: listar alguns usuários para verificar formato
          try {
            const allUsers = await this.userRepo.findAll();
            const sampleEmails = allUsers.slice(0, 5).map(u => u.email).filter(Boolean);
            console.warn(`⚠️ [SANDBOX] Exemplo de emails no banco (primeiros 5):`, sampleEmails);
          } catch (debugError) {
            console.warn(`⚠️ [SANDBOX] Erro ao buscar usuários para debug:`, debugError);
          }
        } else {
          console.warn(`⚠️ ${errorMsg}`);
        }
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
          console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, subscription);
          return { success: false, message: errorMsg };
        }

        plano = await this.planoRepo.findByCodigoHotmart(codigoPlano);
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
      } else {
        const successPrefix = isSandbox ? '✅ [SANDBOX]' : '✅';
        console.log(`${successPrefix} Dados validados:`, {
          userId: user.id,
          userName: user.nome,
          environment: isSandbox ? 'sandbox' : 'production'
        });
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
          result = await this.processarCancelamento(hotmartSubscriptionId);
          break;
        case 'expired':
          result = await this.processarExpiracao(hotmartSubscriptionId);
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
              console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`);
              return { success: false, message: errorMsg };
            }
            
            console.log(`${isSandbox ? '🔍 [SANDBOX]' : '🔍'} Buscando plano com código: ${novoPlanoCodigo}`);
            const novoPlano = await this.planoRepo.findByCodigoHotmart(novoPlanoCodigo);
            
            if (!novoPlano) {
              const errorMsg = `SWITCH_PLAN: Novo plano não encontrado: ${novoPlanoCodigo}. Verifique se o código do plano está correto no banco de dados.`;
              console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`);
              return { success: false, message: errorMsg };
            }
            
            console.log(`${isSandbox ? '✅ [SANDBOX]' : '✅'} Plano encontrado:`, {
              id: novoPlano.id,
              nome: novoPlano.nome,
              codigoHotmart: novoPlano.codigoHotmart
            });
            
            if (!novoPlano.id) {
              const errorMsg = `SWITCH_PLAN: Plano encontrado mas sem ID válido: ${novoPlanoCodigo}`;
              console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, JSON.stringify(novoPlano, null, 2));
              return { success: false, message: errorMsg };
            }
            
            console.log(`${isSandbox ? '🔍 [SANDBOX]' : '🔍'} Chamando processarTrocaPlano com:`, {
              hotmartSubscriptionId,
              novoPlanoId: novoPlano.id
            });
            
            result = await this.processarTrocaPlano(hotmartSubscriptionId, novoPlano.id, payload);
          } catch (error: any) {
            const errorMsg = `SWITCH_PLAN: Erro ao processar troca de plano: ${error?.message || 'Erro desconhecido'}`;
            console.error(`${isSandbox ? '❌ [SANDBOX]' : '❌'} ${errorMsg}`, error);
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
          const errorMsg = `Evento não reconhecido ou não suportado: ${event}`;
          console.warn(`${isSandbox ? '⚠️ [SANDBOX]' : '⚠️'} ${errorMsg}`);
          return { success: false, message: errorMsg };
      }

      if (result.success) {
        const finalPrefix = isSandbox ? '✅ [SANDBOX]' : '✅';
        const logData: any = {
          userId: user.id,
          email: email,
          hotmartSubscriptionId,
          environment: isSandbox ? 'sandbox' : 'production'
        };
        
        // Adicionar planoId apenas se o plano foi validado
        if (plano && plano.id) {
          logData.planoId = plano.id;
          logData.planoNome = plano.nome;
        }
        
        console.log(`${finalPrefix} Webhook processado com sucesso: ${event}`, logData);
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
      console.error('❌ Assinatura encontrada mas sem ID:', assinatura);
      return { success: false, message: 'Assinatura inválida: sem ID' };
    }

    const novoPlano = await this.planoRepo.findById(novoPlanoId);
    if (!novoPlano) {
      console.error(`❌ Plano não encontrado com ID: ${novoPlanoId}`);
      return { success: false, message: 'Novo plano não encontrado' };
    }

    if (!novoPlano.id) {
      console.error('❌ Plano encontrado mas sem ID:', novoPlano);
      return { success: false, message: 'Novo plano inválido: sem ID' };
    }

    if (!novoPlano.nome) {
      console.error('❌ Plano encontrado mas sem nome:', novoPlano);
      return { success: false, message: 'Novo plano inválido: sem nome' };
    }

    if (!novoPlano.codigoHotmart) {
      console.error('❌ Plano encontrado mas sem codigoHotmart:', novoPlano);
      return { success: false, message: 'Novo plano inválido: sem codigoHotmart' };
    }

    const planoAnterior = assinatura.planoId ? await this.planoRepo.findById(assinatura.planoId) : null;
    const switchPlanDate = payload.data?.switch_plan_date ? new Date(payload.data.switch_plan_date) : new Date();

    // Atualizar assinatura com novo plano
    await this.assinaturaRepo.atualizarStatus(assinatura.id, 'active', {
      planoId: novoPlano.id,
      funcionalidadesHabilitadas: novoPlano.funcionalidades || []
    });

    // Atualizar usuário com novo plano
    const user = await this.userRepo.findById(assinatura.userId);
    if (!user) {
      console.error(`❌ Usuário não encontrado com ID: ${assinatura.userId}`);
      return { success: false, message: 'Usuário não encontrado' };
    }

    if (!user.id) {
      console.error('❌ Usuário encontrado mas sem ID:', user);
      return { success: false, message: 'Usuário inválido: sem ID' };
    }

    await this.userRepo.update(user.id, {
      planoId: novoPlano.id,
      planoNome: novoPlano.nome,
      planoCodigoHotmart: novoPlano.codigoHotmart,
      funcionalidadesHabilitadas: novoPlano.funcionalidades || [],
      dataAtualizacao: new Date()
    });

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

    // Remover funcionalidades do usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user) {
      await this.userRepo.update(user.id, {
        funcionalidadesHabilitadas: [],
        dataAtualizacao: new Date()
      });
    }

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

    // Remover funcionalidades do usuário
    const user = await this.userRepo.findById(assinatura.userId);
    if (user) {
      await this.userRepo.update(user.id, {
        funcionalidadesHabilitadas: [],
        dataAtualizacao: new Date()
      });
    }

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

    // Remover funcionalidades e plano do usuário
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

