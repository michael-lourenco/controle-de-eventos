import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { FuncionalidadeRepository } from '@/lib/repositories/funcionalidade-repository';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { ids } = await request.json();
    
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'IDs deve ser um array' }, { status: 400 });
    }

    const repo = new FuncionalidadeRepository();
    const funcionalidades = [];
    
    for (const id of ids) {
      const func = await repo.findById(id);
      if (func && func.ativo) {
        funcionalidades.push(func);
      }
    }

    return NextResponse.json({ funcionalidades });
  } catch (error: any) {
    console.error('Erro ao buscar funcionalidades por IDs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar funcionalidades' },
      { status: 500 }
    );
  }
}

