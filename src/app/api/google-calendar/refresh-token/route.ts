/**
 * API Route para forçar renovação do token do Google Calendar
 * 
 * POST /api/google-calendar/refresh-token
 * 
 * Esta rota força a renovação do access token usando o refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function decrypt(encrypted: string, key: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
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

    // Descriptografar refresh token
    const refreshToken = decrypt(token.refreshToken, ENCRYPTION_KEY);

    // Importar serviço
    const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
    const googleService = new GoogleCalendarService();
    
    // Forçar renovação marcando token como expirado
    await tokenRepo.update(token.id, {
      expiresAt: new Date(0) // Data no passado para forçar renovação
    });

    // Tentar obter novo token (vai forçar renovação)
    try {
      // Usar método privado através de getCalendarInfo que vai renovar o token
      const calendarInfo = await googleService.getCalendarInfo(session.user.id);
      
      // Buscar token atualizado
      const updatedToken = await tokenRepo.findByUserId(session.user.id);
      
      return NextResponse.json({
        success: true,
        message: 'Token renovado com sucesso',
        calendarInfo: calendarInfo
      });
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      
      // Se o refresh token é inválido, usuário precisa reconectar
      if (error.message?.includes('invalid_grant') || error.code === 'invalid_grant') {
        return NextResponse.json(
          {
            error: 'Refresh token inválido',
            message: 'O refresh token é inválido ou foi revogado. Por favor, desconecte e conecte novamente sua conta do Google Calendar.',
            requiresReconnect: true
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Erro ao renovar token',
          message: error.message || 'Erro desconhecido'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro geral ao renovar token:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao renovar token',
        message: error.message || 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

