import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PlanoRepository } from '@/lib/repositories/plano-repository';
import { PlanoService } from '@/lib/services/plano-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Permitir acesso público para landing page
    // Apenas criação/edição requer autenticação admin
    const { id } = await params;
    const service = new PlanoService();
    const plano = await service.obterPlanoComFuncionalidades(id);

    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ plano });
  } catch (error: any) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar plano' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const repo = new PlanoRepository();
    
    const plano = await repo.update(id, {
      ...data,
      dataAtualizacao: new Date()
    });

    return NextResponse.json({ plano });
  } catch (error: any) {
    console.error('Erro ao atualizar plano:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar plano' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const repo = new PlanoRepository();
    await repo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar plano:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar plano' },
      { status: 500 }
    );
  }
}

