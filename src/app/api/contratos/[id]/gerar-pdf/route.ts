import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { ContratoService } from '@/lib/services/contrato-service';
import { PDFService } from '@/lib/services/pdf-service';

export async function POST(
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

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(contrato.modeloContratoId);
    if (!modelo) {
      return NextResponse.json({ error: 'Modelo de contrato não encontrado' }, { status: 404 });
    }

    const html = ContratoService.processarTemplate(modelo.template, contrato.dadosPreenchidos);
    const { url, path } = await PDFService.gerarPDFContrato(contrato, html);

    const atualizado = await contratoRepo.update(id, {
      pdfUrl: url,
      pdfPath: path,
      status: 'gerado',
      dataGeracao: new Date(),
      userId: session.user.id
    });

    return NextResponse.json(atualizado);
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

