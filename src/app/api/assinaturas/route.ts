import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const repo = repositoryFactory.getAssinaturaRepository();
    
    // Admin pode ver todas, usuário apenas a sua
    if (user.role === 'admin') {
      const queryParams = getQueryParams(request);
      const userId = queryParams.get('userId');
      
      if (userId) {
        const assinaturas = await repo.findAllByUserId(userId);
        return createApiResponse({ assinaturas });
      }
      
      const assinaturas = await repo.findAtivas();
      return createApiResponse({ assinaturas });
    }

    // Usuário comum: retornar assinatura ativa e todas as assinaturas (para histórico)
    const assinatura = await repo.findByUserId(user.id);
    const todasAssinaturas = await repo.findAllByUserId(user.id);
    
    return createApiResponse({ 
      assinatura, // Assinatura ativa (ou null se não houver)
      todasAssinaturas // Todas as assinaturas do usuário (para histórico)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

