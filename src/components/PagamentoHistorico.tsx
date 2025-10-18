'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PagamentoForm from '@/components/forms/PagamentoForm';
import { 
  Pagamento, 
  ContratoServico,
  StatusPagamento 
} from '@/types';
import { 
  createPagamento, 
  updatePagamento, 
  deletePagamento,
  getResumoFinanceiroEvento 
} from '@/lib/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface PagamentoHistoricoProps {
  eventoId: string;
  pagamentos: Pagamento[];
  contrato: ContratoServico | null;
  onPagamentosChange: () => void;
}

export default function PagamentoHistorico({ 
  eventoId, 
  pagamentos, 
  contrato, 
  onPagamentosChange 
}: PagamentoHistoricoProps) {
  const [showForm, setShowForm] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<Pagamento | null>(null);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState<Pagamento | null>(null);

  const resumoFinanceiro = getResumoFinanceiroEvento(eventoId);

  const getStatusIcon = (status: StatusPagamento) => {
    switch (status) {
      case StatusPagamento.PAGO:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case StatusPagamento.PENDENTE:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case StatusPagamento.ATRASADO:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case StatusPagamento.CANCELADO:
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: StatusPagamento) => {
    switch (status) {
      case StatusPagamento.PAGO:
        return 'bg-green-100 text-green-800';
      case StatusPagamento.PENDENTE:
        return 'bg-yellow-100 text-yellow-800';
      case StatusPagamento.ATRASADO:
        return 'bg-red-100 text-red-800';
      case StatusPagamento.CANCELADO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNovoPagamento = () => {
    setPagamentoEditando(null);
    setShowForm(true);
  };

  const handleEditarPagamento = (pagamento: Pagamento) => {
    setPagamentoEditando(pagamento);
    setShowForm(true);
  };

  const handleExcluirPagamento = (pagamento: Pagamento) => {
    setPagamentoParaExcluir(pagamento);
  };

  const handleSalvarPagamento = (pagamentoData: Pagamento) => {
    try {
      if (pagamentoEditando) {
        updatePagamento(pagamentoEditando.id, pagamentoData);
      } else {
        createPagamento(pagamentoData);
      }
      onPagamentosChange();
      setShowForm(false);
      setPagamentoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };

  const handleConfirmarExclusao = () => {
    if (pagamentoParaExcluir) {
      const sucesso = deletePagamento(pagamentoParaExcluir.id);
      if (sucesso) {
        onPagamentosChange();
        setPagamentoParaExcluir(null);
      }
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setPagamentoEditando(null);
  };

  if (!contrato) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Nenhum contrato encontrado para este evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            É necessário criar um contrato antes de gerenciar os pagamentos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {pagamentoEditando ? 'Editar Pagamento' : 'Novo Pagamento'}
          </CardTitle>
          <CardDescription>
            {pagamentoEditando ? 'Atualize as informações do pagamento' : 'Adicione um novo pagamento para este evento'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PagamentoForm
            pagamento={pagamentoEditando || undefined}
            contrato={contrato}
            onSave={handleSalvarPagamento}
            onCancel={handleCancelarForm}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                R$ {resumoFinanceiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {resumoFinanceiro.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Pago</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                R$ {resumoFinanceiro.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Pendente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                R$ {resumoFinanceiro.valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Atrasado</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {resumoFinanceiro.totalParcelas}
              </div>
              <div className="text-sm text-gray-500">Total de Parcelas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {resumoFinanceiro.parcelasPagas}
              </div>
              <div className="text-sm text-gray-500">Parcelas Pagas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {resumoFinanceiro.parcelasPendentes}
              </div>
              <div className="text-sm text-gray-500">Parcelas Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {resumoFinanceiro.parcelasAtrasadas}
              </div>
              <div className="text-sm text-gray-500">Parcelas Atrasadas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                {pagamentos.length} pagamento(s) registrado(s)
              </CardDescription>
            </div>
            <Button onClick={handleNovoPagamento}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pagamentos.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento registrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando o primeiro pagamento para este evento.
              </p>
              <div className="mt-6">
                <Button onClick={handleNovoPagamento}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pagamentos.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(pagamento.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {pagamento.numeroParcela && (
                            <span className="text-sm text-gray-500">
                              (Parcela {pagamento.numeroParcela}/{pagamento.totalParcelas})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Vencimento: {format(pagamento.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          {pagamento.dataPagamento && (
                            <div className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Pago em: {format(pagamento.dataPagamento, 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                        {pagamento.status}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarPagamento(pagamento)}
                          title="Editar pagamento"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExcluirPagamento(pagamento)}
                          title="Excluir pagamento"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-1" />
                        {pagamento.formaPagamento}
                      </div>
                      {pagamento.comprovante && (
                        <div>
                          Comprovante: {pagamento.comprovante}
                        </div>
                      )}
                    </div>
                    <div>
                      Criado em {format(pagamento.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                  
                  {pagamento.observacoes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {pagamento.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      {pagamentoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirmar Exclusão</CardTitle>
              <CardDescription>
                Tem certeza que deseja excluir este pagamento?
                <br />
                <strong>Valor:</strong> R$ {pagamentoParaExcluir.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <br />
                Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPagamentoParaExcluir(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmarExclusao}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
