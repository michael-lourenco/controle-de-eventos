/**
 * API Route para alternar status de sincronização
 * 
 * POST /api/google-calendar/toggle-sync
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

    const body = await request.json();
    const { syncEnabled } = body;

    if (typeof syncEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'syncEnabled deve ser um boolean' },
        { status: 400 }
      );
    }

    const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
    await tokenRepo.updateSyncStatus(session.user.id, syncEnabled);

    return NextResponse.json({ 
      success: true,
      syncEnabled
    });
  } catch (error: any) {
    console.error('Erro ao alternar sincronização:', error);
    return NextResponse.json(
      { error: 'Erro ao alternar sincronização', message: error.message },
      { status: 500 }
    );
  }
}

