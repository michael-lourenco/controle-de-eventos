'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CustoForm from '@/components/forms/CustoForm';
import { 
  CustoEvento, 
  Evento
} from '@/types';
import { 
  createCustoEvento, 
  updateCustoEvento, 
  deleteCustoEvento,
  getResumoCustosEvento 
} from '@/lib/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface CustosEventoProps {
  evento: Evento;
  custos: CustoEvento[];
  onCustosChange: () => void;
}

export default function CustosEvento({ 
  evento, 
  custos, 
  onCustosChange 
}: CustosEventoProps) {
  const [showForm, setShowForm] = useState(false);
  const [custoEditando, setCustoEditando] = useState<CustoEvento | null>(null);
  const [custoParaExcluir, setCustoParaExcluir] = useState<CustoEvento | null>(null);

  const resumoCustos = getResumoCustosEvento(evento.id);

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Serviço':
        return 'bg-blue-100 text-blue-800';
      case 'Promoter':
        return 'bg-green-100 text-green-800';
      case 'Motorista':
        return 'bg-yellow-100 text-yellow-800';
      case 'Frete':
        return 'bg-purple-100 text-purple-800';
      case 'Insumos':
        return 'bg-orange-100 text-orange-800';
      case 'Impostos':
        return 'bg-red-100 text-red-800';
      case 'Outros':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNovoCusto = () => {
    setCustoEditando(null);
    setShowForm(true);
  };

  const handleEditarCusto = (custo: CustoEvento) => {
    setCustoEditando(custo);
    setShowForm(true);
  };

  const handleExcluirCusto = (custo: CustoEvento) => {
    setCustoParaExcluir(custo);
  };

  const handleSalvarCusto = (custoData: CustoEvento) => {
    try {
      if (custoEditando) {
        updateCustoEvento(custoEditando.id, custoData);
      } else {
        createCustoEvento(custoData);
      }
      onCustosChange();
      setShowForm(false);
      setCustoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
    }
  };

  const handleConfirmarExclusao = () => {
    if (custoParaExcluir) {
      const sucesso = deleteCustoEvento(custoParaExcluir.id);
      if (sucesso) {
        onCustosChange();
        setCustoParaExcluir(null);
      }
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setCustoEditando(null);
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {custoEditando ? 'Editar Custo' : 'Novo Custo'}
          </CardTitle>
          <CardDescription>
            {custoEditando ? 'Atualize as informações do custo' : 'Adicione um novo custo para este evento'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustoForm
            custo={custoEditando || undefined}
            evento={evento}
            onSave={handleSalvarCusto}
            onCancel={handleCancelarForm}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalculatorIcon className="h-5 w-5 mr-2" />
            Resumo de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                R$ {resumoCustos.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">Total de Custos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resumoCustos.quantidadeItens}
              </div>
              <div className="text-sm text-gray-500">Itens de Custo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(resumoCustos.porCategoria).length}
              </div>
              <div className="text-sm text-gray-500">Categorias</div>
            </div>
          </div>
          
          {/* Custos por Categoria */}
          {Object.keys(resumoCustos.porCategoria).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Custos por Categoria</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(resumoCustos.porCategoria).map(([categoria, valor]) => (
                  <div key={categoria} className="text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(categoria)}`}>
                      {categoria}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Custos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Custos</CardTitle>
              <CardDescription>
                {custos.length} custo(s) registrado(s)
              </CardDescription>
            </div>
            <Button onClick={handleNovoCusto}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Custo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {custos.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum custo registrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando o primeiro custo para este evento.
              </p>
              <div className="mt-6">
                <Button onClick={handleNovoCusto}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Custo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {custos.map((custo) => (
                <div
                  key={custo.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {custo.tipoCusto.nome}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(custo.tipoCusto.categoria)}`}>
                            {custo.tipoCusto.categoria}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            R$ {custo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          {custo.quantidade && custo.quantidade > 1 && (
                            <div className="flex items-center">
                              <span className="mr-1">Qtd:</span>
                              {custo.quantidade}
                            </div>
                          )}
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {format(custo.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarCusto(custo)}
                        title="Editar custo"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirCusto(custo)}
                        title="Excluir custo"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {custo.observacoes && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Observações:</strong> {custo.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      {custoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirmar Exclusão</CardTitle>
              <CardDescription>
                Tem certeza que deseja excluir este custo?
                <br />
                <strong>Tipo:</strong> {custoParaExcluir.tipoCusto.nome}
                <br />
                <strong>Valor:</strong> R$ {custoParaExcluir.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                <br />
                Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCustoParaExcluir(null)}
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
