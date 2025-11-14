import { PlanoRepository } from '../repositories/plano-repository';
import { FuncionalidadeRepository } from '../repositories/funcionalidade-repository';
import { AssinaturaRepository } from '../repositories/assinatura-repository';
import { UserRepository } from '../repositories/user-repository';
import { Plano, PlanoComFuncionalidades, StatusAssinatura } from '@/types/funcionalidades';

export class PlanoService {
  private planoRepo: PlanoRepository;
  private funcionalidadeRepo: FuncionalidadeRepository;
  private assinaturaRepo: AssinaturaRepository;
  private userRepo: UserRepository;

  constructor() {
    this.planoRepo = new PlanoRepository();
    this.funcionalidadeRepo = new FuncionalidadeRepository();
    this.assinaturaRepo = new AssinaturaRepository();
    this.userRepo = new UserRepository();
  }

  async obterTodosPlanos(): Promise<Plano[]> {
    return this.planoRepo.findAtivos();
  }

  async obterPlanoComFuncionalidades(planoId: string): Promise<PlanoComFuncionalidades | null> {
    const plano = await this.planoRepo.findById(planoId);
    if (!plano) return null;

    const funcionalidadesDetalhes = [];
    for (const funcId of plano.funcionalidades) {
      const func = await this.funcionalidadeRepo.findById(funcId);
      if (func) {
        funcionalidadesDetalhes.push(func);
      }
    }

    return {
      ...plano,
      funcionalidadesDetalhes
    };
  }

  async obterPlanosDestaque(): Promise<Plano[]> {
    return this.planoRepo.findDestaque();
  }

  async aplicarPlanoUsuario(userId: string, planoId: string, hotmartSubscriptionId: string, status: StatusAssinatura = 'trial'): Promise<void> {
    const plano = await this.planoRepo.findById(planoId);
    if (!plano) {
      throw new Error('Plano não encontrado');
    }

    // Buscar assinatura existente ou criar nova
    let assinatura = await this.assinaturaRepo.findByHotmartId(hotmartSubscriptionId);
    
    const dadosAssinatura = {
      userId,
      planoId: plano.id,
      hotmartSubscriptionId,
      status,
      dataInicio: new Date(),
      funcionalidadesHabilitadas: plano.funcionalidades,
      historico: [{
        data: new Date(),
        acao: `Assinatura criada - Plano: ${plano.nome}`,
        detalhes: { planoId: plano.id, status }
      }],
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    };

    if (assinatura) {
      // Atualizar assinatura existente
      await this.assinaturaRepo.update(assinatura.id, dadosAssinatura);
      assinatura = { ...assinatura, ...dadosAssinatura };
    } else {
      // Criar nova assinatura
      assinatura = await this.assinaturaRepo.create(dadosAssinatura);
    }

    // Atualizar usuário
    const user = await this.userRepo.findById(userId);
    if (user) {
      await this.userRepo.update(userId, {
        assinaturaId: assinatura.id,
        planoId: plano.id,
        planoNome: plano.nome,
        planoCodigoHotmart: plano.codigoHotmart,
        funcionalidadesHabilitadas: plano.funcionalidades,
        dataExpiraAssinatura: status === 'trial' ? this.calcularDataFimTrial() : undefined,
        dataAtualizacao: new Date()
      });
    }
  }

  async obterPlanoAtual(userId: string): Promise<Plano | null> {
    const assinatura = await this.assinaturaRepo.findByUserId(userId);
    if (!assinatura || !assinatura.planoId) {
      return null;
    }

    return this.planoRepo.findById(assinatura.planoId);
  }

  async compararPlanos(): Promise<PlanoComFuncionalidades[]> {
    const planos = await this.obterTodosPlanos();
    const planosComDetalhes: PlanoComFuncionalidades[] = [];

    for (const plano of planos) {
      const detalhes = await this.obterPlanoComFuncionalidades(plano.id);
      if (detalhes) {
        planosComDetalhes.push(detalhes);
      }
    }

    return planosComDetalhes;
  }

  private calcularDataFimTrial(): Date {
    const data = new Date();
    data.setDate(data.getDate() + 7); // 7 dias de trial
    return data;
  }
}

