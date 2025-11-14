import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { AssinaturaRepository } from '@/lib/repositories/assinatura-repository';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const repo = new AssinaturaRepository();
    
    // Admin pode ver todas, usuário apenas a sua
    if (session.user?.role === 'admin') {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');
      
      if (userId) {
        const assinaturas = await repo.findAllByUserId(userId);
        return NextResponse.json({ assinaturas });
      }
      
      const assinaturas = await repo.findAtivas();
      return NextResponse.json({ assinaturas });
    }

    // Usuário comum vê apenas sua assinatura
    const assinatura = await repo.findByUserId(session.user.id);
    return NextResponse.json({ assinatura });
  } catch (error: any) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar assinaturas' },
      { status: 500 }
    );
  }
}

