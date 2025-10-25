'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/Layout';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  HashtagIcon,
  PrinterIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useEvento, usePagamentosPorEvento, useCustosPorEvento, useServicosPorEvento } from '@/hooks/useData';
import { useAnexos } from '@/hooks/useAnexos';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { AnexoEvento } from '@/types';
import PagamentoHistorico from '@/components/PagamentoHistorico';
import CustosEvento from '@/components/CustosEvento';
import ServicosEvento from '@/components/ServicosEvento';
import AnexosEvento from '@/components/AnexosEvento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventoViewPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useCurrentUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: evento, loading: loadingEvento, error: errorEvento } = useEvento(params.id as string);
  const { data: pagamentos, loading: loadingPagamentos, refetch: refetchPagamentos } = usePagamentosPorEvento(params.id as string);
  const { data: custos, loading: loadingCustos, refetch: refetchCustos } = useCustosPorEvento(params.id as string);
  const { data: servicos, loading: loadingServicos, refetch: refetchServicos } = useServicosPorEvento(params.id as string);
  const { anexos, loading: loadingAnexos, refetch: refetchAnexos } = useAnexos(params.id as string);
  
  const loading = loadingEvento || loadingPagamentos || loadingCustos || loadingServicos || loadingAnexos;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando evento...</div>
        </div>
      </Layout>
    );
  }

  if (errorEvento) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">Erro ao carregar evento: {errorEvento}</div>
        </div>
      </Layout>
    );
  }

  if (!evento) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Evento não encontrado</div>
        </div>
      </Layout>
    );
  }

  const handleEdit = () => {
    router.push(`/eventos/${params.id}/editar`);
  };

  const handleDelete = async () => {
    if (evento) {
      try {
        if (!userId) {
          console.error('Usuário não autenticado');
          return;
        }
        
        await dataService.deleteEvento(evento.id, userId);
        router.push('/eventos');
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
      }
    }
  };

  const handlePagamentosChange = () => {
    // Função para recarregar pagamentos quando houver mudanças
    console.log('Pagamentos foram alterados - recarregando dados');
    refetchPagamentos();
  };

  const handleCustosChange = () => {
    // Função para recarregar custos quando houver mudanças
    console.log('Custos foram alterados - recarregando dados');
    refetchCustos();
  };

  const handleServicosChange = () => {
    // Função para recarregar serviços quando houver mudanças
    console.log('Serviços foram alterados - recarregando dados');
    refetchServicos();
  };

  const handleAnexosChange = () => {
    refetchAnexos();
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Carregando evento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!evento) {
    return (
      <Layout>
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-text-muted" />
          <h3 className="mt-2 text-sm font-medium text-text-primary">Evento não encontrado</h3>
          <p className="mt-1 text-sm text-text-secondary">
            O evento que você está procurando não existe ou foi removido.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/eventos')}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar para Eventos
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/eventos')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {evento.nomeEvento || evento.cliente.nome}
              </h1>
              <p className="text-text-secondary">
                {evento.nomeEvento ? `${evento.cliente.nome} - ${evento.contratante}` : evento.contratante}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Submenu de Navegação Rápida */}
        <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('basico');
                if (element) {
                  const offset = 120; // Altura do submenu + margem
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              BÁSICO
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('pagamentos');
                if (element) {
                  const offset = 120; // Altura do submenu + margem
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              PAGAMENTOS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('custos');
                if (element) {
                  const offset = 120; // Altura do submenu + margem
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              CUSTOS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('servicos');
                if (element) {
                  const offset = 120; // Altura do submenu + margem
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              SERVIÇOS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('anexos');
                if (element) {
                  const offset = 120; // Altura do submenu + margem
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              ANEXOS
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(evento.status)}`}>
            {evento.status}
          </span>
          <span className="text-sm text-text-muted">
            Criado em {format(evento.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        <div id="basico" className="grid grid-cols-1 gap-6 lg:grid-cols-2 pt-4">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <UserIcon className="h-4 w-4 mr-2 text-text-muted" />
                <span className="font-medium">{evento.cliente.nome}</span>
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.cliente.email}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <PhoneIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.cliente.telefone}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <HomeIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.cliente.endereco}
              </div>
              {evento.cliente.instagram && (
                <div className="flex items-center text-sm text-text-secondary">
                  <span className="mr-2">📷</span>
                  {evento.cliente.instagram}
                </div>
              )}
              {evento.cliente.canalEntrada && (
                <div className="text-sm text-text-secondary">
                  <span className="font-medium">Canal de Entrada:</span> {evento.cliente.canalEntrada.nome}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações do Evento */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-text-muted" />
                <span className="font-medium">
                  {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })} - {evento.diaSemana}
                </span>
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <MapPinIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.local}
              </div>
              <div className="text-sm text-text-secondary">
                <div className="font-medium">Endereço:</div>
                {evento.endereco}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <ClockIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.saida} - {evento.horarioInicio}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <UserGroupIcon className="h-4 w-4 mr-2 text-text-muted" />
                {evento.numeroConvidados} convidados
              </div>
              <div className="text-sm">
                <span className="font-medium text-text-primary">Tipo:</span> {evento.tipoEvento}
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-text-primary">Saída:</span>
                  <div className="text-text-secondary">{evento.saida}</div>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Chegada no local:</span>
                  <div className="text-text-secondary">{evento.chegadaNoLocal}</div>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Horário de início:</span>
                  <div className="text-text-secondary">{evento.horarioInicio}</div>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Horário de Desmontagem:</span>
                  <div className="text-text-secondary">{evento.horarioDesmontagem}</div>
                </div>
                <div>
                  <span className="font-medium text-text-primary">Duração:</span>
                  <div className="text-text-secondary">{evento.tempoEvento}</div>
                </div>
              </div>
              
              {evento.quantidadeMesas && (
                <div className="text-sm">
                  <span className="font-medium text-text-primary">Mesas:</span> {evento.quantidadeMesas}
                </div>
              )}
              
              {evento.numeroImpressoes && (
                <div className="flex items-center text-sm text-text-secondary">
                  <PrinterIcon className="h-4 w-4 mr-2 text-text-muted" />
                  {evento.numeroImpressoes} impressões
                </div>
              )}
              
              {evento.hashtag && (
                <div className="flex items-center text-sm text-text-secondary">
                  <HashtagIcon className="h-4 w-4 mr-2 text-text-muted" />
                  {evento.hashtag}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cerimonialista */}
          {evento.cerimonialista && (
            <Card>
              <CardHeader>
                <CardTitle>Cerimonialista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-text-primary">Nome:</span> {evento.cerimonialista.nome}
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="font-medium">Telefone:</span> {evento.cerimonialista.telefone}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {evento.observacoes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{evento.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Visão geral dos valores do evento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    R$ {evento.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </div>
                  <div className="text-sm text-text-secondary">Valor Total Cobrado</div>
                </div>
                <div className="text-center p-4 bg-surface/50 rounded-lg">
                  <div className="text-2xl font-bold text-error">
                    R$ {custos?.reduce((total, custo) => total + custo.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </div>
                  <div className="text-sm text-text-secondary">Total de Custos</div>
                </div>
                <div className="text-center p-4 bg-surface/50 rounded-lg">
                  <div className={`text-2xl font-bold ${(evento.valorTotal || 0) - (custos?.reduce((total, custo) => total + custo.valor, 0) || 0) >= 0 ? 'text-success' : 'text-error'}`}>
                    R$ {((evento.valorTotal || 0) - (custos?.reduce((total, custo) => total + custo.valor, 0) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-text-secondary">Estimativa de Lucro</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Pagamentos */}
        <div id="pagamentos" className="pt-4">
          <PagamentoHistorico
          eventoId={evento.id}
          pagamentos={pagamentos || []}
          onPagamentosChange={handlePagamentosChange}
          evento={evento}
        />
        </div>

        {/* Custos do Evento */}
        <div id="custos" className="pt-4">
          <CustosEvento
          evento={evento}
          custos={custos || []}
          onCustosChange={handleCustosChange}
        />
        </div>

        {/* Serviços do Evento */}
        <div id="servicos" className="pt-4">
          <ServicosEvento
          evento={evento}
          servicos={servicos || []}
          onServicosChange={handleServicosChange}
        />
        </div>

        {/* Anexos do Evento */}
        <div id="anexos" className="pt-4">
          <AnexosEvento
          evento={evento}
          anexos={anexos || []}
          onAnexosChange={handleAnexosChange}
        />
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 modal-card">
              <CardHeader>
                <CardTitle>Confirmar Exclusão</CardTitle>
                <CardDescription>
                  Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
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
