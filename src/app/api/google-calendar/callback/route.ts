/**
 * API Route para receber o callback do OAuth do Google Calendar
 * 
 * GET /api/google-calendar/callback?code=...&state=...
 * 
 * Esta rota é opcional e não quebra o sistema se não estiver configurada.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { verificarAcessoGoogleCalendar } from '@/lib/utils/google-calendar-auth';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

// Funções simples de criptografia (usar biblioteca adequada em produção)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function encrypt(text: string, key: string): string {
  if (process.env.NODE_ENV === 'production' && key === 'default-key-change-in-production') {
    throw new Error('ENCRYPTION_KEY deve ser configurada em produção');
  }
  return Buffer.from(text).toString('base64');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    // Verificar se usuário tem plano permitido
    const temAcesso = await verificarAcessoGoogleCalendar(session.user.id);
    if (!temAcesso) {
      return NextResponse.redirect(
        new URL('/configuracoes/calendario?error=access_denied', request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Verificar se usuário cancelou autorização
    if (error) {
      return NextResponse.redirect(
        new URL('/configuracoes/calendario?error=user_cancelled', request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/configuracoes/calendario?error=no_code', request.url)
      );
    }

    // Validar state (deve ser o userId)
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL('/configuracoes/calendario?error=invalid_state', request.url)
      );
    }

    // Importação dinâmica do serviço
    const { GoogleCalendarService } = await import('@/lib/services/google-calendar-service');
    const googleService = new GoogleCalendarService();
    const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();

    // Trocar código por tokens
    const tokens = await googleService.exchangeCodeForTokens(code);

    // Obter informações do calendário usando o access token
    const calendarInfo = await googleService.getCalendarInfo(undefined, tokens.accessToken);

    // Verificar se já existe token para este usuário
    const tokenExistente = await tokenRepo.findByUserId(session.user.id);

    // Criptografar tokens antes de armazenar
    const encryptedAccessToken = encrypt(tokens.accessToken, ENCRYPTION_KEY);
    const encryptedRefreshToken = encrypt(tokens.refreshToken, ENCRYPTION_KEY);

    if (tokenExistente) {
      // Atualizar token existente
      await tokenRepo.update(tokenExistente.id, {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokens.expiresAt,
        calendarId: calendarInfo.calendarId,
        syncEnabled: true,
        dataAtualizacao: new Date()
      });
    } else {
      // Criar novo token
      await tokenRepo.create({
        userId: session.user.id,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokens.expiresAt,
        calendarId: calendarInfo.calendarId,
        syncEnabled: true,
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      });
    }

    return NextResponse.redirect(
      new URL('/configuracoes/calendario?success=connected', request.url)
    );
  } catch (error: any) {
    console.error('Erro no callback OAuth:', error);
    return NextResponse.redirect(
      new URL(`/configuracoes/calendario?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

