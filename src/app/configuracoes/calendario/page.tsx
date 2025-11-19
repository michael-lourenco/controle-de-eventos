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
import { useToast } from '@/components/ui/toast';
import { GoogleCalendarSyncStatus } from '@/types/google-calendar';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

function GoogleCalendarConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GoogleCalendarSyncStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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

  // Carregar status
  useEffect(() => {
    loadStatus();
  }, []);

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
              </>
            )}
          </CardContent>
        </Card>

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

