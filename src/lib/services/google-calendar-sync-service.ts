/* 
 * COMENTADO: Aguardando permissões diretas da Google para dados sensíveis
 * Este serviço será reativado no futuro após obtenção das permissões necessárias
 * 
 * Data de comentário: 2025-01-XX
 */

/**
 * Serviço de sincronização com Google Calendar
 * 
 * Este serviço é chamado após operações de eventos para sincronizar com Google Calendar.
 * Usa importação dinâmica para evitar bundle no cliente.
 * 
 * TODO: Reativar quando tivermos permissões diretas da Google
 */

import { Evento } from '@/types';
import { GoogleCalendarEvent } from '@/types/google-calendar';

const HORARIO_PADRAO_MEIO_DIA = '12:00';

const URL_BASE_CLICKSEHUB_PROD = 'https://clicksehub.com';

/** URL pública do evento no app (usa env em dev, produção clicksehub.com). */
function obterUrlEventoNoSistema(eventoId: string): string {
  const base =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : '') || URL_BASE_CLICKSEHUB_PROD;
  return `${base}/eventos/${eventoId}`;
}

/**
 * Texto exibido na descrição do evento no Google Calendar.
 * Dados vêm do `Evento` salvo (incl. cliente quando preenchido no payload).
 */
function montarDescricaoGoogleCalendar(evento: Evento): string {
  const c = evento.cliente;
  const nomeCliente = c?.nome?.trim();
  const emailCliente = c?.email?.trim();
  const telefoneCliente = c?.telefone?.trim();

  const linhas: string[] = [
    'Evento sincronizado pelo Clicksehub.',
    '',
    ...(nomeCliente ? [`Cliente: ${nomeCliente}`] : []),
    `E-mail: ${emailCliente || 'Não informado'}`
  ];

  if (telefoneCliente) {
    linhas.push(`Telefone: ${telefoneCliente}`);
  }

  linhas.push(`Status: ${evento.status}`);
  linhas.push('');
  linhas.push('Abrir no Clicksehub:');
  linhas.push(obterUrlEventoNoSistema(evento.id));

  return linhas.join('\n');
}

/** Se não houver horário válido (HH:mm), usa 12:00. */
function horarioOuMeioDia(horario?: string | null): string {
  if (horario && typeof horario === 'string') {
    const t = horario.trim();
    if (t && t.includes(':')) {
      return t;
    }
  }
  return HORARIO_PADRAO_MEIO_DIA;
}

function combinarDataHora(dataBase: Date | string, horario?: string): Date {
  const data = dataBase instanceof Date ? new Date(dataBase) : new Date(dataBase);
  if (Number.isNaN(data.getTime())) {
    return new Date();
  }

  let horas = 0;
  let minutos = 0;
  if (horario && horario.includes(':')) {
    const [h, m] = horario.split(':').map(Number);
    horas = Number.isFinite(h) ? h : 0;
    minutos = Number.isFinite(m) ? m : 0;
  }

  data.setHours(horas, minutos, 0, 0);
  return data;
}

function montarPayloadMinimo(evento: Evento): GoogleCalendarEvent {
  const inicio = combinarDataHora(evento.dataEvento, horarioOuMeioDia(evento.horarioInicio));
  let fim = combinarDataHora(
    evento.dataEvento,
    horarioOuMeioDia(evento.horarioDesmontagem)
  );

  // Garante fim > inicio (incluindo empate) para evitar rejeição do Google.
  if (fim.getTime() <= inicio.getTime()) {
    fim = new Date(inicio.getTime() + 60 * 60 * 1000);
  }

  const titulo =
    evento.nomeEvento?.trim() ||
    evento.tipoEvento?.trim() ||
    evento.cliente?.nome?.trim() ||
    'Evento';

  return {
    summary: titulo,
    description: montarDescricaoGoogleCalendar(evento),
    start: {
      dateTime: inicio.toISOString(),
      timeZone: 'America/Sao_Paulo'
    },
    end: {
      dateTime: fim.toISOString(),
      timeZone: 'America/Sao_Paulo'
    }
  };
}

export class GoogleCalendarSyncService {
  /**
   * Sincroniza evento com Google Calendar após criação
   * COMENTADO: Aguardando permissões diretas da Google
   */
  static async syncAfterCreate(evento: Evento, userId: string): Promise<void> {
    try {
      // Importação dinâmica para evitar bundle no cliente
      const { GoogleCalendarService } = await import('./google-calendar-service');
      const { repositoryFactory } = await import('../repositories/repository-factory');
      const { AdminGoogleCalendarTokenRepository } = await import('../repositories/admin-google-calendar-token-repository');
      const { verificarAcessoGoogleCalendar } = await import('../utils/google-calendar-auth');
      
      // Verificar se usuário tem acesso
      const temAcesso = await verificarAcessoGoogleCalendar(userId);
      if (!temAcesso) {
        return;
      }

      // Verificar se usuário tem token e sincronização ativa
      const tokenRepo = new AdminGoogleCalendarTokenRepository();
      const token = await tokenRepo.findByUserId(userId);
      
      if (!token || !token.syncEnabled) {
        return;
      }

      // Não sincronizar eventos arquivados
      if (evento.arquivado) {
        return;
      }

      const eventoRepo = repositoryFactory.getEventoRepository();
      // Após create, o repositório pode retornar sem join do cliente; buscar registro completo.
      const eventoParaSync = (await eventoRepo.getEventoById(evento.id, userId)) ?? evento;

      const googleService = new GoogleCalendarService(eventoRepo);
      const payloadMinimo = montarPayloadMinimo(eventoParaSync);
      const googleEventId = await googleService.createEventDirectly(userId, payloadMinimo);
      
      // Atualizar evento com googleCalendarEventId usando o repository
      await eventoRepo.update(evento.id, {
        googleCalendarEventId: googleEventId,
        googleCalendarSyncedAt: new Date()
      });
      
      console.log('[GoogleCalendarSyncService] Evento criado no Google Calendar:', googleEventId);
    } catch (error) {
      console.error('[GoogleCalendarSyncService] Erro ao sincronizar evento criado:', error);
    }
  }

