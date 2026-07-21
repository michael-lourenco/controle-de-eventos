'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import PlanOverlay from '@/components/PlanOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import CustoFixoForm from '@/components/forms/CustoFixoForm';
import CustosFixosFiltros, {
  criarFiltrosPadrao,
  CustosFixosFiltrosState,
  temFiltrosAtivos,
} from '@/components/filters/CustosFixosFiltros';
import { isDateInFilter } from '@/components/filters/DateRangeFilter';
import { dataService } from '@/lib/data-service';
import { CustoFixo, TipoCustoFixo } from '@/types';
import { useCurrentUser } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { handlePlanoError } from '@/lib/utils/plano-errors';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: Date | string) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('pt-BR');
}

function aplicarFiltros(custos: CustoFixo[], filtros: CustosFixosFiltrosState): CustoFixo[] {
  const term = filtros.busca.toLowerCase().trim();

  return custos.filter((c) => {
    if (filtros.tipoId && c.tipoCustoFixoId !== filtros.tipoId) {
      return false;
    }

    if (filtros.periodo && !isDateInFilter(new Date(c.dataPagamento), filtros.periodo)) {
      return false;
    }

    if (term) {
      const tipo = c.tipoCustoFixo?.nome?.toLowerCase() || '';
      const desc = (c.descricao || '').toLowerCase();
      if (!tipo.includes(term) && !desc.includes(term)) {
        return false;
      }
    }

    return true;
  });
}

export default function CustosFixosPage() {
  const { userId } = useCurrentUser();
  const { showToast } = useToast();
  const router = useRouter();
  const [custos, setCustos] = useState<CustoFixo[]>([]);
  const [tipos, setTipos] = useState<TipoCustoFixo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<CustosFixosFiltrosState>(() => criarFiltrosPadrao());
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<CustoFixo | null>(null);
  const [excluindo, setExcluindo] = useState<CustoFixo | null>(null);

  const carregar = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [lista, tiposAtivos] = await Promise.all([
        dataService.getCustosFixos(userId),
        dataService.getTiposCustoFixoAtivos(userId),
      ]);
      setCustos(lista);
      setTipos(tiposAtivos);
    } catch (error: any) {
      const tratado = handlePlanoError(error, showToast, () => router.push('/planos'));
      if (!tratado) {
        showToast(error.message || 'Erro ao carregar custos fixos', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [userId]);

  const filtrados = useMemo(() => aplicarFiltros(custos, filtros), [custos, filtros]);

  const total = useMemo(
    () => filtrados.reduce((sum, c) => sum + c.valor * (c.quantidade || 1), 0),
    [filtrados]
  );

  const filtrosAtivos = temFiltrosAtivos(filtros);

  const handleSalvo = async () => {
    setShowForm(false);
    setEditando(null);
    showToast(editando ? 'Custo fixo atualizado!' : 'Custo fixo criado!', 'success');
    await carregar();
  };

  const handleExcluir = async () => {
    if (!userId || !excluindo) return;
    try {
      await dataService.deleteCustoFixo(userId, excluindo.id);
      showToast('Custo fixo excluído', 'success');
      setExcluindo(null);
      await carregar();
    } catch (error: any) {
      const tratado = handlePlanoError(error, showToast, () => router.push('/planos'));
      if (!tratado) showToast(error.message || 'Erro ao excluir', 'error');
    }
  };

  return (
    <Layout>
      <PlanOverlay>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <CurrencyDollarIcon className="h-6 w-6" />
                Custos Fixos
              </h1>
              <p className="text-text-secondary">
                Despesas sem vínculo com eventos (aluguel, software, etc.)
              </p>
            </div>
            <Button
              onClick={() => {
                setEditando(null);
                setShowForm(true);
              }}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo custo fixo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Total exibido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-text-primary">{formatCurrency(total)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-text-secondary">
                  Lançamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-text-primary">{filtrados.length}</p>
              </CardContent>
            </Card>
          </div>

          <CustosFixosFiltros
            tipos={tipos}
            value={filtros}
            onChange={setFiltros}
            resultadoCount={filtrados.length}
            totalCount={custos.length}
          />

          {loading ? (
            <div className="text-text-secondary py-12 text-center">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-text-secondary space-y-3">
                <p>
                  {filtrosAtivos
                    ? 'Nenhum custo fixo corresponde aos filtros.'
                    : 'Nenhum custo fixo encontrado. Crie o primeiro lançamento.'}
                </p>
                {filtrosAtivos && (
                  <Button variant="outline" onClick={() => setFiltros(criarFiltrosPadrao())}>
                    Limpar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-surface-hover text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium">Descrição</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd</th>
                    <th className="px-4 py-3 text-right font-medium">Valor</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((custo) => {
                    const qtd = custo.quantidade || 1;
                    return (
                      <tr key={custo.id} className="border-t border-border hover:bg-surface-hover/50">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(custo.dataPagamento)}</td>
                        <td className="px-4 py-3">{custo.tipoCustoFixo?.nome || '—'}</td>
                        <td className="px-4 py-3 max-w-xs truncate">{custo.descricao || '—'}</td>
                        <td className="px-4 py-3 text-right">{qtd}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(custo.valor)}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(custo.valor * qtd)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditando(custo);
                                setShowForm(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExcluindo(custo)}
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={showForm} onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditando(null);
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar custo fixo' : 'Novo custo fixo'}</DialogTitle>
            </DialogHeader>
            <CustoFixoForm
              custo={editando || undefined}
              onSave={handleSalvo}
              onCancel={() => {
                setShowForm(false);
                setEditando(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <ConfirmationDialog
          open={!!excluindo}
          onOpenChange={(open) => !open && setExcluindo(null)}
          title="Excluir custo fixo"
          description={`Tem certeza que deseja excluir permanentemente o custo "${excluindo?.tipoCustoFixo?.nome || ''}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleExcluir}
          variant="destructive"
        />
      </PlanOverlay>
    </Layout>
  );
}
