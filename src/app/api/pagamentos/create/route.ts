import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';

/**
 * API route para criar pagamentos
 * Usa o cliente admin do Supabase para contornar RLS
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Validar permissão para registrar pagamentos
    const funcionalidadeService = new FuncionalidadeService();
    const temPermissao = await funcionalidadeService.verificarPermissao(userId, 'PAGAMENTOS_REGISTRAR');
    if (!temPermissao) {
      return NextResponse.json(
        { error: 'Seu plano não permite registrar pagamentos' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { 
      eventoId, 
      valor, 
      dataPagamento, 
      formaPagamento, 
      status, 
      observacoes, 
      comprovante, 
      anexoId 
    } = body;

    if (!eventoId || !valor || !dataPagamento || !formaPagamento || !status) {
      return NextResponse.json(
        { error: 'eventoId, valor, dataPagamento, formaPagamento e status são obrigatórios' }, 
        { status: 400 }
      );
    }

    // Normalizar data_pagamento
    let dataPagamentoDate: Date;
    if (dataPagamento instanceof Date) {
      dataPagamentoDate = dataPagamento;
    } else if (typeof dataPagamento === 'string') {
      const date = new Date(dataPagamento);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Formato de data inválido' },
          { status: 400 }
        );
      }
      dataPagamentoDate = date;
    } else {
      return NextResponse.json(
        { error: 'Data de pagamento é obrigatória e deve ser válida' },
        { status: 400 }
      );
    }

    // Usar repositório (funciona tanto para Firebase quanto Supabase)
    const pagamentoRepo = repositoryFactory.getPagamentoRepository();
    const pagamentoCriado = await pagamentoRepo.createPagamento(
      userId,
      eventoId,
      {
        userId,
        eventoId,
        valor: parseFloat(valor) || 0,
        dataPagamento: dataPagamentoDate,
        formaPagamento: formaPagamento,
        status: status,
        observacoes: observacoes || '',
        comprovante: comprovante,
        anexoId: anexoId,
        cancelado: false,
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      }
    );

    return NextResponse.json(pagamentoCriado);
  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao criar pagamento',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

