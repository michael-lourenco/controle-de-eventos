import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { PasswordResetTokenRepository } from '@/lib/repositories/password-reset-token-repository';
import { generateShortToken, generatePasswordResetEmailTemplate } from '@/lib/services/email-service';
import { sendEmail, isEmailServiceConfigured } from '@/lib/services/resend-email-service';
import { UserRepository } from '@/lib/repositories/user-repository';

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

    // Verificar se o serviço de email está configurado
    if (!isEmailServiceConfigured()) {
      console.error('[reset-password] RESEND_API_KEY não configurada. Configure a variável de ambiente RESEND_API_KEY.');
      // Não fazer fallback para Firebase - retornar erro claro
      return NextResponse.json(
        { 
          success: false,
          error: 'Serviço de email não configurado. Configure RESEND_API_KEY nas variáveis de ambiente.'
        },
        { status: 500 }
      );
    }

    // Tentar usar sistema personalizado
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Verificar se o usuário existe usando Firebase Admin
      const user = await adminAuth.getUserByEmail(normalizedEmail);
      
      // Buscar nome do usuário no Firestore
      const userRepo = new UserRepository();
      const userData = await userRepo.findById(user.uid);
      const nome = userData?.nome || '';

      // Gerar código de reset usando Firebase Admin
      const resetLink = await adminAuth.generatePasswordResetLink(normalizedEmail, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/redefinir-senha`,
        handleCodeInApp: false,
      });

      // Extrair o código do link gerado
      const urlObj = new URL(resetLink);
      const oobCode = urlObj.searchParams.get('oobCode');
      
      if (!oobCode) {
        throw new Error('Código de reset não gerado pelo Firebase');
      }

      // Gerar token curto
      const shortToken = generateShortToken();
      
      // Calcular expiração (1 hora)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Armazenar token no banco
      const tokenRepo = new PasswordResetTokenRepository();
      await tokenRepo.createToken({
        token: shortToken,
        email: normalizedEmail,
        firebaseCode: oobCode,
        expiresAt
      });

      // Criar URL curta e limpa
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/redefinir-senha?token=${shortToken}`;

      // Gerar template de email
      const emailHtml = generatePasswordResetEmailTemplate(nome, resetUrl);
      const emailSubject = 'Redefinir sua senha - Clicksehub';

      // Enviar email usando Resend
      const emailResult = await sendEmail({
        to: normalizedEmail,
        subject: emailSubject,
        html: emailHtml,
        from: 'Clicksehub <noreply@clicksehub.com>'
      });

      if (!emailResult.success) {
        console.error('[reset-password] Erro ao enviar email personalizado:', emailResult.error);
        // Não fazer fallback para Firebase - retornar erro
        return NextResponse.json(
          { 
            success: false,
            error: `Erro ao enviar email: ${emailResult.error}. Verifique a configuração do Resend.`
          },
          { status: 500 }
        );
      }

      console.log('[reset-password] Email personalizado enviado com sucesso para:', normalizedEmail);
      
      return NextResponse.json({
        success: true,
        message: 'Email de redefinição enviado com sucesso'
      });

    } catch (error: any) {
      console.error('[reset-password] Erro no processo de reset:', error);
      
      // Se o erro for que o usuário não existe, não expor isso por segurança
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
        });
      }

      // Para outros erros, retornar mensagem genérica por segurança
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      });
    }

  } catch (error: any) {
    console.error('[reset-password] Erro geral:', error);
    // Por segurança, sempre retornar sucesso mesmo em caso de erro
    return NextResponse.json(
      { 
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      },
      { status: 200 }
    );
  }
}

