'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Evento, StatusEvento, TipoEvento } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownTrayIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PerformanceEventosReportProps {
  eventos: Evento[];
}

export default function PerformanceEventosReport({ eventos }: PerformanceEventosReportProps) {
  const [dataInicio, setDataInicio] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const eventosFiltrados = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.dataEvento);
      return dataEvento >= inicio && dataEvento <= fim;
    });
  }, [eventos, dataInicio, dataFim]);

  const resumoGeral = useMemo(() => {
    const total = eventosFiltrados.length;
    const concluidos = eventosFiltrados.filter(e => e.status === StatusEvento.CONCLUIDO).length;
    const cancelados = eventosFiltrados.filter(e => e.status === StatusEvento.CANCELADO).length;
    
    return {
      totalEventos: total,
      eventosConcluidos: concluidos,
      eventosCancelados: cancelados,
      taxaConclusao: total > 0 ? (concluidos / total) * 100 : 0,
      taxaCancelamento: total > 0 ? (cancelados / total) * 100 : 0
    };
  }, [eventosFiltrados]);

  const eventosPorStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    
    eventosFiltrados.forEach(evento => {
      statusCount[evento.status] = (statusCount[evento.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, quantidade]) => ({
      status,
      quantidade,
      percentual: resumoGeral.totalEventos > 0 ? (quantidade / resumoGeral.totalEventos) * 100 : 0
    }));
  }, [eventosFiltrados, resumoGeral.totalEventos]);

  const eventosPorTipo = useMemo(() => {
    const tipoCount: Record<string, number> = {};
    
    eventosFiltrados.forEach(evento => {
      tipoCount[evento.tipoEvento] = (tipoCount[evento.tipoEvento] || 0) + 1;
    });

    return Object.entries(tipoCount).map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
      percentual: resumoGeral.totalEventos > 0 ? (quantidade / resumoGeral.totalEventos) * 100 : 0
    }));
  }, [eventosFiltrados, resumoGeral.totalEventos]);

  const exportarCSV = () => {
    const csvData = [
      ['Relatório de Performance de Eventos'],
      [`Período: ${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`],
      [''],
      ['RESUMO GERAL'],
      ['Total de Eventos', resumoGeral.totalEventos],
      ['Eventos Concluídos', resumoGeral.eventosConcluidos],
      ['Eventos Cancelados', resumoGeral.eventosCancelados],
      ['Taxa de Conclusão (%)', resumoGeral.taxaConclusao.toFixed(2)],
      ['Taxa de Cancelamento (%)', resumoGeral.taxaCancelamento.toFixed(2)],
      [''],
      ['EVENTOS POR STATUS'],
      ['Status', 'Quantidade', 'Percentual (%)'],
      ...eventosPorStatus.map(item => [item.status, item.quantidade, item.percentual.toFixed(2)]),
      [''],
      ['EVENTOS POR TIPO'],
      ['Tipo', 'Quantidade', 'Percentual (%)'],
      ...eventosPorTipo.map(item => [item.tipo, item.quantidade, item.percentual.toFixed(2)])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance-eventos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Relatório de Performance de Eventos
          </CardTitle>
          <CardDescription>
            Análise de performance dos eventos por período
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <Input
              label="Data Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
            <div className="flex items-end">
              <Button 
                onClick={exportarCSV} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-blue-500 focus:ring-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">{resumoGeral.totalEventos}</div>
            <p className="text-sm text-text-secondary">Total de Eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">{resumoGeral.eventosConcluidos}</div>
            <p className="text-sm text-text-secondary">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-error">{resumoGeral.eventosCancelados}</div>
            <p className="text-sm text-text-secondary">Cancelados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">{resumoGeral.taxaConclusao.toFixed(1)}%</div>
            <p className="text-sm text-text-secondary">Taxa de Conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {eventosPorStatus.map((item) => (
              <div key={item.status} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                <span className="font-medium">{item.status}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">{item.quantidade} eventos</span>
                  <span className="text-sm font-medium">{item.percentual.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eventos por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {eventosPorTipo.map((item) => (
              <div key={item.tipo} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                <span className="font-medium">{item.tipo}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-secondary">{item.quantidade} eventos</span>
                  <span className="text-sm font-medium">{item.percentual.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
