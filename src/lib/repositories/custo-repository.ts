import { FirestoreRepository } from './firestore-repository';
import { CustoEvento, TipoCusto } from '@/types';
import { where, orderBy } from 'firebase/firestore';

export class CustoEventoRepository extends FirestoreRepository<CustoEvento> {
  constructor() {
    super('controle_custos');
  }

  async findByEventoId(eventoId: string): Promise<CustoEvento[]> {
    return this.findWhere('eventoId', '==', eventoId);
  }

  async findByTipoCustoId(tipoCustoId: string): Promise<CustoEvento[]> {
    return this.findWhere('tipoCustoId', '==', tipoCustoId);
  }

  async getTotalCustosPorEvento(eventoId: string): Promise<number> {
    const custos = await this.findByEventoId(eventoId);
    return custos.reduce((total, custo) => total + custo.valor, 0);
  }

  async getResumoCustosPorEvento(eventoId: string): Promise<{
    custos: CustoEvento[];
    total: number;
    porTipo: Record<string, number>;
    quantidadeItens: number;
  }> {
    const custos = await this.findByEventoId(eventoId);
    const total = custos.reduce((sum, custo) => sum + custo.valor, 0);
    
    const porTipo: Record<string, number> = {};
    custos.forEach(custo => {
      const tipoNome = custo.tipoCusto?.nome || 'Sem tipo';
      porTipo[tipoNome] = (porTipo[tipoNome] || 0) + custo.valor;
    });

    return {
      custos,
      total,
      porTipo,
      quantidadeItens: custos.length
    };
  }
}

export class TipoCustoRepository extends FirestoreRepository<TipoCusto> {
  constructor() {
    super('controle_tipo_custos');
  }

  async findByNome(nome: string): Promise<TipoCusto | null> {
    const tipos = await this.findWhere('nome', '==', nome);
    return tipos.length > 0 ? tipos[0] : null;
  }

  async getAtivos(): Promise<TipoCusto[]> {
    return this.findWhere('ativo', '==', true);
  }

  async searchByName(name: string): Promise<TipoCusto[]> {
    // Busca simples - em produção seria melhor usar Algolia
    const allTipos = await this.findAll();
    return allTipos.filter(tipo => 
      tipo.nome.toLowerCase().includes(name.toLowerCase()) ||
      tipo.descricao.toLowerCase().includes(name.toLowerCase())
    );
  }
}
