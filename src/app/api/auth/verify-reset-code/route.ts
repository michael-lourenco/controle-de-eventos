import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Código de redefinição é obrigatório' },
        { status: 400 }
      );
    }

    const result = await authService.verifyResetCode(code);

    if (result.success) {
      return NextResponse.json({
        success: true,
        email: result.email
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Erro ao verificar código de reset:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Código de redefinição inválido ou expirado'
      },
      { status: 400 }
    );
  }
}

