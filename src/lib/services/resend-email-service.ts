import { Resend } from 'resend';

/**
 * Serviço de envio de email usando Resend
 */
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Enviar email usando Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Clicksehub <noreply@clicksehub.com>'
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // Verificar se Resend está configurado
  if (!resend) {
    return {
      success: false,
      error: 'RESEND_API_KEY não configurada'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Erro ao enviar email'
      };
    }

    return {
      success: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro inesperado ao enviar email'
    };
  }
}

/**
 * Verificar se o serviço de email está configurado
 */
export function isEmailServiceConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!resend;
}

