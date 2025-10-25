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
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'pizza' | 'barras'>('lista');

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

  const coresGrafico = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  const renderGraficoPizza = () => {
    if (eventosPorTipo.length === 0) return <div className="text-center text-gray-500 py-8">Nenhum dado disponível</div>;
    
    let anguloAtual = 0;
    const raio = 80;
    const centroX = 100;
    const centroY = 100;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {eventosPorTipo.map((item, index) => {
              const angulo = (item.percentual / 100) * 360;
              const anguloFinal = anguloAtual + angulo;
              
              const x1 = centroX + raio * Math.cos((anguloAtual * Math.PI) / 180);
              const y1 = centroY + raio * Math.sin((anguloAtual * Math.PI) / 180);
              const x2 = centroX + raio * Math.cos((anguloFinal * Math.PI) / 180);
              const y2 = centroY + raio * Math.sin((anguloFinal * Math.PI) / 180);
              
              const largeArcFlag = angulo > 180 ? 1 : 0;
              const pathData = [
                `M ${centroX} ${centroY}`,
                `L ${x1} ${y1}`,
                `A ${raio} ${raio} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const cor = coresGrafico[index % coresGrafico.length];
              
              anguloAtual = anguloFinal;
              
              return (
                <path
                  key={item.tipo}
                  d={pathData}
                  fill={cor}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{resumoGeral.totalEventos}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGraficoBarras = () => {
    if (eventosPorTipo.length === 0) return <div className="text-center text-gray-500 py-8">Nenhum dado disponível</div>;
    
    const maxQuantidade = Math.max(...eventosPorTipo.map(item => item.quantidade));

    return (
      <div className="space-y-4">
        {eventosPorTipo.map((item, index) => (
          <div key={item.tipo} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{item.tipo}</span>
              <span className="text-sm font-bold text-gray-900">{item.quantidade}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="h-6 rounded-full flex items-center justify-end pr-2"
                style={{
                  width: `${(item.quantidade / maxQuantidade) * 100}%`,
                  backgroundColor: coresGrafico[index % coresGrafico.length]
                }}
              >
                <span className="text-xs font-medium text-white">
                  {item.percentual.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
          <CardDescription>
            Visualize a distribuição dos eventos por tipo em diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Abas */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setAbaAtiva('lista')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                abaAtiva === 'lista'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setAbaAtiva('pizza')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                abaAtiva === 'pizza'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🥧 Pizza
            </button>
            <button
              onClick={() => setAbaAtiva('barras')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                abaAtiva === 'barras'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Barras
            </button>
          </div>

          {/* Conteúdo das Abas */}
          <div className="min-h-[300px]">
            {abaAtiva === 'lista' && (
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
            )}

            {abaAtiva === 'pizza' && (
              <div>
                {renderGraficoPizza()}
                {/* Legenda */}
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {eventosPorTipo.map((item, index) => (
                    <div key={item.tipo} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: coresGrafico[index % coresGrafico.length] }}
                      />
                      <span className="text-sm text-gray-700">{item.tipo}</span>
                      <span className="text-sm font-medium text-gray-900 ml-auto">
                        {item.quantidade} ({item.percentual.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {abaAtiva === 'barras' && (
              <div>
                {renderGraficoBarras()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
