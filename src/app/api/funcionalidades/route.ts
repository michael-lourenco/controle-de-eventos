import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { FuncionalidadeRepository } from '@/lib/repositories/funcionalidade-repository';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const repo = new FuncionalidadeRepository();
    let funcionalidades: any[] = [];
    
    try {
      funcionalidades = await repo.findAllOrdered();
    } catch (error: any) {
      // Tentar buscar sem ordenação
      try {
        funcionalidades = await repo.findAll();
      } catch (fallbackError: any) {
        throw fallbackError;
      }
    }

    return NextResponse.json({ 
      funcionalidades,
      count: funcionalidades.length 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Erro ao buscar funcionalidades',
        details: error.toString()
      },
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
    const repo = new FuncionalidadeRepository();
    
    const funcionalidade = await repo.create({
      ...data,
      dataCadastro: new Date()
    });

    return NextResponse.json({ funcionalidade }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar funcionalidade' },
      { status: 500 }
    );
  }
}

