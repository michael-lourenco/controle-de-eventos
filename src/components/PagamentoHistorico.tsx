'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PagamentoForm from '@/components/forms/PagamentoForm';
import { 
  Pagamento,
  Evento,
  AnexoPagamento
} from '@/types';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';
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
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface PagamentoHistoricoProps {
  eventoId: string;
  pagamentos: Pagamento[];
  onPagamentosChange: () => void;
  evento: Evento; // Adicionar prop evento
}

export default function PagamentoHistorico({ 
  eventoId, 
  pagamentos, 
  onPagamentosChange,
  evento 
}: PagamentoHistoricoProps) {
  const { userId } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<Pagamento | null>(null);
  const [pagamentoParaExcluir, setPagamentoParaExcluir] = useState<Pagamento | null>(null);
  const [anexosExpandidos, setAnexosExpandidos] = useState<Set<string>>(new Set());
  const [anexosPorPagamento, setAnexosPorPagamento] = useState<Record<string, AnexoPagamento[]>>({});
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    valorTotal: 0,
    valorPago: 0,
    valorPendenteOuAtrasado: 0,
    valorPendente: 0,
    valorAtrasado: 0,
    isAtrasado: false,
    diaFinalPagamento: null as Date | null
  });

  // Carregar resumo financeiro do Firestore
  useEffect(() => {
    const carregarResumoFinanceiro = async () => {
      if (!userId) {
        console.log('PagamentoHistorico: userId não disponível ainda');
        return;
      }
      
      try {
        console.log('PagamentoHistorico: Carregando resumo financeiro para evento:', eventoId);
        const valorTotal = evento?.valorTotal || 0;
        const dataFinalPagamento = evento?.diaFinalPagamento ? 
          (evento.diaFinalPagamento instanceof Date ? evento.diaFinalPagamento : new Date(evento.diaFinalPagamento)) : 
          undefined;
        const resumo = await dataService.getResumoFinanceiroPorEvento(userId, eventoId, valorTotal, dataFinalPagamento);
        
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
          diaFinalPagamento: dataFinalPagamento || null || null
        });
      } catch (error) {
        console.error('Erro ao carregar resumo financeiro:', error);
      }
    };

    if (eventoId && userId) {
      carregarResumoFinanceiro();
    }
  }, [eventoId, evento?.valorTotal, evento?.diaFinalPagamento, userId]);

  // Carregar anexos dos pagamentos
  const carregarAnexos = async (pagamentoId: string) => {
    if (!userId) return;
    
    try {
      // Primeiro, tentar migrar anexos da pasta temp se existirem
      await migrarAnexosTemp(pagamentoId);
      
      const response = await fetch(
        `/api/comprovantes?eventoId=${eventoId}&pagamentoId=${pagamentoId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setAnexosPorPagamento(prev => ({
          ...prev,
          [pagamentoId]: result.anexos
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }
  };

  const migrarAnexosTemp = async (pagamentoId: string) => {
    try {
      const response = await fetch('/api/migrar-anexos-temp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventoId,
          pagamentoIdTemp: 'temp',
          pagamentoIdReal: pagamentoId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.migrados > 0) {
          console.log(`${result.migrados} anexos migrados da pasta temp`);
        }
      }
    } catch (error) {
      console.error('Erro ao migrar anexos temp:', error);
    }
  };

  const toggleAnexos = (pagamentoId: string) => {
    const novoSet = new Set(anexosExpandidos);
    if (novoSet.has(pagamentoId)) {
      novoSet.delete(pagamentoId);
    } else {
      novoSet.add(pagamentoId);
      // Carregar anexos se ainda não foram carregados
      if (!anexosPorPagamento[pagamentoId]) {
        carregarAnexos(pagamentoId);
      }
    }
    setAnexosExpandidos(novoSet);
  };

  const deletarAnexo = async (pagamentoId: string, anexoId: string) => {
    try {
      const response = await fetch(
        `/api/comprovantes?eventoId=${eventoId}&pagamentoId=${pagamentoId}&anexoId=${anexoId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        // Atualizar lista local
        setAnexosPorPagamento(prev => ({
          ...prev,
          [pagamentoId]: prev[pagamentoId]?.filter(anexo => anexo.id !== anexoId) || []
        }));
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
    }
  };

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

  const handleSalvarPagamento = async (pagamentoData: Pagamento): Promise<Pagamento> => {
    if (!userId) {
      console.error('PagamentoHistorico: userId não disponível para salvar pagamento');
      throw new Error('UserId não disponível');
    }
    
    try {
      console.log('PagamentoHistorico: Salvando pagamento:', pagamentoData);
      
      let pagamentoSalvo: Pagamento;
      
      if (pagamentoEditando) {
        console.log('PagamentoHistorico: Atualizando pagamento existente');
        pagamentoSalvo = await dataService.updatePagamento(userId, eventoId, pagamentoEditando.id, pagamentoData);
      } else {
        console.log('PagamentoHistorico: Criando novo pagamento');
        pagamentoSalvo = await dataService.createPagamento(userId, eventoId, pagamentoData);
        console.log('PagamentoHistorico: Pagamento criado:', pagamentoSalvo);
      }
      
      // Recarregar resumo financeiro após salvar
      const valorTotal = evento?.valorTotal || 0;
      const dataFinalPagamento = evento?.diaFinalPagamento ? 
        (evento.diaFinalPagamento instanceof Date ? evento.diaFinalPagamento : new Date(evento.diaFinalPagamento)) : 
        undefined;
      const resumo = await dataService.getResumoFinanceiroPorEvento(userId, eventoId, valorTotal, dataFinalPagamento);
      
      setResumoFinanceiro({
        valorTotal: valorTotal,
        valorPago: resumo.totalPago,
        valorPendenteOuAtrasado: resumo.valorPendente + resumo.valorAtrasado,
        valorPendente: resumo.valorPendente,
        valorAtrasado: resumo.valorAtrasado,
        isAtrasado: resumo.isAtrasado,
        diaFinalPagamento: dataFinalPagamento || null
      });
      
      console.log('PagamentoHistorico: Chamando onPagamentosChange');
      onPagamentosChange();
      
      // Fechar formulário
      setShowForm(false);
      setPagamentoEditando(null);
      
      return pagamentoSalvo;
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      throw error;
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!userId) {
      console.error('PagamentoHistorico: userId não disponível para excluir pagamento');
      return;
    }
    
    if (pagamentoParaExcluir) {
      try {
        await dataService.deletePagamento(userId, eventoId, pagamentoParaExcluir.id);
        
        // Recarregar resumo financeiro após excluir
        const valorTotal = evento?.valorTotal || 0;
        const dataFinalPagamento = evento?.diaFinalPagamento ? 
          (evento.diaFinalPagamento instanceof Date ? evento.diaFinalPagamento : new Date(evento.diaFinalPagamento)) : 
          undefined;
        const resumo = await dataService.getResumoFinanceiroPorEvento(userId!, eventoId, valorTotal, dataFinalPagamento);
        
        setResumoFinanceiro({
          valorTotal: valorTotal,
          valorPago: resumo.totalPago,
          valorPendenteOuAtrasado: resumo.valorPendente + resumo.valorAtrasado,
          valorPendente: resumo.valorPendente,
          valorAtrasado: resumo.valorAtrasado,
          isAtrasado: resumo.isAtrasado,
          diaFinalPagamento: dataFinalPagamento || null || null
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
              <div className="text-3xl font-bold text-text-primary">
                R$ {resumoFinanceiro.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-text-secondary">Valor Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                R$ {resumoFinanceiro.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-text-secondary">Valor Pago</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${resumoFinanceiro.isAtrasado ? 'text-red-600' : 'text-yellow-600'}`}>
                R$ {resumoFinanceiro.valorPendenteOuAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-text-secondary">
                {resumoFinanceiro.isAtrasado ? 'Valor Atrasado' : 'Valor Pendente'}
              </div>
            </div>
          </div>
          
          {resumoFinanceiro.diaFinalPagamento && (
            <div className="mt-6 text-center">
              <div className="text-sm text-text-secondary">Dia Final de Pagamento</div>
              <div className="text-lg font-semibold text-text-primary">
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
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-text-secondary" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">Nenhum pagamento registrado</h3>
              <p className="mt-1 text-sm text-text-secondary">
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
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(pagamento.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text-primary">
                            R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                            {pagamento.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
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
                        onClick={() => toggleAnexos(pagamento.id)}
                        title="Ver comprovantes"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <DocumentIcon className="h-4 w-4" />
                        {anexosExpandidos.has(pagamento.id) ? (
                          <ChevronDownIcon className="h-3 w-3 ml-1" />
                        ) : (
                          <ChevronRightIcon className="h-3 w-3 ml-1" />
                        )}
                      </Button>
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
                    <div className="mt-2 text-sm text-text-primary p-2 rounded">
                      <strong>Observações:</strong> {pagamento.observacoes}
                    </div>
                  )}

                  {/* Seção de Anexos Expandível */}
                  {anexosExpandidos.has(pagamento.id) && (
                    <div className="mt-3 border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-text-primary">Comprovantes</h4>
                        <span className="text-xs text-text-secondary">
                          {anexosPorPagamento[pagamento.id]?.length || 0} arquivo(s)
                        </span>
                      </div>
                      
                      {anexosPorPagamento[pagamento.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {anexosPorPagamento[pagamento.id].map((anexo) => (
                            <div key={anexo.id} className="flex items-center justify-between p-2 bg-surface rounded border border-border">
                              <div className="flex items-center space-x-2">
                                <DocumentIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-text-primary">{anexo.nome}</span>
                                <span className="text-xs text-text-secondary">
                                  ({(anexo.tamanho / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(anexo.url, '_blank')}
                                  title="Visualizar arquivo"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <EyeIcon className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deletarAnexo(pagamento.id, anexo.id)}
                                  title="Remover arquivo"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-text-secondary">
                          <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-text-muted" />
                          <p className="text-sm">Nenhum comprovante anexado</p>
                        </div>
                      )}
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