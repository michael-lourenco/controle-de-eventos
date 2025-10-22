import { ClienteRepository } from './cliente-repository';
import { EventoRepository } from './evento-repository';
import { PagamentoRepository } from './pagamento-repository';
import { CustoEventoRepository, TipoCustoRepository } from './custo-repository';
import { UserRepository } from './user-repository';
import { ArquivoRepository } from './arquivo-repository';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  
  private clienteRepository: ClienteRepository;
  private eventoRepository: EventoRepository;
  private pagamentoRepository: PagamentoRepository;
  private custoEventoRepository: CustoEventoRepository;
  private tipoCustoRepository: TipoCustoRepository;
  private userRepository: UserRepository;
  private arquivoRepository: ArquivoRepository;

  private constructor() {
    this.clienteRepository = new ClienteRepository();
    this.eventoRepository = new EventoRepository();
    this.pagamentoRepository = new PagamentoRepository();
    this.custoEventoRepository = new CustoEventoRepository();
    this.tipoCustoRepository = new TipoCustoRepository();
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
}

// Exportar instância singleton
export const repositoryFactory = RepositoryFactory.getInstance();
