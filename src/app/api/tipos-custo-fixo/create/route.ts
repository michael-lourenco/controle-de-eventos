import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
// import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';
// import { AdminFuncionalidadeRepository } from '@/lib/repositories/admin-funcionalidade-repository';
// import { AdminAssinaturaRepository } from '@/lib/repositories/admin-assinatura-repository';
// import { AdminUserRepository } from '@/lib/repositories/admin-user-repository';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody
} from '@/lib/api/route-helpers';

async function assertCustosFixos(_userId: string) {
  // TODO: reativar bloqueio por plano quando CUSTOS_FIXOS estiver liberado nos planos dos usuários
  // const funcionalidadeService = new FuncionalidadeService(
  //   new AdminFuncionalidadeRepository(),
  //   new AdminAssinaturaRepository(),
  //   new AdminUserRepository()
  // );
  // const temPermissao = await funcionalidadeService.verificarPermissao(_userId, 'CUSTOS_FIXOS');
  // if (!temPermissao) {
  //   return createErrorResponse('Seu plano não permite custos fixos', 403);
  // }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const bloqueio = await assertCustosFixos(user.id);
    if (bloqueio) return bloqueio;

    const body = await getRequestBody(request);
    const { nome, descricao, ativo = true } = body;

    if (!nome || !String(nome).trim()) {
      return createErrorResponse('nome é obrigatório', 400);
    }

    const repo = repositoryFactory.getTipoCustoFixoRepository();
    const criado = await repo.createTipoCustoFixo(
      {
        nome: String(nome).trim(),
        descricao: descricao?.trim() || '',
        ativo: ativo !== false,
      },
      user.id
    );

    return createApiResponse(criado, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
