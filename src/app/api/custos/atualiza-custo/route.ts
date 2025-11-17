import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { CustoGlobalRepository } from '@/lib/repositories/custo-global-repository';

/**
 * Endpoint para normalizar custos existentes
 * 
 * Este endpoint busca todos os custos da collection de eventos
 * e os cria na collection global de custos (users -> custos)
 * 
 * Estrutura atual: users/{userId}/eventos/{eventoId}/custos/{custoId}
 * Estrutura nova: users/{userId}/custos/{custoId}{eventoId}
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se há um token de segurança no header (para uso via Postman/API)
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
    const isDevMode = process.env.NODE_ENV === 'development';
    
    // Tentar autenticação via sessão primeiro
    const session = await getServerSession(authOptions);
    
    let userId: string | null = null;
    
    // Se houver sessão, usar userId da sessão
    if (session?.user?.id) {
      userId = session.user.id;
    } 
    // Se não houver sessão, verificar se é modo dev ou tem API key válida
    else {
      // Ler body e query params uma vez
      const body = await request.json().catch(() => ({}));
      const queryParams = new URL(request.url).searchParams;
      const bodyUserId = body.userId || queryParams.get('userId') || null;
      
      if (apiKey) {
        const validApiKey = process.env.SEED_API_KEY || 'dev-seed-key-2024';
        if (apiKey !== validApiKey && !apiKey.includes(validApiKey)) {
          return NextResponse.json({ error: 'API key inválida' }, { status: 401 });
        }
        // API key válida, usar userId do body ou query param
        userId = bodyUserId;
        
        if (!userId) {
          return NextResponse.json({ 
            error: 'userId é obrigatório quando usando API key. Forneça no body: { "userId": "..." } ou query param: ?userId=...' 
          }, { status: 400 });
        }
      } 
      // Em desenvolvimento, permitir sem autenticação se fornecer userId
      else if (isDevMode) {
        userId = bodyUserId;
        
        if (!userId) {
          return NextResponse.json({ 
            error: 'Em modo desenvolvimento, forneça userId no body: { "userId": "..." } ou query param: ?userId=...' 
          }, { status: 400 });
        }
      }
      // Em produção, requer autenticação
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
    const custoRepo = repositoryFactory.getCustoEventoRepository();
    const custoGlobalRepo = new CustoGlobalRepository();

    // Buscar todos os eventos do usuário
    const eventos = await eventoRepo.findAll(userId);
    
    let totalProcessados = 0;
    let totalCriados = 0;
    let totalErros = 0;
    const erros: string[] = [];

    // Para cada evento, buscar seus custos
    for (const evento of eventos) {
      try {
        const custos = await custoRepo.findByEventoId(userId, evento.id);
        
        // Para cada custo, criar na collection global se não existir
        for (const custo of custos) {
          totalProcessados++;
          
          try {
            // Verificar se o custo já existe na collection global
            const custoExistente = await custoGlobalRepo.findById(
              userId,
              evento.id,
              custo.id
            );

            if (!custoExistente) {
              // Criar na collection global
              await custoGlobalRepo.createCusto(
                userId,
                evento.id,
                custo.id,
                {
                  eventoId: evento.id,
                  tipoCustoId: custo.tipoCustoId,
                  valor: custo.valor,
                  quantidade: custo.quantidade,
                  observacoes: custo.observacoes,
                  removido: custo.removido,
                  dataRemocao: custo.dataRemocao,
                  motivoRemocao: custo.motivoRemocao,
                  dataCadastro: custo.dataCadastro
                }
              );
              totalCriados++;
            }
          } catch (error) {
            totalErros++;
            const errorMessage = `Erro ao processar custo ${custo.id} do evento ${evento.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
            erros.push(errorMessage);
            console.error(errorMessage, error);
          }
        }
      } catch (error) {
        const errorMessage = `Erro ao buscar custos do evento ${evento.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
        erros.push(errorMessage);
        console.error(errorMessage, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Normalização de custos concluída',
      estatisticas: {
        totalProcessados,
        totalCriados,
        totalErros,
        totalEventos: eventos.length
      },
      erros: erros.length > 0 ? erros : undefined
    });

  } catch (error) {
    console.error('Erro ao normalizar custos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

