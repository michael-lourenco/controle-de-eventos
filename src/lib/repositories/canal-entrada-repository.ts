import { SubcollectionRepository } from './subcollection-repository';
import { CanalEntrada } from '@/types';
import { orderBy, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '../firestore/collections';

export class CanalEntradaRepository extends SubcollectionRepository<CanalEntrada> {
  constructor() {
    super(COLLECTIONS.USERS, COLLECTIONS.CANAIS_ENTRADA);
  }

  // Método para garantir que a subcollection existe
  private async ensureSubcollectionExists(userId: string): Promise<void> {
    try {
      // Tentar buscar todos os documentos para verificar se a subcollection existe
      const canaisCollection = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CANAIS_ENTRADA);
      const q = query(canaisCollection);
      const snapshot = await getDocs(q);
      
      // Se não há documentos, criar um canal padrão
      if (snapshot.docs.length === 0) {
        try {
          await this.createCanalEntrada(userId, {
            nome: 'Boca a Boca',
            descricao: 'Indicação de conhecidos',
            ativo: true,
            dataCadastro: new Date()
          });
        } catch (createError) {
          console.error('Erro ao criar canal padrão:', createError);
        }
      }
    } catch (error) {
      // Se a subcollection não existe, tentar criar um documento temporário
      try {
        const tempDoc = await addDoc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CANAIS_ENTRADA), {
          nome: 'temp',
          descricao: 'temp',
          ativo: false,
          dataCadastro: new Date()
        });
        await deleteDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CANAIS_ENTRADA, tempDoc.id));
        
        // Agora criar um canal padrão
        try {
          await this.createCanalEntrada(userId, {
            nome: 'Boca a Boca',
            descricao: 'Indicação de conhecidos',
            ativo: true,
            dataCadastro: new Date()
          });
        } catch (createError) {
          console.error('Erro ao criar canal padrão após inicialização:', createError);
        }
      } catch (createError) {
        console.error('Erro ao criar subcollection canais_entrada:', createError);
      }
    }
  }

  async findByNome(userId: string, nome: string): Promise<CanalEntrada | null> {
    await this.ensureSubcollectionExists(userId);
    const canais = await this.findWhere('nome', '==', nome, userId);
    return canais.length > 0 ? canais[0] : null;
  }

  async getAtivos(userId: string): Promise<CanalEntrada[]> {
    try {
      // Usar o método da classe base que já está otimizado
      return await super.getAtivos(userId);
    } catch (error) {
      console.error('Erro ao buscar canais de entrada ativos:', error);
      // Retornar array vazio em caso de erro para não quebrar a interface
      return [];
    }
  }

  async searchByName(userId: string, searchTerm: string): Promise<CanalEntrada[]> {
    await this.ensureSubcollectionExists(userId);
    const allCanais = await this.findAll(userId);
    return allCanais.filter(canal =>
      canal.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async createCanalEntrada(userId: string, canal: Omit<CanalEntrada, 'id'>): Promise<CanalEntrada> {
    await this.ensureSubcollectionExists(userId);
    return super.create(canal, userId);
  }

  async updateCanalEntrada(userId: string, canalId: string, canal: Partial<CanalEntrada>): Promise<CanalEntrada> {
    await this.ensureSubcollectionExists(userId);
    return super.update(canalId, canal, userId);
  }

  async deleteCanalEntrada(userId: string, canalId: string): Promise<void> {
    await this.ensureSubcollectionExists(userId);
    return super.delete(canalId, userId);
  }

  async getCanalEntradaById(userId: string, canalId: string): Promise<CanalEntrada | null> {
    await this.ensureSubcollectionExists(userId);
    return super.findById(canalId, userId);
  }
}
