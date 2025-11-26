import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetTokenRepository } from '@/lib/repositories/password-reset-token-repository';

/**
 * Converte um token curto no código do Firebase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const tokenRepo = new PasswordResetTokenRepository();
    const tokenData = await tokenRepo.findByToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar se o token expirou
    const expiresAt = tokenData.expiresAt instanceof Date 
      ? tokenData.expiresAt 
      : new Date(tokenData.expiresAt);
    
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Retornar o código do Firebase
    return NextResponse.json({
      success: true,
      code: tokenData.firebaseCode,
      email: tokenData.email
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar token' },
      { status: 500 }
    );
  }
}

