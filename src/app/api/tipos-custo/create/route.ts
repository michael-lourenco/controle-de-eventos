import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody
} from '@/lib/api/route-helpers';

/**
 * API route para criar tipos de custo
 * Usa o cliente admin do Supabase para contornar RLS
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await getRequestBody(request);
    const { nome, descricao, ativo = true } = body;

    if (!nome || !nome.trim()) {
      return createErrorResponse('Nome é obrigatório', 400);
    }

    // Validar permissão para criar tipos personalizados
    const { getServiceFactory } = await import('@/lib/factories/service-factory');
    const serviceFactory = getServiceFactory();
    const funcionalidadeService = serviceFactory.getFuncionalidadeService();
    const temPermissao = await funcionalidadeService.verificarPermissao(user.id, 'TIPOS_PERSONALIZADO');
    if (!temPermissao) {
      return createErrorResponse(
        'Seu plano não permite criar tipos personalizados. Esta funcionalidade está disponível apenas nos planos Profissional e Premium.',
        403
      );
    }

    const tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
    const tipoCriado = await tipoCustoRepo.createTipoCusto(
      {
        nome: nome.trim(),
        descricao: descricao?.trim() || '',
        ativo: ativo
      },
      user.id
    );

    return createApiResponse(tipoCriado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