  /**
   * Sincroniza evento com Google Calendar após atualização
   * COMENTADO: Aguardando permissões diretas da Google
   */
  static async syncAfterUpdate(
    evento: Evento, 
    userId: string, 
    eventoAntigo?: Evento | null
  ): Promise<void> {
    try {
      // Importação dinâmica para evitar bundle no cliente
      const { GoogleCalendarService } = await import('./google-calendar-service');
      const { repositoryFactory } = await import('../repositories/repository-factory');
      const { AdminGoogleCalendarTokenRepository } = await import('../repositories/admin-google-calendar-token-repository');
      const { verificarAcessoGoogleCalendar } = await import('../utils/google-calendar-auth');
      
      // Verificar se usuário tem acesso
      const temAcesso = await verificarAcessoGoogleCalendar(userId);
      if (!temAcesso) {
        return;
      }

      // Verificar se usuário tem token e sincronização ativa
      const tokenRepo = new AdminGoogleCalendarTokenRepository();
      const token = await tokenRepo.findByUserId(userId);
      
      if (!token || !token.syncEnabled) {
        return;
      }

      const eventoRepo = repositoryFactory.getEventoRepository();
      const eventoSync = (await eventoRepo.getEventoById(evento.id, userId)) ?? evento;

      const googleService = new GoogleCalendarService(eventoRepo);

      // Se evento foi arquivado, remover do Google Calendar
      if (evento.arquivado) {
        if (eventoAntigo && !eventoAntigo.arquivado && evento.googleCalendarEventId) {
          await googleService.deleteEvent(userId, evento.googleCalendarEventId);
          await eventoRepo.update(evento.id, {
            googleCalendarEventId: undefined,
            googleCalendarSyncedAt: new Date()
          });
          console.log('[GoogleCalendarSyncService] Evento removido do Google Calendar');
        }
        return;
      }

      // Se evento foi desarquivado, criar no Google Calendar
      if (eventoAntigo && eventoAntigo.arquivado && !evento.arquivado) {
        const payloadMinimo = montarPayloadMinimo(eventoSync);
        const googleEventId = await googleService.createEventDirectly(userId, payloadMinimo);
        await eventoRepo.update(evento.id, {
          googleCalendarEventId: googleEventId,
          googleCalendarSyncedAt: new Date()
        });
        console.log('[GoogleCalendarSyncService] Evento desarquivado e criado no Google Calendar');
        return;
      }

      // Atualizar ou criar evento no Google Calendar
      if (evento.googleCalendarEventId) {
        const payloadMinimo = montarPayloadMinimo(eventoSync);
        await googleService.updateEventDirectly(userId, evento.googleCalendarEventId, payloadMinimo);
        await eventoRepo.update(evento.id, {
          googleCalendarSyncedAt: new Date()
        });
        console.log('[GoogleCalendarSyncService] Evento atualizado no Google Calendar');
      } else {
        const payloadMinimo = montarPayloadMinimo(eventoSync);
        const googleEventId = await googleService.createEventDirectly(userId, payloadMinimo);
        await eventoRepo.update(evento.id, {
          googleCalendarEventId: googleEventId,
          googleCalendarSyncedAt: new Date()
        });
        console.log('[GoogleCalendarSyncService] Evento criado no Google Calendar');
      }
    } catch (error) {
      console.error('[GoogleCalendarSyncService] Erro ao sincronizar evento atualizado:', error);
    }
  }

  /**
   * Remove evento do Google Calendar após arquivamento
   * COMENTADO: Aguardando permissões diretas da Google
   */
  static async syncAfterDelete(evento: Evento, userId: string): Promise<void> {
    try {
      // Importação dinâmica para evitar bundle no cliente
      const { GoogleCalendarService } = await import('./google-calendar-service');
      const { repositoryFactory } = await import('../repositories/repository-factory');
      const { AdminGoogleCalendarTokenRepository } = await import('../repositories/admin-google-calendar-token-repository');
      const { verificarAcessoGoogleCalendar } = await import('../utils/google-calendar-auth');
      
      // Verificar se usuário tem acesso
      const temAcesso = await verificarAcessoGoogleCalendar(userId);
      if (!temAcesso) {
        return;
      }

      // Verificar se usuário tem token e sincronização ativa
      const tokenRepo = new AdminGoogleCalendarTokenRepository();
      const token = await tokenRepo.findByUserId(userId);
      
      if (!token || !token.syncEnabled) {
        return;
      }

      // Remover evento do Google Calendar se tiver googleCalendarEventId
      if (evento.googleCalendarEventId) {
        const googleService = new GoogleCalendarService(repositoryFactory.getEventoRepository());
        await googleService.deleteEvent(userId, evento.googleCalendarEventId);
        console.log('[GoogleCalendarSyncService] Evento removido do Google Calendar');
      }
    } catch (error) {
      console.error('[GoogleCalendarSyncService] Erro ao remover evento do Google Calendar:', error);
    }
  }
}
