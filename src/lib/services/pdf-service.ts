import { s3Service } from '@/lib/s3-service';
import { Contrato } from '@/types';
import { ContratoService } from './contrato-service';

/** URL base usada na geração do PDF (links, referências no HTML do contrato). */
const PDF_BASE_URL = 'https://controle-de-eventos.vercel.app';

/** Detecta se está em ambiente serverless (Vercel, AWS Lambda). */
function isServerless(): boolean {
  return process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

/** Substitui clicksehub.com por PDF_BASE_URL no HTML do contrato. */
function normalizarUrlsNoHtml(html: string): string {
  return html.replace(
    /https:\/\/clicksehub\.com/gi,
    PDF_BASE_URL
  );
}

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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Erro ao gerar PDF:', error);
      throw new Error(`Erro ao gerar PDF: ${msg}`);
    }
  }

  static async gerarPDF(html: string): Promise<Buffer> {
    if (!html?.trim()) {
      throw new Error('HTML não pode estar vazio');
    }

    const htmlNormalizado = normalizarUrlsNoHtml(html);

    const htmlCompleto = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <base href="${PDF_BASE_URL}/">
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
  ${htmlNormalizado}
</body>
</html>`;

    const useChromium = isServerless();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let puppeteer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let launchOptions: any;

    if (useChromium) {
      // Ambiente serverless: puppeteer-core + @sparticuz/chromium (obrigatório, sem fallback)
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        puppeteer = require('puppeteer-core');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chromium = require('@sparticuz/chromium') as any;

        // Desabilitar WebGL (opcional, pode melhorar estabilidade)
        chromium.setGraphicsMode = false;

        const executablePath = await chromium.executablePath();
        // headless "shell" é exigido pelo @sparticuz/chromium (headless_shell); tipos do Puppeteer não incluem "shell"
        const headless = 'shell' as unknown as boolean | 'new';

        launchOptions = {
          args: puppeteer.defaultArgs({
            args: chromium.args,
            headless
          }),
          defaultViewport: null,
          executablePath,
          headless,
          timeout: 60_000
        };
        console.log('[PDF] Usando @sparticuz/chromium (serverless)');
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('[PDF] Falha ao carregar @sparticuz/chromium:', e);
        throw new Error(
          `Em ambiente serverless (Vercel/Lambda) é necessário @sparticuz/chromium. Não use fallback para Puppeteer. Detalhes: ${msg}`
        );
      }
    } else {
      // Desenvolvimento local: puppeteer com Chrome bundado
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        puppeteer = require('puppeteer');
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Puppeteer não disponível:', e);
        throw new Error(`Puppeteer não está instalado. Execute: npx puppeteer browsers install chrome. Detalhes: ${msg}`);
      }
      launchOptions = {
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
        timeout: 60_000
      };
      console.log('[PDF] Usando Puppeteer (local)');
    }

    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
    try {
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      page.setDefaultTimeout(30_000);

      await page.setContent(htmlCompleto, {
        waitUntil: 'networkidle0',
        timeout: 30_000
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        printBackground: true,
        timeout: 30_000
      });

      await browser.close();
      browser = undefined;

      if (!pdfBuffer?.length) {
        throw new Error('PDF gerado está vazio');
      }
      return Buffer.from(pdfBuffer);
    } catch (e) {
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr) {
          console.error('Erro ao fechar browser:', closeErr);
        }
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Erro ao gerar PDF:', { message: msg, stack: e instanceof Error ? e.stack : undefined });
      throw new Error(`Erro ao gerar PDF: ${msg}`);
    }
  }
}
