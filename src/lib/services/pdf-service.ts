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

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlCompleto, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });
    
    await browser.close();
    
    return Buffer.from(pdfBuffer);
  }
}

