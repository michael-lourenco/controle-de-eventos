import { NextRequest } from 'next/server';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRequestBody,
  getRouteParams
} from '@/lib/api/route-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const contratoRepo = repositoryFactory.getContratoRepository();
    const contrato = await contratoRepo.findById(id, user.id);

    if (!contrato) {
      return createErrorResponse('Contrato não encontrado', 404);
    }

    // Popular modeloContrato
    let contratoComModelo = contrato;
    if (contrato.modeloContratoId) {
      try {
        const modeloRepo = repositoryFactory.getModeloContratoRepository();
        const modelo = await modeloRepo.findById(contrato.modeloContratoId);
        if (modelo) {
          contratoComModelo = { ...contrato, modeloContrato: modelo };
        }
      } catch (error) {
        console.error(`Erro ao buscar modelo ${contrato.modeloContratoId}:`, error);
      }
    }

    return createApiResponse(contratoComModelo);
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
    const { id } = await getRouteParams(params);
    const body = await getRequestBody(request);
    const contratoRepo = repositoryFactory.getContratoRepository();
    
    const contrato = await contratoRepo.findById(id, user.id);
    if (!contrato) {
      return createErrorResponse('Contrato não encontrado', 404);
    }

    if (body.dadosPreenchidos && contrato.modeloContratoId) {
      const modeloRepo = repositoryFactory.getModeloContratoRepository();
      const modelo = await modeloRepo.findById(contrato.modeloContratoId);
      if (modelo) {
        const { ContratoService } = await import('@/lib/services/contrato-service');
        const validacao = ContratoService.validarDadosPreenchidos(body.dadosPreenchidos, modelo.campos);
        if (!validacao.valido) {
          return createErrorResponse('Dados inválidos', 400, { erros: validacao.erros });
        }
      }
      
      // Garantir que numero_contrato está nos dados preenchidos
      body.dadosPreenchidos = {
        ...body.dadosPreenchidos,
        numero_contrato: contrato.numeroContrato || ''
      };
    }

    const atualizado = await contratoRepo.update(id, {
      ...body,
      dataAtualizacao: new Date(),
      userId: user.id
    });
    
    // Popular modeloContrato no retorno
    let atualizadoComModelo = atualizado;
    if (atualizado.modeloContratoId) {
      try {
        const modeloRepo = repositoryFactory.getModeloContratoRepository();
        const modelo = await modeloRepo.findById(atualizado.modeloContratoId);
        if (modelo) {
          atualizadoComModelo = { ...atualizado, modeloContrato: modelo };
        }
      } catch (error) {
        console.error(`Erro ao buscar modelo ${atualizado.modeloContratoId}:`, error);
      }
    }

    return createApiResponse(atualizadoComModelo);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const contratoRepo = repositoryFactory.getContratoRepository();
    await contratoRepo.delete(id);

    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

