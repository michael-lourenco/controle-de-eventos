import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, newPassword } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Código de redefinição é obrigatório' },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nova senha é obrigatória' },
        { status: 400 }
      );
    }

    // Validações de senha (mesmas do cadastro)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const passwordStrength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (passwordStrength < 3) {
      return NextResponse.json(
        { success: false, error: 'A senha deve atender aos critérios mínimos de segurança (mínimo 3 de 4: maiúscula, minúscula, número, caractere especial)' },
        { status: 400 }
      );
    }

    const result = await authService.confirmPasswordReset(code, newPassword);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Senha redefinida com sucesso'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao confirmar reset de senha:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao redefinir senha'
      },
      { status: 500 }
    );
  }
}

