import { SubcollectionRepository } from './subcollection-repository';
import { CustoEvento, TipoCusto } from '@/types';
import { orderBy, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '../firestore/collections';

export class CustoEventoRepository extends SubcollectionRepository<CustoEvento> {
  constructor() {
    super(COLLECTIONS.EVENTOS, COLLECTIONS.CUSTOS);
  }

  // Métodos específicos para subcollections de custos por evento
  private getCustosCollection(userId: string, eventoId: string) {
    if (!userId || !eventoId) {
      throw new Error('userId e eventoId são obrigatórios para acessar custos');
    }
    return collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.CUSTOS);
  }

  async createCustoEvento(userId: string, eventoId: string, custo: Omit<CustoEvento, 'id'>): Promise<CustoEvento> {
    const custosCollection = this.getCustosCollection(userId, eventoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...custo } as any;
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

  async updateCustoEvento(userId: string, eventoId: string, custoId: string, custo: Partial<CustoEvento>): Promise<CustoEvento> {
    const custoRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.CUSTOS, custoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...custo } as any;
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    await updateDoc(custoRef, cleanData);
    
    return { id: custoId, ...custo } as CustoEvento;
  }

  async deleteCustoEvento(userId: string, eventoId: string, custoId: string): Promise<void> {
    const custoRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.CUSTOS, custoId);
    await deleteDoc(custoRef);
  }

  async findByEventoId(userId: string, eventoId: string): Promise<CustoEvento[]> {
    const custosCollection = this.getCustosCollection(userId, eventoId);
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

  async findByTipoCustoId(userId: string, eventoId: string, tipoCustoId: string): Promise<CustoEvento[]> {
    return this.findWhere('tipoCustoId', '==', tipoCustoId, eventoId);
  }

  async getTotalCustosPorEvento(userId: string, eventoId: string): Promise<number> {
    const custos = await this.findByEventoId(userId, eventoId);
    return custos.reduce((total, custo) => total + custo.valor, 0);
  }

  async getResumoCustosPorEvento(userId: string, eventoId: string): Promise<{
    custos: CustoEvento[];
    total: number;
    porCategoria: Record<string, number>;
    quantidadeItens: number;
  }> {
    const custos = await this.findByEventoId(userId, eventoId);
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

export class TipoCustoRepository extends SubcollectionRepository<TipoCusto> {
  constructor() {
    super(COLLECTIONS.USERS, COLLECTIONS.TIPO_CUSTOS);
  }

  // Método para garantir que a subcollection existe
  private async ensureSubcollectionExists(userId: string): Promise<void> {
    try {
      // Tentar fazer uma query simples para verificar se a subcollection existe
      const testQuery = query(this.getSubcollectionRef(userId), limit(1));
      await getDocs(testQuery);
    } catch (error) {
      console.log('Subcollection tipo_custos não existe, criando...');
      // Se a subcollection não existe, criar um documento temporário para inicializá-la
      const tempDoc = {
        nome: '_temp_init',
        descricao: 'Documento temporário para inicializar subcollection',
        ativo: false,
        dataCadastro: new Date()
      };
      
      try {
        const docRef = await addDoc(this.getSubcollectionRef(userId), tempDoc);
        // Deletar o documento temporário imediatamente
        await deleteDoc(docRef);
        console.log('Subcollection tipo_custos inicializada com sucesso');
      } catch (createError) {
        console.error('Erro ao inicializar subcollection tipo_custos:', createError);
        throw createError;
      }
    }
  }

  // Métodos específicos para tipos de custo (agora sem userId pois é parte do path)
  async findByNome(nome: string, userId: string): Promise<TipoCusto | null> {
    await this.ensureSubcollectionExists(userId);
    const tipos = await this.findWhere('nome', '==', nome, userId);
    return tipos.length > 0 ? tipos[0] : null;
  }

  async getAtivos(userId: string): Promise<TipoCusto[]> {
    await this.ensureSubcollectionExists(userId);
    return this.findWhere('ativo', '==', true, userId);
  }

  async searchByName(name: string, userId: string): Promise<TipoCusto[]> {
    await this.ensureSubcollectionExists(userId);
    // Busca simples - em produção seria melhor usar Algolia
    const allTipos = await this.findAll(userId);
    return allTipos.filter(tipo => 
      tipo.nome.toLowerCase().includes(name.toLowerCase()) ||
      tipo.descricao.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Métodos de conveniência que mantêm a interface original
  async createTipoCusto(tipoCusto: Omit<TipoCusto, 'id' | 'dataCadastro'>, userId: string): Promise<TipoCusto> {
    await this.ensureSubcollectionExists(userId);
    const tipoWithMeta = {
      ...tipoCusto,
      dataCadastro: new Date()
    } as Omit<TipoCusto, 'id'>;
    
    return this.create(tipoWithMeta, userId);
  }

  async updateTipoCusto(id: string, tipoCusto: Partial<TipoCusto>, userId: string): Promise<TipoCusto> {
    await this.ensureSubcollectionExists(userId);
    return this.update(id, tipoCusto, userId);
  }

  async deleteTipoCusto(id: string, userId: string): Promise<void> {
    await this.ensureSubcollectionExists(userId);
    return this.delete(id, userId);
  }

  async getTipoCustoById(id: string, userId: string): Promise<TipoCusto | null> {
    await this.ensureSubcollectionExists(userId);
    return this.findById(id, userId);
  }
}
