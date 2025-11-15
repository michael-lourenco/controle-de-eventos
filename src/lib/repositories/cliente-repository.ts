import { SubcollectionRepository } from './subcollection-repository';
import { Cliente } from '@/types';
import { orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { COLLECTIONS } from '../firestore/collections';

export class ClienteRepository extends SubcollectionRepository<Cliente> {
  constructor() {
    super(COLLECTIONS.USERS, COLLECTIONS.CLIENTES);
  }

  // Métodos específicos para clientes (agora sem userId pois é parte do path)
  async findByEmail(email: string, userId: string): Promise<Cliente | null> {
    const clientes = await this.findWhere('email', '==', email, userId);
    return clientes.length > 0 ? clientes[0] : null;
  }

  async findByCpf(cpf: string, userId: string): Promise<Cliente | null> {
    const clientes = await this.findWhere('cpf', '==', cpf, userId);
    return clientes.length > 0 ? clientes[0] : null;
  }

  async searchByName(name: string, userId: string): Promise<Cliente[]> {
    // Firestore não suporta busca por substring nativamente
    // Para uma busca mais eficiente, seria necessário usar Algolia ou similar
    // Por enquanto, vamos buscar todos e filtrar no cliente
    const allClientes = await this.findAll(userId);
    return allClientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(name.toLowerCase())
    );
  }

  async getRecentClientes(userId: string, limit: number = 10): Promise<Cliente[]> {
    return this.query([
      orderBy('dataCadastro', 'desc'),
      firestoreLimit(limit)
    ], userId);
  }

  // Métodos de conveniência que mantêm a interface original
  async createCliente(cliente: Omit<Cliente, 'id' | 'dataCadastro'>, userId: string): Promise<Cliente> {
    const clienteWithMeta = {
      ...cliente,
      dataCadastro: new Date()
    } as Omit<Cliente, 'id'>;
    
    return this.create(clienteWithMeta, userId);
  }

  async updateCliente(id: string, cliente: Partial<Cliente>, userId: string): Promise<Cliente> {
    return this.update(id, cliente, userId);
  }

  async deleteCliente(id: string, userId: string): Promise<void> {
    // Arquivamento ao invés de exclusão física
    await this.update(id, {
      arquivado: true,
      dataArquivamento: new Date()
    }, userId);
  }
  
  async desarquivarCliente(id: string, userId: string): Promise<void> {
    await this.update(id, {
      arquivado: false,
      dataArquivamento: undefined,
      motivoArquivamento: undefined
    }, userId);
  }
  
  async getArquivados(userId: string): Promise<Cliente[]> {
    return this.findWhere('arquivado', '==', true, userId);
  }
  
  async getAtivos(userId: string): Promise<Cliente[]> {
    // Buscar clientes não arquivados (arquivado !== true ou arquivado é undefined/null)
    const todos = await this.findAll(userId);
    return todos.filter(c => !c.arquivado);
  }

  async getClienteById(id: string, userId: string): Promise<Cliente | null> {
    const cliente = await this.findById(id, userId);
    if (!cliente || !cliente.canalEntradaId) return cliente;

    try {
      const canalEntradaRepo = new (await import('./canal-entrada-repository')).CanalEntradaRepository();
      const canalEntrada = await canalEntradaRepo.getCanalEntradaById(userId, cliente.canalEntradaId);
      return {
        ...cliente,
        canalEntrada: canalEntrada || undefined
      };
    } catch (error) {
      console.error('Erro ao carregar canal de entrada:', error);
      return cliente;
    }
  }
}
