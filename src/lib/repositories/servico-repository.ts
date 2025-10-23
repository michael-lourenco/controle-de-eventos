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
    
    // Criar dados simplificados para salvar no Firestore
    const servicoData = {
      tipoServicoId: servico.tipoServicoId,
      observacoes: servico.observacoes || '',
      dataCadastro: new Date()
    };
    
    const docRef = await addDoc(servicosCollection, servicoData);
    
    return {
      id: docRef.id,
      eventoId: servico.eventoId,
      tipoServicoId: servico.tipoServicoId,
      tipoServico: servico.tipoServico,
      observacoes: servico.observacoes,
      dataCadastro: new Date()
    } as ServicoEvento;
  }

  async updateServicoEvento(userId: string, eventoId: string, servicoId: string, servico: Partial<ServicoEvento>): Promise<ServicoEvento> {
    const servicoRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.EVENTOS, eventoId, COLLECTIONS.SERVICOS_EVENTO, servicoId);
    
    // Criar dados simplificados para atualizar no Firestore
    const updateData: any = {};
    if (servico.tipoServicoId !== undefined) updateData.tipoServicoId = servico.tipoServicoId;
    if (servico.observacoes !== undefined) updateData.observacoes = servico.observacoes;
    
    await updateDoc(servicoRef, updateData);
    
    return {
      id: servicoId,
      eventoId: servico.eventoId || '',
      tipoServicoId: servico.tipoServicoId || '',
      tipoServico: servico.tipoServico || {} as TipoServico,
      observacoes: servico.observacoes,
      dataCadastro: servico.dataCadastro || new Date()
    } as ServicoEvento;
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
      
      // Carregar tipos de serviço para popular os objetos
      const tipoServicoRepo = new TipoServicoRepository();
      const tiposServico = await tipoServicoRepo.findAll(userId);
      const tiposMap = new Map(tiposServico.map(tipo => [tipo.id, tipo]));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('ServicoEventoRepository: Dados do documento:', data);
        
        // Buscar o tipo de serviço correspondente
        const tipoServico = tiposMap.get(data.tipoServicoId) || {
          id: data.tipoServicoId,
          nome: 'Tipo não encontrado',
          descricao: '',
          ativo: false,
          dataCadastro: new Date()
        } as TipoServico;
        
        const servico: ServicoEvento = {
          id: doc.id,
          eventoId: eventoId,
          tipoServicoId: data.tipoServicoId,
          tipoServico: tipoServico,
          observacoes: data.observacoes,
          dataCadastro: data.dataCadastro?.toDate ? data.dataCadastro.toDate() : new Date(data.dataCadastro)
        };
        
        console.log('ServicoEventoRepository: Serviço convertido:', servico);
        return servico;
      });
    } catch (error) {
      console.log('ServicoEventoRepository: Subcollection não existe ainda, retornando array vazio:', error);
      return [];
    }
  }

  async findByTipoServicoId(userId: string, eventoId: string, tipoServicoId: string): Promise<ServicoEvento[]> {
    return this.findWhere('tipoServicoId', '==', tipoServicoId, eventoId);
  }

  async getResumoServicosPorEvento(userId: string, eventoId: string): Promise<{
    servicos: ServicoEvento[];
    quantidadeItens: number;
    porCategoria: Record<string, number>;
  }> {
    const servicos = await this.findByEventoId(userId, eventoId);
    
    const porCategoria: Record<string, number> = {};
    servicos.forEach(servico => {
      const tipoNome = servico.tipoServico?.nome || 'Sem tipo';
      porCategoria[tipoNome] = (porCategoria[tipoNome] || 0) + 1;
    });

    return {
      servicos,
      quantidadeItens: servicos.length,
      porCategoria
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
