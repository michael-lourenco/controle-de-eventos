import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const queryParams = getQueryParams(request);
    const eventoId = queryParams.get('eventoId');
    const status = queryParams.get('status');

    const contratoRepo = repositoryFactory.getContratoRepository();
    
    let contratos;
    if (eventoId) {
      contratos = await contratoRepo.findByEventoId(eventoId, user.id);
    } else {
      contratos = await contratoRepo.findAll(user.id);
    }

    if (status) {
      contratos = contratos.filter(c => c.status === status);
    }

    return createApiResponse(contratos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await getRequestBody(request);
    const { eventoId, modeloContratoId, dadosPreenchidos, status = 'rascunho' } = body;

    if (!modeloContratoId || !dadosPreenchidos) {
      return createErrorResponse('modeloContratoId e dadosPreenchidos são obrigatórios', 400);
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelo = await modeloRepo.findById(modeloContratoId);
    if (!modelo || !modelo.ativo) {
      return createErrorResponse('Modelo de contrato não encontrado ou inativo', 400);
    }

    const { ContratoService } = await import('@/lib/services/contrato-service');
    const validacao = ContratoService.validarDadosPreenchidos(dadosPreenchidos, modelo.campos);
    if (!validacao.valido) {
      return createErrorResponse('Dados inválidos', 400, { erros: validacao.erros });
    }

    const numeroContrato = await ContratoService.gerarNumeroContrato(user.id);
    
    const contratoRepo = repositoryFactory.getContratoRepository();
    const contrato = await contratoRepo.create({
      userId: user.id,
      eventoId: eventoId || undefined,
      modeloContratoId,
      dadosPreenchidos,
      status,
      numeroContrato,
      dataGeracao: new Date(),
      dataCadastro: new Date(),
      dataAtualizacao: new Date(),
      criadoPor: user.id
    });

    return createApiResponse(contrato, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

