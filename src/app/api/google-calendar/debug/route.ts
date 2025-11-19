/**
 * API Route para obter informações de debug do Google Calendar
 * 
 * GET /api/google-calendar/debug
 * 
 * Esta rota retorna informações detalhadas sobre o token e conexão do Google Calendar
 * para fins de debug durante desenvolvimento.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

// Função de descriptografia (mesma do serviço)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function decrypt(encrypted: string, key: string): string {
  return Buffer.from(encrypted, 'base64').toString('utf-8');
}

export async function GET(request: NextRequest) {
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
      return NextResponse.json({
        connected: false,
        message: 'Token não encontrado. Conecte sua conta do Google Calendar primeiro.'
      });
    }

    // Descriptografar tokens
    let accessToken = '';
    let refreshToken = '';
    let accessTokenPreview = '';
    let refreshTokenPreview = '';
    
    try {
      accessToken = decrypt(token.accessToken, ENCRYPTION_KEY);
      refreshToken = decrypt(token.refreshToken, ENCRYPTION_KEY);
      
      // Criar preview (primeiros 20 e últimos 10 caracteres)
      if (accessToken.length > 30) {
        accessTokenPreview = `${accessToken.substring(0, 20)}...${accessToken.substring(accessToken.length - 10)}`;
      } else {
        accessTokenPreview = accessToken.substring(0, 30);
      }
      
      if (refreshToken.length > 30) {
        refreshTokenPreview = `${refreshToken.substring(0, 20)}...${refreshToken.substring(refreshToken.length - 10)}`;
      } else {
        refreshTokenPreview = refreshToken.substring(0, 30);
      }
    } catch (error) {
      console.error('Erro ao descriptografar tokens:', error);
    }

    // Verificar se token está expirado
    const agora = new Date();
    const expiresAt = token.expiresAt instanceof Date 
      ? token.expiresAt 
      : new Date(token.expiresAt);
    
    const isExpired = agora.getTime() >= expiresAt.getTime();
    const minutesUntilExpiry = Math.floor((expiresAt.getTime() - agora.getTime()) / (1000 * 60));

    // Tentar obter informações do calendário
    let calendarInfo = null;
    let calendarError = null;
    
    try {
      const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
      const googleService = new GoogleCalendarService();
      calendarInfo = await googleService.getCalendarInfo(session.user.id);
    } catch (error: any) {
      calendarError = {
        message: error.message,
        code: error.code,
        status: error.response?.status
      };
    }

    // Tentar validar o token fazendo uma requisição simples ao calendário
    let tokenValid = false;
    let tokenValidationError = null;
    let tokenTestDetails = null;
    
    try {
      const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
      const googleService = new GoogleCalendarService();
      
      // Tentar obter informações do calendário (vai validar e renovar token se necessário)
      const calendarInfo = await googleService.getCalendarInfo(session.user.id);
      tokenValid = !!calendarInfo && !!calendarInfo.email;
      tokenTestDetails = {
        success: true,
        calendarEmail: calendarInfo.email,
        calendarId: calendarInfo.calendarId
      };
    } catch (error: any) {
      tokenValid = false;
      tokenValidationError = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        response: error.response?.data
      };
      
      // Tentar fazer uma requisição direta com o token para ver o erro exato
      try {
        // Usar o accessToken descriptografado que já temos
        const testResponse = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
        const tokenInfo = await testResponse.json();
        tokenTestDetails = {
          success: false,
          tokenInfo: tokenInfo,
          httpStatus: testResponse.status,
          httpStatusText: testResponse.statusText
        };
      } catch (tokenInfoError: any) {
        tokenTestDetails = {
          success: false,
          tokenInfoError: tokenInfoError.message
        };
      }
    }

    return NextResponse.json({
      connected: true,
      token: {
        id: token.id,
        userId: token.userId,
        accessToken: accessToken, // Token completo para debug
        accessTokenPreview: accessTokenPreview,
        refreshToken: refreshToken, // Token completo para debug
        refreshTokenPreview: refreshTokenPreview,
        expiresAt: expiresAt.toISOString(),
        expiresAtFormatted: expiresAt.toLocaleString('pt-BR'),
        isExpired: isExpired,
        minutesUntilExpiry: isExpired ? 0 : minutesUntilExpiry,
        calendarId: token.calendarId,
        syncEnabled: token.syncEnabled,
        lastSyncAt: token.lastSyncAt ? new Date(token.lastSyncAt).toISOString() : null,
        lastSyncAtFormatted: token.lastSyncAt ? new Date(token.lastSyncAt).toLocaleString('pt-BR') : null,
        dataCadastro: token.dataCadastro instanceof Date ? token.dataCadastro.toISOString() : new Date(token.dataCadastro).toISOString(),
        dataAtualizacao: token.dataAtualizacao instanceof Date ? token.dataAtualizacao.toISOString() : new Date(token.dataAtualizacao).toISOString()
      },
      calendarInfo: calendarInfo || null,
      calendarError: calendarError,
      tokenValidation: {
        valid: tokenValid,
        error: tokenValidationError,
        testDetails: tokenTestDetails
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    });
  } catch (error: any) {
    console.error('Erro ao obter informações de debug:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao obter informações de debug',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

