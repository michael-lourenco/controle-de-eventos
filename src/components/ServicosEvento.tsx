'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ServicoForm from '@/components/forms/ServicoForm';
import { 
  ServicoEvento, 
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

interface ServicosEventoProps {
  evento: Evento;
  servicos: ServicoEvento[];
  onServicosChange: () => void;
}

export default function ServicosEvento({ 
  evento, 
  servicos, 
  onServicosChange 
}: ServicosEventoProps) {
  const { userId } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<ServicoEvento | null>(null);
  const [servicoParaExcluir, setServicoParaExcluir] = useState<ServicoEvento | null>(null);
  const [resumoServicos, setResumoServicos] = useState({
    quantidadeItens: 0,
    porCategoria: {} as Record<string, number>
  });

  // Carregar resumo de serviços do Firestore
  useEffect(() => {
    const carregarResumoServicos = async () => {
      if (!userId) {
        console.log('ServicosEvento: userId não disponível ainda');
        return;
      }

      try {
        console.log('ServicosEvento: Carregando resumo de serviços para evento:', evento.id);
        const resumo = await dataService.getResumoServicosPorEvento(userId, evento.id);
        console.log('ServicosEvento: Resumo carregado:', resumo);
        setResumoServicos(resumo);
      } catch (error) {
        console.error('Erro ao carregar resumo de serviços:', error);
      }
    };

    carregarResumoServicos();
  }, [userId, evento.id, servicos]);

  const handleNovoServico = () => {
    setServicoEditando(null);
    setShowForm(true);
  };

  const handleEditarServico = (servico: ServicoEvento) => {
    setServicoEditando(servico);
    setShowForm(true);
  };

  const handleExcluirServico = (servico: ServicoEvento) => {
    setServicoParaExcluir(servico);
  };

  const handleConfirmarExclusao = async () => {
    if (servicoParaExcluir && userId) {
      try {
        await dataService.deleteServicoEvento(userId, evento.id, servicoParaExcluir.id);
        onServicosChange();
        setServicoParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
      }
    }
  };

  const handleSalvarServico = async (servico: ServicoEvento) => {
    if (!userId) return;

    try {
      if (servicoEditando) {
        await dataService.updateServicoEvento(userId, evento.id, servico.id, servico);
      } else {
        await dataService.createServicoEvento(userId, evento.id, servico);
      }
      
      onServicosChange();
      setShowForm(false);
      setServicoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setServicoEditando(null);
  };

  // Função para gerar cor baseada no nome do tipo de serviço
  const getTipoServicoColor = (nome: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-gray-100 text-gray-800'
    ];
    
    // Gerar um índice baseado no nome para consistência
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = ((hash << 5) - hash + nome.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (showForm) {
    return (
      <ServicoForm
        servico={servicoEditando || undefined}
        evento={evento}
        onSave={handleSalvarServico}
        onCancel={handleCancelar}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TagIcon className="h-5 w-5" />
                Serviços do Evento
              </CardTitle>
              <CardDescription>
                Gerencie os serviços prestados neste evento
              </CardDescription>
            </div>
            <Button variant='outline' onClick={handleNovoServico}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">Nenhum serviço cadastrado</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Comece adicionando um serviço para este evento.
              </p>
              <div className="mt-6">
                <Button variant='outline' onClick={handleNovoServico}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Serviço
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo dos Serviços */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface rounded-lg border border-border">
                <div className="flex items-center">
                  <CalculatorIcon className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Total de Serviços</p>
                    <p className="text-2xl font-bold text-text-primary">{resumoServicos.quantidadeItens}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-accent mr-3" />
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipos Diferentes</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {Object.keys(resumoServicos.porCategoria).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Serviços */}
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoServicoColor(servico.tipoServico.nome)}`}>
                            {servico.tipoServico.nome}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mb-1">
                          Serviço adicionado em {format(new Date(servico.dataCadastro), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        {servico.observacoes && (
                          <p className="text-sm text-text-muted italic">
                            {servico.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-text-muted">
                            {format(servico.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditarServico(servico)}
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirServico(servico)}
                            title="Excluir"
                            className="text-error hover:text-error hover:bg-error/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumo por Tipo */}
              {Object.keys(resumoServicos.porCategoria).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-text-primary mb-3">Serviços por Tipo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(resumoServicos.porCategoria).map(([tipo, quantidade]) => (
                      <div key={tipo} className="flex justify-between items-center p-2 bg-surface rounded border border-border">
                        <span className="text-sm text-text-primary">{tipo}</span>
                        <span className="text-sm font-medium text-text-primary">
                          {quantidade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      {servicoParaExcluir && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 modal-card">
            <CardHeader>
              <CardTitle>Confirmar Exclusão</CardTitle>
                     <CardDescription>
                       Tem certeza que deseja excluir este serviço?
                       <br />
                       <strong>Tipo:</strong> {servicoParaExcluir.tipoServico.nome}
                       <br />
                       Esta ação não pode ser desfeita.
                     </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setServicoParaExcluir(null)}
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
