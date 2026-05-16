import { Evento } from '@/types';
import { getDiaSemana } from '@/lib/utils/date-helpers';

export const SUFIXO_TITULO_EVENTO_CLONE = ' (clone)';

/**
 * Monta o título do evento clonado com sufixo "(clone)".
 * Ex.: "Evento da Maria" → "Evento da Maria (clone)"
 */
export function montarTituloEventoClonado(
  nomeEvento?: string | null,
  nomeClienteFallback?: string | null
): string {
  const base = nomeEvento?.trim() || nomeClienteFallback?.trim() || 'Evento';
  return `${base}${SUFIXO_TITULO_EVENTO_CLONE}`;
}

/**
 * Payload para criar um novo evento a partir de um existente (sem pagamentos, custos ou contratos).
 */
export function montarPayloadEventoClonado(
  origem: Evento
): Omit<Evento, 'id' | 'dataCadastro' | 'dataAtualizacao'> {
  const dataEvento =
    origem.dataEvento instanceof Date ? origem.dataEvento : new Date(origem.dataEvento);

  return {
    nomeEvento: montarTituloEventoClonado(origem.nomeEvento, origem.cliente?.nome),
    clienteId: origem.clienteId,
    cliente: origem.cliente,
    dataEvento,
    diaSemana: getDiaSemana(dataEvento),
    local: origem.local,
    endereco: origem.endereco,
    tipoEvento: origem.tipoEvento,
    tipoEventoId: origem.tipoEventoId,
    saida: origem.saida,
    chegadaNoLocal: origem.chegadaNoLocal,
    horarioInicio: origem.horarioInicio,
    horarioDesmontagem: origem.horarioDesmontagem,
    tempoEvento: origem.tempoEvento,
    contratante: origem.contratante,
    numeroConvidados: origem.numeroConvidados,
    quantidadeMesas: origem.quantidadeMesas,
    hashtag: origem.hashtag,
    numeroImpressoes: origem.numeroImpressoes,
    cerimonialista: origem.cerimonialista,
    observacoes: origem.observacoes,
    status: origem.status,
    valorTotal: origem.valorTotal,
    diaFinalPagamento: origem.diaFinalPagamento,
    arquivado: false,
    dataArquivamento: undefined,
    motivoArquivamento: undefined,
    googleCalendarEventId: undefined,
    googleCalendarSyncedAt: undefined
  };
}
