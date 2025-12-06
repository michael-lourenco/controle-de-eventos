import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

/**
 * API route para criar custos
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
    const body = await request.json();
    const { eventoId, tipoCustoId, valor, quantidade, observacoes } = body;

    if (!eventoId || !tipoCustoId || valor === undefined) {
      return NextResponse.json({ error: 'eventoId, tipoCustoId e valor são obrigatórios' }, { status: 400 });
    }

    // Usar repositório (funciona tanto para Firebase quanto Supabase)
    const custoRepo = repositoryFactory.getCustoEventoRepository();
    const custoCriado = await custoRepo.createCustoEvento(
      userId,
      eventoId,
      {
        tipoCustoId,
        valor: parseFloat(valor) || 0,
        quantidade: quantidade || 1,
        observacoes: observacoes || '',
        removido: false,
        eventoId,
        evento: {} as any,
        tipoCusto: {} as any,
        dataCadastro: new Date()
      }
    );

    return NextResponse.json(custoCriado);
  } catch (error: any) {
    console.error('Erro ao criar custo:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao criar custo',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}


