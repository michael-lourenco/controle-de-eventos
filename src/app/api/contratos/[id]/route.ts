import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const contratoRepo = repositoryFactory.getContratoRepository();
    const contrato = await contratoRepo.findById(id, session.user.id);

    if (!contrato) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    return NextResponse.json(contrato);
  } catch (error: any) {
    console.error('Erro ao buscar contrato:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const contratoRepo = repositoryFactory.getContratoRepository();
    
    const contrato = await contratoRepo.findById(id, session.user.id);
    if (!contrato) {
      return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
    }

    if (body.dadosPreenchidos && contrato.modeloContratoId) {
      const modeloRepo = repositoryFactory.getModeloContratoRepository();
      const modelo = await modeloRepo.findById(contrato.modeloContratoId);
      if (modelo) {
        const { ContratoService } = await import('@/lib/services/contrato-service');
        const validacao = ContratoService.validarDadosPreenchidos(body.dadosPreenchidos, modelo.campos);
        if (!validacao.valido) {
          return NextResponse.json({ error: 'Dados inválidos', erros: validacao.erros }, { status: 400 });
        }
      }
    }

    const atualizado = await contratoRepo.update(id, {
      ...body,
      dataAtualizacao: new Date()
    }, session.user.id);

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const contratoRepo = repositoryFactory.getContratoRepository();
    await contratoRepo.delete(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar contrato:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

