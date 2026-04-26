import { NextRequest } from 'next/server';
import { dataService } from '@/lib/data-service';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  getRequestBody
} from '@/lib/api/route-helpers';
import { Evento } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await getRequestBody<Omit<Evento, 'id' | 'dataCadastro' | 'dataAtualizacao'>>(request);
    const evento = await dataService.createEvento(body, user.id);
    return createApiResponse(evento, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
