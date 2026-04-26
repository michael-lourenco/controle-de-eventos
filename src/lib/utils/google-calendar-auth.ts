/**
 * Utilitário para verificar acesso ao Google Calendar baseado no plano do usuário
 * 
 * Esta função é segura e não quebra o sistema se o Google Calendar não estiver configurado.
 */

import { repositoryFactory } from '../repositories/repository-factory';

const CHAVES_PLANO_PERMITIDAS = ['PROFISSIONAL', 'PREMIUM'];
const STATUS_PERMITIDOS = ['ATIVA', 'TRIAL', 'ACTIVE'];

function normalizarCodigoPlano(codigo?: string): string {
  return (codigo || '').trim().toUpperCase();
}

function planoPermitido(codigo?: string): boolean {
  const codigoNormalizado = normalizarCodigoPlano(codigo);
  if (!codigoNormalizado) return false;

  return CHAVES_PLANO_PERMITIDAS.some(chavePermitida =>
    codigoNormalizado === chavePermitida ||
    codigoNormalizado.startsWith(`${chavePermitida}_`) ||
    codigoNormalizado.includes(chavePermitida)
  );
}

/**
 * Verifica se o usuário tem plano permitido para usar Google Calendar
 * Apenas PROFISSIONAL_MENSAL e PREMIUM_MENSAL têm acesso
 * 
 * @param userId - ID do usuário
 * @returns Promise<boolean> - true se o usuário tem acesso, false caso contrário
 */
export async function verificarAcessoGoogleCalendar(userId: string): Promise<boolean> {
  try {
    const userRepo = repositoryFactory.getUserRepository();
    const user = await userRepo.findById(userId);
    
    // Admin sempre tem acesso
    if (user?.role === 'admin') {
      return true;
    }

    const assinatura = user?.assinatura;
    if (!assinatura) {
      return false;
    }

    // Requer assinatura ativa/trial
    const statusNormalizado = (assinatura.status || '').toUpperCase();
    if (!statusNormalizado || !STATUS_PERMITIDOS.includes(statusNormalizado)) {
      return false;
    }

    // 1) Tenta pelo código em cache no usuário
    if (planoPermitido(assinatura.planoCodigoHotmart)) {
      return true;
    }

    // 2) Fallback por nome do plano (cenários legados/migração)
    const nomePlano = (assinatura.planoNome || '').toUpperCase();
    if (nomePlano.includes('PREMIUM') || nomePlano.includes('PROFISSIONAL')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar acesso Google Calendar:', error);
    // Em caso de erro, retornar false para ser seguro
    return false;
  }
}

