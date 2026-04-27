import { GoogleCalendarEvent } from '@/types/google-calendar';

/**
 * Mantém apenas eventos do Google Calendar cujo `id` está associado a um evento
 * salvo no Clicksehub para o mesmo usuário (`google_calendar_event_id` no Supabase).
 */
export function filtrarEventosGoogleCalendarVinculadosAoSistema(
  eventosCalendario: GoogleCalendarEvent[],
  idsGoogleSalvosNoSistema: ReadonlySet<string>
): GoogleCalendarEvent[] {
  return eventosCalendario.filter((evento) => {
    const id = evento.id?.trim();
    return Boolean(id && idsGoogleSalvosNoSistema.has(id));
  });
}
