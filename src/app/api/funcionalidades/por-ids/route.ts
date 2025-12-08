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

    const { ids } = await getRequestBody<{ ids: string[] }>(request);
    
    if (!Array.isArray(ids)) {
      return createErrorResponse('IDs deve ser um array', 400);
    }

    const repo = repositoryFactory.getFuncionalidadeRepository();
    const funcionalidades = [];
    
    for (const id of ids) {
      const func = await repo.findById(id);
      if (func && func.ativo) {
        funcionalidades.push(func);
      }
    }

    return createApiResponse({ funcionalidades });
  } catch (error) {
    return handleApiError(error);
  }
}

