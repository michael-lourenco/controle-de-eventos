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
  getRequestBody
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

/** Lista custos fixos — GET /api/custos-fixos */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const repo = repositoryFactory.getCustoFixoRepository();
    const custos = await repo.findAll(user.id, true);
    return createApiResponse(custos);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Alias de create — POST /api/custos-fixos */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const body = await getRequestBody(request);
    const { tipoCustoFixoId, valor, quantidade, dataPagamento, descricao } = body;

    if (!tipoCustoFixoId || valor === undefined || !dataPagamento) {
      return createErrorResponse('tipoCustoFixoId, valor e dataPagamento são obrigatórios', 400);
    }

    const repo = repositoryFactory.getCustoFixoRepository();
    const criado = await repo.createCustoFixo(user.id, {
      tipoCustoFixoId,
      valor: parseFloat(valor) || 0,
      quantidade: quantidade || 1,
      dataPagamento: new Date(dataPagamento),
      descricao: descricao || '',
      removido: false,
    });

    return createApiResponse(criado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
