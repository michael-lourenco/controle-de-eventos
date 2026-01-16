/**
 * Funções helper para manipulação de datas com timezone local
 */

/**
 * Converte uma string de data no formato "yyyy-MM-dd" para um objeto Date
 * no timezone local (não UTC).
 * 
 * Quando você cria `new Date("2025-01-15")`, o JavaScript interpreta como UTC,
 * o que pode resultar em um dia anterior quando convertido para o timezone local.
 * Esta função garante que a data seja criada no timezone local.
 * 
 * @param dateString - String no formato "yyyy-MM-dd"
 * @returns Date no timezone local à meia-noite
 * 
 * @example
 * // Em vez de: new Date("2025-01-15") que pode resultar em 2025-01-14T21:00:00-03:00
 * // Use: parseLocalDate("2025-01-15") que resulta em 2025-01-15T00:00:00-03:00
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    throw new Error('Date string is required');
  }

  // Dividir a string em ano, mês e dia
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error('Date string must be in format "yyyy-MM-dd"');
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexed no JavaScript
  const day = parseInt(parts[2], 10);

  // Criar Date no timezone local
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Converte um objeto Date para string no formato "yyyy-MM-dd" no timezone local
 * 
 * @param date - Objeto Date
 * @returns String no formato "yyyy-MM-dd"
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula o dia da semana de uma data, usando apenas ano, mês e dia
 * para evitar problemas de timezone.
 * 
 * @param date - Objeto Date ou string de data
 * @returns Dia da semana em português (DOMINGO, SEGUNDA, TERÇA, etc.)
 */
export function getDiaSemana(date: Date | string): string {
  const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  
  let dataObj: Date;
  if (typeof date === 'string') {
    dataObj = new Date(date);
  } else {
    dataObj = date;
  }
  
  // Usar getUTCDay() para evitar problemas de timezone
  // ou extrair apenas ano, mês e dia e criar uma nova data
  const year = dataObj.getFullYear();
  const month = dataObj.getMonth();
  const day = dataObj.getDate();
  
  // Criar uma nova data no timezone local usando apenas ano, mês e dia
  // Isso garante que o dia da semana seja calculado corretamente
  const dataLocal = new Date(year, month, day);
  return dias[dataLocal.getDay()];
}

