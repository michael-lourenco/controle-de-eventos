/**
 * API Route para iniciar o fluxo OAuth do Google Calendar
 * 
 * GET /api/google-calendar/auth
 * 
 * Esta rota é opcional e não quebra o sistema se não estiver configurada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { verificarAcessoGoogleCalendar } from '@/lib/utils/google-calendar-auth';

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
    const temAcesso = await verificarAcessoGoogleCalendar(session.user.id);
    if (!temAcesso) {
      return NextResponse.json(
        { 
          error: 'Acesso negado',
          message: 'Esta funcionalidade está disponível apenas para planos Profissional e Premium.'
        },
        { status: 403 }
      );
    }

    // Verificar se variáveis de ambiente estão configuradas
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { 
          error: 'Configuração incompleta',
          message: 'Google Calendar não está configurado. Contate o administrador.'
        },
        { status: 500 }
      );
    }

    // Importar serviço (server-side apenas)
    const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
    const googleService = new GoogleCalendarService();

    // Verificar se há parâmetro para forçar nova autorização
    const searchParams = request.nextUrl.searchParams;
    const forcePrompt = searchParams.get('force') === 'true';

    // Gerar URL de autorização com state = userId para segurança
    // getAuthUrl já inclui prompt=consent, então se forcePrompt, apenas garantir que está na URL
    const authUrl = googleService.getAuthUrl(session.user.id);
    
    // Se forcePrompt, garantir que prompt=consent está presente (pode já estar)
    const finalAuthUrl = forcePrompt && !authUrl.includes('prompt=consent')
      ? `${authUrl}&prompt=consent`
      : authUrl;

    return NextResponse.redirect(finalAuthUrl);
  } catch (error: any) {
    console.error('Erro ao iniciar autenticação Google Calendar:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar autenticação', message: error.message },
      { status: 500 }
    );
  }
}

