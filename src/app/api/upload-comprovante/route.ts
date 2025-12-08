import { NextRequest } from 'next/server';
import { s3Service } from '@/lib/s3-service';
import { anexoPagamentoRepository } from '@/lib/repositories/anexo-pagamento-repository';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse
} from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventoId = formData.get('eventoId') as string;
    const pagamentoId = formData.get('pagamentoId') as string;

    if (!file || !eventoId || !pagamentoId) {
      return createErrorResponse('Arquivo, eventoId e pagamentoId são obrigatórios', 400);
    }

    // Validar tipo de arquivo para comprovantes
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, PDF, DOC, DOCX, TXT', 400);
    }

    // Validar tamanho do arquivo (5MB máximo para comprovantes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return createErrorResponse('Arquivo muito grande. Tamanho máximo: 5MB', 400);
    }

    // Fazer upload para S3
    const uploadResult = await s3Service.uploadFilePagamento(
      file, 
      user.id, 
      eventoId, 
      pagamentoId
    );

    if (!uploadResult.success) {
      return createErrorResponse(uploadResult.error || 'Erro no upload', 500);
    }

    // Salvar metadados no Firestore
    const anexoData = {
      userId: user.id,
      eventoId,
      pagamentoId,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      s3Key: uploadResult.key!,
      url: uploadResult.url!,
      dataUpload: new Date(),
    };

    const anexo = await anexoPagamentoRepository.createAnexo(
      user.id,
      eventoId,
      pagamentoId,
      anexoData
    );

    return createApiResponse({
      success: true,
      anexo,
    });

  } catch (error) {
    return handleApiError(error);
  }
}
