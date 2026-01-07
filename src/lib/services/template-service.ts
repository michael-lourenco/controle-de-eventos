export class TemplateService {
  /**
   * Formata uma data no formato "DD de mês de YYYY" (ex: "06 de janeiro de 2026")
   */
  private static formatarDataExtenso(data: string | Date | unknown): string {
    if (!data) return '';
    
    let dataObj: Date;
    
    if (data instanceof Date) {
      dataObj = data;
    } else if (typeof data === 'string') {
      // Verificar se está no formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        dataObj = new Date(data + 'T00:00:00');
      } else {
        // Tentar parsear como data
        dataObj = new Date(data);
      }
    } else {
      return String(data);
    }
    
    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      return String(data);
    }
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const dia = dataObj.getDate();
    const mes = meses[dataObj.getMonth()];
    const ano = dataObj.getFullYear();
    
    return `${dia} de ${mes} de ${ano}`;
  }

  static processarPlaceholders(template: string, dados: Record<string, unknown>): string {
    let resultado = template;
    
    // Processar condicionais {{#if variavel}}...{{/if}} de forma recursiva
    // Processa as condicionais mais internas primeiro
    resultado = this.processarCondicionaisRecursivo(resultado, dados);
    
    // Processar placeholders simples {{variavel}}
    Object.keys(dados).forEach(chave => {
      const valor = dados[chave];
      let valorString: string;
      
      // Formatar automaticamente campos de data para formato extenso
      if (chave === 'data_evento' || chave === 'data_contrato') {
        valorString = this.formatarDataExtenso(valor);
        console.log(`TemplateService: ${chave} formatado de "${valor}" para "${valorString}"`);
      } else {
        valorString = valor !== undefined && valor !== null ? String(valor) : '';
      }
      
      const placeholder = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      resultado = resultado.replace(placeholder, valorString);
    });

    return resultado;
  }

  private static processarCondicionaisRecursivo(template: string, dados: Record<string, unknown>): string {
    let resultado = template;
    const maxIterations = 50; // Prevenir loops infinitos
    let iterations = 0;
    
    // Processar repetidamente até não haver mais condicionais
    while (resultado.includes('{{#if') && iterations < maxIterations) {
      iterations++;
      
      // Encontrar a primeira condicional e seu fechamento correspondente
      const ifStartIndex = resultado.indexOf('{{#if');
      if (ifStartIndex === -1) break;
      
      // Extrair o nome da variável
      const matchStart = resultado.substring(ifStartIndex).match(/^\{\{#if\s+(\w+)\}\}/);
      if (!matchStart) break;
      
      const variavel = matchStart[1];
      const startTagLength = matchStart[0].length;
      const conteudoStart = ifStartIndex + startTagLength;
      
      // Encontrar o {{/if}} correspondente usando contagem de níveis
      let depth = 1;
      let pos = conteudoStart;
      
      while (depth > 0 && pos < resultado.length) {
        const nextIfIndex = resultado.indexOf('{{#if', pos);
        const nextEndIfIndex = resultado.indexOf('{{/if}}', pos);
        
        if (nextEndIfIndex === -1) break; // Não encontrou fechamento
        
        if (nextIfIndex !== -1 && nextIfIndex < nextEndIfIndex) {
          // Encontrou outra condicional aninhada
          depth++;
          pos = nextIfIndex + 5;
        } else {
          // Encontrou fechamento
          depth--;
          if (depth === 0) {
            // Processar esta condicional
            const conteudo = resultado.substring(conteudoStart, nextEndIfIndex);
            const valor = dados[variavel];
            // Verifica se a variável é truthy (não é undefined, null, '', false, 0)
            const isTruthy = valor !== undefined && valor !== null && 
                            (typeof valor === 'string' ? valor !== '' : true) && 
                            valor !== false && valor !== 0;
            
            if (isTruthy) {
              // Mantém o conteúdo (removendo apenas as tags)
              resultado = resultado.substring(0, ifStartIndex) + conteudo + resultado.substring(nextEndIfIndex + 7);
            } else {
              // Remove o bloco completo
              resultado = resultado.substring(0, ifStartIndex) + resultado.substring(nextEndIfIndex + 7);
            }
            break;
          }
          pos = nextEndIfIndex + 7;
        }
      }
      
      // Se não encontrou fechamento, parar
      if (depth > 0) break;
    }
    
    return resultado;
  }

  static extrairPlaceholders(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map(m => m.replace(/\{\{|\}\}/g, ''));
  }

  static validarPlaceholders(template: string, campos: { chave: string }[]): boolean {
    const placeholders = this.extrairPlaceholders(template);
    const chavesCampos = new Set(campos.map(c => c.chave));
    
    return placeholders.every(p => chavesCampos.has(p));
  }
}

