'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CustoForm from '@/components/forms/CustoForm';
import { 
  CustoEvento, 
  Evento
} from '@/types';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { userId } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [custoEditando, setCustoEditando] = useState<CustoEvento | null>(null);
  const [custoParaExcluir, setCustoParaExcluir] = useState<CustoEvento | null>(null);
  const [resumoCustos, setResumoCustos] = useState({
    total: 0,
    quantidadeItens: 0,
    porCategoria: {} as Record<string, number>
  });

  // Carregar resumo de custos do Firestore
  useEffect(() => {
    const carregarResumoCustos = async () => {
      if (!userId) {
        console.log('CustosEvento: userId não disponível ainda');
        return;
      }
      
      try {
        console.log('CustosEvento: Carregando resumo de custos para evento:', evento.id);
        const resumo = await dataService.getResumoCustosPorEvento(userId, evento.id);
        setResumoCustos(resumo);
        console.log('CustosEvento - Resumo do Firestore:', resumo);
      } catch (error) {
        console.error('Erro ao carregar resumo de custos:', error);
      }
    };

    if (evento.id && userId) {
      carregarResumoCustos();
    }
  }, [evento.id, custos, userId]);

  const getTipoCustoColor = (nome: string) => {
    // Gera uma cor baseada no nome do tipo de custo
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    
    const hash = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
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

  const handleSalvarCusto = async (custoData: CustoEvento) => {
    if (!userId) {
      console.error('CustosEvento: userId não disponível para salvar custo');
      return;
    }
    
    try {
      if (custoEditando) {
        await dataService.updateCustoEvento(userId, evento.id, custoEditando.id, custoData);
      } else {
        await dataService.createCustoEvento(userId, evento.id, custoData);
      }
      
      // Recarregar resumo de custos
      const resumo = await dataService.getResumoCustosPorEvento(userId, evento.id);
      setResumoCustos(resumo);
      
      onCustosChange();
      setShowForm(false);
      setCustoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!userId) {
      console.error('CustosEvento: userId não disponível para excluir custo');
      return;
    }
    
    if (custoParaExcluir) {
      try {
        await dataService.deleteCustoEvento(userId, evento.id, custoParaExcluir.id);
        
        // Recarregar resumo de custos
        const resumo = await dataService.getResumoCustosPorEvento(userId, evento.id);
        setResumoCustos(resumo);
        
        onCustosChange();
        setCustoParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir custo:', error);
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
              <div className="text-3xl font-bold text-text-primary">
                R$ {resumoCustos.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-text-secondary">Total de Custos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resumoCustos.quantidadeItens}
              </div>
              <div className="text-sm text-text-secondary">Itens de Custo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(resumoCustos.porCategoria).length}
              </div>
              <div className="text-sm text-text-secondary">Tipos</div>
            </div>
          </div>
          
          {/* Custos por Tipo */}
          {Object.keys(resumoCustos.porCategoria).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-text-primary mb-3">Custos por Tipo</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(resumoCustos.porCategoria).map(([tipoCusto, valor]) => (
                  <div key={tipoCusto} className="text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoCustoColor(tipoCusto)}`}>
                      {tipoCusto}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-text-primary">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='outline' onClick={handleNovoCusto} className="p-2">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Novo Custo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {custos.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">Nenhum custo registrado</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Comece adicionando o primeiro custo para este evento.
              </p>
              <div className="mt-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='outline' onClick={handleNovoCusto} className="p-2">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Novo Custo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {custos.map((custo) => (
                <div
                  key={custo.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text-primary">
                            {custo.tipoCusto.nome}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTipoCustoColor(custo.tipoCusto.nome)}`}>
                            {custo.tipoCusto.nome}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
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
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 modal-card">
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
                  variant="outline"
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
