import { NextRequest, NextResponse } from 'next/server';
import { arquivoRepository } from '@/lib/repositories/arquivo-repository';
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

    if (!eventoId) {
      return NextResponse.json({ 
        error: 'eventoId é obrigatório' 
      }, { status: 400 });
    }

    // Buscar arquivos do evento
    const arquivos = await arquivoRepository.getArquivosPorEvento(
      session.user.id,
      eventoId
    );

    // Gerar URLs assinadas para cada arquivo
    const arquivosComUrls = await Promise.all(
      arquivos.map(async (arquivo) => {
        try {
          const signedUrl = await s3Service.getSignedUrl(arquivo.s3Key);
          return {
            ...arquivo,
            url: signedUrl,
          };
        } catch (error) {
          console.error(`Erro ao gerar URL para arquivo ${arquivo.id}:`, error);
          return arquivo;
        }
      })
    );

    return NextResponse.json({
      success: true,
      arquivos: arquivosComUrls,
    });

  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
