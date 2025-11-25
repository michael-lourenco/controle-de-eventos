import { NextRequest, NextResponse } from 'next/server';
import { HotmartWebhookService } from '@/lib/services/hotmart-webhook-service';

export async function POST(request: NextRequest) {
  try {
    // Obter o body como texto primeiro (para validação HMAC)
    const bodyText = await request.text();
    let payload: any;
    
    try {
      payload = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json(
        { error: 'Payload JSON inválido' },
        { status: 400 }
      );
    }

    const service = new HotmartWebhookService();

    // Segundo a documentação oficial do Hotmart:
    // https://developers.hotmart.com/docs/pt-BR/tutorials/use-webhook-for-subscriptions/
    // O header correto é 'x-hotmart-hmac-sha256'
    const signature = request.headers.get('x-hotmart-hmac-sha256') || '';
    
    // Obter secret da variável de ambiente
    const secret = process.env.HOTMART_WEBHOOK_SECRET || '';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const validateHmac = process.env.HOTMART_VALIDATE_HMAC !== 'false';


    // Validar HMAC se estiver habilitado e em produção
    if (validateHmac && secret && !isDevelopment) {
      if (!signature) {
        console.error('❌ Webhook sem assinatura HMAC no header');
        return NextResponse.json(
          { error: 'Assinatura HMAC não fornecida' },
          { status: 401 }
        );
      }

      // Validar usando o body como texto (ordem original preservada)
      const isValid = service.validarAssinatura(bodyText, signature, secret);
      
      if (!isValid) {
        console.error('❌ Webhook HMAC inválido');
        return NextResponse.json(
          { error: 'Assinatura HMAC inválida' },
          { status: 401 }
        );
      }
    } else if (isDevelopment) {
      console.warn('⚠️ Modo desenvolvimento: Validação HMAC desabilitada');
    } else if (!secret) {
      console.warn('⚠️ HOTMART_WEBHOOK_SECRET não configurado: Validação HMAC desabilitada');
    }

    // Processar webhook
    const result = await service.processarWebhook(payload);

    if (!result.success) {
      console.error('❌ Erro ao processar webhook:', result.message);
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error);
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

