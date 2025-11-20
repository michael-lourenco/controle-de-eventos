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
    const camposFixos = await configRepo.getCamposFixos(session.user.id);

    return NextResponse.json(camposFixos);
  } catch (error: any) {
    console.error('Erro ao buscar campos fixos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

