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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventoId = formData.get('eventoId') as string;
    const pagamentoId = formData.get('pagamentoId') as string;

    if (!file || !eventoId || !pagamentoId) {
      return NextResponse.json({ 
        error: 'Arquivo, eventoId e pagamentoId são obrigatórios' 
      }, { status: 400 });
    }

    // Validar tipo de arquivo para comprovantes
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, PDF, DOC, DOCX, TXT' 
      }, { status: 400 });
    }

    // Validar tamanho do arquivo (5MB máximo para comprovantes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Tamanho máximo: 5MB' 
      }, { status: 400 });
    }

    // Fazer upload para S3
    const uploadResult = await s3Service.uploadFilePagamento(
      file, 
      session.user.id, 
      eventoId, 
      pagamentoId
    );

    if (!uploadResult.success) {
      return NextResponse.json({ 
        error: uploadResult.error || 'Erro no upload' 
      }, { status: 500 });
    }

    // Salvar metadados no Firestore
    const anexoData = {
      userId: session.user.id,
      eventoId,
      pagamentoId,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
      s3Key: uploadResult.key!,
      url: uploadResult.url!,
      dataUpload: new Date(),
    };

    const anexo = await anexoPagamentoRepository.createAnexo(
      session.user.id,
      eventoId,
      pagamentoId,
      anexoData
    );

    return NextResponse.json({
      success: true,
      anexo,
    });

  } catch (error) {
    console.error('Erro no upload de comprovante:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
