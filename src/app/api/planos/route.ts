import { NextRequest } from 'next/server';
import { getServiceFactory } from '@/lib/factories/service-factory';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUserOptional,
  requireAdmin,
  handleApiError,
  createApiResponse,
  getRequestBody,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    // Planos podem ser vistos por todos (público para landing page)
    const queryParams = getQueryParams(request);
    const apenasAtivos = queryParams.get('ativos') === 'true';

    const planoRepo = repositoryFactory.getPlanoRepository();
    const planos = apenasAtivos ? await planoRepo.findAtivos() : await planoRepo.findAll();

    return createApiResponse({ planos });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await getRequestBody(request);
    const planoRepo = repositoryFactory.getPlanoRepository();
    
    const plano = await planoRepo.create({
      ...data,
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    });

    return createApiResponse({ plano }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

