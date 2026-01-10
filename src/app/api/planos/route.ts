import { NextRequest } from 'next/server';
import { getServiceFactory } from '@/lib/factories/service-factory';
import { AdminPlanoRepository } from '@/lib/repositories/admin-plano-repository';
import { isFirebaseAdminInitialized, getFirebaseAdminInitializationError } from '@/lib/firebase-admin';
import { 
  getAuthenticatedUserOptional,
  requireAdmin,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verificar se Firebase Admin está inicializado
    if (!isFirebaseAdminInitialized()) {
      const initError = getFirebaseAdminInitializationError();
      console.error('[API /planos] Firebase Admin não está inicializado:', initError?.message);
      return createErrorResponse(
        'Firebase Admin não está inicializado. Verifique as credenciais do Firebase.',
        500
      );
    }

    // Planos podem ser vistos por todos (público para landing page)
    // Usar AdminPlanoRepository no servidor para bypassar regras de segurança do Firebase
    const queryParams = getQueryParams(request);
    const apenasAtivos = queryParams.get('ativos') === 'true';

    console.log('[API /planos] Buscando planos, apenasAtivos:', apenasAtivos);
    
    const planoRepo = new AdminPlanoRepository();
    console.log('[API /planos] AdminPlanoRepository criado com sucesso');
    
    const planos = apenasAtivos ? await planoRepo.findAtivos() : await planoRepo.findAll();
    console.log('[API /planos] Planos encontrados:', planos.length);

    return createApiResponse({ planos });
  } catch (error: any) {
    console.error('[API /planos] Erro ao buscar planos:', error);
    console.error('[API /planos] Stack:', error.stack);
    console.error('[API /planos] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Se for erro de Firebase Admin não inicializado, retornar erro específico
    if (error.message?.includes('Firebase Admin não está inicializado')) {
      return createErrorResponse(error.message, 500);
    }
    
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const data = await getRequestBody(request);
    // Usar AdminPlanoRepository no servidor para bypassar regras de segurança do Firebase
    const planoRepo = new AdminPlanoRepository();
    
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

