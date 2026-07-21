import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/s3-service';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';
import { AdminFuncionalidadeRepository } from '@/lib/repositories/admin-funcionalidade-repository';
import { AdminAssinaturaRepository } from '@/lib/repositories/admin-assinatura-repository';
import { AdminUserRepository } from '@/lib/repositories/admin-user-repository';
import {
  getAuthenticatedUser,
  handleApiError,
  createErrorResponse
} from '@/lib/api/route-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();

    const funcionalidadeService = new FuncionalidadeService(
      new AdminFuncionalidadeRepository(),
      new AdminAssinaturaRepository(),
      new AdminUserRepository()
    );
    const temPermissao = await funcionalidadeService.verificarPermissao(user.id, 'ANEXOS_CUSTO_FIXO');
    if (!temPermissao) {
      return createErrorResponse(
        'Esta funcionalidade está disponível apenas no plano Premium.',
        403
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const custoFixoId = formData.get('custoFixoId') as string;

    if (!file || !custoFixoId) {
      return createErrorResponse('Arquivo e custoFixoId são obrigatórios', 400);
    }

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

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse('Arquivo muito grande. Tamanho máximo: 5MB', 400);
    }

    const uploadResult = await s3Service.uploadFileCustoFixo(file, user.id, custoFixoId);
    if (!uploadResult.success) {
      return createErrorResponse(uploadResult.error || 'Erro no upload', 500);
    }

    const anexoRepo = repositoryFactory.getAnexoCustoFixoRepository();
    const anexo = await anexoRepo.createAnexo(user.id, custoFixoId, {
      userId: user.id,
      custoFixoId,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      s3Key: uploadResult.key!,
      url: uploadResult.url!,
      dataUpload: new Date(),
    });

    return NextResponse.json({ success: true, anexo }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
