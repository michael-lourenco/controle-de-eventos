import { s3Service } from '@/lib/s3-service';
import { Contrato } from '@/types';
import { ContratoService } from './contrato-service';

export class PDFService {
  static async gerarPDFContrato(contrato: Contrato, html: string): Promise<{ url: string; path: string }> {
    try {
      const pdfBuffer = await this.gerarPDF(html);
      const fileName = `contratos/${contrato.userId}/${contrato.id}.pdf`;
      
      const uploadResult = await s3Service.uploadBuffer(pdfBuffer, fileName, 'application/pdf');
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error('Erro ao fazer upload do PDF');
      }

      return {
        url: uploadResult.url,
        path: fileName
      };
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error(`Erro ao gerar PDF: ${error.message}`);
    }
  }

  static async gerarPDF(html: string): Promise<Buffer> {
    if (!html || !html.trim()) {
      throw new Error('HTML não pode estar vazio');
    }

    // Verificar se Puppeteer está disponível
    let puppeteer;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      puppeteer = require('puppeteer');
    } catch (error: any) {
      console.error('Puppeteer não está disponível:', error);
      throw new Error('Puppeteer não está instalado ou não está disponível no ambiente');
    }

    const htmlCompleto = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    p {
      margin: 10px 0;
    }
    strong {
      color: #2c3e50;
    }
    .signature {
      margin-top: 50px;
      border-top: 1px solid #ccc;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    let browser;
    try {
      // Configurações otimizadas para ambientes serverless (Vercel, etc)
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        timeout: 30000 // 30 segundos de timeout
      });
      
      const page = await browser.newPage();
      
      // Configurar timeout para operações da página
      page.setDefaultTimeout(30000);
      
      await page.setContent(htmlCompleto, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        timeout: 30000
      });
      
      await browser.close();
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF gerado está vazio');
      }
      
      return Buffer.from(pdfBuffer);
    } catch (error: any) {
      // Garantir que o browser seja fechado mesmo em caso de erro
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Erro ao fechar browser:', closeError);
        }
      }
      
      console.error('Erro detalhado ao gerar PDF:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      throw new Error(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
    }
  }
}

