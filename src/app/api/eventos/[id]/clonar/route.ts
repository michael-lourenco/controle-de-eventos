import { NextRequest } from 'next/server';
import { dataService } from '@/lib/data-service';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  getRouteParams
} from '@/lib/api/route-helpers';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await getRouteParams(params);
    const eventoClonado = await dataService.clonarEvento(id, user.id);
    return createApiResponse(eventoClonado, 201, 'Evento clonado com sucesso');
  } catch (error) {
    return handleApiError(error);
  }
}
