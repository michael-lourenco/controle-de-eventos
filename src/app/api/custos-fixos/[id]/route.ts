import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';
import { AdminFuncionalidadeRepository } from '@/lib/repositories/admin-funcionalidade-repository';
import { AdminAssinaturaRepository } from '@/lib/repositories/admin-assinatura-repository';
import { AdminUserRepository } from '@/lib/repositories/admin-user-repository';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody,
  getRouteParams
} from '@/lib/api/route-helpers';

async function assertCustosFixos(userId: string) {
  const funcionalidadeService = new FuncionalidadeService(
    new AdminFuncionalidadeRepository(),
    new AdminAssinaturaRepository(),
    new AdminUserRepository()
  );
  const temPermissao = await funcionalidadeService.verificarPermissao(userId, 'CUSTOS_FIXOS');
  if (!temPermissao) {
    return createErrorResponse('Seu plano não permite custos fixos', 403);
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const { id } = await getRouteParams(params);
    const repo = repositoryFactory.getCustoFixoRepository();
    const custo = await repo.findById(id, user.id);
    if (!custo) return createErrorResponse('Custo fixo não encontrado', 404);
    return createApiResponse(custo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const { id } = await getRouteParams(params);
    const body = await getRequestBody(request);
    const updates: any = {};

    if (body.tipoCustoFixoId !== undefined) updates.tipoCustoFixoId = body.tipoCustoFixoId;
    if (body.valor !== undefined) updates.valor = parseFloat(body.valor) || 0;
    if (body.quantidade !== undefined) updates.quantidade = body.quantidade || 1;
    if (body.dataPagamento !== undefined) updates.dataPagamento = new Date(body.dataPagamento);
    if (body.descricao !== undefined) updates.descricao = body.descricao;

    const repo = repositoryFactory.getCustoFixoRepository();
    const atualizado = await repo.updateCustoFixo(user.id, id, updates);
    return createApiResponse(atualizado);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const { id } = await getRouteParams(params);
    const custoRepo = repositoryFactory.getCustoFixoRepository();
    const anexoRepo = repositoryFactory.getAnexoCustoFixoRepository();
    const { s3Service } = await import('@/lib/s3-service');

    const existente = await custoRepo.findById(id, user.id);
    if (!existente) {
      return createErrorResponse('Custo fixo não encontrado', 404);
    }

    const anexos = await anexoRepo.findByCustoFixoId(user.id, id);
    for (const anexo of anexos) {
      try {
        await s3Service.deleteFile(anexo.s3Key);
      } catch (e) {
        console.error('Erro ao deletar anexo S3 de custo fixo:', e);
      }
    }

    await custoRepo.deleteCustoFixo(user.id, id);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
