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

    // Criar objeto de evento do Google Calendar
    const googleEvent: GoogleCalendarEvent = {
      summary: summary.trim(),
      description: description?.trim() || undefined,
      start: {
        dateTime: startDateTime,
        timeZone: timeZone || 'America/Sao_Paulo'
      },
      end: {
        dateTime: endDateTime || startDateTime, // Se não tiver fim, usar o mesmo que início
        timeZone: timeZone || 'America/Sao_Paulo'
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
      
      // Tratar erros específicos
      let errorMessage = createError.message || 'Erro desconhecido';
      let statusCode = 500;
      
      if (errorMessage.includes('Login Required') || errorMessage.includes('401')) {
        errorMessage = 'Token expirado ou inválido. Tente desconectar e conectar novamente sua conta do Google Calendar.';
        statusCode = 401;
      } else if (errorMessage.includes('invalid_grant')) {
        errorMessage = 'Token inválido. Por favor, reconecte sua conta do Google Calendar.';
        statusCode = 401;
      } else if (errorMessage.includes('Token não encontrado')) {
        errorMessage = 'Token não encontrado. Conecte sua conta do Google Calendar primeiro.';
        statusCode = 404;
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar evento',
          message: errorMessage,
          details: createError.response?.data || createError.code || null
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

