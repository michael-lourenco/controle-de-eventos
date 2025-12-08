import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody
} from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser();
    const body = await getRequestBody(request);
    const { modeloContratoId, dadosPreenchidos } = body;

    if (!modeloContratoId || !dadosPreenchidos) {
      return createErrorResponse('modeloContratoId e dadosPreenchidos são obrigatórios', 400);
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(modeloContratoId);
    if (!modelo) {
      return createErrorResponse('Modelo não encontrado', 404);
    }

    const { ContratoService } = await import('@/lib/services/contrato-service');
    const html = ContratoService.processarTemplate(modelo.template, dadosPreenchidos);

    return createApiResponse({ html });
  } catch (error) {
    return handleApiError(error);
  }
}

