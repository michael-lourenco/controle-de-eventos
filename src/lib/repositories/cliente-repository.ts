import { FirestoreRepository } from './firestore-repository';
import { Cliente } from '@/types';
import { where, orderBy, limit as firestoreLimit } from 'firebase/firestore';

export class ClienteRepository extends FirestoreRepository<Cliente> {
  constructor() {
    super('controle_clientes');
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const clientes = await this.findWhere('email', '==', email);
    return clientes.length > 0 ? clientes[0] : null;
  }

  async findByCpf(cpf: string): Promise<Cliente | null> {
    const clientes = await this.findWhere('cpf', '==', cpf);
    return clientes.length > 0 ? clientes[0] : null;
  }

  async searchByName(name: string): Promise<Cliente[]> {
    // Firestore não suporta busca por substring nativamente
    // Para uma busca mais eficiente, seria necessário usar Algolia ou similar
    // Por enquanto, vamos buscar todos e filtrar no cliente
    const allClientes = await this.findAll();
    return allClientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(name.toLowerCase())
    );
  }

  async getRecentClientes(limit: number = 10): Promise<Cliente[]> {
    const q = this.query([
      orderBy('dataCadastro', 'desc'),
      firestoreLimit(limit)
    ]);
    return q;
  }
}
