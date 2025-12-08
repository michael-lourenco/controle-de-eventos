import { NextRequest } from 'next/server';
import { s3Service } from '@/lib/s3-service';
import { arquivoRepository } from '@/lib/repositories/arquivo-repository';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventoId = formData.get('eventoId') as string;

    if (!file || !eventoId) {
      return createErrorResponse('Arquivo e eventoId são obrigatórios', 400);
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, GIF, PDF, DOC, DOCX, TXT', 400);
    }

    // Validar tamanho do arquivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return createErrorResponse('Arquivo muito grande. Tamanho máximo: 10MB', 400);
    }

    // Fazer upload para S3
    const uploadResult = await s3Service.uploadFile(file, user.id, eventoId);

    if (!uploadResult.success) {
      return createErrorResponse(uploadResult.error || 'Erro no upload', 500);
    }

    // Salvar metadados no Firestore
    const arquivoData = {
      userId: user.id,
      eventoId,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      s3Key: uploadResult.key!,
      url: uploadResult.url!,
      dataUpload: new Date(),
    };

    const arquivo = await arquivoRepository.createArquivo(
      user.id,
      eventoId,
      arquivoData
    );

    return createApiResponse({
      success: true,
      arquivo: {
        id: arquivo.id,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
        url: arquivo.url,
        dataUpload: arquivo.dataUpload,
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const queryParams = getQueryParams(request);
    const arquivoId = queryParams.get('arquivoId');
    const eventoId = queryParams.get('eventoId');

    if (!arquivoId || !eventoId) {
      return createErrorResponse('arquivoId e eventoId são obrigatórios', 400);
    }

    // Buscar arquivo no Firestore
    const arquivo = await arquivoRepository.getArquivoById(
      user.id,
      eventoId,
      arquivoId
    );

    if (!arquivo) {
      return createErrorResponse('Arquivo não encontrado', 404);
    }

    // Deletar do S3
    const deletedFromS3 = await s3Service.deleteFile(arquivo.s3Key);

    // Deletar do Firestore
    await arquivoRepository.deleteArquivo(user.id, eventoId, arquivoId);

    return createApiResponse({ 
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    return handleApiError(error);
  }
}
