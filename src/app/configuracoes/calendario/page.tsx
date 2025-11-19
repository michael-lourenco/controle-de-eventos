'use client';

/**
 * Página de configuração do Google Calendar
 * 
 * Esta página é opcional e não quebra o sistema se não estiver configurada.
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { GoogleCalendarSyncStatus } from '@/types/google-calendar';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  CalendarIcon,
  PlusIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function GoogleCalendarConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GoogleCalendarSyncStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  // Estados do formulário de evento
  const [showEventForm, setShowEventForm] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    summary: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: ''
  });

  // Estados de debug
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Estados para etapas detalhadas
  const [detailedSteps, setDetailedSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(true); // Sempre mostrar por padrão

  // Verificar mensagens da URL
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected' || success === 'already_connected') {
      showToast('Google Calendar conectado com sucesso!', 'success');
      // Recarregar status após sucesso
      loadStatus();
      // Limpar URL
      router.replace('/configuracoes/calendario');
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'Seu plano não permite usar Google Calendar. Esta funcionalidade está disponível apenas para planos Profissional e Enterprise.',
        'user_cancelled': 'Conexão cancelada pelo usuário.',
        'no_code': 'Código de autorização não recebido.',
        'invalid_state': 'Estado de segurança inválido. Tente novamente.',
      };
      
      // Verificar se é erro de código já usado
      const errorLower = error.toLowerCase();
      if (errorLower.includes('invalid_grant') || errorLower.includes('código de autorização inválido')) {
        showToast(
          'Código de autorização inválido. Se você já autorizou antes, tente desconectar e conectar novamente.',
          'error'
        );
      } else {
        showToast(
          errorMessages[error] || `Erro: ${error}`,
          'error'
        );
      }
      // Limpar URL
      router.replace('/configuracoes/calendario');
    }
  }, [searchParams, router, showToast]);

  // Carregar etapas detalhadas
  const loadDetailedSteps = async () => {
    try {
      setLoadingSteps(true);
      const response = await fetch('/api/google-calendar/detailed-status');
      
      if (response.ok) {
        const data = await response.json();
        setDetailedSteps(data.steps || []);
      } else {
        const error = await response.json();
        console.error('Erro ao carregar etapas detalhadas:', error);
      }
    } catch (error: any) {
      console.error('Erro ao carregar etapas detalhadas:', error);
    } finally {
      setLoadingSteps(false);
    }
  };

  // Carregar status
  useEffect(() => {
    loadStatus();
    loadDetailedSteps(); // Carregar etapas ao montar componente
  }, []);

  // Carregar informações de debug quando status mudar
  useEffect(() => {
    if (status?.connected) {
      loadDebugInfo();
      loadDetailedSteps();
    }
  }, [status?.connected]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/google-calendar/status');
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        const error = await response.json();
        showToast(error.message || 'Erro ao carregar status', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao carregar status:', error);
      showToast('Erro ao carregar status do Google Calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDebugInfo = async () => {
    try {
      setLoadingDebug(true);
      const response = await fetch('/api/google-calendar/debug');
      
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data);
      } else {
        const error = await response.json();
        console.error('Erro ao carregar debug:', error);
      }
    } catch (error: any) {
      console.error('Erro ao carregar informações de debug:', error);
    } finally {
      setLoadingDebug(false);
    }
  };

  const handleConnect = async (force: boolean = false) => {
    try {
      setConnecting(true);
      // Redirecionar para iniciar OAuth
      // Se force=true, forçar nova autorização mesmo se já autorizou antes
      const url = force 
        ? '/api/google-calendar/auth?force=true'
        : '/api/google-calendar/auth';
      window.location.href = url;
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      showToast('Erro ao iniciar conexão', 'error');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Google Calendar?')) {
      return;
    }

    try {
      setDisconnecting(true);
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST'
      });

      if (response.ok) {
        showToast('Conta desconectada com sucesso', 'success');
        await loadStatus();
      } else {
        const error = await response.json();
        showToast(error.message || 'Erro ao desconectar', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao desconectar:', error);
      showToast('Erro ao desconectar conta', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleToggleSync = async () => {
    if (!status?.connected) return;

    try {
      const response = await fetch('/api/google-calendar/toggle-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          syncEnabled: !status.syncEnabled
        })
      });

      if (response.ok) {
        showToast(
          status.syncEnabled 
            ? 'Sincronização desativada' 
            : 'Sincronização ativada',
          'success'
        );
        await loadStatus();
      } else {
        const error = await response.json();
        showToast(error.message || 'Erro ao alterar sincronização', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao alterar sincronização:', error);
      showToast('Erro ao alterar sincronização', 'error');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status?.connected || !status?.syncEnabled) {
      showToast('Conecte e ative a sincronização primeiro', 'error');
      return;
    }

    if (!eventForm.summary.trim()) {
      showToast('Título do evento é obrigatório', 'error');
      return;
    }

    if (!eventForm.startDateTime) {
      showToast('Data/hora de início é obrigatória', 'error');
      return;
    }

    try {
      setCreatingEvent(true);
      
      const response = await fetch('/api/google-calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: eventForm.summary,
          description: eventForm.description,
          startDateTime: eventForm.startDateTime,
          endDateTime: eventForm.endDateTime || eventForm.startDateTime,
          location: eventForm.location,
          timeZone: 'America/Sao_Paulo'
        })
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Evento criado com sucesso no Google Calendar!', 'success');
        // Limpar formulário
        setEventForm({
          summary: '',
          description: '',
          startDateTime: '',
          endDateTime: '',
          location: ''
        });
        setShowEventForm(false);
      } else {
        const error = await response.json();
        showToast(error.message || 'Erro ao criar evento', 'error');
      }
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      showToast('Erro ao criar evento no Google Calendar', 'error');
    } finally {
      setCreatingEvent(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Google Calendar</h1>
          <p className="text-text-secondary mt-2">
            Conecte sua conta do Google para sincronizar eventos automaticamente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              Gerencie sua integração com o Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verificação de Plano */}
            <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
              <div className="flex items-center gap-3">
                {status?.planAllowed ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-text-primary">
                    Acesso ao Google Calendar
                  </p>
                  <p className="text-sm text-text-secondary">
                    {status?.planAllowed
                      ? 'Seu plano permite usar esta funcionalidade'
                      : 'Esta funcionalidade está disponível apenas para planos Profissional e Enterprise'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status da Conexão */}
            {status?.planAllowed && (
              <>
                <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    {status.connected ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-text-primary">
                        {status.connected ? 'Conectado' : 'Não Conectado'}
                      </p>
                      {status.email && (
                        <p className="text-sm text-text-secondary">
                          {status.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Última Sincronização */}
                {status.lastSyncAt && (
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <p className="text-sm text-text-secondary">
                      Última sincronização:{' '}
                      <span className="font-medium text-text-primary">
                        {new Date(status.lastSyncAt).toLocaleString('pt-BR')}
                      </span>
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-4 flex-wrap">
                  {!status.connected ? (
                    <>
                      <Button
                        onClick={() => handleConnect(false)}
                        disabled={connecting}
                        className="bg-primary hover:bg-accent hover:text-white"
                      >
                        {connecting ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-5 w-5 mr-2" />
                            Conectar Google Calendar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleConnect(true)}
                        disabled={connecting}
                        variant="outline"
                        className="text-text-secondary"
                      >
                        {connecting ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-5 w-5 mr-2" />
                            Forçar Nova Conexão
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleToggleSync}
                        variant={status.syncEnabled ? 'default' : 'outline'}
                        className={status.syncEnabled 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : ''
                        }
                      >
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        {status.syncEnabled ? 'Sincronização Ativa' : 'Ativar Sincronização'}
                      </Button>
                      <Button
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        {disconnecting ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                            Desconectando...
                          </>
                        ) : (
                          'Desconectar'
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* Seção de Etapas Detalhadas - Todas as Etapas do Processo */}
                <div className="mt-6">
                  <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
                            Etapas do Processo - Diagnóstico Completo
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Visualize todas as etapas e retornos do processo de conexão e validação do Google Calendar
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={loadDetailedSteps}
                            disabled={loadingSteps}
                            variant="outline"
                            size="sm"
                          >
                            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loadingSteps ? 'animate-spin' : ''}`} />
                            Atualizar
                          </Button>
                          <Button
                            onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                            variant="outline"
                            size="sm"
                          >
                            {showDetailedSteps ? 'Ocultar' : 'Mostrar'} Etapas
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {showDetailedSteps && (
                      <CardContent>
                        {loadingSteps ? (
                          <div className="flex items-center justify-center py-8">
                            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                            <span className="text-text-secondary">Carregando etapas...</span>
                          </div>
                        ) : detailedSteps.length === 0 ? (
                          <div className="text-center py-8 text-text-secondary">
                            Nenhuma etapa executada ainda. Conecte o Google Calendar para ver as etapas.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {detailedSteps.map((step: any, index: number) => {
                              const getStatusColor = () => {
                                switch (step.status) {
                                  case 'success':
                                    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                                  case 'error':
                                    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                                  case 'warning':
                                    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
                                  default:
                                    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
                                }
                              };
                              
                              const getStatusIcon = () => {
                                switch (step.status) {
                                  case 'success':
                                    return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
                                  case 'error':
                                    return <XCircleIcon className="h-5 w-5 text-red-600" />;
                                  case 'warning':
                                    return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
                                  default:
                                    return <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />;
                                }
                              };
                              
                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-lg border-2 ${getStatusColor()}`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      {getStatusIcon()}
                                      <h3 className="font-semibold text-text-primary">{step.step}</h3>
                                    </div>
                                    <span className="text-xs text-text-secondary">
                                      {new Date(step.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  
                                  <p className={`text-sm mb-3 ${
                                    step.status === 'success' ? 'text-green-700 dark:text-green-400' :
                                    step.status === 'error' ? 'text-red-700 dark:text-red-400' :
                                    step.status === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                                    'text-text-secondary'
                                  }`}>
                                    {step.message}
                                  </p>
                                  
                                  {step.details && (
                                    <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                      <p className="text-xs font-semibold text-text-secondary mb-2">Detalhes:</p>
                                      <pre className="text-xs overflow-auto max-h-64 bg-gray-100 dark:bg-gray-800 p-3 rounded">
                                        {JSON.stringify(step.details, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </div>

                {/* Seção de Debug - Informações Detalhadas */}
                {status.connected && (
                  <div className="mt-6">
                    <Card className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <InformationCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <CardTitle className="text-lg">Informações de Debug (Desenvolvimento)</CardTitle>
                          </div>
                          <Button
                            onClick={() => {
                              setShowDebug(!showDebug);
                              if (!showDebug && !debugInfo) {
                                loadDebugInfo();
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            {showDebug ? 'Ocultar' : 'Mostrar'} Debug
                          </Button>
                        </div>
                        <CardDescription>
                          Informações detalhadas sobre tokens e conexão para debug
                        </CardDescription>
                      </CardHeader>
                      {showDebug && (
                        <CardContent>
                          {loadingDebug ? (
                            <div className="flex items-center justify-center py-8">
                              <ArrowPathIcon className="h-6 w-6 animate-spin text-primary mr-2" />
                              <span>Carregando informações de debug...</span>
                            </div>
                          ) : debugInfo ? (
                            <div className="space-y-4">
                              {/* Variáveis de Ambiente */}
                              {debugInfo.environment && (
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                  <h3 className="font-semibold text-text-primary mb-2">⚙️ Configuração do Ambiente</h3>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      <span className="font-medium">GOOGLE_CLIENT_ID:</span>{' '}
                                      <span className={debugInfo.environment.hasClientId ? 'text-green-600' : 'text-red-600'}>
                                        {debugInfo.environment.hasClientId ? '✅ Configurado' : '❌ Não configurado'}
                                      </span>
                                      {debugInfo.environment.hasClientId && (
                                        <>
                                          <span className="text-text-secondary ml-2">({debugInfo.environment.clientIdPreview})</span>
                                          <br />
                                          <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1 inline-block">
                                            {debugInfo.environment.clientId}
                                          </code>
                                        </>
                                      )}
                                    </p>
                                    <p>
                                      <span className="font-medium">GOOGLE_CLIENT_SECRET:</span>{' '}
                                      <span className={debugInfo.environment.hasClientSecret ? 'text-green-600' : 'text-red-600'}>
                                        {debugInfo.environment.hasClientSecret ? '✅ Configurado' : '❌ Não configurado'}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium">GOOGLE_REDIRECT_URI:</span>{' '}
                                      <span className={debugInfo.environment.hasRedirectUri ? 'text-green-600' : 'text-red-600'}>
                                        {debugInfo.environment.hasRedirectUri ? '✅ Configurado' : '❌ Não configurado'}
                                      </span>
                                      {debugInfo.environment.hasRedirectUri && (
                                        <span className="text-text-secondary ml-2">({debugInfo.environment.redirectUri})</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Informações do Usuário */}
                              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-semibold text-text-primary mb-2">👤 Usuário do Sistema</h3>
                                <div className="space-y-1 text-sm">
                                  <p><span className="font-medium">ID:</span> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{debugInfo.user?.id}</code></p>
                                  <p><span className="font-medium">Nome:</span> {debugInfo.user?.name}</p>
                                  <p><span className="font-medium">Email:</span> {debugInfo.user?.email}</p>
                                </div>
                              </div>

                              {/* Informações do Token */}
                              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-semibold text-text-primary mb-2">🔑 Token do Google Calendar</h3>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Token ID:</span>
                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-2">{debugInfo.token?.id}</code>
                                  </div>
                                  <div>
                                    <span className="font-medium">Access Token:</span>
                                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
                                      {debugInfo.token?.accessToken || 'Não disponível'}
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">
                                      Preview: {debugInfo.token?.accessTokenPreview}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Refresh Token:</span>
                                    <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs break-all">
                                      {debugInfo.token?.refreshToken || 'Não disponível'}
                                    </div>
                                    <p className="text-xs text-text-secondary mt-1">
                                      Preview: {debugInfo.token?.refreshTokenPreview}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <span className="font-medium">Expira em:</span>
                                      <p className="text-text-secondary">{debugInfo.token?.expiresAtFormatted}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Status:</span>
                                      <p className={debugInfo.token?.isExpired ? 'text-red-600' : 'text-green-600'}>
                                        {debugInfo.token?.isExpired ? '❌ Expirado' : `✅ Válido (${debugInfo.token?.minutesUntilExpiry} min restantes)`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <span className="font-medium">Calendar ID:</span>
                                      <p className="text-text-secondary">{debugInfo.token?.calendarId || 'primary'}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Sincronização:</span>
                                      <p className={debugInfo.token?.syncEnabled ? 'text-green-600' : 'text-gray-600'}>
                                        {debugInfo.token?.syncEnabled ? '✅ Ativa' : '❌ Inativa'}
                                      </p>
                                    </div>
                                  </div>
                                  {debugInfo.token?.lastSyncAtFormatted && (
                                    <div>
                                      <span className="font-medium">Última Sincronização:</span>
                                      <p className="text-text-secondary">{debugInfo.token?.lastSyncAtFormatted}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Informações do Calendário */}
                              {debugInfo.calendarInfo && (
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                  <h3 className="font-semibold text-text-primary mb-2">📅 Informações do Calendário</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Email:</span> {debugInfo.calendarInfo.email}</p>
                                    <p><span className="font-medium">Calendar ID:</span> <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{debugInfo.calendarInfo.calendarId}</code></p>
                                  </div>
                                </div>
                              )}

                              {/* Erro do Calendário */}
                              {debugInfo.calendarError && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">❌ Erro ao Obter Informações do Calendário</h3>
                                  <div className="space-y-1 text-sm text-red-600 dark:text-red-400">
                                    <p><span className="font-medium">Mensagem:</span> {debugInfo.calendarError.message}</p>
                                    {debugInfo.calendarError.code && (
                                      <p><span className="font-medium">Código:</span> {debugInfo.calendarError.code}</p>
                                    )}
                                    {debugInfo.calendarError.status && (
                                      <p><span className="font-medium">Status HTTP:</span> {debugInfo.calendarError.status}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Validação do Token */}
                              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                                <h3 className="font-semibold text-text-primary mb-2">✅ Validação do Token</h3>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span className={debugInfo.tokenValidation?.valid ? 'text-green-600' : 'text-red-600'}>
                                      {debugInfo.tokenValidation?.valid ? '✅ Token Válido' : '❌ Token Inválido'}
                                    </span>
                                  </p>
                                  {debugInfo.tokenValidation?.error && (
                                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                      <p className="text-red-600 dark:text-red-400 text-xs font-medium mb-2">Erro de Validação:</p>
                                      <div className="space-y-1 text-xs">
                                        <p className="text-red-600 dark:text-red-400">
                                          <span className="font-medium">Mensagem:</span> {debugInfo.tokenValidation.error.message}
                                        </p>
                                        {debugInfo.tokenValidation.error.code && (
                                          <p className="text-red-600 dark:text-red-400">
                                            <span className="font-medium">Código:</span> {debugInfo.tokenValidation.error.code}
                                          </p>
                                        )}
                                        {debugInfo.tokenValidation.error.status && (
                                          <p className="text-red-600 dark:text-red-400">
                                            <span className="font-medium">Status HTTP:</span> {debugInfo.tokenValidation.error.status}
                                          </p>
                                        )}
                                        {debugInfo.tokenValidation.error.response && (
                                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                                            <p className="text-red-700 dark:text-red-300 text-xs font-medium mb-1">Resposta da API:</p>
                                            <pre className="text-xs overflow-auto max-h-32">
                                              {JSON.stringify(debugInfo.tokenValidation.error.response, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {debugInfo.tokenValidation?.testDetails && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                      <p className="text-blue-600 dark:text-blue-400 text-xs font-medium mb-2">Detalhes do Teste:</p>
                                      <div className="space-y-1 text-xs">
                                        {debugInfo.tokenValidation.testDetails.success ? (
                                          <>
                                            <p className="text-green-600 dark:text-green-400">
                                              ✅ Teste bem-sucedido
                                            </p>
                                        {debugInfo.tokenValidation.testDetails.calendarEmail && (
                                          <p className="text-text-secondary">
                                            <span className="font-medium">Email do Calendário:</span> {debugInfo.tokenValidation.testDetails.calendarEmail}
                                          </p>
                                        )}
                                        {debugInfo.tokenValidation.testDetails.calendarApiTest && (
                                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                            <p className="text-xs font-medium mb-1">Teste Direto na API do Calendar (Fetch):</p>
                                            <p className={`text-xs ${debugInfo.tokenValidation.testDetails.calendarApiTest.success ? 'text-green-600' : 'text-red-600'}`}>
                                              <span className="font-medium">Status HTTP:</span> {debugInfo.tokenValidation.testDetails.calendarApiTest.httpStatus} ({debugInfo.tokenValidation.testDetails.calendarApiTest.httpStatusText})
                                              {debugInfo.tokenValidation.testDetails.calendarApiTest.success ? ' ✅' : ' ❌'}
                                            </p>
                                            {debugInfo.tokenValidation.testDetails.calendarApiTest.response && (
                                              <pre className="text-xs overflow-auto max-h-32 mt-2">
                                                {JSON.stringify(debugInfo.tokenValidation.testDetails.calendarApiTest.response, null, 2)}
                                              </pre>
                                            )}
                                          </div>
                                        )}
                                        {debugInfo.tokenValidation.testDetails.oauth2ClientTest && (
                                          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                            <p className="text-xs font-medium mb-1">Teste com OAuth2Client (googleapis):</p>
                                            {debugInfo.tokenValidation.testDetails.oauth2ClientTest.success ? (
                                              <div>
                                                <p className="text-xs text-green-600">
                                                  ✅ Teste bem-sucedido
                                                </p>
                                                {debugInfo.tokenValidation.testDetails.oauth2ClientTest.calendarEmail && (
                                                  <p className="text-xs text-text-secondary">
                                                    <span className="font-medium">Email:</span> {debugInfo.tokenValidation.testDetails.oauth2ClientTest.calendarEmail}
                                                  </p>
                                                )}
                                              </div>
                                            ) : (
                                              <div>
                                                <p className="text-xs text-red-600">
                                                  ❌ Teste falhou
                                                </p>
                                                {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error && (
                                                  <div className="mt-2">
                                                    <p className="text-xs text-red-600">
                                                      <span className="font-medium">Erro:</span> {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.message}
                                                    </p>
                                                    {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.code && (
                                                      <p className="text-xs text-red-600">
                                                        <span className="font-medium">Código:</span> {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.code}
                                                      </p>
                                                    )}
                                                    {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.status && (
                                                      <p className="text-xs text-red-600">
                                                        <span className="font-medium">Status HTTP:</span> {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.status}
                                                      </p>
                                                    )}
                                                    {debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.response && (
                                                      <pre className="text-xs overflow-auto max-h-32 mt-2">
                                                        {JSON.stringify(debugInfo.tokenValidation.testDetails.oauth2ClientTest.error.response, null, 2)}
                                                      </pre>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                          </>
                                        ) : (
                                          <>
                                            <p className="text-red-600 dark:text-red-400">
                                              ❌ Teste falhou
                                            </p>
                                            {debugInfo.tokenValidation.testDetails.tokenInfo && (
                                              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                <p className="text-xs font-medium mb-1">Informações do Token (Google API):</p>
                                                <pre className="text-xs overflow-auto max-h-32">
                                                  {JSON.stringify(debugInfo.tokenValidation.testDetails.tokenInfo, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                            {debugInfo.tokenValidation.testDetails.clientIdValidation && (
                                              <div className={`mt-2 p-2 rounded ${debugInfo.tokenValidation.testDetails.clientIdValidation.match ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500'}`}>
                                                <p className={`text-xs font-medium mb-1 ${debugInfo.tokenValidation.testDetails.clientIdValidation.match ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                                                  {debugInfo.tokenValidation.testDetails.clientIdValidation.match ? '✅ Client ID corresponde' : '⚠️ Client ID não corresponde!'}
                                                </p>
                                                <div className="space-y-1 text-xs">
                                                  <p className="text-text-secondary">
                                                    <span className="font-medium">Client ID do Token:</span>{' '}
                                                    <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                                                      {debugInfo.tokenValidation.testDetails.clientIdValidation.tokenClientId || 'N/A'}
                                                    </code>
                                                  </p>
                                                  <p className="text-text-secondary">
                                                    <span className="font-medium">Client ID Configurado:</span>{' '}
                                                    <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                                                      {debugInfo.tokenValidation.testDetails.clientIdValidation.configuredClientId || 'N/A'}
                                                    </code>
                                                  </p>
                                                  {debugInfo.tokenValidation.testDetails.clientIdValidation.warning && (
                                                    <p className="text-yellow-700 dark:text-yellow-400 font-medium mt-2">
                                                      {debugInfo.tokenValidation.testDetails.clientIdValidation.warning}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            {debugInfo.tokenValidation.testDetails.httpStatus && (
                                              <p className="text-text-secondary">
                                                <span className="font-medium">Status HTTP:</span> {debugInfo.tokenValidation.testDetails.httpStatus}
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Botões de Ação */}
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={async () => {
                                    try {
                                      setLoadingDebug(true);
                                      const response = await fetch('/api/google-calendar/refresh-token', {
                                        method: 'POST'
                                      });
                                      const data = await response.json();
                                      
                                      if (response.ok) {
                                        showToast('Token renovado com sucesso!', 'success');
                                        await loadDebugInfo();
                                      } else {
                                        showToast(data.message || 'Erro ao renovar token', 'error');
                                        if (data.requiresReconnect) {
                                          showToast('Por favor, desconecte e conecte novamente sua conta do Google Calendar', 'error');
                                        }
                                      }
                                    } catch (error: any) {
                                      console.error('Erro ao renovar token:', error);
                                      showToast('Erro ao renovar token', 'error');
                                    } finally {
                                      setLoadingDebug(false);
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  disabled={loadingDebug}
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                  <ArrowPathIcon className={`h-4 w-4 mr-2 ${loadingDebug ? 'animate-spin' : ''}`} />
                                  Forçar Renovação do Token
                                </Button>
                                <Button
                                  onClick={loadDebugInfo}
                                  variant="outline"
                                  size="sm"
                                  disabled={loadingDebug}
                                >
                                  <ArrowPathIcon className={`h-4 w-4 mr-2 ${loadingDebug ? 'animate-spin' : ''}`} />
                                  Recarregar Informações
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-text-secondary">
                              <p>Nenhuma informação de debug disponível</p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Criação de Evento */}
        {status?.connected && status?.syncEnabled && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Criar Evento no Google Calendar</CardTitle>
                  <CardDescription>
                    Crie eventos diretamente na sua agenda sincronizada
                  </CardDescription>
                </div>
                {!showEventForm && (
                  <Button
                    onClick={() => setShowEventForm(true)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Novo Evento
                  </Button>
                )}
              </div>
            </CardHeader>
            {showEventForm && (
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <Input
                    label="Título do Evento *"
                    placeholder="Ex: Reunião com cliente"
                    value={eventForm.summary}
                    onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })}
                    required
                  />

                  <Textarea
                    label="Descrição"
                    placeholder="Detalhes do evento..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Data/Hora de Início *"
                      type="datetime-local"
                      value={eventForm.startDateTime}
                      onChange={(e) => setEventForm({ ...eventForm, startDateTime: e.target.value })}
                      required
                    />

                    <Input
                      label="Data/Hora de Término"
                      type="datetime-local"
                      value={eventForm.endDateTime}
                      onChange={(e) => setEventForm({ ...eventForm, endDateTime: e.target.value })}
                    />
                  </div>

                  <Input
                    label="Localização"
                    placeholder="Ex: Rua das Flores, 123 - São Paulo, SP"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowEventForm(false);
                        setEventForm({
                          summary: '',
                          description: '',
                          startDateTime: '',
                          endDateTime: '',
                          location: ''
                        });
                      }}
                      disabled={creatingEvent}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={creatingEvent}
                      className="bg-primary hover:bg-accent hover:text-white"
                    >
                      {creatingEvent ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Criar Evento
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        )}

        {/* Informações */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-text-secondary">
              <li>• Eventos criados no Clicksehub serão automaticamente adicionados ao seu Google Calendar</li>
              <li>• Alterações nos eventos também serão sincronizadas</li>
              <li>• Eventos arquivados serão removidos do Google Calendar</li>
              <li>• Apenas data/hora de início é sincronizada nesta versão</li>
              <li>• Você também pode criar eventos diretamente no Google Calendar usando o formulário acima</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default function GoogleCalendarConfigPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    }>
      <GoogleCalendarConfigContent />
    </Suspense>
  );
}

