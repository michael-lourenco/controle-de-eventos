import { NextRequest } from 'next/server';
import { dataService } from '@/lib/data-service';
import { 
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  createErrorResponse,
  getRouteParams,
  getRequestBody
} from '@/lib/api/route-helpers';
import { Evento } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const evento = await dataService.getEventoById(id, user.id);
    
    if (!evento) {
      return createErrorResponse('Evento não encontrado', 404);
    }

    return createApiResponse(evento);
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
    const body = await getRequestBody<Partial<Evento>>(request);
    const evento = await dataService.updateEvento(id, body, user.id);
    return createApiResponse(evento);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    await dataService.deleteEvento(id, user.id);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const body = await getRequestBody<{ action?: 'desarquivar' }>(request);

    if (body?.action === 'desarquivar') {
      await dataService.desarquivarEvento(id, user.id);
      return createApiResponse({ success: true });
    }

    return createErrorResponse('Ação inválida', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

