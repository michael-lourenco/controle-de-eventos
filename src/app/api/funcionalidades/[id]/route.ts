import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { FuncionalidadeRepository } from '@/lib/repositories/funcionalidade-repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const repo = new FuncionalidadeRepository();
    const funcionalidade = await repo.findById(id);

    if (!funcionalidade) {
      return NextResponse.json({ error: 'Funcionalidade não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ funcionalidade });
  } catch (error: any) {
    console.error('Erro ao buscar funcionalidade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar funcionalidade' },
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
    const repo = new FuncionalidadeRepository();
    
    const funcionalidade = await repo.update(id, data);

    return NextResponse.json({ funcionalidade });
  } catch (error: any) {
    console.error('Erro ao atualizar funcionalidade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar funcionalidade' },
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
    const repo = new FuncionalidadeRepository();
    await repo.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar funcionalidade:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar funcionalidade' },
      { status: 500 }
    );
  }
}

