import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const configRepo = repositoryFactory.getConfiguracaoContratoRepository();
    const config = await configRepo.findByUserId(session.user.id);

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const configRepo = repositoryFactory.getConfiguracaoContratoRepository();
    const config = await configRepo.createOrUpdate(session.user.id, body);

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Erro ao salvar configuração:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

