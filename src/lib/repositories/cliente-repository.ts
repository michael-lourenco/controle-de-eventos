import { SubcollectionRepository } from './subcollection-repository';
import { Cliente } from '@/types';
import { where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
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
    return this.delete(id, userId);
  }

  async getClienteById(id: string, userId: string): Promise<Cliente | null> {
    return this.findById(id, userId);
  }
}
