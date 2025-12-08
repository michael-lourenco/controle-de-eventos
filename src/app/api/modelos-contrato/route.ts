import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedUser();

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelos = await modeloRepo.findAtivos();

    // Serializar datas manualmente para evitar problemas de JSON
    const modelosSerializados = modelos.map(modelo => ({
      ...modelo,
      dataCadastro: modelo.dataCadastro instanceof Date 
        ? modelo.dataCadastro.toISOString() 
        : modelo.dataCadastro,
      dataAtualizacao: modelo.dataAtualizacao instanceof Date 
        ? modelo.dataAtualizacao.toISOString() 
        : modelo.dataAtualizacao
    }));

    return createApiResponse(modelosSerializados);
  } catch (error) {
    return handleApiError(error);
  }
}

