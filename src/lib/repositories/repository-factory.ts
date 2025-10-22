import { ClienteRepository } from './cliente-repository';
import { EventoRepository } from './evento-repository';
import { PagamentoRepository } from './pagamento-repository';
import { CustoEventoRepository, TipoCustoRepository } from './custo-repository';
import { ServicoEventoRepository, TipoServicoRepository } from './servico-repository';
import { UserRepository } from './user-repository';
import { ArquivoRepository } from './arquivo-repository';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  
  private clienteRepository: ClienteRepository;
  private eventoRepository: EventoRepository;
  private pagamentoRepository: PagamentoRepository;
  private custoEventoRepository: CustoEventoRepository;
  private tipoCustoRepository: TipoCustoRepository;
  private servicoEventoRepository: ServicoEventoRepository;
  private tipoServicoRepository: TipoServicoRepository;
  private userRepository: UserRepository;
  private arquivoRepository: ArquivoRepository;

  private constructor() {
    this.clienteRepository = new ClienteRepository();
    this.eventoRepository = new EventoRepository();
    this.pagamentoRepository = new PagamentoRepository();
    this.custoEventoRepository = new CustoEventoRepository();
    this.tipoCustoRepository = new TipoCustoRepository();
    this.servicoEventoRepository = new ServicoEventoRepository();
    this.tipoServicoRepository = new TipoServicoRepository();
    this.userRepository = new UserRepository();
    this.arquivoRepository = new ArquivoRepository();
  }

  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  public getClienteRepository(): ClienteRepository {
    return this.clienteRepository;
  }

  public getEventoRepository(): EventoRepository {
    return this.eventoRepository;
  }

  public getPagamentoRepository(): PagamentoRepository {
    return this.pagamentoRepository;
  }

  public getCustoEventoRepository(): CustoEventoRepository {
    return this.custoEventoRepository;
  }

  public getTipoCustoRepository(): TipoCustoRepository {
    return this.tipoCustoRepository;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }

  public getArquivoRepository(): ArquivoRepository {
    return this.arquivoRepository;
  }

  public getServicoEventoRepository(): ServicoEventoRepository {
    return this.servicoEventoRepository;
  }

  public getTipoServicoRepository(): TipoServicoRepository {
    return this.tipoServicoRepository;
  }
}

// Exportar instância singleton
export const repositoryFactory = RepositoryFactory.getInstance();
