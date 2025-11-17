import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { ServicoGlobalRepository } from '@/lib/repositories/servico-global-repository';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
    const isDevMode = process.env.NODE_ENV === 'development';

    const session = await getServerSession(authOptions);

    let userId: string | null = null;

    if (session?.user?.id) {
      userId = session.user.id;
    }
    else {
      const body = await request.json().catch(() => ({}));
      const queryParams = new URL(request.url).searchParams;
      const bodyUserId = body.userId || queryParams.get('userId') || null;

      if (apiKey) {
        const validApiKey = process.env.SEED_API_KEY || 'dev-seed-key-2024';
        if (apiKey !== validApiKey && !apiKey.includes(validApiKey)) {
          return NextResponse.json({ error: 'API key inválida' }, { status: 401 });
        }
        userId = bodyUserId;

        if (!userId) {
          return NextResponse.json({
            error: 'userId é obrigatório quando usando API key. Forneça no body: { "userId": "..." } ou query param: ?userId=...'
          }, { status: 400 });
        }
      }
      else if (isDevMode) {
        userId = bodyUserId;

        if (!userId) {
          return NextResponse.json({
            error: 'Em modo desenvolvimento, forneça userId no body: { "userId": "..." } ou query param: ?userId=...'
          }, { status: 400 });
        }
      }
      else {
        return NextResponse.json({
          error: 'Não autorizado. Use autenticação via sessão ou forneça x-api-key header com userId'
        }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const repositoryFactory = RepositoryFactory.getInstance();
    const eventoRepo = repositoryFactory.getEventoRepository();
    const servicoRepo = repositoryFactory.getServicoEventoRepository();
    const servicoGlobalRepo = new ServicoGlobalRepository();

    const eventos = await eventoRepo.findAll(userId);

    let totalProcessados = 0;
    let totalCriados = 0;
    let totalErros = 0;
    const erros: string[] = [];

    for (const evento of eventos) {
      try {
        const servicos = await servicoRepo.findByEventoId(userId, evento.id);

        for (const servico of servicos) {
          totalProcessados++;

          try {
            const servicoExistente = await servicoGlobalRepo.findById(
              userId,
              evento.id,
              servico.id
            );

            if (!servicoExistente) {
              await servicoGlobalRepo.createServico(
                userId,
                evento.id,
                servico.id,
                {
                  eventoId: evento.id,
                  tipoServicoId: servico.tipoServicoId,
                  observacoes: servico.observacoes,
                  removido: servico.removido,
                  dataRemocao: servico.dataRemocao,
                  motivoRemocao: servico.motivoRemocao,
                  dataCadastro: servico.dataCadastro
                }
              );
              totalCriados++;
            }
          } catch (error) {
            totalErros++;
            const errorMessage = `Erro ao processar serviço ${servico.id} do evento ${evento.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
            erros.push(errorMessage);
            console.error(errorMessage, error);
          }
        }
      } catch (error) {
        const errorMessage = `Erro ao buscar serviços do evento ${evento.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros.push(errorMessage);
        console.error(errorMessage, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Normalização de serviços concluída',
      estatisticas: {
        totalProcessados,
        totalCriados,
        totalErros,
        totalEventos: eventos.length
      },
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    console.error('Erro ao normalizar serviços:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

