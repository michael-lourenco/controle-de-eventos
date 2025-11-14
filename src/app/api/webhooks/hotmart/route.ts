import { NextRequest, NextResponse } from 'next/server';
import { HotmartWebhookService } from '@/lib/services/hotmart-webhook-service';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const service = new HotmartWebhookService();

    // Validação HMAC mockada (sempre retorna true por enquanto)
    // Quando integrar com Hotmart real, usar: service.validarAssinatura(payload, signature, secret)
    const isValid = true; // TODO: Implementar validação HMAC real

    if (!isValid) {
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      );
    }

    const result = await service.processarWebhook(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// GET para testar webhook mockado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const planoCodigo = searchParams.get('plano') || 'BASICO_MENSAL';
    const evento = searchParams.get('evento') || 'SUBSCRIPTION_PURCHASE';

    if (!email) {
      return NextResponse.json({
        error: 'Parâmetro email é obrigatório',
        exemplo: '/api/webhooks/hotmart?email=usuario@exemplo.com&plano=PROFISSIONAL_MENSAL&evento=SUBSCRIPTION_PURCHASE'
      }, { status: 400 });
    }

    // Payload mockado para testes
    const mockPayload = {
      event: evento,
      data: {
        subscription: {
          code: `SUB-${Date.now()}`,
          plan: {
            code: planoCodigo
          },
          buyer: {
            email: email,
            name: 'Usuário Teste'
          },
          status: evento === 'SUBSCRIPTION_PURCHASE' ? 'TRIAL' : 'ACTIVE',
          trial_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          date_next_charge: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    };

    const service = new HotmartWebhookService();
    const result = await service.processarWebhook(mockPayload);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      payloadEnviado: mockPayload
    });
  } catch (error: any) {
    console.error('Erro ao processar webhook mockado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

