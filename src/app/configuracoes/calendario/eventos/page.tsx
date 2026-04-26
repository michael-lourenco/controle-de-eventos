'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { GoogleCalendarEvent } from '@/types/google-calendar';

function formatarData(data?: string) {
  if (!data) return 'N/A';
  const date = new Date(data);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('pt-BR');
}

export default function GoogleCalendarEventosPage() {
  const { showToast } = useToast();
  const [eventos, setEventos] = useState<GoogleCalendarEvent[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarEventos() {
    setCarregando(true);
    try {
      const now = new Date();
      const timeMin = now.toISOString();
      const response = await fetch(`/api/google-calendar/list-events?maxResults=100&timeMin=${encodeURIComponent(timeMin)}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao carregar eventos do Google Calendar');
      }

      const dados = json?.data ?? json;
      setEventos(dados?.eventos || []);
    } catch (error: any) {
      showToast(error?.message || 'Não foi possível carregar os eventos do Google Calendar.', 'error');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEventos();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Eventos do Google Calendar</h1>
            <p className="text-text-secondary">Visualização dos próximos eventos sincronizados da sua conta Google.</p>
          </div>
          <Button variant="outline" onClick={carregarEventos} disabled={carregando}>
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <p className="text-text-secondary">Carregando eventos...</p>
            ) : eventos.length === 0 ? (
              <p className="text-text-secondary">Nenhum evento encontrado no período consultado.</p>
            ) : (
              <div className="space-y-3">
                {eventos.map((evento) => (
                  <div key={evento.id || `${evento.summary}-${evento.start?.dateTime || evento.start?.date || ''}`} className="rounded-md border border-border p-3">
                    <p className="font-medium text-text-primary">{evento.summary || 'Sem título'}</p>
                    <p className="text-sm text-text-secondary">
                      Início: {formatarData(evento.start?.dateTime || evento.start?.date)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Fim: {formatarData(evento.end?.dateTime || evento.end?.date)}
                    </p>
                    {evento.location ? <p className="text-sm text-text-secondary">Local: {evento.location}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
