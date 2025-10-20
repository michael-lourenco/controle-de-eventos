'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Layout from '@/components/Layout';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useEventos } from '@/hooks/useData';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusEvento, TipoEvento, Evento } from '@/types';

export default function EventosPage() {
  const router = useRouter();
  const { data: eventos, loading, error, refetch } = useEventos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [eventoParaExcluir, setEventoParaExcluir] = useState<Evento | null>(null);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando eventos...</div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Erro ao carregar eventos: {error}</div>
        </div>
      </Layout>
    );
  }
  
  if (!eventos) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Nenhum evento encontrado</div>
        </div>
      </Layout>
    );
  }

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.local.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || evento.status === filterStatus;
    const matchesTipo = filterTipo === 'todos' || evento.tipoEvento === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const handleView = (evento: Evento) => {
    router.push(`/eventos/${evento.id}`);
  };

  const handleEdit = (evento: Evento) => {
    router.push(`/eventos/${evento.id}/editar`);
  };

  const handleDelete = (evento: Evento) => {
    setEventoParaExcluir(evento);
  };

  const confirmDelete = async () => {
    if (eventoParaExcluir) {
      try {
        // Buscar userId do usuário atual
        const { userId } = useCurrentUser();
        if (!userId) {
          console.error('Usuário não autenticado');
          return;
        }
        
        await dataService.deleteEvento(eventoParaExcluir.id, userId);
        await refetch(); // Recarrega os dados
        setEventoParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
      }
    }
  };

  const cancelDelete = () => {
    setEventoParaExcluir(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluído':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600">
              Gerencie todos os eventos agendados
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={loading}
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => router.push('/eventos/novo')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <Input
                  label="Buscar"
                  placeholder="Nome do cliente ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value={StatusEvento.AGENDADO}>Agendado</option>
                  <option value={StatusEvento.CONFIRMADO}>Confirmado</option>
                  <option value={StatusEvento.EM_ANDAMENTO}>Em andamento</option>
                  <option value={StatusEvento.CONCLUIDO}>Concluído</option>
                  <option value={StatusEvento.CANCELADO}>Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value={TipoEvento.CASAMENTO}>Casamento</option>
                  <option value={TipoEvento.ANIVERSARIO_INFANTIL}>Aniversário Infantil</option>
                  <option value={TipoEvento.ANIVERSARIO_ADULTO}>Aniversário Adulto</option>
                  <option value={TipoEvento.QUINZE_ANOS}>15 Anos</option>
                  <option value={TipoEvento.OUTROS}>Outros</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredEventos.map((evento) => (
            <Card 
              key={evento.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleView(evento)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{evento.cliente.nome}</CardTitle>
                    <CardDescription>{evento.contratante}</CardDescription>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evento.status)}`}>
                    {evento.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })} - {evento.diaSemana}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {evento.local}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {evento.horarioInicioServico} - {evento.horarioTerminoServico}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {evento.numeroConvidados} convidados
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{evento.tipoEvento}</span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(evento);
                        }}
                        title="Visualizar"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(evento);
                        }}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(evento);
                        }}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
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

        {filteredEventos.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum evento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar os filtros ou criar um novo evento.
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/eventos/novo')}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {eventoParaExcluir && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Confirmar Exclusão</CardTitle>
                <CardDescription>
                  Tem certeza que deseja excluir o evento de <strong>{eventoParaExcluir.cliente.nome}</strong>?
                  <br />
                  Esta ação não pode ser desfeita.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={cancelDelete}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
