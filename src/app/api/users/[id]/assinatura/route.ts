import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { AssinaturaService } from '@/lib/services/assinatura-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);

    // Verificar se usuário está autenticado
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se usuário pode acessar (próprio usuário ou admin)
    if (session.user?.id !== userId && session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const assinaturaService = new AssinaturaService();
    const statusPlano = await assinaturaService.obterStatusPlanoUsuario(userId);

    return NextResponse.json({
      success: true,
      statusPlano
    });
  } catch (error: any) {
    console.error('Erro ao obter assinatura:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter assinatura' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);

    // Verificar se usuário está autenticado e é admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { assinaturaId } = await request.json();

    if (!assinaturaId) {
      return NextResponse.json(
        { error: 'assinaturaId é obrigatório' },
        { status: 400 }
      );
    }

    const assinaturaService = new AssinaturaService();
    const user = await assinaturaService.atualizarAssinaturaUsuario(userId, assinaturaId);

    return NextResponse.json({
      success: true,
      message: 'Assinatura atualizada com sucesso',
      user
    });
  } catch (error: any) {
    console.error('Erro ao atualizar assinatura:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar assinatura' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);

    // Verificar se usuário está autenticado e é admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { sincronizar } = await request.json();

    const assinaturaService = new AssinaturaService();
    
    if (sincronizar) {
      // Forçar sincronização
      const user = await assinaturaService.sincronizarPlanoUsuario(userId);
      const statusPlano = await assinaturaService.obterStatusPlanoUsuario(userId);

      return NextResponse.json({
        success: true,
        message: 'Plano sincronizado com sucesso',
        user,
        statusPlano
      });
    }

    // Obter status atual
    const statusPlano = await assinaturaService.obterStatusPlanoUsuario(userId);

    return NextResponse.json({
      success: true,
      statusPlano
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar plano:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar plano' },
      { status: 500 }
    );
  }
}

