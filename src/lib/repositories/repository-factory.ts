import { ClienteRepository } from './cliente-repository';
import { EventoRepository } from './evento-repository';
import { PagamentoRepository } from './pagamento-repository';
import { PagamentoGlobalRepository } from './pagamento-global-repository';
import { CustoEventoRepository, TipoCustoRepository } from './custo-repository';
import { CustoGlobalRepository } from './custo-global-repository';
import { ServicoEventoRepository, TipoServicoRepository } from './servico-repository';
import { ServicoGlobalRepository } from './servico-global-repository';
import { CanalEntradaRepository } from './canal-entrada-repository';
import { UserRepository } from './user-repository';
import { ArquivoRepository } from './arquivo-repository';
import { TipoEventoRepository } from './tipo-evento-repository';
import { GoogleCalendarTokenRepository } from './google-calendar-token-repository';
import { ModeloContratoRepository } from './modelo-contrato-repository';
import { ConfiguracaoContratoRepository } from './configuracao-contrato-repository';
import { ContratoRepository } from './contrato-repository';
import { RelatoriosDiariosRepository } from './relatorios-diarios-repository';
import { RelatorioCacheRepository } from './relatorio-cache-repository';

// Importar repositórios Supabase
import { ClienteSupabaseRepository } from './supabase/cliente-supabase-repository';
import { EventoSupabaseRepository } from './supabase/evento-supabase-repository';
import { PagamentoSupabaseRepository } from './supabase/pagamento-supabase-repository';
import { TipoEventoSupabaseRepository } from './supabase/tipo-evento-supabase-repository';
import { CanalEntradaSupabaseRepository } from './supabase/canal-entrada-supabase-repository';
import { TipoCustoSupabaseRepository } from './supabase/tipo-custo-supabase-repository';
import { TipoServicoSupabaseRepository } from './supabase/tipo-servico-supabase-repository';
import { CustoSupabaseRepository } from './supabase/custo-supabase-repository';
import { ServicoEventoSupabaseRepository } from './supabase/servico-evento-supabase-repository';
import { ContratoSupabaseRepository } from './supabase/contrato-supabase-repository';
import { ModeloContratoSupabaseRepository } from './supabase/modelo-contrato-supabase-repository';
import { ConfiguracaoContratoSupabaseRepository } from './supabase/configuracao-contrato-supabase-repository';
import { RelatoriosDiariosSupabaseRepository } from './supabase/relatorios-diarios-supabase-repository';
import { RelatorioCacheSupabaseRepository } from './supabase/relatorio-cache-supabase-repository';

