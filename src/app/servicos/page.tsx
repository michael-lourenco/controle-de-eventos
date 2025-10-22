'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { ServicoEvento, Evento } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function ServicosPage() {
  const { userId } = useCurrentUser();
  const [servicos, setServicos] = useState<ServicoEvento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvento, setFilterEvento] = useState<string>('todos');

  // Carregar dados
  useEffect(() => {
    const carregarDados = async () => {
      if (!userId) {
        console.log('ServicosPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('ServicosPage: Carregando dados');
        
        // Carregar eventos
        const eventosData = await dataService.getEventos(userId);
        setEventos(eventosData);
        
        // Carregar todos os serviços de todos os eventos
        const todosServicos: ServicoEvento[] = [];
        for (const evento of eventosData) {
          const servicosEvento = await dataService.getServicosEvento(userId, evento.id);
          todosServicos.push(...servicosEvento);
        }
        
        console.log('ServicosPage: Serviços carregados:', todosServicos);
        setServicos(todosServicos);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId]);

  // Filtrar serviços
  const servicosFiltrados = servicos.filter(servico => {
    const matchesSearch = servico.tipoServico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         servico.evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvento = filterEvento === 'todos' || servico.eventoId === filterEvento;
    
    return matchesSearch && matchesEvento;
  });

  const handleExcluirServico = async (servico: ServicoEvento) => {
    if (!userId) return;

    try {
      await dataService.deleteServicoEvento(userId, servico.eventoId, servico.id);
      setServicos(prev => prev.filter(s => s.id !== servico.id));
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

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
    
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = ((hash << 5) - hash + nome.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando serviços...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Serviços</h1>
            <p className="text-text-secondary">
              Gerencie todos os serviços prestados
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Input
                  label="Buscar"
                  placeholder="Nome do serviço, cliente ou observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select
                  label="Evento"
                  value={filterEvento}
                  onChange={(e) => setFilterEvento(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todos os eventos' },
                    ...eventos.map(evento => ({
                      value: evento.id,
                      label: `${evento.cliente.nome} - ${format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}`
                    }))
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total de Serviços</p>
                  <p className="text-2xl font-bold text-text-primary">{servicosFiltrados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Valor Total</p>
                  <p className="text-2xl font-bold text-text-primary">
                    R$ {servicosFiltrados.reduce((total, servico) => total + servico.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MapPinIcon className="h-8 w-8 text-accent mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Eventos Únicos</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {new Set(servicosFiltrados.map(s => s.eventoId)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Serviços */}
        <div className="space-y-4">
          {servicosFiltrados.map((servico) => (
            <Card key={servico.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoServicoColor(servico.tipoServico.nome)}`}>
                        {servico.tipoServico.nome}
                      </span>
                      {servico.quantidade && servico.quantidade > 1 && (
                        <span className="text-sm text-text-muted">
                          x{servico.quantidade}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mb-2">
                      {servico.tipoServico.descricao}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {format(servico.evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {servico.evento.cliente.nome}
                      </span>
                    </div>
                    {servico.observacoes && (
                      <p className="text-sm text-text-muted italic mt-2">
                        {servico.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-text-primary">
                        R$ {servico.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-text-muted">
                        {format(servico.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/eventos/${servico.eventoId}`, '_blank')}
                        title="Ver Evento"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/eventos/${servico.eventoId}`, '_blank')}
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
              </CardContent>
            </Card>
          ))}
        </div>

        {servicosFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm || filterEvento !== 'todos' ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm || filterEvento !== 'todos' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece adicionando serviços aos eventos.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
