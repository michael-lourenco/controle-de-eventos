import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { s3Service } from '@/lib/s3-service';
// import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';
// import { AdminFuncionalidadeRepository } from '@/lib/repositories/admin-funcionalidade-repository';
// import { AdminAssinaturaRepository } from '@/lib/repositories/admin-assinatura-repository';
// import { AdminUserRepository } from '@/lib/repositories/admin-user-repository';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getQueryParams
} from '@/lib/api/route-helpers';

async function assertAnexos(_userId: string) {
  // TODO: reativar bloqueio por plano quando ANEXOS_CUSTO_FIXO estiver liberado nos planos
  // const funcionalidadeService = new FuncionalidadeService(
  //   new AdminFuncionalidadeRepository(),
  //   new AdminAssinaturaRepository(),
  //   new AdminUserRepository()
  // );
  // const temPermissao = await funcionalidadeService.verificarPermissao(_userId, 'ANEXOS_CUSTO_FIXO');
  // if (!temPermissao) {
  //   return createErrorResponse(
  //     'Esta funcionalidade está disponível apenas no plano Premium.',
  //     403
  //   );
  // }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertAnexos(user.id);
    if (bloqueio) return bloqueio;

    const custoFixoId = getQueryParams(request).get('custoFixoId');
    if (!custoFixoId) {
      return createErrorResponse('custoFixoId é obrigatório', 400);
    }

    const anexoRepo = repositoryFactory.getAnexoCustoFixoRepository();
    const anexos = await anexoRepo.findByCustoFixoId(user.id, custoFixoId);

    const anexosComUrls = await Promise.all(
      anexos.map(async (anexo) => {
        try {
          const signedUrl = await s3Service.getSignedUrl(anexo.s3Key, 3600 * 24 * 7);
          return {
            ...anexo,
            url: signedUrl,
            dataUpload: anexo.dataUpload instanceof Date ? anexo.dataUpload.toISOString() : anexo.dataUpload,
            dataCadastro: anexo.dataCadastro instanceof Date ? anexo.dataCadastro.toISOString() : anexo.dataCadastro,
          };
        } catch {
          return {
            ...anexo,
            dataUpload: anexo.dataUpload instanceof Date ? anexo.dataUpload.toISOString() : anexo.dataUpload,
            dataCadastro: anexo.dataCadastro instanceof Date ? anexo.dataCadastro.toISOString() : anexo.dataCadastro,
          };
        }
      })
    );

    return createApiResponse({ success: true, anexos: anexosComUrls });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertAnexos(user.id);
    if (bloqueio) return bloqueio;

    const queryParams = getQueryParams(request);
    const custoFixoId = queryParams.get('custoFixoId');
    const anexoId = queryParams.get('anexoId');

    if (!custoFixoId || !anexoId) {
      return createErrorResponse('custoFixoId e anexoId são obrigatórios', 400);
    }

    const anexoRepo = repositoryFactory.getAnexoCustoFixoRepository();
    const anexo = await anexoRepo.getAnexoById(user.id, custoFixoId, anexoId);
    if (!anexo) {
      return createErrorResponse('Anexo não encontrado', 404);
    }

    try {
      await s3Service.deleteFile(anexo.s3Key);
    } catch (e) {
      console.error('Erro ao deletar arquivo S3 de custo fixo:', e);
    }

    await anexoRepo.deleteAnexo(user.id, custoFixoId, anexoId);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
