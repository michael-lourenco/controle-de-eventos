import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/s3-service';
import { arquivoRepository } from '@/lib/repositories/arquivo-repository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventoId = formData.get('eventoId') as string;

    if (!file || !eventoId) {
      return NextResponse.json({ error: 'Arquivo e eventoId são obrigatórios' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, GIF, PDF, DOC, DOCX, TXT' 
      }, { status: 400 });
    }

    // Validar tamanho do arquivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 10MB' 
      }, { status: 400 });
    }

    // Fazer upload para S3
    const uploadResult = await s3Service.uploadFile(file, session.user.id, eventoId);

    if (!uploadResult.success) {
      return NextResponse.json({ 
        error: uploadResult.error || 'Erro no upload' 
      }, { status: 500 });
    }

    // Salvar metadados no Firestore
    const arquivoData = {
      userId: session.user.id,
      eventoId,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      s3Key: uploadResult.key!,
      url: uploadResult.url!,
      dataUpload: new Date(),
    };

    const arquivo = await arquivoRepository.createArquivo(
      session.user.id,
      eventoId,
      arquivoData
    );

    return NextResponse.json({
      success: true,
      arquivo: {
        id: arquivo.id,
        nome: arquivo.nome,
        tipo: arquivo.tipo,
        tamanho: arquivo.tamanho,
        url: arquivo.url,
        dataUpload: arquivo.dataUpload,
      }
    });

  } catch (error) {
    console.error('Erro no upload:', error);
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
    const arquivoId = searchParams.get('arquivoId');
    const eventoId = searchParams.get('eventoId');

    if (!arquivoId || !eventoId) {
      return NextResponse.json({ 
        error: 'arquivoId e eventoId são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar arquivo no Firestore
    const arquivo = await arquivoRepository.getArquivoById(
      session.user.id,
      eventoId,
      arquivoId
    );

    if (!arquivo) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Deletar do S3
    const deletedFromS3 = await s3Service.deleteFile(arquivo.s3Key);

    // Deletar do Firestore
    await arquivoRepository.deleteArquivo(session.user.id, eventoId, arquivoId);

    return NextResponse.json({ 
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