/**
 * Factory unificado que pode usar Firebase ou Supabase
 * Controlado pela variável de ambiente USE_SUPABASE
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  
  // Flag para determinar qual banco usar
  private useSupabase: boolean;
  
  // Repositórios Firebase
  private clienteRepository: ClienteRepository | ClienteSupabaseRepository;
  private eventoRepository: EventoRepository | EventoSupabaseRepository;
  private pagamentoRepository: PagamentoRepository | PagamentoSupabaseRepository;
  private pagamentoGlobalRepository: PagamentoGlobalRepository;
  private custoEventoRepository: CustoEventoRepository | CustoSupabaseRepository;
  private custoGlobalRepository: CustoGlobalRepository;
  private tipoCustoRepository: TipoCustoRepository | TipoCustoSupabaseRepository;
  private servicoEventoRepository: ServicoEventoRepository | ServicoEventoSupabaseRepository;
  private servicoGlobalRepository: ServicoGlobalRepository;
  private tipoServicoRepository: TipoServicoRepository | TipoServicoSupabaseRepository;
  private canalEntradaRepository: CanalEntradaRepository | CanalEntradaSupabaseRepository;
  private tipoEventoRepository: TipoEventoRepository | TipoEventoSupabaseRepository;
  private userRepository: UserRepository;
  private arquivoRepository: ArquivoRepository;
  private googleCalendarTokenRepository: GoogleCalendarTokenRepository;
  private modeloContratoRepository: ModeloContratoRepository | ModeloContratoSupabaseRepository;
  private configuracaoContratoRepository: ConfiguracaoContratoRepository | ConfiguracaoContratoSupabaseRepository;
  private contratoRepository: ContratoRepository | ContratoSupabaseRepository;
  private relatoriosDiariosRepository: RelatoriosDiariosRepository | RelatoriosDiariosSupabaseRepository;
  private relatorioCacheRepository: RelatorioCacheRepository | RelatorioCacheSupabaseRepository;

  private constructor() {
    // Verificar se deve usar Supabase (variável de ambiente)
    // IMPORTANTE: No Next.js, variáveis precisam ter NEXT_PUBLIC_ para funcionar no cliente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Tenta NEXT_PUBLIC_USE_SUPABASE primeiro, depois USE_SUPABASE (para compatibilidade)
    const useSupabaseFlag = process.env.NEXT_PUBLIC_USE_SUPABASE || process.env.USE_SUPABASE;
    
    const hasSupabaseConfig = !!supabaseUrl && !!supabaseAnonKey;
    
    // Log para debug
    console.log('[RepositoryFactory] Configuração:', {
      NEXT_PUBLIC_USE_SUPABASE: process.env.NEXT_PUBLIC_USE_SUPABASE,
      USE_SUPABASE: process.env.USE_SUPABASE,
      useSupabaseFlag,
      hasSupabaseConfig,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    
    this.useSupabase = useSupabaseFlag === 'true' && hasSupabaseConfig;

    if (this.useSupabase) {
      console.log('[RepositoryFactory] ✅ Usando repositórios Supabase');
      try {
        // Inicializar repositórios Supabase
        this.clienteRepository = new ClienteSupabaseRepository();
        this.eventoRepository = new EventoSupabaseRepository();
        this.pagamentoRepository = new PagamentoSupabaseRepository();
        this.custoEventoRepository = new CustoSupabaseRepository();
        this.tipoCustoRepository = new TipoCustoSupabaseRepository();
        this.servicoEventoRepository = new ServicoEventoSupabaseRepository();
        this.tipoServicoRepository = new TipoServicoSupabaseRepository();
        this.canalEntradaRepository = new CanalEntradaSupabaseRepository();
        this.tipoEventoRepository = new TipoEventoSupabaseRepository();
        this.contratoRepository = new ContratoSupabaseRepository();
        this.modeloContratoRepository = new ModeloContratoSupabaseRepository();
        this.configuracaoContratoRepository = new ConfiguracaoContratoSupabaseRepository();
        this.relatoriosDiariosRepository = new RelatoriosDiariosSupabaseRepository();
        this.relatorioCacheRepository = new RelatorioCacheSupabaseRepository();
      } catch (error) {
        console.error('[RepositoryFactory] Erro ao inicializar Supabase, usando Firebase:', error);
        this.useSupabase = false;
        // Fallback para Firebase
        this.clienteRepository = new ClienteRepository();
        this.eventoRepository = new EventoRepository();
        this.pagamentoRepository = new PagamentoRepository();
        this.custoEventoRepository = new CustoEventoRepository();
        this.tipoCustoRepository = new TipoCustoRepository();
        this.servicoEventoRepository = new ServicoEventoRepository();
        this.tipoServicoRepository = new TipoServicoRepository();
        this.canalEntradaRepository = new CanalEntradaRepository();
        this.tipoEventoRepository = new TipoEventoRepository();
        this.contratoRepository = new ContratoRepository();
        this.modeloContratoRepository = new ModeloContratoRepository();
        this.configuracaoContratoRepository = new ConfiguracaoContratoRepository();
        this.relatoriosDiariosRepository = new RelatoriosDiariosRepository();
        this.relatorioCacheRepository = new RelatorioCacheRepository();
      }
    } else {
      if (useSupabaseFlag === 'true' && !hasSupabaseConfig) {
        console.warn('[RepositoryFactory] ⚠️ USE_SUPABASE=true mas variáveis não configuradas. Usando Firebase.');
        console.warn('[RepositoryFactory] Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
      } else if (!useSupabaseFlag || useSupabaseFlag !== 'true') {
        console.log('[RepositoryFactory] 🔥 Usando repositórios Firebase (padrão)');
        console.log('[RepositoryFactory] 💡 Para usar Supabase, configure NEXT_PUBLIC_USE_SUPABASE=true no .env.local');
      } else {
        console.log('[RepositoryFactory] 🔥 Usando repositórios Firebase (padrão)');
      }
      // Inicializar repositórios Firebase (padrão)
      this.clienteRepository = new ClienteRepository();
      this.eventoRepository = new EventoRepository();
      this.pagamentoRepository = new PagamentoRepository();
      this.custoEventoRepository = new CustoEventoRepository();
      this.tipoCustoRepository = new TipoCustoRepository();
      this.servicoEventoRepository = new ServicoEventoRepository();
      this.tipoServicoRepository = new TipoServicoRepository();
      this.canalEntradaRepository = new CanalEntradaRepository();
      this.tipoEventoRepository = new TipoEventoRepository();
      this.contratoRepository = new ContratoRepository();
      this.modeloContratoRepository = new ModeloContratoRepository();
      this.configuracaoContratoRepository = new ConfiguracaoContratoRepository();
      this.relatoriosDiariosRepository = new RelatoriosDiariosRepository();
      this.relatorioCacheRepository = new RelatorioCacheRepository();
    }

    // Repositórios que ainda não têm versão Supabase (usar Firebase)
    // Collections globais são apenas para fallback quando Firebase está ativo
    // Quando Supabase está ativo, usar findAll(userId) dos repositórios Supabase diretamente
    this.pagamentoGlobalRepository = new PagamentoGlobalRepository();
    this.custoGlobalRepository = new CustoGlobalRepository();
    this.servicoGlobalRepository = new ServicoGlobalRepository();
    
    // Repositórios de autenticação, planos e funcionalidades (sempre Firebase)
    this.userRepository = new UserRepository();
    this.arquivoRepository = new ArquivoRepository();
    this.googleCalendarTokenRepository = new GoogleCalendarTokenRepository();
    // modeloContratoRepository, configuracaoContratoRepository, contratoRepository, relatoriosDiariosRepository e relatorioCacheRepository já foram inicializados acima baseado em useSupabase
  }

  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  // Métodos getter - retornam o tipo correto baseado no useSupabase
  public getClienteRepository(): ClienteRepository | ClienteSupabaseRepository {
    return this.clienteRepository;
  }

  public getEventoRepository(): EventoRepository | EventoSupabaseRepository {
    return this.eventoRepository;
  }

  public getPagamentoRepository(): PagamentoRepository | PagamentoSupabaseRepository {
    return this.pagamentoRepository;
  }

  public getPagamentoGlobalRepository(): PagamentoGlobalRepository {
    return this.pagamentoGlobalRepository;
  }

  public getCustoEventoRepository(): CustoEventoRepository | CustoSupabaseRepository {
    return this.custoEventoRepository;
  }

  public getCustoGlobalRepository(): CustoGlobalRepository {
    return this.custoGlobalRepository;
  }

  public getTipoCustoRepository(): TipoCustoRepository | TipoCustoSupabaseRepository {
    return this.tipoCustoRepository;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getArquivoRepository(): ArquivoRepository {
    return this.arquivoRepository;
  }

  public getServicoEventoRepository(): ServicoEventoRepository | ServicoEventoSupabaseRepository {
    return this.servicoEventoRepository;
  }

  public getServicoGlobalRepository(): ServicoGlobalRepository {
    return this.servicoGlobalRepository;
  }

  public getTipoServicoRepository(): TipoServicoRepository | TipoServicoSupabaseRepository {
    return this.tipoServicoRepository;
  }

  public getCanalEntradaRepository(): CanalEntradaRepository | CanalEntradaSupabaseRepository {
    return this.canalEntradaRepository;
  }

  public getTipoEventoRepository(): TipoEventoRepository | TipoEventoSupabaseRepository {
    return this.tipoEventoRepository;
  }

  public getGoogleCalendarTokenRepository(): GoogleCalendarTokenRepository {
    return this.googleCalendarTokenRepository;
  }

  public getModeloContratoRepository(): ModeloContratoRepository | ModeloContratoSupabaseRepository {
    return this.modeloContratoRepository;
  }

  public getConfiguracaoContratoRepository(): ConfiguracaoContratoRepository | ConfiguracaoContratoSupabaseRepository {
    return this.configuracaoContratoRepository;
  }

  public getContratoRepository(): ContratoRepository | ContratoSupabaseRepository {
    return this.contratoRepository;
  }

  public getRelatoriosDiariosRepository(): RelatoriosDiariosRepository | RelatoriosDiariosSupabaseRepository {
    return this.relatoriosDiariosRepository;
  }

  public getRelatorioCacheRepository(): RelatorioCacheRepository | RelatorioCacheSupabaseRepository {
    return this.relatorioCacheRepository;
  }

  /**
   * Verifica se está usando Supabase
   */
  public isUsingSupabase(): boolean {
    return this.useSupabase;
  }
}

// Exportar instância singleton
export const repositoryFactory = RepositoryFactory.getInstance();
