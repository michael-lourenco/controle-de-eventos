/**
 * API Route para obter status da conexão com Google Calendar
 * 
 * GET /api/google-calendar/status
 * 
 * Esta rota é opcional e não quebra o sistema se não estiver configurada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { verificarAcessoGoogleCalendar } from '@/lib/utils/google-calendar-auth';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { GoogleCalendarSyncStatus } from '@/types/google-calendar';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se usuário tem plano permitido
    const planAllowed = await verificarAcessoGoogleCalendar(session.user.id);
    
    const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
    const token = await tokenRepo.findByUserId(session.user.id);

    const status: GoogleCalendarSyncStatus = {
      connected: !!token,
      syncEnabled: token?.syncEnabled || false,
      planAllowed,
      lastSyncAt: token?.lastSyncAt,
      email: undefined
    };

    // Se conectado, obter email do calendário
    if (token && planAllowed) {
      try {
        const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
        const googleService = new GoogleCalendarService();
        const calendarInfo = await googleService.getCalendarInfo(session.user.id);
        status.email = calendarInfo.email;
      } catch (error) {
        // Não falhar se não conseguir obter email
      }
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Erro ao obter status Google Calendar:', error);
    return NextResponse.json(
      { error: 'Erro ao obter status', message: error.message },
      { status: 500 }
    );
  }
}

