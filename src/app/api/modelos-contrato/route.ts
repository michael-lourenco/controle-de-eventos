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

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelos = await modeloRepo.findAtivos();

    // Serializar datas manualmente para evitar problemas de JSON
    const modelosSerializados = modelos.map(modelo => ({
      ...modelo,
      dataCadastro: modelo.dataCadastro instanceof Date 
        ? modelo.dataCadastro.toISOString() 
        : modelo.dataCadastro,
      dataAtualizacao: modelo.dataAtualizacao instanceof Date 
        ? modelo.dataAtualizacao.toISOString() 
        : modelo.dataAtualizacao
    }));

    return NextResponse.json(modelosSerializados);
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erro ao listar modelos'
    }, { status: 500 });
  }
}

