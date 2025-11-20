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

    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');
    const status = searchParams.get('status');

    const contratoRepo = repositoryFactory.getContratoRepository();
    
    let contratos;
    if (eventoId) {
      contratos = await contratoRepo.findByEventoId(eventoId, session.user.id);
    } else {
      contratos = await contratoRepo.findAll(session.user.id);
    }

    if (status) {
      contratos = contratos.filter(c => c.status === status);
    }

    return NextResponse.json(contratos);
  } catch (error: any) {
    console.error('Erro ao listar contratos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { eventoId, modeloContratoId, dadosPreenchidos, status = 'rascunho' } = body;

    if (!modeloContratoId || !dadosPreenchidos) {
      return NextResponse.json({ error: 'modeloContratoId e dadosPreenchidos são obrigatórios' }, { status: 400 });
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(modeloContratoId);
    if (!modelo || !modelo.ativo) {
      return NextResponse.json({ error: 'Modelo de contrato não encontrado ou inativo' }, { status: 400 });
    }

    const { ContratoService } = await import('@/lib/services/contrato-service');
    const validacao = ContratoService.validarDadosPreenchidos(dadosPreenchidos, modelo.campos);
    if (!validacao.valido) {
      return NextResponse.json({ error: 'Dados inválidos', erros: validacao.erros }, { status: 400 });
    }

    const numeroContrato = await ContratoService.gerarNumeroContrato(session.user.id);
    const contratoRepo = repositoryFactory.getContratoRepository();

    const contrato = await contratoRepo.create({
      userId: session.user.id,
      eventoId: eventoId || undefined,
      modeloContratoId,
      dadosPreenchidos,
      status,
      numeroContrato,
      dataGeracao: new Date(),
      dataCadastro: new Date(),
      dataAtualizacao: new Date(),
      criadoPor: session.user.id
    }, session.user.id);

    return NextResponse.json(contrato, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

