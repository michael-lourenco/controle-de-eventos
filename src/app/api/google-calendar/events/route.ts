/**
 * API Route para criar eventos diretamente no Google Calendar
 * 
 * POST /api/google-calendar/events
 * 
 * Esta rota é opcional e não quebra o sistema se não estiver configurada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { verificarAcessoGoogleCalendar } from '@/lib/utils/google-calendar-auth';
import { GoogleCalendarEvent } from '@/types/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se usuário tem plano permitido
    const temAcesso = await verificarAcessoGoogleCalendar(session.user.id);
    if (!temAcesso) {
      return NextResponse.json(
        { 
          error: 'Acesso negado',
          message: 'Esta funcionalidade está disponível apenas para planos Profissional e Enterprise.'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { summary, description, startDateTime, endDateTime, location, timeZone } = body;

    // Validações
    if (!summary || !summary.trim()) {
      return NextResponse.json(
        { error: 'Título do evento é obrigatório' },
        { status: 400 }
      );
    }

    if (!startDateTime) {
      return NextResponse.json(
        { error: 'Data/hora de início é obrigatória' },
        { status: 400 }
      );
    }

    // Validar que endDateTime >= startDateTime (se fornecido)
    if (endDateTime && new Date(endDateTime) < new Date(startDateTime)) {
      return NextResponse.json(
        { error: 'Data/hora de término deve ser posterior à data/hora de início' },
        { status: 400 }
      );
    }

    // Validar timezone (se fornecido)
    const timeZoneValue = timeZone || 'America/Sao_Paulo';
    try {
      // Verificar se timezone é válido
      Intl.DateTimeFormat(undefined, { timeZone: timeZoneValue });
    } catch {
      return NextResponse.json(
        { error: 'Timezone inválido' },
        { status: 400 }
      );
    }

    // Criar objeto de evento do Google Calendar
    const googleEvent: GoogleCalendarEvent = {
      summary: summary.trim(),
      description: description?.trim() || undefined,
      start: {
        dateTime: startDateTime,
        timeZone: timeZoneValue
      },
      end: {
        dateTime: endDateTime || startDateTime, // Se não tiver fim, usar o mesmo que início
        timeZone: timeZoneValue
      },
      location: location?.trim() || undefined
    };

    // Importar serviço (server-side apenas)
    const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
    const googleService = new GoogleCalendarService();

    // Criar evento no Google Calendar
    try {
      const eventId = await googleService.createEventDirectly(session.user.id, googleEvent);

      return NextResponse.json({
        success: true,
        eventId,
        message: 'Evento criado com sucesso no Google Calendar'
      });
    } catch (createError: any) {
      console.error('Erro ao criar evento no Google Calendar:', createError);
      
      // Mapear erros específicos da API do Google Calendar
      const errorCode = createError.code || createError.response?.status;
      const errorData = createError.response?.data;
      
      let errorMessage = createError.message || 'Erro desconhecido';
      let statusCode = 500;
      
      // Erros específicos da API do Google Calendar
      switch (errorCode) {
        case 400:
          errorMessage = errorData?.error?.message || 'Dados inválidos. Verifique os campos do evento.';
          statusCode = 400;
          break;
        case 401:
        case 'UNAUTHENTICATED':
          if (errorMessage.includes('Login Required') || errorMessage.includes('invalid_grant')) {
            errorMessage = 'Token expirado ou inválido. Tente desconectar e conectar novamente sua conta do Google Calendar.';
          } else {
            errorMessage = 'Token inválido. Por favor, reconecte sua conta do Google Calendar.';
          }
          statusCode = 401;
          break;
        case 403:
        case 'PERMISSION_DENIED':
          errorMessage = 'Sem permissão para criar eventos neste calendário. Verifique as permissões da sua conta Google.';
          statusCode = 403;
          break;
        case 404:
        case 'NOT_FOUND':
          if (errorMessage.includes('Token não encontrado')) {
            errorMessage = 'Token não encontrado. Conecte sua conta do Google Calendar primeiro.';
          } else {
            errorMessage = 'Calendário não encontrado.';
          }
          statusCode = 404;
          break;
        case 429:
        case 'RESOURCE_EXHAUSTED':
          errorMessage = 'Muitas requisições. Tente novamente em alguns instantes.';
          statusCode = 429;
          break;
        default:
          // Manter mensagem original se não for um erro conhecido
          if (errorMessage.includes('invalid_grant')) {
            errorMessage = 'Token inválido. Por favor, reconecte sua conta do Google Calendar.';
            statusCode = 401;
          } else if (errorMessage.includes('Token não encontrado')) {
            errorMessage = 'Token não encontrado. Conecte sua conta do Google Calendar primeiro.';
            statusCode = 404;
          }
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar evento',
          message: errorMessage,
          code: errorCode,
          details: errorData || null
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Erro geral ao criar evento no Google Calendar:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar evento',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

