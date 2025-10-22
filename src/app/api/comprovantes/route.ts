import { NextRequest, NextResponse } from 'next/server';
import { anexoPagamentoRepository } from '@/lib/repositories/anexo-pagamento-repository';
import { s3Service } from '@/lib/s3-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');
    const pagamentoId = searchParams.get('pagamentoId');

    if (!eventoId || !pagamentoId) {
      return NextResponse.json({ 
        error: 'eventoId e pagamentoId são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar anexos do pagamento
    const anexos = await anexoPagamentoRepository.getAnexosPorPagamento(
      session.user.id,
      eventoId,
      pagamentoId
    );

    // Gerar URLs assinadas para cada anexo
    const anexosComUrls = await Promise.all(
      anexos.map(async (anexo) => {
        try {
          const signedUrl = await s3Service.getSignedUrl(anexo.s3Key);
          return {
            ...anexo,
            url: signedUrl,
          };
        } catch (error) {
          console.error(`Erro ao gerar URL para anexo ${anexo.id}:`, error);
          return anexo;
        }
      })
    );

    return NextResponse.json({
      success: true,
      anexos: anexosComUrls,
    });

  } catch (error) {
    console.error('Erro ao buscar comprovantes:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');
    const pagamentoId = searchParams.get('pagamentoId');
    const anexoId = searchParams.get('anexoId');

    if (!eventoId || !pagamentoId || !anexoId) {
      return NextResponse.json({ 
        error: 'eventoId, pagamentoId e anexoId são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar anexo para obter s3Key
    const anexo = await anexoPagamentoRepository.getAnexoById(
      session.user.id,
      eventoId,
      pagamentoId,
      anexoId
    );

    if (!anexo) {
      return NextResponse.json({ 
        error: 'Anexo não encontrado' 
      }, { status: 404 });
    }

    // Deletar do S3
    const deletedFromS3 = await s3Service.deleteFile(anexo.s3Key);
    
    if (!deletedFromS3) {
      console.warn(`Falha ao deletar arquivo do S3: ${anexo.s3Key}`);
    }

    // Deletar do Firestore
    await anexoPagamentoRepository.deleteAnexo(
      session.user.id,
      eventoId,
      pagamentoId,
      anexoId
    );

    return NextResponse.json({
      success: true,
      message: 'Anexo deletado com sucesso',
    });

  } catch (error) {
    console.error('Erro ao deletar comprovante:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
