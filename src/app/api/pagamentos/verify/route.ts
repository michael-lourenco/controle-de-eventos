import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getSupabaseClient } from '@/lib/supabase/client';
import { repositoryFactory } from '@/lib/repositories/repository-factory';

/**
 * API route para verificar se pagamentos estão sendo salvos no Supabase
 * Útil para debug
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');

    const supabaseAdmin = getSupabaseClient(true);

    // Buscar todos os pagamentos do usuário
    let query = supabaseAdmin
      .from('pagamentos')
      .select('*')
      .eq('user_id', userId);

    if (eventoId) {
      query = query.eq('evento_id', eventoId);
    }

    const { data: pagamentos, error } = await query.order('data_cadastro', { ascending: false }).limit(10);

    if (error) {
      return NextResponse.json({
        error: `Erro ao buscar pagamentos: ${error.message}`,
        details: error.toString()
      }, { status: 500 });
    }

    return NextResponse.json({
      totalEncontrado: pagamentos?.length || 0,
      pagamentos: pagamentos || [],
      eventoId: eventoId || 'todos'
    });
  } catch (error: any) {
    console.error('Erro ao verificar pagamentos:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao verificar pagamentos',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}



