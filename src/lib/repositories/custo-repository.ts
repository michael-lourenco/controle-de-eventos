import { FirestoreRepository } from './firestore-repository';
import { CustoEvento, TipoCusto } from '@/types';
import { where, orderBy, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class CustoEventoRepository extends FirestoreRepository<CustoEvento> {
  constructor() {
    super('controle_custos'); // Mantido para compatibilidade, mas não será usado
  }

  // Métodos específicos para subcollections de custos por evento
  private getCustosCollection(eventoId: string) {
    return collection(db, 'controle_eventos', eventoId, 'controle_custos');
  }

  async createCustoEvento(eventoId: string, custo: Omit<CustoEvento, 'id'>): Promise<CustoEvento> {
    const custosCollection = this.getCustosCollection(eventoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...custo };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    const docRef = await addDoc(custosCollection, {
      ...cleanData,
      dataCadastro: new Date()
    });
    
    return {
      id: docRef.id,
      ...custo,
      dataCadastro: new Date()
    } as CustoEvento;
  }

  async updateCustoEvento(eventoId: string, custoId: string, custo: Partial<CustoEvento>): Promise<CustoEvento> {
    const custoRef = doc(db, 'controle_eventos', eventoId, 'controle_custos', custoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...custo };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    await updateDoc(custoRef, cleanData);
    
    return { id: custoId, ...custo } as CustoEvento;
  }

  async deleteCustoEvento(eventoId: string, custoId: string): Promise<void> {
    const custoRef = doc(db, 'controle_eventos', eventoId, 'controle_custos', custoId);
    await deleteDoc(custoRef);
  }

  async findByEventoId(eventoId: string): Promise<CustoEvento[]> {
    const custosCollection = this.getCustosCollection(eventoId);
    const q = query(custosCollection, orderBy('dataCadastro', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('CustoEventoRepository: Buscando custos para evento:', eventoId);
    console.log('CustoEventoRepository: Documentos encontrados:', querySnapshot.docs.length);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('CustoEventoRepository: Dados do documento:', data);
      
      // Converter Timestamps do Firestore para Date
      const custo = {
        id: doc.id,
        ...data,
        dataCadastro: data.dataCadastro?.toDate ? data.dataCadastro.toDate() : new Date(data.dataCadastro)
      };
      
      console.log('CustoEventoRepository: Custo convertido:', custo);
      return custo;
    }) as CustoEvento[];
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
    porCategoria: Record<string, number>;
    quantidadeItens: number;
  }> {
    const custos = await this.findByEventoId(eventoId);
    const total = custos.reduce((sum, custo) => sum + custo.valor, 0);
    
    const porCategoria: Record<string, number> = {};
    custos.forEach(custo => {
      const tipoNome = custo.tipoCusto?.nome || 'Sem tipo';
      porCategoria[tipoNome] = (porCategoria[tipoNome] || 0) + custo.valor;
    });

    return {
      custos,
      total,
      porCategoria,
      quantidadeItens: custos.length
    };
  }
}

export class TipoCustoRepository extends FirestoreRepository<TipoCusto> {
  constructor() {
    super('controle_tipo_custos');
  }

  async findByUserId(userId: string): Promise<TipoCusto[]> {
    return this.findWhere('userId', '==', userId);
  }

  async findByNome(nome: string): Promise<TipoCusto | null> {
    const tipos = await this.findWhere('nome', '==', nome);
    return tipos.length > 0 ? tipos[0] : null;
  }

  async findByUserIdAndNome(userId: string, nome: string): Promise<TipoCusto | null> {
    const tipos = await this.query([
      where('userId', '==', userId),
      where('nome', '==', nome)
    ]);
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
