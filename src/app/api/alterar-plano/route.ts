import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { UserRepository } from '@/lib/repositories/user-repository';
import { PlanoRepository } from '@/lib/repositories/plano-repository';
import { AssinaturaService } from '@/lib/services/assinatura-service';
import { AssinaturaRepository } from '@/lib/repositories/assinatura-repository';
import { StatusAssinatura } from '@/types/funcionalidades';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization');
    const isDevMode = process.env.NODE_ENV === 'development';

    const session = await getServerSession(authOptions);

    let isAuthorized = false;

    if (session?.user?.role === 'admin') {
      isAuthorized = true;
    } else if (apiKey) {
      const validApiKey = process.env.SEED_API_KEY || 'dev-seed-key-2024';
      if (apiKey === validApiKey || apiKey.includes(validApiKey)) {
        isAuthorized = true;
      }
    } else if (isDevMode) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({
        error: 'Não autorizado. Use autenticação admin, x-api-key header ou modo desenvolvimento'
      }, { status: 401 });
    }

    const body = await request.json();
    const { email, codigoHotmart } = body;

    if (!email || !codigoHotmart) {
      return NextResponse.json({
        error: 'email e codigoHotmart são obrigatórios'
      }, { status: 400 });
    }

    const userRepo = new UserRepository();
    const planoRepo = new PlanoRepository();
    const assinaturaService = new AssinaturaService();
    const assinaturaRepo = new AssinaturaRepository();

    // Buscar usuário pelo email
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return NextResponse.json({
        error: 'Usuário não encontrado com o email fornecido'
      }, { status: 404 });
    }

    // Buscar plano pelo codigoHotmart
    const plano = await planoRepo.findByCodigoHotmart(codigoHotmart);
    if (!plano) {
      return NextResponse.json({
        error: 'Plano não encontrado com o codigoHotmart fornecido'
      }, { status: 404 });
    }

    // Verificar se usuário já tem assinatura (buscar todas para verificar)
    const todasAssinaturas = await assinaturaRepo.findAllByUserId(user.id);
    const assinaturaAtiva = todasAssinaturas.find(a => a.status === 'active' || a.status === 'trial');
    const assinaturaExistente = assinaturaAtiva || (todasAssinaturas.length > 0 ? todasAssinaturas[0] : null);

    let assinatura: any;
    let acao: string;

    if (!assinaturaExistente) {
      // Criar nova assinatura
      assinatura = await assinaturaService.criarAssinaturaUsuario(
        user.id,
        plano.id,
        'active'
      );
      acao = 'criada';
    } else {
      // Atualizar assinatura existente
      const agora = new Date();
      let dataRenovacao: Date | undefined;
      
      if (plano.intervalo === 'mensal') {
        dataRenovacao = new Date(agora);
        dataRenovacao.setMonth(dataRenovacao.getMonth() + 1);
      } else if (plano.intervalo === 'anual') {
        dataRenovacao = new Date(agora);
        dataRenovacao.setFullYear(dataRenovacao.getFullYear() + 1);
      }

      // Adicionar ao histórico
      await assinaturaRepo.addHistorico(assinaturaExistente.id, {
        data: agora,
        acao: `Plano alterado para ${plano.nome}`,
        detalhes: {
          planoAnterior: assinaturaExistente.planoId,
          planoNovo: plano.id,
          codigoHotmart
        }
      });

      // Atualizar assinatura
      assinatura = await assinaturaRepo.update(assinaturaExistente.id, {
        ...assinaturaExistente,
        planoId: plano.id,
        status: 'active' as StatusAssinatura,
        dataInicio: agora,
        dataFim: undefined,
        dataRenovacao,
        funcionalidadesHabilitadas: plano.funcionalidades || [],
        dataAtualizacao: agora
      });

      acao = 'atualizada';
    }

    // Sincronizar plano no usuário
    const userAtualizado = await assinaturaService.sincronizarPlanoUsuario(user.id);

    return NextResponse.json({
      success: true,
      message: `Assinatura ${acao} com sucesso`,
      dados: {
        usuario: {
          id: userAtualizado.id,
          email: userAtualizado.email,
          nome: userAtualizado.nome
        },
        plano: {
          id: plano.id,
          nome: plano.nome,
          codigoHotmart: plano.codigoHotmart
        },
        assinatura: {
          id: assinatura.id,
          status: assinatura.status,
          dataInicio: assinatura.dataInicio,
          dataRenovacao: assinatura.dataRenovacao
        },
        acao
      }
    });

  } catch (error) {
    console.error('Erro ao alterar plano:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

