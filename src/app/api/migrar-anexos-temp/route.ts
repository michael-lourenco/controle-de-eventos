import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/s3-service';
import { anexoPagamentoRepository } from '@/lib/repositories/anexo-pagamento-repository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { eventoId, pagamentoIdTemp, pagamentoIdReal } = await request.json();

    if (!eventoId || !pagamentoIdTemp || !pagamentoIdReal) {
      return NextResponse.json({ 
        error: 'eventoId, pagamentoIdTemp e pagamentoIdReal são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar anexos da pasta temp
    const anexosTemp = await anexoPagamentoRepository.getAnexosPorPagamento(
      session.user.id,
      eventoId,
      pagamentoIdTemp
    );

    if (anexosTemp.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum anexo encontrado para migrar',
        migrados: 0
      });
    }

    // Migrar cada anexo
    const anexosMigrados = [];
    
    for (const anexo of anexosTemp) {
      try {
        // Criar novo anexo com o ID correto do pagamento
        const novoAnexo = await anexoPagamentoRepository.createAnexo(
          session.user.id,
          eventoId,
          pagamentoIdReal,
          {
            userId: anexo.userId,
            eventoId: anexo.eventoId,
            pagamentoId: pagamentoIdReal,
            nome: anexo.nome,
            tipo: anexo.tipo,
            tamanho: anexo.tamanho,
            s3Key: anexo.s3Key,
            url: anexo.url,
            dataUpload: anexo.dataUpload,
          }
        );

        anexosMigrados.push(novoAnexo);

        // Deletar anexo da pasta temp
        await anexoPagamentoRepository.deleteAnexo(
          session.user.id,
          eventoId,
          pagamentoIdTemp,
          anexo.id
        );

      } catch (error) {
        console.error(`Erro ao migrar anexo ${anexo.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${anexosMigrados.length} anexos migrados com sucesso`,
      migrados: anexosMigrados.length,
      anexos: anexosMigrados
    });

  } catch (error) {
    console.error('Erro na migração de anexos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
