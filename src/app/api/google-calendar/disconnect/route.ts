/**
 * API Route para desconectar conta do Google Calendar
 * 
 * POST /api/google-calendar/disconnect
 * 
 * Esta rota é opcional e não quebra o sistema se não estiver configurada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { verificarAcessoGoogleCalendar } from '@/lib/utils/google-calendar-auth';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

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
          message: 'Esta funcionalidade está disponível apenas para planos Profissional e Premium.'
        },
        { status: 403 }
      );
    }

    const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
    const token = await tokenRepo.findByUserId(session.user.id);

    if (!token) {
      return NextResponse.json(
        { error: 'Token não encontrado' },
        { status: 404 }
      );
    }

    // Deletar token
    await tokenRepo.delete(token.id);

    return NextResponse.json({ 
      success: true,
      message: 'Conta desconectada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao desconectar Google Calendar:', error);
    return NextResponse.json(
      { error: 'Erro ao desconectar', message: error.message },
      { status: 500 }
    );
  }
}

