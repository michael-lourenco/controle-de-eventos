'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PagamentoForm from '@/components/forms/PagamentoForm';
import { 
  Pagamento
} from '@/types';
import { dataService } from '@/lib/data-service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface PagamentoHistoricoProps {
  eventoId: string;
  pagamentos: Pagamento[];
  onPagamentosChange: () => void;
  evento: any; // Adicionar prop evento
}

export default function PagamentoHistorico({ 
  eventoId, 
  pagamentos, 
  onPagamentosChange,
  evento 
}: PagamentoHistoricoProps) {
  const [showForm, setShowForm] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<Pagamento | null>(null);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState<Pagamento | null>(null);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    valorTotal: 0,
    valorPago: 0,
    valorPendenteOuAtrasado: 0,
    valorPendente: 0,
    valorAtrasado: 0,
    isAtrasado: false,
    diaFinalPagamento: null
  });

  // Carregar resumo financeiro do Firestore
  useEffect(() => {
    const carregarResumoFinanceiro = async () => {
      try {
        console.log('PagamentoHistorico: Carregando resumo financeiro para evento:', eventoId);
        const valorTotal = evento?.valorTotal || 0;
        const dataFinalPagamento = evento?.diaFinalPagamento ? 
          (evento.diaFinalPagamento?.toDate ? evento.diaFinalPagamento.toDate() : new Date(evento.diaFinalPagamento)) : 
          undefined;
        const resumo = await dataService.getResumoFinanceiroPorEvento(eventoId, valorTotal, dataFinalPagamento);
        
        console.log('PagamentoHistorico - Resumo do Firestore:', resumo);
        console.log('PagamentoHistorico - Valor total do evento:', valorTotal);
        console.log('PagamentoHistorico - Data final de pagamento:', dataFinalPagamento);
        
        setResumoFinanceiro({
          valorTotal: valorTotal,
          valorPago: resumo.totalPago,
          valorPendenteOuAtrasado: resumo.valorPendente + resumo.valorAtrasado,
          valorPendente: resumo.valorPendente,
          valorAtrasado: resumo.valorAtrasado,
          isAtrasado: resumo.isAtrasado,
          diaFinalPagamento: dataFinalPagamento
        });
      } catch (error) {
        console.error('Erro ao carregar resumo financeiro:', error);
      }
    };

    if (eventoId) {
      carregarResumoFinanceiro();
    }
  }, [eventoId, evento?.valorTotal, evento?.diaFinalPagamento]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pago':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
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

  const handleSalvarPagamento = async (pagamentoData: Pagamento) => {
    try {
      console.log('PagamentoHistorico: Salvando pagamento:', pagamentoData);
      
      if (pagamentoEditando) {
        console.log('PagamentoHistorico: Atualizando pagamento existente');
        await dataService.updatePagamento(eventoId, pagamentoEditando.id, pagamentoData);
      } else {
        console.log('PagamentoHistorico: Criando novo pagamento');
        const resultado = await dataService.createPagamento(eventoId, pagamentoData);
        console.log('PagamentoHistorico: Pagamento criado:', resultado);
      }
      
      // Recarregar resumo financeiro após salvar
      const valorTotal = evento?.valorTotal || 0;
      const dataFinalPagamento = evento?.diaFinalPagamento ? 
        (evento.diaFinalPagamento?.toDate ? evento.diaFinalPagamento.toDate() : new Date(evento.diaFinalPagamento)) : 
        undefined;
      const resumo = await dataService.getResumoFinanceiroPorEvento(eventoId, valorTotal, dataFinalPagamento);
      
      setResumoFinanceiro({
        valorTotal: valorTotal,
        valorPago: resumo.totalPago,
        valorPendenteOuAtrasado: resumo.valorPendente + resumo.valorAtrasado,
        valorPendente: resumo.valorPendente,
        valorAtrasado: resumo.valorAtrasado,
        isAtrasado: resumo.isAtrasado,
        diaFinalPagamento: dataFinalPagamento
      });
      
      console.log('PagamentoHistorico: Chamando onPagamentosChange');
      onPagamentosChange();
      setShowForm(false);
      setPagamentoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (pagamentoParaExcluir) {
      try {
        await dataService.deletePagamento(eventoId, pagamentoParaExcluir.id);
        
        // Recarregar resumo financeiro após excluir
        const valorTotal = evento?.valorTotal || 0;
        const dataFinalPagamento = evento?.diaFinalPagamento ? 
          (evento.diaFinalPagamento?.toDate ? evento.diaFinalPagamento.toDate() : new Date(evento.diaFinalPagamento)) : 
          undefined;
        const resumo = await dataService.getResumoFinanceiroPorEvento(eventoId, valorTotal, dataFinalPagamento);
        
        setResumoFinanceiro({
          valorTotal: valorTotal,
          valorPago: resumo.totalPago,
          valorPendenteOuAtrasado: resumo.valorPendente + resumo.valorAtrasado,
          valorPendente: resumo.valorPendente,
          valorAtrasado: resumo.valorAtrasado,
          isAtrasado: resumo.isAtrasado,
          diaFinalPagamento: dataFinalPagamento
        });
        
        onPagamentosChange();
        setPagamentoParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
      }
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setPagamentoEditando(null);
  };

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
            evento={evento}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                R$ {resumoFinanceiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                R$ {resumoFinanceiro.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Valor Pago</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${resumoFinanceiro.isAtrasado ? 'text-red-600' : 'text-yellow-600'}`}>
                R$ {resumoFinanceiro.valorPendenteOuAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">
                {resumoFinanceiro.isAtrasado ? 'Valor Atrasado' : 'Valor Pendente'}
              </div>
            </div>
          </div>
          
          {resumoFinanceiro.diaFinalPagamento && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500">Dia Final de Pagamento</div>
              <div className="text-lg font-semibold text-gray-900">
                {format(new Date(resumoFinanceiro.diaFinalPagamento), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          )}
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
              {pagamentos
                .sort((a, b) => new Date(b.dataPagamento).getTime() - new Date(a.dataPagamento).getTime())
                .map((pagamento) => (
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                            {pagamento.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {pagamento.dataPagamento ? format(new Date(pagamento.dataPagamento), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">Forma:</span>
                            {pagamento.formaPagamento}
                          </div>
                        </div>
                      </div>
                    </div>
                    
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
                <strong>Data:</strong> {pagamentoParaExcluir.dataPagamento ? format(new Date(pagamentoParaExcluir.dataPagamento), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
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