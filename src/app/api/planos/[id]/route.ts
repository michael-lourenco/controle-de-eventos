import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  requireAdmin,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody,
  getRouteParams
} from '@/lib/api/route-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Permitir acesso público para landing page
    const { id } = await getRouteParams(params);
    // Importação dinâmica para evitar dependências circulares
    const { getServiceFactory } = await import('@/lib/factories/service-factory');
    const serviceFactory = getServiceFactory();
    const service = serviceFactory.getPlanoService();
    const plano = await service.obterPlanoComFuncionalidades(id);

    if (!plano) {
      return createErrorResponse('Plano não encontrado', 404);
    }

    return createApiResponse({ plano });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await getRouteParams(params);
    const data = await getRequestBody(request);
    const planoRepo = repositoryFactory.getPlanoRepository();
    
    const plano = await planoRepo.update(id, {
      ...data,
      dataAtualizacao: new Date()
    });

    return createApiResponse({ plano });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await getRouteParams(params);
    const planoRepo = repositoryFactory.getPlanoRepository();
    await planoRepo.delete(id);

    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

