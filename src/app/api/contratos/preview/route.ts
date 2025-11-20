import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { ContratoService } from '@/lib/services/contrato-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { modeloContratoId, dadosPreenchidos } = body;

    if (!modeloContratoId || !dadosPreenchidos) {
      return NextResponse.json({ error: 'modeloContratoId e dadosPreenchidos são obrigatórios' }, { status: 400 });
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(modeloContratoId);
    if (!modelo) {
      return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 });
    }

    const html = ContratoService.processarTemplate(modelo.template, dadosPreenchidos);

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Erro ao gerar preview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

