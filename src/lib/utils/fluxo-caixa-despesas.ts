/**
 * Helpers compartilhados do Fluxo de Caixa (despesas variáveis + fixas).
 */

export type TipoCustoFluxo = 'fixo' | 'variável';

export interface DespesaCategoriaFluxo {
  categoria: string;
  valor: number;
  percentual: number;
  tipoCusto: TipoCustoFluxo;
}

export function chaveDespesaCategoria(tipoCusto: TipoCustoFluxo, categoria: string): string {
  return `${tipoCusto}::${categoria}`;
}

export function agregarDespesaCategoria(
  mapa: Record<string, { categoria: string; tipoCusto: TipoCustoFluxo; valor: number }>,
  tipoCusto: TipoCustoFluxo,
  categoria: string,
  valor: number
): void {
  const key = chaveDespesaCategoria(tipoCusto, categoria);
  if (!mapa[key]) {
    mapa[key] = { categoria, tipoCusto, valor: 0 };
  }
  mapa[key].valor += valor;
}

export function finalizarDespesasPorCategoria(
  mapa: Record<string, { categoria: string; tipoCusto: TipoCustoFluxo; valor: number }>
): DespesaCategoriaFluxo[] {
  const total = Object.values(mapa).reduce((sum, item) => sum + item.valor, 0);
  return Object.values(mapa)
    .map((item) => ({
      categoria: item.categoria,
      valor: item.valor,
      percentual: total > 0 ? (item.valor / total) * 100 : 0,
      tipoCusto: item.tipoCusto,
    }))
    .sort((a, b) => b.valor - a.valor);
}
