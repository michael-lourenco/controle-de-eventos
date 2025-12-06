import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getSupabaseClient } from '@/lib/supabase/client';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { randomUUID } from 'crypto';

/**
 * API route para inicializar tipos de serviço padrão
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

    // Usar repository factory para obter o repositório correto
    const tipoServicoRepo = repositoryFactory.getTipoServicoRepository();

    // Verificar se já existem tipos de serviço para este usuário
    const existentes = await tipoServicoRepo.findAll(userId);

    if (existentes.length > 0) {
      return NextResponse.json({
        message: 'Tipos de serviço já inicializados',
        tipos: existentes.length
      });
    }

    // Criar tipos padrão usando cliente admin se for Supabase
    if (repositoryFactory.isUsingSupabase()) {
      // Usar cliente admin para contornar RLS
      const supabaseAdmin = getSupabaseClient(true); // true = usar admin

      const defaults = [
        { nome: 'totem fotográfico', descricao: 'Serviço de totem fotográfico', ativo: true },
        { nome: 'instaprint', descricao: 'Serviço de Instaprint', ativo: true },
        { nome: 'outros', descricao: 'Outros serviços', ativo: true }
      ];

      const tiposCriados = [];

      for (const item of defaults) {
        // Gerar ID único usando UUID
        const id = randomUUID();
        
        const { data, error } = await supabaseAdmin
          .from('tipo_servicos')
          .insert({
            id: id,
            nome: item.nome,
            descricao: item.descricao,
            ativo: item.ativo,
            user_id: userId,
            data_cadastro: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          // Se for erro de duplicação, ignorar silenciosamente
          if (error.code === '23505') {
            console.log(`Tipo de serviço "${item.nome}" já existe, ignorando...`);
            tiposCriados.push({ id, nome: item.nome }); // Contar como criado
          } else {
            console.error(`Erro ao criar tipo de serviço "${item.nome}":`, error);
          }
        } else {
          tiposCriados.push(data);
        }
      }

      return NextResponse.json({
        message: 'Tipos de serviço inicializados com sucesso',
        tipos: tiposCriados.length
      });
    } else {
      // Firebase - usar repositório normalmente
      const defaults = [
        { nome: 'totem fotográfico', descricao: 'Serviço de totem fotográfico', ativo: true },
        { nome: 'instaprint', descricao: 'Serviço de Instaprint', ativo: true },
        { nome: 'outros', descricao: 'Outros serviços', ativo: true }
      ];

      for (const item of defaults) {
        await tipoServicoRepo.createTipoServico(item, userId);
      }

      return NextResponse.json({
        message: 'Tipos de serviço inicializados com sucesso',
        tipos: defaults.length
      });
    }
  } catch (error: any) {
    console.error('Erro ao inicializar tipos de serviço:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro ao inicializar tipos de serviço',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

