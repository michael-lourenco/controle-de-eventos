import { FirestoreRepository } from './firestore-repository';
import { Pagamento } from '@/types';
import { where, orderBy, limit as firestoreLimit, and, gte, lte, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export class PagamentoRepository extends FirestoreRepository<Pagamento> {
  constructor() {
    super('controle_pagamentos'); // Mantido para compatibilidade, mas não será usado
  }

  // Métodos específicos para subcollections de pagamentos por evento
  private getPagamentosCollection(eventoId: string) {
    return collection(db, 'controle_eventos', eventoId, 'controle_pagamentos');
  }

  async createPagamento(eventoId: string, pagamento: Omit<Pagamento, 'id'>): Promise<Pagamento> {
    const pagamentosCollection = this.getPagamentosCollection(eventoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...pagamento };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    const docRef = await addDoc(pagamentosCollection, {
      ...cleanData,
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    });
    
    return {
      id: docRef.id,
      ...pagamento,
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    } as Pagamento;
  }

  async updatePagamento(eventoId: string, pagamentoId: string, pagamento: Partial<Pagamento>): Promise<Pagamento> {
    const pagamentoRef = doc(db, 'controle_eventos', eventoId, 'controle_pagamentos', pagamentoId);
    
    // Remover campos undefined antes de enviar para o Firestore
    const cleanData = { ...pagamento };
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    
    await updateDoc(pagamentoRef, {
      ...cleanData,
      dataAtualizacao: new Date()
    });
    
    return { id: pagamentoId, ...pagamento } as Pagamento;
  }

  async deletePagamento(eventoId: string, pagamentoId: string): Promise<void> {
    const pagamentoRef = doc(db, 'controle_eventos', eventoId, 'controle_pagamentos', pagamentoId);
    await deleteDoc(pagamentoRef);
  }

  async findByEventoId(eventoId: string): Promise<Pagamento[]> {
    const pagamentosCollection = this.getPagamentosCollection(eventoId);
    const q = query(pagamentosCollection, orderBy('dataPagamento', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('PagamentoRepository: Buscando pagamentos para evento:', eventoId);
    console.log('PagamentoRepository: Documentos encontrados:', querySnapshot.docs.length);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('PagamentoRepository: Dados do documento:', data);
      
      // Converter Timestamps do Firestore para Date
      const pagamento = {
        id: doc.id,
        ...data,
        dataPagamento: data.dataPagamento?.toDate ? data.dataPagamento.toDate() : new Date(data.dataPagamento),
        dataCadastro: data.dataCadastro?.toDate ? data.dataCadastro.toDate() : new Date(data.dataCadastro),
        dataAtualizacao: data.dataAtualizacao?.toDate ? data.dataAtualizacao.toDate() : new Date(data.dataAtualizacao)
      };
      
      console.log('PagamentoRepository: Pagamento convertido:', pagamento);
      return pagamento;
    }) as Pagamento[];
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

  async getResumoFinanceiroPorEvento(eventoId: string, valorTotalEvento: number, dataFinalPagamento?: Date): Promise<{
    totalPago: number;
    valorPendente: number;
    valorAtrasado: number;
    quantidadePagamentos: number;
    isAtrasado: boolean;
  }> {
    const pagamentos = await this.findByEventoId(eventoId);
    
    const totalPago = pagamentos
      .filter(p => p.status === 'Pago')
      .reduce((total, p) => total + p.valor, 0);
    
    const valorPendente = valorTotalEvento - totalPago;
    const hoje = new Date();
    
    // Se não tem data final de pagamento, considera como pendente
    if (!dataFinalPagamento) {
      return {
        totalPago,
        valorPendente,
        valorAtrasado: 0,
        quantidadePagamentos: pagamentos.length,
        isAtrasado: false
      };
    }
    
    const isAtrasado = hoje > dataFinalPagamento && valorPendente > 0;
    
    return {
      totalPago,
      valorPendente: isAtrasado ? 0 : valorPendente,
      valorAtrasado: isAtrasado ? valorPendente : 0,
      quantidadePagamentos: pagamentos.length,
      isAtrasado
    };
  }
}
