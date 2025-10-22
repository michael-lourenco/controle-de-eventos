import { SubcollectionRepository } from './subcollection-repository';
import { ServicoEvento, TipoServico } from '@/types';
import { orderBy, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '../firestore/collections';

export class ServicoEventoRepository extends SubcollectionRepository<ServicoEvento> {
  constructor() {
    super(COLLECTIONS.EVENTOS, COLLECTIONS.SERVICOS_EVENTO);
  }

  // Métodos específicos para subcollections de serviços por evento
  private getServicosCollection(userId: string, eventoId: string) {
    if (!userId || !eventoId) {
      throw new Error('userId e eventoId são obrigatórios para acessar serviços');
    }
    return collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.SERVICOS_EVENTO);
  }

  async createServicoEvento(userId: string, eventoId: string, servico: Omit<ServicoEvento, 'id'>): Promise<ServicoEvento> {
    const servicosCollection = this.getServicosCollection(userId, eventoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...servico } as any;
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    const docRef = await addDoc(servicosCollection, {
      ...cleanData,
      dataCadastro: new Date()
    });
    
    return {
      id: docRef.id,
      ...servico,
      dataCadastro: new Date()
    } as ServicoEvento;
  }

  async updateServicoEvento(userId: string, eventoId: string, servicoId: string, servico: Partial<ServicoEvento>): Promise<ServicoEvento> {
    const servicoRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.SERVICOS_EVENTO, servicoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...servico } as any;
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    await updateDoc(servicoRef, cleanData);
    
    return { id: servicoId, ...servico } as ServicoEvento;
  }

  async deleteServicoEvento(userId: string, eventoId: string, servicoId: string): Promise<void> {
    const servicoRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.SERVICOS_EVENTO, servicoId);
    await deleteDoc(servicoRef);
  }

  async findByEventoId(userId: string, eventoId: string): Promise<ServicoEvento[]> {
    try {
      const servicosCollection = this.getServicosCollection(userId, eventoId);
      const q = query(servicosCollection, orderBy('dataCadastro', 'desc'));
      const querySnapshot = await getDocs(q);
      
      console.log('ServicoEventoRepository: Buscando serviços para evento:', eventoId);
      console.log('ServicoEventoRepository: Documentos encontrados:', querySnapshot.docs.length);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('ServicoEventoRepository: Dados do documento:', data);
        
        // Converter Timestamps do Firestore para Date
        const servico = {
          id: doc.id,
          ...data,
          dataCadastro: data.dataCadastro?.toDate ? data.dataCadastro.toDate() : new Date(data.dataCadastro)
        };
        
        console.log('ServicoEventoRepository: Serviço convertido:', servico);
        return servico;
      }) as ServicoEvento[];
    } catch (error) {
      console.log('ServicoEventoRepository: Subcollection não existe ainda, retornando array vazio:', error);
      return [];
    }
  }

  async findByTipoServicoId(userId: string, eventoId: string, tipoServicoId: string): Promise<ServicoEvento[]> {
    return this.findWhere('tipoServicoId', '==', tipoServicoId, eventoId);
  }

  async getTotalServicosPorEvento(userId: string, eventoId: string): Promise<number> {
    const servicos = await this.findByEventoId(userId, eventoId);
    return servicos.reduce((total, servico) => total + servico.valor, 0);
  }

  async getResumoServicosPorEvento(userId: string, eventoId: string): Promise<{
    servicos: ServicoEvento[];
    total: number;
    porCategoria: Record<string, number>;
    quantidadeItens: number;
  }> {
    const servicos = await this.findByEventoId(userId, eventoId);
    const total = servicos.reduce((sum, servico) => sum + servico.valor, 0);
    
    const porCategoria: Record<string, number> = {};
    servicos.forEach(servico => {
      const tipoNome = servico.tipoServico?.nome || 'Sem tipo';
      porCategoria[tipoNome] = (porCategoria[tipoNome] || 0) + servico.valor;
    });

    return {
      servicos,
      total,
      porCategoria,
      quantidadeItens: servicos.length
    };
  }
}

export class TipoServicoRepository extends SubcollectionRepository<TipoServico> {
  constructor() {
    super(COLLECTIONS.USERS, COLLECTIONS.TIPO_SERVICOS);
  }

  // Método para garantir que a subcollection existe
  private async ensureSubcollectionExists(userId: string): Promise<void> {
    try {
      // Tentar fazer uma query simples para verificar se a subcollection existe
      const testQuery = query(this.getSubcollectionRef(userId), limit(1));
      await getDocs(testQuery);
    } catch (error) {
      console.log('Subcollection tipo_servicos não existe, criando...');
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
        console.log('Subcollection tipo_servicos inicializada com sucesso');
      } catch (createError) {
        console.error('Erro ao inicializar subcollection tipo_servicos:', createError);
        throw createError;
      }
    }
  }

  // Métodos específicos para tipos de serviço (agora sem userId pois é parte do path)
  async findByNome(nome: string, userId: string): Promise<TipoServico | null> {
    await this.ensureSubcollectionExists(userId);
    const tipos = await this.findWhere('nome', '==', nome, userId);
    return tipos.length > 0 ? tipos[0] : null;
  }

  async getAtivos(userId: string): Promise<TipoServico[]> {
    await this.ensureSubcollectionExists(userId);
    return this.findWhere('ativo', '==', true, userId);
  }

  async searchByName(name: string, userId: string): Promise<TipoServico[]> {
    await this.ensureSubcollectionExists(userId);
    // Busca simples - em produção seria melhor usar Algolia
    const allTipos = await this.findAll(userId);
    return allTipos.filter(tipo => 
      tipo.nome.toLowerCase().includes(name.toLowerCase()) ||
      tipo.descricao.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Métodos de conveniência que mantêm a interface original
  async createTipoServico(tipoServico: Omit<TipoServico, 'id' | 'dataCadastro'>, userId: string): Promise<TipoServico> {
    await this.ensureSubcollectionExists(userId);
    const tipoWithMeta = {
      ...tipoServico,
      dataCadastro: new Date()
    } as Omit<TipoServico, 'id'>;
    
    return this.create(tipoWithMeta, userId);
  }

  async updateTipoServico(id: string, tipoServico: Partial<TipoServico>, userId: string): Promise<TipoServico> {
    await this.ensureSubcollectionExists(userId);
    return this.update(id, tipoServico, userId);
  }

  async deleteTipoServico(id: string, userId: string): Promise<void> {
    await this.ensureSubcollectionExists(userId);
    return this.delete(id, userId);
  }

  async getTipoServicoById(id: string, userId: string): Promise<TipoServico | null> {
    await this.ensureSubcollectionExists(userId);
    return this.findById(id, userId);
  }
}
