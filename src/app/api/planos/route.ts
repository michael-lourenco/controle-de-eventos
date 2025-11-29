import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PlanoRepository } from '@/lib/repositories/plano-repository';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const repo = new PlanoRepository();
    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get('ativos') === 'true';

    // Planos podem ser vistos por todos (público para landing page)
    // Apenas criação/edição requer autenticação admin
    const planos = apenasAtivos ? await repo.findAtivos() : await repo.findAll();

    return NextResponse.json({ planos });
  } catch (error: any) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const repo = new PlanoRepository();
    
    const plano = await repo.create({
      ...data,
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    });

    return NextResponse.json({ plano }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar plano:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar plano' },
      { status: 500 }
    );
  }
}

