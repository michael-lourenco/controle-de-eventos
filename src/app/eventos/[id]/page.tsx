'use client';

import React, { useState, useEffect } from 'react';
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
import { 
  getEventoById, 
  deleteEvento, 
  getPagamentosByEventoId, 
  getCustosByEventoId,
  getAnexosByEventoId
} from '@/lib/mockData';
import { Evento, Pagamento, CustoEvento, AnexoEvento } from '@/types';
import PagamentoHistorico from '@/components/PagamentoHistorico';
import CustosEvento from '@/components/CustosEvento';
import AnexosEvento from '@/components/AnexosEvento';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventoViewPage() {
  const params = useParams();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [custos, setCustos] = useState<CustoEvento[]>([]);
  const [anexos, setAnexos] = useState<AnexoEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.id) {
      const eventoEncontrado = getEventoById(params.id as string);
      setEvento(eventoEncontrado || null);
      
      if (eventoEncontrado) {
        const pagamentosEvento = getPagamentosByEventoId(eventoEncontrado.id);
        const custosEvento = getCustosByEventoId(eventoEncontrado.id);
        const anexosEvento = getAnexosByEventoId(eventoEncontrado.id);
        setPagamentos(pagamentosEvento);
        setCustos(custosEvento);
        setAnexos(anexosEvento);
      }
      
      setLoading(false);
    }
  }, [params.id]);

  const handlePagamentosChange = () => {
    if (params.id) {
      const pagamentosEvento = getPagamentosByEventoId(params.id as string);
      setPagamentos(pagamentosEvento);
    }
  };

  const handleCustosChange = () => {
    if (params.id) {
      const custosEvento = getCustosByEventoId(params.id as string);
      setCustos(custosEvento);
    }
  };

  const handleAnexosChange = () => {
    if (params.id) {
      const anexosEvento = getAnexosByEventoId(params.id as string);
      setAnexos(anexosEvento);
    }
  };

  const handleEdit = () => {
    router.push(`/eventos/${params.id}/editar`);
  };

  const handleDelete = () => {
    if (evento) {
      const sucesso = deleteEvento(evento.id);
      if (sucesso) {
        router.push('/eventos');
      }
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando evento...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!evento) {
    return (
      <Layout>
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Evento não encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
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
              <h1 className="text-2xl font-bold text-gray-900">{evento.cliente.nome}</h1>
              <p className="text-gray-600">{evento.contratante}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(evento.status)}`}>
            {evento.status}
          </span>
          <span className="text-sm text-gray-500">
            Criado em {format(evento.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">{evento.cliente.nome}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.cliente.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.cliente.telefone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.cliente.endereco}
              </div>
              {evento.cliente.instagram && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📷</span>
                  {evento.cliente.instagram}
                </div>
              )}
              {evento.cliente.comoConheceu && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Como conheceu:</span> {evento.cliente.comoConheceu}
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
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span className="font-medium">
                  {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })} - {evento.diaSemana}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.local}
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium">Endereço:</div>
                {evento.endereco}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.horarioInicio} - {evento.horarioTerminoServico}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                {evento.numeroConvidados} convidados
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-900">Tipo:</span> {evento.tipoEvento}
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
                  <span className="font-medium text-gray-900">Início do Serviço:</span>
                  <div className="text-gray-600">{evento.horarioInicioServico}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Término do Serviço:</span>
                  <div className="text-gray-600">{evento.horarioTerminoServico}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Desmontagem:</span>
                  <div className="text-gray-600">{evento.horarioDesmontagem}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Duração:</span>
                  <div className="text-gray-600">{evento.tempoEvento}</div>
                </div>
              </div>
              
              {evento.quantidadeMesas && (
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Mesas:</span> {evento.quantidadeMesas}
                </div>
              )}
              
              {evento.numeroImpressoes && (
                <div className="flex items-center text-sm text-gray-600">
                  <PrinterIcon className="h-4 w-4 mr-2 text-gray-400" />
                  {evento.numeroImpressoes} impressões
                </div>
              )}
              
              {evento.hashtag && (
                <div className="flex items-center text-sm text-gray-600">
                  <HashtagIcon className="h-4 w-4 mr-2 text-gray-400" />
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
                  <span className="font-medium text-gray-900">Nome:</span> {evento.cerimonialista.nome}
                </div>
                <div className="text-sm text-gray-600">
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
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{evento.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Histórico de Pagamentos */}
        <PagamentoHistorico
          eventoId={evento.id}
          pagamentos={pagamentos}
          onPagamentosChange={handlePagamentosChange}
        />

        {/* Custos do Evento */}
        <CustosEvento
          evento={evento}
          custos={custos}
          onCustosChange={handleCustosChange}
        />

        {/* Anexos do Evento */}
        <AnexosEvento
          evento={evento}
          anexos={anexos}
          onAnexosChange={handleAnexosChange}
        />

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
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
                    variant="destructive"
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
