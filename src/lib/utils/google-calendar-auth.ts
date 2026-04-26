/**
 * Verifica se o usuário tem plano permitido para usar Google Calendar
 * TEMPORÁRIO: validação de plano desabilitada para destravar autenticação/sincronização.
 * 
 * @param userId - ID do usuário
 * @returns Promise<boolean> - sempre true enquanto este bypass estiver ativo
 */
export async function verificarAcessoGoogleCalendar(userId: string): Promise<boolean> {
  void userId;
  return true;
}

