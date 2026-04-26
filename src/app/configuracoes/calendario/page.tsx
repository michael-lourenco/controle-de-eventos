'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { GoogleCalendarSyncStatus } from '@/types/google-calendar';

export default function GoogleCalendarConfigPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<GoogleCalendarSyncStatus | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [processandoAcao, setProcessandoAcao] = useState(false);

  async function carregarStatus() {
    setCarregando(true);
    try {
      const response = await fetch('/api/google-calendar/status');
      const json = await response.json();
      const dados = json?.data ?? json;
      setStatus(dados);
    } catch {
      showToast('Não foi possível carregar o status do Google Calendar.', 'error');
    } finally {
      setCarregando(false);
    }
  }

  async function conectar() {
    window.location.href = '/api/google-calendar/auth';
  }

  async function desconectar() {
    setProcessandoAcao(true);
    try {
      const response = await fetch('/api/google-calendar/disconnect', {
        method: 'POST'
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao desconectar');
      }

      showToast('Conta desconectada com sucesso.', 'success');
      await carregarStatus();
    } catch (error: any) {
      showToast(error?.message || 'Não foi possível desconectar.', 'error');
    } finally {
      setProcessandoAcao(false);
    }
  }

  async function alternarSync() {
    if (!status) return;

    setProcessandoAcao(true);
    try {
      const response = await fetch('/api/google-calendar/toggle-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncEnabled: !status.syncEnabled })
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao atualizar sincronização');
      }

      showToast(!status.syncEnabled ? 'Sincronização ativada.' : 'Sincronização desativada.', 'success');
      await carregarStatus();
    } catch (error: any) {
      showToast(error?.message || 'Não foi possível atualizar a sincronização.', 'error');
    } finally {
      setProcessandoAcao(false);
    }
  }

  useEffect(() => {
    carregarStatus();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Google Calendar</h1>

          <Card>
            <CardHeader>
              <CardTitle>Integração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carregando ? (
                <p className="text-text-secondary">Carregando status...</p>
              ) : (
                <>
                  <p className="text-text-secondary">
                    {status?.planAllowed === false
                      ? 'Seu plano atual não possui acesso a esta funcionalidade.'
                      : status?.connected
                        ? 'Conta conectada com sucesso.'
                        : 'Nenhuma conta conectada no momento.'}
                  </p>

                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>
                      <strong>Conectado:</strong> {status?.connected ? 'Sim' : 'Não'}
                    </p>
                    <p>
                      <strong>Sincronização ativa:</strong> {status?.syncEnabled ? 'Sim' : 'Não'}
                    </p>
                    <p>
                      <strong>Plano permitido:</strong> {status?.planAllowed ? 'Sim' : 'Não'}
                    </p>
                    {status?.email ? (
                      <p>
                        <strong>Conta Google:</strong> {status.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!status?.connected ? (
                      <Button onClick={conectar} disabled={processandoAcao || status?.planAllowed === false}>
                        Conectar Google Calendar
                      </Button>
                    ) : (
                      <>
                        <Button onClick={alternarSync} disabled={processandoAcao}>
                          {status?.syncEnabled ? 'Desativar sincronização' : 'Ativar sincronização'}
                        </Button>
                        <Button variant="destructive" onClick={desconectar} disabled={processandoAcao}>
                          Desconectar conta
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={carregarStatus} disabled={carregando || processandoAcao}>
                      Atualizar status
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
