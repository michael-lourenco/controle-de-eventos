import { FirestoreRepository } from './firestore-repository';
import { Evento } from '@/types';
import { where, orderBy, limit as firestoreLimit, and, gte, lte } from 'firebase/firestore';

export class EventoRepository extends FirestoreRepository<Evento> {
  constructor() {
    super('controle_eventos');
  }

  async findByUserId(userId: string): Promise<Evento[]> {
    return this.findWhere('userId', '==', userId);
  }

  async findByClienteId(clienteId: string): Promise<Evento[]> {
    return this.findWhere('clienteId', '==', clienteId);
  }

  async findByUserIdAndClienteId(userId: string, clienteId: string): Promise<Evento[]> {
    return this.query([
      where('userId', '==', userId),
      where('clienteId', '==', clienteId)
    ]);
  }

  async findByStatus(status: string): Promise<Evento[]> {
    return this.findWhere('status', '==', status);
  }

  async findByTipoEvento(tipoEvento: string): Promise<Evento[]> {
    return this.findWhere('tipoEvento', '==', tipoEvento);
  }

  async findByDataEvento(dataInicio: Date, dataFim: Date): Promise<Evento[]> {
    return this.query([
      and(
        where('dataEvento', '>=', dataInicio),
        where('dataEvento', '<=', dataFim)
      ),
      orderBy('dataEvento', 'asc')
    ]);
  }

  async getEventosHoje(): Promise<Evento[]> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);
    
    return this.findByDataEvento(hoje, fimDoDia);
  }

  async getProximosEventos(limit: number = 10): Promise<Evento[]> {
    const hoje = new Date();
    return this.query([
      where('dataEvento', '>=', hoje),
      orderBy('dataEvento', 'asc'),
      firestoreLimit(limit)
    ]);
  }

  async getEventosPorMes(mes: number, ano: number): Promise<Evento[]> {
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    return this.findByDataEvento(inicioMes, fimMes);
  }

  async searchByLocal(local: string): Promise<Evento[]> {
    // Busca simples por local - em produção seria melhor usar Algolia
    const allEventos = await this.findAll();
    return allEventos.filter(evento => 
      evento.local.toLowerCase().includes(local.toLowerCase()) ||
      evento.endereco.toLowerCase().includes(local.toLowerCase())
    );
  }

  async getEventosPorPeriodo(inicio: Date, fim: Date): Promise<Evento[]> {
    return this.findByDataEvento(inicio, fim);
  }
}
