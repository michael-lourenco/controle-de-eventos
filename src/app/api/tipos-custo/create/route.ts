import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';

/**
 * API route para criar tipos de custo
 * Usa o cliente admin do Supabase para contornar RLS
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { nome, descricao, ativo = true } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Validar permissão para criar tipos personalizados
    const funcionalidadeService = new FuncionalidadeService();
    const temPermissao = await funcionalidadeService.verificarPermissao(userId, 'TIPOS_PERSONALIZADO');
    if (!temPermissao) {
      return NextResponse.json(
        { 
          error: 'Seu plano não permite criar tipos personalizados. Esta funcionalidade está disponível apenas nos planos Profissional e Premium.',
          status: 403
        },
        { status: 403 }
      );
    }

    // Usar repositório (funciona tanto para Firebase quanto Supabase)
    const tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
    const tipoCriado = await tipoCustoRepo.createTipoCusto(
      {
        nome: nome.trim(),
        descricao: descricao?.trim() || '',
        ativo: ativo
      },
      userId
    );

    return NextResponse.json(tipoCriado);
  } catch (error: any) {
    console.error('Erro ao criar tipo de custo:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao criar tipo de custo',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

