import { Evento } from '@/types';

/**
 * Monta o texto padronizado com informações do evento para colar
 * (colaboradores / cerimonialistas).
 */
export function formatEventInfoForCopy(
  evento: Evento,
  servicosNomes: string[] = []
): string {
  const formatDatePtBR = (value: Date | string) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  const getWeekdayPtBR = (value: Date | string) => {
    const d = value instanceof Date ? value : new Date(value);
    return d
      .toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' })
      .toUpperCase();
  };

  const nomeEvento =
    evento.nomeEvento ||
    (evento.tipoEvento
      ? `${evento.tipoEvento}${evento.cliente?.nome ? ` - ${evento.cliente.nome}` : ''}`
      : '') ||
    evento.local ||
    'Evento';

  let text = '';
  text += 'Nome do Evento\n\n';
  text += `${nomeEvento}\n`;
  text += '\n────────────────────────\n\n';

  text += 'Informações do Evento\n\n';
  text += `Data: ${formatDatePtBR(evento.dataEvento)} - ${getWeekdayPtBR(evento.dataEvento)}\n`;
  if (evento.local) text += `Local: ${evento.local}\n`;
  if (evento.endereco) text += `Endereço: ${evento.endereco}\n`;
  if (evento.numeroConvidados) text += `Convidados: ${evento.numeroConvidados}\n`;
  if (evento.tipoEvento) text += `Tipo: ${evento.tipoEvento}\n`;
  text += '\n────────────────────────\n\n';

  text += 'Detalhes do Serviço\n\n';
  if (evento.saida) text += `Saída: ${evento.saida}\n`;
  if (evento.chegadaNoLocal) text += `Chegada no local: ${evento.chegadaNoLocal}\n`;
  if (evento.horarioInicio) text += `Horário de início: ${evento.horarioInicio}\n`;
  if (evento.horarioDesmontagem) text += `Horário de Desmontagem: ${evento.horarioDesmontagem}\n`;
  if (evento.tempoEvento) text += `Duração: ${evento.tempoEvento}\n`;
  if (evento.quantidadeMesas) text += `Mesas: ${evento.quantidadeMesas}\n`;
  if (evento.numeroImpressoes) text += `Impressões: ${evento.numeroImpressoes}\n`;
  if (evento.hashtag) text += `Hashtag: ${evento.hashtag}\n`;
  text += '\n────────────────────────\n\n';

  text += 'Cerimonialista\n\n';
  if (evento.cerimonialista?.nome) text += `Nome: ${evento.cerimonialista.nome}\n`;
  if (evento.cerimonialista?.telefone) text += `Telefone: ${evento.cerimonialista.telefone}\n`;
  text += '\n────────────────────────\n\n';

  text += 'Serviços do Evento\n\n';
  text += servicosNomes.length > 0 ? servicosNomes.join(', ') : '-';
  text += '\n';

  return text;
}

/** Copia texto para a área de transferência (com fallback). */
export async function copiarTextoParaClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback abaixo
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
