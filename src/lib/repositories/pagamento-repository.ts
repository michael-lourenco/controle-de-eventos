import { FirestoreRepository } from './firestore-repository';
import { Pagamento } from '@/types';
import { where, orderBy, limit as firestoreLimit, and, gte, lte } from 'firebase/firestore';

export class PagamentoRepository extends FirestoreRepository<Pagamento> {
  constructor() {
    super('controle_pagamentos');
  }

  async findByEventoId(eventoId: string): Promise<Pagamento[]> {
    return this.findWhere('eventoId', '==', eventoId);
  }

  async findByStatus(status: string): Promise<Pagamento[]> {
    return this.findWhere('status', '==', status);
  }

  async findByFormaPagamento(formaPagamento: string): Promise<Pagamento[]> {
    return this.findWhere('formaPagamento', '==', formaPagamento);
  }

  async findByDataPagamento(dataInicio: Date, dataFim: Date): Promise<Pagamento[]> {
    return this.query([
      and(
        where('dataPagamento', '>=', dataInicio),
        where('dataPagamento', '<=', dataFim)
      ),
      orderBy('dataPagamento', 'desc')
    ]);
  }

  async getPagamentosPorMes(mes: number, ano: number): Promise<Pagamento[]> {
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    return this.findByDataPagamento(inicioMes, fimMes);
  }

  async getPagamentosPendentes(): Promise<Pagamento[]> {
    // Busca eventos com pagamentos pendentes
    // Isso requer uma lógica mais complexa que envolve cálculos
    // Por enquanto, vamos buscar todos e filtrar no cliente
    const allPagamentos = await this.findAll();
    return allPagamentos.filter(pagamento => pagamento.status === 'Pendente');
  }

  async getTotalRecebidoPorPeriodo(inicio: Date, fim: Date): Promise<number> {
    const pagamentos = await this.findByDataPagamento(inicio, fim);
    return pagamentos
      .filter(p => p.status === 'Pago')
      .reduce((total, pagamento) => total + pagamento.valor, 0);
  }

  async getResumoFinanceiroPorEvento(eventoId: string): Promise<{
    totalPago: number;
    totalAtrasado: number;
    valorPendente: number;
    quantidadePagamentos: number;
  }> {
    const pagamentos = await this.findByEventoId(eventoId);
    
    const totalPago = pagamentos
      .filter(p => p.status === 'Pago')
      .reduce((total, p) => total + p.valor, 0);
    
    const totalAtrasado = pagamentos
      .filter(p => p.status === 'Atrasado')
      .reduce((total, p) => total + p.valor, 0);
    
    return {
      totalPago,
      totalAtrasado,
      valorPendente: 0, // Será calculado baseado no valor total do evento
      quantidadePagamentos: pagamentos.length
    };
  }
}
