import { Evento, ServicoEvento } from '@/types';
import { EventoSupabaseRepository } from '@/lib/repositories/supabase/evento-supabase-repository';
import { ServicoEventoSupabaseRepository } from '@/lib/repositories/supabase/servico-evento-supabase-repository';
import { montarPayloadEventoClonado } from '@/lib/utils/evento-clone';
import { FuncionalidadeService } from '@/lib/services/funcionalidade-service';
import { GoogleCalendarSyncService } from '@/lib/services/google-calendar-sync-service';

export class EventoCloneService {
  constructor(
    private readonly eventoRepo: EventoSupabaseRepository,
    private readonly servicoEventoRepo: ServicoEventoSupabaseRepository,
    private readonly funcionalidadeService: FuncionalidadeService
  ) {}

  async clonar(eventoId: string, userId: string): Promise<Evento> {
    if (!userId) {
      throw new Error('userId é obrigatório para clonar evento');
    }

    const eventoOriginal = await this.eventoRepo.getEventoById(eventoId, userId);
    if (!eventoOriginal) {
      const erro = new Error('Evento não encontrado');
      (erro as { status?: number }).status = 404;
      throw erro;
    }

    const validacao = await this.funcionalidadeService.verificarPodeCriar(userId, 'eventos');
    if (!validacao.pode) {
      const erro = new Error(validacao.motivo || 'Não é possível clonar evento');
      (erro as { status?: number; limite?: number; usado?: number; restante?: number }).status = 403;
      (erro as { limite?: number }).limite = validacao.limite;
      (erro as { usado?: number }).usado = validacao.usado;
      (erro as { restante?: number }).restante = validacao.restante;
      throw erro;
    }

    const payload = montarPayloadEventoClonado(eventoOriginal);
    const eventoClonado = await this.eventoRepo.createEvento(payload, userId);

    await this.copiarServicosDoEvento(userId, eventoOriginal.id, eventoClonado.id);

    if (typeof window === 'undefined' && typeof process !== 'undefined' && process.env) {
      try {
        const eventoCompleto =
          (await this.eventoRepo.getEventoById(eventoClonado.id, userId)) ?? eventoClonado;
        await GoogleCalendarSyncService.syncAfterCreate(eventoCompleto, userId);
      } catch (error) {
        console.error('[EventoCloneService] Falha ao sincronizar clone com Google Calendar:', error);
      }
    }

    return (await this.eventoRepo.getEventoById(eventoClonado.id, userId)) ?? eventoClonado;
  }

  private async copiarServicosDoEvento(
    userId: string,
    eventoOrigemId: string,
    eventoDestinoId: string
  ): Promise<void> {
    const servicos = await this.servicoEventoRepo.findByEventoId(userId, eventoOrigemId);
    const servicosAtivos = servicos.filter((s) => !s.removido && s.tipoServicoId);

    for (const servico of servicosAtivos) {
      try {
        await this.servicoEventoRepo.createServicoEvento(userId, eventoDestinoId, {
          eventoId: eventoDestinoId,
          tipoServicoId: servico.tipoServicoId,
          tipoServico: servico.tipoServico,
          observacoes: servico.observacoes,
          removido: false
        } as Omit<ServicoEvento, 'id' | 'dataCadastro'>);
      } catch (error) {
        console.error(
          `[EventoCloneService] Erro ao copiar serviço ${servico.tipoServicoId} para evento ${eventoDestinoId}:`,
          error
        );
      }
    }
  }
}
