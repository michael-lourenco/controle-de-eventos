import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';

// Rate limiting simples em memória (para produção, usar Redis ou similar)
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hora

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempt = resetAttempts.get(email);

  if (!attempt) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset se passou a janela de tempo
  if (now - attempt.lastAttempt > WINDOW_MS) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Verificar se excedeu o limite
  if (attempt.count >= MAX_ATTEMPTS) {
    return false;
  }

  // Incrementar contador
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar rate limiting
    if (!checkRateLimit(email.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.' 
        },
        { status: 429 }
      );
    }

    // Enviar email de redefinição
    const result = await authService.sendPasswordReset(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de redefinição enviado com sucesso'
      });
    } else {
      // Por segurança, sempre retornar sucesso mesmo se o email não existir
      // Isso evita que atacantes descubram quais emails estão cadastrados
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      });
    }
  } catch (error: any) {
    console.error('Erro ao processar reset de senha:', error);
    return NextResponse.json(
      { 
        success: true, // Sempre retornar sucesso por segurança
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      },
      { status: 200 }
    );
  }
}

