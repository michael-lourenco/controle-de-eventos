import { SubcollectionRepository } from './subcollection-repository';
import { Evento } from '@/types';
import { where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { COLLECTIONS } from '../firestore/collections';

export class EventoRepository extends SubcollectionRepository<Evento> {
  constructor() {
    super(COLLECTIONS.USERS, COLLECTIONS.EVENTOS);
  }

  // Métodos específicos para eventos (agora sem userId pois é parte do path)
  async findByClienteId(clienteId: string, userId: string): Promise<Evento[]> {
    return this.findWhere('clienteId', '==', clienteId, userId);
  }

  async findByStatus(status: string, userId: string): Promise<Evento[]> {
    return this.findWhere('status', '==', status, userId);
  }

  async findByTipoEvento(tipoEvento: string, userId: string): Promise<Evento[]> {
    return this.findWhere('tipoEvento', '==', tipoEvento, userId);
  }

  async findByDataEvento(dataInicio: Date, dataFim: Date, userId: string): Promise<Evento[]> {
    return this.query([
      where('dataEvento', '>=', dataInicio),
      where('dataEvento', '<=', dataFim),
      orderBy('dataEvento', 'asc')
    ], userId);
  }

  async getEventosHoje(userId: string): Promise<Evento[]> {
    const hoje = new Date();
    const offset = hoje.getTimezoneOffset();
    hoje.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);
    
    // Ajustar para o fuso horário local
    const hojeLocal = new Date(hoje.getTime() - offset * 60000);
    const fimDoDiaLocal = new Date(fimDoDia.getTime() - offset * 60000);
    
    return this.findByDataEvento(hojeLocal, fimDoDiaLocal, userId);
  }

  async getProximosEventos(userId: string, limit: number = 10): Promise<Evento[]> {
    const hoje = new Date();
    const eventos = await this.query([
      where('dataEvento', '>=', hoje),
      orderBy('dataEvento', 'asc'),
      firestoreLimit(limit * 2) // Buscar mais para compensar filtro
    ], userId);
    // Filtrar apenas eventos não arquivados
    return eventos.filter(e => !e.arquivado).slice(0, limit);
  }

  async getEventosPorMes(mes: number, ano: number, userId: string): Promise<Evento[]> {
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);
    
    return this.findByDataEvento(inicioMes, fimMes, userId);
  }

  async searchByLocal(local: string, userId: string): Promise<Evento[]> {
    // Busca simples por local - em produção seria melhor usar Algolia
    const allEventos = await this.findAll(userId);
    return allEventos.filter(evento => 
      evento.local.toLowerCase().includes(local.toLowerCase()) ||
      evento.endereco.toLowerCase().includes(local.toLowerCase())
    );
  }

  async getEventosPorPeriodo(inicio: Date, fim: Date, userId: string): Promise<Evento[]> {
    return this.findByDataEvento(inicio, fim, userId);
  }

  // Métodos de conveniência que mantêm a interface original
  async createEvento(evento: Omit<Evento, 'id' | 'dataCadastro' | 'dataAtualizacao'>, userId: string): Promise<Evento> {
    const eventoWithMeta = {
      ...evento,
      dataCadastro: new Date(),
      dataAtualizacao: new Date()
    } as Omit<Evento, 'id'>;
    
    const eventoCriado = await this.create(eventoWithMeta, userId);
    
    // Sincronizar com Google Calendar (não bloquear se falhar)
    this.syncToGoogleCalendar(eventoCriado, userId, 'create').catch(error => {
      console.error('[EventoRepository] Erro ao sincronizar evento criado com Google Calendar:', error);
    });
    
    return eventoCriado;
  }

  async updateEvento(id: string, evento: Partial<Evento>, userId: string): Promise<Evento> {
    // Buscar evento antigo para comparação
    const eventoAntigo = await this.findById(id, userId);
    
    const eventoWithMeta = {
      ...evento,
      dataAtualizacao: new Date()
    };
    
    const eventoAtualizado = await this.update(id, eventoWithMeta, userId);
    
    // Sincronizar com Google Calendar (não bloquear se falhar)
    this.syncToGoogleCalendar(eventoAtualizado, userId, 'update', eventoAntigo).catch(error => {
      console.error('[EventoRepository] Erro ao sincronizar evento atualizado com Google Calendar:', error);
    });
    
    return eventoAtualizado;
  }

  async deleteEvento(id: string, userId: string): Promise<void> {
    // Buscar evento antes de arquivar para sincronização
    const evento = await this.findById(id, userId);
    
    // Arquivamento ao invés de exclusão física
    await this.update(id, {
      arquivado: true,
      dataArquivamento: new Date()
    }, userId);
    
    // Sincronizar com Google Calendar (remover do Google se arquivado)
    if (evento) {
      const eventoArquivado = { ...evento, arquivado: true };
      this.syncToGoogleCalendar(eventoArquivado, userId, 'delete', evento).catch(error => {
        console.error('[EventoRepository] Erro ao sincronizar evento arquivado com Google Calendar:', error);
      });
    }
  }

  /**
   * Sincroniza evento com Google Calendar
   * Não bloqueia a operação principal se falhar
   * Usa importação dinâmica para evitar bundle no cliente
   */
  private async syncToGoogleCalendar(
    evento: Evento,
    userId: string,
    operation: 'create' | 'update' | 'delete',
    eventoAntigo?: Evento | null
  ): Promise<void> {
    try {
      console.log(`[EventoRepository] Iniciando sincronização Google Calendar - Operação: ${operation}, Evento ID: ${evento.id}`);
      
      // Importação dinâmica para evitar bundle no cliente
      const { GoogleCalendarService } = await import('../services/google-calendar-service');
      const { repositoryFactory } = await import('./repository-factory');
      const { verificarAcessoGoogleCalendar } = await import('../utils/google-calendar-auth');
      
      // Verificar se usuário tem acesso
      const temAcesso = await verificarAcessoGoogleCalendar(userId);
      if (!temAcesso) {
        console.log('[EventoRepository] Usuário não tem acesso ao Google Calendar');
        return; // Silenciosamente retorna se não tem acesso
      }

      // Verificar se usuário tem token e sincronização ativa
      const tokenRepo = repositoryFactory.getGoogleCalendarTokenRepository();
      const token = await tokenRepo.findByUserId(userId);
      
      if (!token) {
        console.log('[EventoRepository] Token não encontrado para usuário:', userId);
        return; // Silenciosamente retorna se não está conectado
      }
      
      if (!token.syncEnabled) {
        console.log('[EventoRepository] Sincronização desativada para usuário:', userId);
        return; // Silenciosamente retorna se sincronização desativada
      }
      
      console.log('[EventoRepository] Token encontrado e sincronização ativa');

      const googleService = new GoogleCalendarService();

      // Se evento foi arquivado, remover do Google Calendar
      if (evento.arquivado) {
        if (operation === 'update' && eventoAntigo && !eventoAntigo.arquivado && evento.googleCalendarEventId) {
          await googleService.deleteEvent(userId, evento.googleCalendarEventId);
          // Atualizar evento para remover googleCalendarEventId
          await this.update(evento.id, {
            googleCalendarEventId: undefined,
            googleCalendarSyncedAt: new Date()
          }, userId);
        }
        return;
      }

      // Sincronizar baseado na operação
      switch (operation) {
        case 'create':
          // Criar evento no Google Calendar
          const googleEventId = await googleService.syncEventToCalendar(userId, evento);
          // Atualizar evento com googleCalendarEventId
          await this.update(evento.id, {
            googleCalendarEventId: googleEventId,
            googleCalendarSyncedAt: new Date()
          }, userId);
          console.log('[EventoRepository] Evento sincronizado com Google Calendar:', googleEventId);
          break;

        case 'update':
          if (evento.googleCalendarEventId) {
            // Atualizar evento existente no Google Calendar
            await googleService.updateEvent(userId, evento.googleCalendarEventId, evento);
            // Atualizar timestamp de sincronização
            await this.update(evento.id, {
              googleCalendarSyncedAt: new Date()
            }, userId);
            console.log('[EventoRepository] Evento atualizado no Google Calendar:', evento.googleCalendarEventId);
          } else {
            // Criar evento no Google Calendar se não existe
            const novoGoogleEventId = await googleService.syncEventToCalendar(userId, evento);
            await this.update(evento.id, {
              googleCalendarEventId: novoGoogleEventId,
              googleCalendarSyncedAt: new Date()
            }, userId);
            console.log('[EventoRepository] Evento criado no Google Calendar:', novoGoogleEventId);
          }
          break;

        case 'delete':
          // Remover evento do Google Calendar
          if (evento.googleCalendarEventId) {
            await googleService.deleteEvent(userId, evento.googleCalendarEventId);
            console.log('[EventoRepository] Evento removido do Google Calendar:', evento.googleCalendarEventId);
          }
          break;
      }
    } catch (error) {
      // Log do erro mas não falhar a operação principal
      console.error('[EventoRepository] Erro ao sincronizar evento com Google Calendar:', error);
    }
  }
  
  async desarquivarEvento(id: string, userId: string): Promise<void> {
    const evento = await this.findById(id, userId);
    
    await this.update(id, {
      arquivado: false,
      dataArquivamento: undefined,
      motivoArquivamento: undefined
    }, userId);
    
    // Se evento foi desarquivado, sincronizar com Google Calendar
    if (evento) {
      const eventoDesarquivado = { ...evento, arquivado: false };
      this.syncToGoogleCalendar(eventoDesarquivado, userId, 'create', evento).catch(error => {
        console.error('[EventoRepository] Erro ao sincronizar evento desarquivado com Google Calendar:', error);
      });
    }
  }
  
  async getArquivados(userId: string): Promise<Evento[]> {
    return this.findWhere('arquivado', '==', true, userId);
  }
  
  async getAtivos(userId: string): Promise<Evento[]> {
    // Buscar eventos não arquivados (arquivado !== true ou arquivado é undefined/null)
    const todos = await this.findAll(userId);
    return todos.filter(e => !e.arquivado);
  }

  async getEventoById(id: string, userId: string): Promise<Evento | null> {
    return this.findById(id, userId);
  }
}
