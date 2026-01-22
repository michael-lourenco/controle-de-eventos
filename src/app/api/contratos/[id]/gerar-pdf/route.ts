import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRouteParams
} from '@/lib/api/route-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const contratoRepo = repositoryFactory.getContratoRepository();
    const contrato = await contratoRepo.findById(id, user.id);

    if (!contrato) {
      return createErrorResponse('Contrato não encontrado', 404);
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(contrato.modeloContratoId);
    if (!modelo) {
      return createErrorResponse('Modelo de contrato não encontrado', 404);
    }

    const { ContratoService } = await import('@/lib/services/contrato-service');
    const { PDFService } = await import('@/lib/services/pdf-service');
    
    // Usar HTML editado pelo usuário, se houver; senão, processar o template
    let html: string;
    if (contrato.conteudoHtml && contrato.conteudoHtml.trim()) {
      html = contrato.conteudoHtml;
    } else {
      const dadosPreenchidosComNumero = {
        ...contrato.dadosPreenchidos,
        numero_contrato: contrato.numeroContrato || ''
      };
      html = ContratoService.processarTemplate(modelo.template, dadosPreenchidosComNumero);
    }
    const { url, path } = await PDFService.gerarPDFContrato(contrato, html);

    const atualizado = await contratoRepo.update(id, {
      pdfUrl: url,
      pdfPath: path,
      status: 'gerado',
      dataGeracao: new Date(),
      userId: user.id
    });

    return createApiResponse(atualizado);
  } catch (error) {
    return handleApiError(error);
  }
}

