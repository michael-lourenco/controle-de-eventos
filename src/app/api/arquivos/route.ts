import { NextRequest } from 'next/server';
import { arquivoRepository } from '@/lib/repositories/arquivo-repository';
import { s3Service } from '@/lib/s3-service';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const queryParams = getQueryParams(request);
    const eventoId = queryParams.get('eventoId');

    if (!eventoId) {
      return createErrorResponse('eventoId é obrigatório', 400);
    }

    // Buscar arquivos do evento
    const arquivos = await arquivoRepository.getArquivosPorEvento(
      user.id,
      eventoId
    );

    // Gerar URLs assinadas para cada arquivo
    const arquivosComUrls = await Promise.all(
      arquivos.map(async (arquivo) => {
        try {
          const signedUrl = await s3Service.getSignedUrl(arquivo.s3Key);
          return {
            ...arquivo,
            url: signedUrl,
          };
        } catch (error) {
          console.error(`Erro ao gerar URL para arquivo ${arquivo.id}:`, error);
          return arquivo;
        }
      })
    );

    return createApiResponse({
      success: true,
      arquivos: arquivosComUrls,
    });

  } catch (error) {
    return handleApiError(error);
  }
}
