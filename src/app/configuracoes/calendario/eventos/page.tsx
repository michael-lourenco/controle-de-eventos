'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [criando, setCriando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [local, setLocal] = useState('');

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

  async function criarEventoDiretoNoGoogle() {
    if (!titulo.trim()) {
      showToast('Informe um título para o evento.', 'error');
      return;
    }

    if (!inicio) {
      showToast('Informe a data/hora de início.', 'error');
      return;
    }

    setCriando(true);
    try {
      const response = await fetch('/api/google-calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: titulo.trim(),
          startDateTime: new Date(inicio).toISOString(),
          endDateTime: fim ? new Date(fim).toISOString() : undefined,
          location: local.trim() || undefined,
          timeZone: 'America/Sao_Paulo'
        })
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao criar evento no Google Calendar');
      }

      showToast('Evento criado no Google Calendar com sucesso.', 'success');
      setTitulo('');
      setInicio('');
      setFim('');
      setLocal('');
      await carregarEventos();
    } catch (error: any) {
      showToast(error?.message || 'Não foi possível criar evento no Google Calendar.', 'error');
    } finally {
      setCriando(false);
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Eventos do Google Calendar</h1>
            <p className="text-text-secondary">
              Próximos compromissos do Google Calendar que estão vinculados a eventos do Clicksehub (sincronizados pelo
              sistema). Outros eventos da mesma conta não aparecem aqui.
            </p>
          </div>
          <Button variant="outline" onClick={carregarEventos} disabled={carregando}>
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar evento direto no Google</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião de teste"
            />
            <Input
              label="Início"
              type="datetime-local"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
            <Input
              label="Fim (opcional)"
              type="datetime-local"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
            <Input
              label="Local (opcional)"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Escritório"
            />
            <Button onClick={criarEventoDiretoNoGoogle} disabled={criando}>
              {criando ? 'Criando...' : 'Criar evento no Google'}
            </Button>
          </CardContent>
        </Card>

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
