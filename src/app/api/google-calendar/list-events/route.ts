import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  handleApiError,
  createApiResponse,
  getQueryParams
} from '@/lib/api/route-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const queryParams = getQueryParams(request);

    const maxResultsParam = Number(queryParams.get('maxResults') || '50');
    const maxResults = Number.isFinite(maxResultsParam) ? Math.min(Math.max(maxResultsParam, 1), 250) : 50;
    const timeMin = queryParams.get('timeMin') || undefined;
    const timeMax = queryParams.get('timeMax') || undefined;

    const { getServiceFactory } = await import('@/lib/factories/service-factory');
    const serviceFactory = getServiceFactory();
    const googleService = serviceFactory.getGoogleCalendarService();

    const eventos = await googleService.listarEventosGoogleCalendarVinculadosAoSistema(user.id, {
      maxResults,
      timeMin,
      timeMax
    });

    return createApiResponse({
      eventos,
      total: eventos.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
