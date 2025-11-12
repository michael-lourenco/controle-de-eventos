'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Layout from '@/components/Layout';
import {
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useEventos } from '@/hooks/useData';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusEvento, Evento, DEFAULT_TIPOS_EVENTO } from '@/types';
import DateRangeFilter, { DateFilter, isDateInFilter } from '@/components/filters/DateRangeFilter';
import { useTiposEvento } from '@/hooks/useData';

export default function EventosPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { data: eventos, loading, error, refetch } = useEventos();
  const { data: tiposEventoData } = useTiposEvento();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<Evento | null>(null);
  const [eventoCopiado, setEventoCopiado] = useState<string | null>(null);
  
  const eventosLista = eventos ?? [];

  const tiposEventoFilterOptions = React.useMemo(() => {
    const nomes = new Set<string>();
    const options = [
      { value: 'todos', label: 'Todos' }
    ];

    const fontes = [
      ...(tiposEventoData ?? []).filter(tipo => tipo.ativo).map(tipo => tipo.nome),
      ...DEFAULT_TIPOS_EVENTO.map(tipo => tipo.nome),
      ...eventosLista.map(evento => evento.tipoEvento)
    ];

    fontes.forEach(nome => {
      if (nome && !nomes.has(nome)) {
        nomes.add(nome);
        options.push({
          value: nome,
          label: nome
        });
      }
    });

    return options;
  }, [tiposEventoData, eventosLista]);

  // Filtrar eventos - chamado antes dos early returns para seguir as regras dos hooks
  const filteredEventos = useMemo(() => {
    if (!eventosLista || eventosLista.length === 0) {
      return [];
    }
    
    return eventosLista.filter(evento => {
      const matchesSearch = evento.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (evento.nomeEvento && evento.nomeEvento.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'todos' || evento.status === filterStatus;
      const matchesTipo = filterTipo === 'todos' || evento.tipoEvento === filterTipo;
      const matchesDate = isDateInFilter(evento.dataEvento, dateFilter);
      
      // Debug para verificar filtro de data
      if (dateFilter && dateFilter.range.startDate && dateFilter.range.endDate) {
        console.log('Filtro de data ativo:', {
          eventDate: evento.dataEvento,
          eventDateFormatted: format(evento.dataEvento, 'dd/MM/yyyy'),
          filterStart: dateFilter.range.startDate,
          filterEnd: dateFilter.range.endDate,
          matchesDate
        });
      }
      
      return matchesSearch && matchesStatus && matchesTipo && matchesDate;
    });
  }, [eventosLista, searchTerm, filterStatus, filterTipo, dateFilter]);

  // Ordenar eventos por data do evento em ordem crescente - chamado antes dos early returns
  const sortedEventos = useMemo(() => {
    if (!filteredEventos || filteredEventos.length === 0) {
      return [];
    }
    
    return [...filteredEventos].sort((a, b) => {
      const dataA = a.dataEvento instanceof Date ? a.dataEvento.getTime() : new Date(a.dataEvento).getTime();
      const dataB = b.dataEvento instanceof Date ? b.dataEvento.getTime() : new Date(b.dataEvento).getTime();
      return dataA - dataB;
    });
  }, [filteredEventos]);

  // Early returns após todos os hooks
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando eventos...</div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">Erro ao carregar eventos: {error}</div>
        </div>
      </Layout>
    );
  }
  
  if (!eventos) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Nenhum evento encontrado</div>
        </div>
      </Layout>
    );
  }

  const handleView = (evento: Evento) => {
    router.push(`/eventos/${evento.id}`);
  };

  const handleEdit = (evento: Evento) => {
    router.push(`/eventos/${evento.id}/editar`);
  };

  const handleDelete = (evento: Evento) => {
    setEventoParaExcluir(evento);
  };

  const formatEventInfoForCopy = (evento: Evento) => {
    let text = '';

    // Informações do Cliente
    text += '👤 *INFORMAÇÕES DO CLIENTE*\n\n';
    text += `Nome: ${evento.cliente.nome}\n`;
    text += `Email: ${evento.cliente.email}\n`;
    text += `Telefone: ${evento.cliente.telefone}\n`;
    text += `Endereço: ${evento.cliente.endereco}\n`;
    if (evento.cliente.instagram) {
      text += `Instagram: ${evento.cliente.instagram}\n`;
    }
    if (evento.cliente.canalEntrada) {
      text += `Canal de Entrada: ${evento.cliente.canalEntrada.nome}\n`;
    }
    
    text += '\n────────────────────────\n\n';

    // Informações do Evento
    text += '📅 *INFORMAÇÕES DO EVENTO*\n\n';
    text += `Data: ${format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })} - ${evento.diaSemana}\n`;
    text += `Local: ${evento.local}\n`;
    text += `Endereço: ${evento.endereco}\n`;
    text += `Convidados: ${evento.numeroConvidados}\n`;
    text += `Tipo: ${evento.tipoEvento}\n`;
    if (evento.contratante) {
      text += `Contratante: ${evento.contratante}\n`;
    }
    
    text += '\n────────────────────────\n\n';

    // Detalhes do Serviço
    text += '⚙️ *DETALHES DO SERVIÇO*\n\n';
    if (evento.saida) {
      text += `Saída: ${evento.saida}\n`;
    }
    if (evento.chegadaNoLocal) {
      text += `Chegada no local: ${evento.chegadaNoLocal}\n`;
    }
    if (evento.horarioInicio) {
      text += `Horário de início: ${evento.horarioInicio}\n`;
    }
    if (evento.horarioDesmontagem) {
      text += `Horário de Desmontagem: ${evento.horarioDesmontagem}\n`;
    }
    if (evento.tempoEvento) {
      text += `Duração: ${evento.tempoEvento}\n`;
    }
    if (evento.quantidadeMesas) {
      text += `Mesas: ${evento.quantidadeMesas}\n`;
    }
    if (evento.numeroImpressoes) {
      text += `Impressões: ${evento.numeroImpressoes}\n`;
    }
    if (evento.hashtag) {
      text += `Hashtag: ${evento.hashtag}\n`;
    }
    if (evento.cerimonialista) {
      text += `\nCerimonialista: ${evento.cerimonialista.nome}\n`;
      if (evento.cerimonialista.telefone) {
        text += `Telefone: ${evento.cerimonialista.telefone}\n`;
      }
    }
    if (evento.observacoes) {
      text += `\nObservações:\n${evento.observacoes}\n`;
    }

    return text;
  };

  const handleCopyInfo = async (evento: Evento) => {
    const text = formatEventInfoForCopy(evento);
    
    // Tentar usar a API moderna do clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setEventoCopiado(evento.id);
        setTimeout(() => {
          setEventoCopiado(null);
        }, 2000);
        return;
      } catch (error) {
        console.error('Erro ao copiar texto:', error);
      }
    }
    
    // Fallback para navegadores mais antigos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setEventoCopiado(evento.id);
        setTimeout(() => {
          setEventoCopiado(null);
        }, 2000);
      } else {
        console.error('Falha ao copiar texto');
      }
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  const confirmDelete = async () => {
    if (eventoParaExcluir) {
      try {
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
        return 'bg-info-bg text-info-text';
      case 'Confirmado':
        return 'bg-success-bg text-success-text';
      case 'Em andamento':
        return 'bg-warning-bg text-warning-text';
      case 'Concluído':
        return 'bg-surface text-text-secondary';
      case 'Cancelado':
        return 'bg-error-bg text-error-text';
      default:
        return 'bg-surface text-text-secondary';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Eventos</h1>
            <p className="text-text-secondary">
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
            <Button variant="outline" onClick={() => router.push('/eventos/novo')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Filtro por Período */}
          <div>
            <DateRangeFilter 
              onFilterChange={setDateFilter}
              className="w-full"
            />
          </div>

          {/* Filtros Básicos */}
          <Card className="lg:col-span-2 bg-surface/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Input
                    label="Buscar"
                    placeholder="Nome do evento, cliente ou local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Select
                    label="Status"
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value)}
                    options={[
                      { value: 'todos', label: 'Todos' },
                      { value: StatusEvento.AGENDADO, label: 'Agendado' },
                      { value: StatusEvento.CANCELADO, label: 'Cancelado' },
                      { value: StatusEvento.CONCLUIDO, label: 'Concluído' },
                      { value: StatusEvento.CONFIRMADO, label: 'Confirmado' },
                      { value: StatusEvento.EM_ANDAMENTO, label: 'Em andamento' }
                    ]}
                  />
                </div>
                <div>
                  <Select
                    label="Tipo"
                    value={filterTipo}
                    onValueChange={(value) => setFilterTipo(value)}
                    options={tiposEventoFilterOptions}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo dos Filtros Ativos */}
        {(searchTerm || filterStatus !== 'todos' || filterTipo !== 'todos' || dateFilter) && (
          <Card className="bg-surface/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-text-primary">Filtros ativos:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-bg text-info-text">
                        Busca: &quot;{searchTerm}&quot;
                      </span>
                    )}
                    {filterStatus !== 'todos' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success-text">
                        Status: {filterStatus}
                      </span>
                    )}
                    {filterTipo !== 'todos' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        Tipo: {filterTipo}
                      </span>
                    )}
                    {dateFilter && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-bg text-warning-text">
                        {dateFilter.type === 'quick' 
                          ? `Período: ${dateFilter.quickFilter}`
                          : `Período: ${format(dateFilter.range.startDate!, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateFilter.range.endDate!, 'dd/MM/yyyy', { locale: ptBR })}`
                        }
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-text-secondary">
                  {sortedEventos.length} evento{sortedEventos.length !== 1 ? 's' : ''} encontrado{sortedEventos.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Eventos */}
        <div className="space-y-4">
          {sortedEventos.map((evento) => (
            <Card 
              key={evento.id} 
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => handleView(evento)}
            >
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg leading-tight text-text-primary break-words">
                        {evento.nomeEvento || evento.cliente.nome}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-text-secondary">
                        <span className="block text-text-primary font-medium truncate lg:whitespace-normal">
                          {evento.cliente.nome}
                        </span>
                        <span className="block text-xs text-text-secondary truncate lg:whitespace-normal">
                          {evento.contratante}
                        </span>
                      </CardDescription>
                    </div>
                    <span className={`mt-2 lg:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(evento.status)} shrink-0`}>
                      {evento.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-text-secondary">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })} - {evento.diaSemana}
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {evento.local}
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {evento.numeroConvidados} convidados
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-text-primary">{evento.tipoEvento}</span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyInfo(evento);
                        }}
                        title="Copiar informações"
                        className={eventoCopiado === evento.id ? 'bg-success-bg text-success-text' : 'hover:bg-info/10 hover:text-info'}
                      >
                        {eventoCopiado === evento.id ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(evento);
                        }}
                        title="Visualizar"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(evento);
                        }}
                        title="Editar"
                        className="hover:bg-accent/10 hover:text-accent"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(evento);
                        }}
                        title="Excluir"
                        className="hover:bg-error/10 hover:text-error"
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

        {sortedEventos.length === 0 && (
          <Card className="bg-surface/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">Nenhum evento encontrado</h3>
              <p className="mt-1 text-sm text-text-secondary">
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
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 modal-card">
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
                    variant="outline"
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
