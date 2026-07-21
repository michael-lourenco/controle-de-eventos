'use client';

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateRangeFilter, {
  DateFilter,
  criarDateFilterPeriodoRapido,
} from '@/components/filters/DateRangeFilter';
import SelectWithSearch from '@/components/ui/SelectWithSearch';
import { TipoCustoFixo } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface CustosFixosFiltrosState {
  busca: string;
  tipoId: string; // '' = todos
  periodo: DateFilter | null;
}

interface CustosFixosFiltrosProps {
  tipos: TipoCustoFixo[];
  value: CustosFixosFiltrosState;
  onChange: (next: CustosFixosFiltrosState) => void;
  resultadoCount: number;
  totalCount: number;
}

/** Estado padrão: mês atual, sem busca/tipo. */
export function criarFiltrosPadrao(): CustosFixosFiltrosState {
  return {
    busca: '',
    tipoId: '',
    periodo: criarDateFilterPeriodoRapido('thisMonth'),
  };
}

export function isPeriodoMesAtual(periodo: DateFilter | null): boolean {
  return periodo?.type === 'quick' && periodo.quickFilter === 'thisMonth';
}

/** True se há algo diferente do padrão (mês atual, sem busca/tipo). */
export function temFiltrosAtivos(f: CustosFixosFiltrosState): boolean {
  return Boolean(f.busca.trim() || f.tipoId || !isPeriodoMesAtual(f.periodo));
}

export default function CustosFixosFiltros({
  tipos,
  value,
  onChange,
  resultadoCount,
  totalCount,
}: CustosFixosFiltrosProps) {
  const ativos = temFiltrosAtivos(value);

  const opcoesTipo = useMemo(
    () => [
      { value: '', label: 'Todos os tipos' },
      ...tipos.map((t) => ({
        value: t.id,
        label: t.nome,
        description: t.descricao || undefined,
      })),
    ],
    [tipos]
  );

  const limpar = () => onChange(criarFiltrosPadrao());

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1 min-w-0">
          <Input
            label="Buscar"
            placeholder="Descrição ou tipo..."
            value={value.busca}
            onChange={(e) => onChange({ ...value, busca: e.target.value })}
          />
        </div>
        <div className="w-full lg:w-72">
          <SelectWithSearch
            label="Tipo"
            options={opcoesTipo}
            value={value.tipoId}
            onChange={(tipoId) => onChange({ ...value, tipoId })}
            placeholder="Todos os tipos"
            allowCreate={false}
          />
        </div>
      </div>

      <DateRangeFilter
        valorSincronizado={value.periodo}
        onFilterChange={(periodo) => onChange({ ...value, periodo })}
      />

      {ativos && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-text-secondary">
            Exibindo {resultadoCount} de {totalCount} lançamento{totalCount === 1 ? '' : 's'}
          </p>
          <Button type="button" variant="outline" onClick={limpar}>
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
