import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'controle-eventos';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileMetadata {
  id: string;
  userId: string;
  eventoId: string;
  nome: string;
  tipo: string;
  tamanho: number;
  s3Key: string;
  url: string;
  dataUpload: Date;
}

export class S3Service {
  private generateS3Key(userId: string, eventoId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `users/${userId}/eventos/${eventoId}/${timestamp}_${sanitizedFileName}`;
  }

  async uploadFile(
    file: File,
    userId: string,
    eventoId: string
  ): Promise<UploadResult> {
    try {
      const s3Key = this.generateS3Key(userId, eventoId, file.name);
      
      // Converter File para ArrayBuffer e depois para Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          userId,
          eventoId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);

      // Gerar URL assinada para acesso ao arquivo
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      });

      const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }); // 7 dias

      return {
        success: true,
        url,
        key: s3Key,
      };
    } catch (error) {
      console.error('Erro ao fazer upload para S3:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async getSignedUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw error;
    }
  }

  async deleteFile(s3Key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Erro ao deletar arquivo do S3:', error);
      return false;
    }
  }

  async uploadMultipleFiles(
    files: File[],
    userId: string,
    eventoId: string
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, userId, eventoId)
    );

    return Promise.all(uploadPromises);
  }
}

export const s3Service = new S3Service();
