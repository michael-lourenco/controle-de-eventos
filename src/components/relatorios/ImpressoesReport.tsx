'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Evento } from '@/types';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownTrayIcon, PrinterIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Area, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { 
  StatCard, 
  StatGrid, 
  TabbedChart, 
  PieChart, 
  BarChart,
  ChartDataPoint 
} from '@/components/charts';

interface ImpressoesReportProps {
  eventos: Evento[];
}

export default function ImpressoesReport({ eventos }: ImpressoesReportProps) {
  const [dataInicio, setDataInicio] = useState(
    format(subMonths(new Date(), 11), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const dadosImpressoes = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Filtrar eventos do período
    const eventosPeriodo = eventos.filter(evento => {
      const dataEvento = new Date(evento.dataEvento);
      return dataEvento >= inicio && dataEvento <= fim;
    });

    // Resumo geral
    const totalImpressoes = eventosPeriodo.reduce((sum, evento) => sum + (evento.numeroImpressoes || 0), 0);
    const eventosComImpressoes = eventosPeriodo.filter(e => (e.numeroImpressoes || 0) > 0).length;
    const eventosSemImpressoes = eventosPeriodo.length - eventosComImpressoes;
    const taxaUtilizacaoImpressoes = eventosPeriodo.length > 0 ? (eventosComImpressoes / eventosPeriodo.length) * 100 : 0;
    
    // Custo médio por impressão (assumindo R$ 0,50 por impressão)
    const custoPorImpressao = 0.50;
    const custoMedioPorImpressao = custoPorImpressao;

    // Impressões por evento
    const impressoesPorEvento = eventosPeriodo
      .filter(e => (e.numeroImpressoes || 0) > 0)
      .map(evento => ({
        eventoId: evento.id,
        clienteNome: evento.cliente.nome,
        dataEvento: evento.dataEvento,
        tipoEvento: evento.tipoEvento,
        quantidadeImpressoes: evento.numeroImpressoes || 0,
        valorEvento: evento.valorTotal,
        custoImpressaoPorEvento: (evento.numeroImpressoes || 0) * custoPorImpressao
      }))
      .sort((a, b) => b.quantidadeImpressoes - a.quantidadeImpressoes);

    // Impressões por tipo de evento
    const impressoesPorTipoMap: Record<string, { total: number; eventos: number; somaImpressoes: number }> = {};
    eventosPeriodo.forEach(evento => {
      if (!impressoesPorTipoMap[evento.tipoEvento]) {
        impressoesPorTipoMap[evento.tipoEvento] = { total: 0, eventos: 0, somaImpressoes: 0 };
      }
      impressoesPorTipoMap[evento.tipoEvento].total++;
      if ((evento.numeroImpressoes || 0) > 0) {
        impressoesPorTipoMap[evento.tipoEvento].eventos++;
        impressoesPorTipoMap[evento.tipoEvento].somaImpressoes += evento.numeroImpressoes || 0;
      }
    });

    const impressoesPorTipoEvento = Object.entries(impressoesPorTipoMap).map(([tipo, dados]) => ({
      tipoEvento: tipo,
      totalImpressoes: dados.somaImpressoes,
      eventosComImpressoes: dados.eventos,
      mediaImpressoesPorEvento: dados.eventos > 0 ? dados.somaImpressoes / dados.eventos : 0,
      percentual: totalImpressoes > 0 ? (dados.somaImpressoes / totalImpressoes) * 100 : 0
    }));

    // Impressões por mês
    const impressoesPorMesMap: Record<string, { totalImpressoes: number; eventosComImpressoes: number }> = {};
    eventosPeriodo.forEach(evento => {
      const mes = format(new Date(evento.dataEvento), 'yyyy-MM');
      if (!impressoesPorMesMap[mes]) {
        impressoesPorMesMap[mes] = { totalImpressoes: 0, eventosComImpressoes: 0 };
      }
      impressoesPorMesMap[mes].totalImpressoes += evento.numeroImpressoes || 0;
      if ((evento.numeroImpressoes || 0) > 0) {
        impressoesPorMesMap[mes].eventosComImpressoes++;
      }
    });

    const meses = eachMonthOfInterval({ start: inicio, end: fim });
    const impressoesPorMes = meses.map(mes => {
      const mesKey = format(mes, 'yyyy-MM');
      const dados = impressoesPorMesMap[mesKey] || { totalImpressoes: 0, eventosComImpressoes: 0 };
      return {
        mes: format(mes, 'MMM/yyyy', { locale: ptBR }),
        ano: mes.getFullYear(),
        totalImpressoes: dados.totalImpressoes,
        eventosComImpressoes: dados.eventosComImpressoes,
        custoTotalImpressoes: dados.totalImpressoes * custoPorImpressao
      };
    });

    // Análise custo-benefício
    const analiseCustoBeneficio = impressoesPorTipoEvento.map(tipo => {
      const eventosTipo = eventosPeriodo.filter(e => e.tipoEvento === tipo.tipoEvento);
      const valorMedioEvento = eventosTipo.length > 0 ? 
        eventosTipo.reduce((sum, e) => sum + e.valorTotal, 0) / eventosTipo.length : 0;
      const custoMedioImpressoes = tipo.mediaImpressoesPorEvento * custoPorImpressao;
      const percentualCustoImpressoes = valorMedioEvento > 0 ? (custoMedioImpressoes / valorMedioEvento) * 100 : 0;
      const roiImpressoes = valorMedioEvento > 0 ? ((valorMedioEvento - custoMedioImpressoes) / custoMedioImpressoes) * 100 : 0;
      
      return {
        tipoEvento: tipo.tipoEvento,
        valorMedioEvento,
        custoMedioImpressoes,
        percentualCustoImpressoes,
        roiImpressoes
      };
    });

    // Tendências
    const eventoComMaisImpressoes = impressoesPorEvento.length > 0 ? 
      impressoesPorEvento[0].clienteNome : 'N/A';
    const eventoComMenosImpressoes = impressoesPorEvento.length > 0 ? 
      impressoesPorEvento[impressoesPorEvento.length - 1].clienteNome : 'N/A';
    
    const crescimentoImpressoes = impressoesPorMes.length >= 2 ? 
      ((impressoesPorMes[impressoesPorMes.length - 1].totalImpressoes - impressoesPorMes[0].totalImpressoes) / 
       Math.max(impressoesPorMes[0].totalImpressoes, 1)) * 100 : 0;

    const tiposEventoMaisImpressos = impressoesPorTipoEvento
      .filter(tipo => tipo.percentual > 20)
      .map(tipo => tipo.tipoEvento);

    // Alertas
    const alertas = [];
    if (eventosSemImpressoes > 0) {
      alertas.push({
        tipo: 'evento_sem_impressoes' as const,
        mensagem: `${eventosSemImpressoes} eventos sem impressões cadastradas`,
        severidade: 'media' as const
      });
    }
    
    const altoCustoImpressoes = analiseCustoBeneficio.find(analise => analise.percentualCustoImpressoes > 10);
    if (altoCustoImpressoes) {
      alertas.push({
        tipo: 'alto_custo_impressoes' as const,
        mensagem: `${altoCustoImpressoes.tipoEvento} com alto custo de impressões (${altoCustoImpressoes.percentualCustoImpressoes.toFixed(1)}% do valor do evento)`,
        severidade: 'alta' as const
      });
    }

    if (taxaUtilizacaoImpressoes < 50) {
      alertas.push({
        tipo: 'baixa_utilizacao' as const,
        mensagem: `Baixa utilização de impressões (${taxaUtilizacaoImpressoes.toFixed(1)}% dos eventos)`,
        severidade: 'baixa' as const
      });
    }

    return {
      periodo: { inicio, fim },
      resumoGeral: {
        totalImpressoes,
        eventosComImpressoes,
        eventosSemImpressoes,
        taxaUtilizacaoImpressoes,
        custoMedioPorImpressao
      },
      impressoesPorEvento,
      impressoesPorTipoEvento,
      impressoesPorMes,
      analiseCustoBeneficio,
      tendencias: {
        eventoComMaisImpressoes,
        eventoComMenosImpressoes,
        crescimentoImpressoes,
        tiposEventoMaisImpressos
      },
      alertas
    };
  }, [dataInicio, dataFim, eventos]);

  // Converter dados para formato dos gráficos
  const impressoesPorTipoData: ChartDataPoint[] = dadosImpressoes.impressoesPorTipoEvento.map(item => ({
    label: item.tipoEvento,
    value: item.totalImpressoes,
    percentage: item.percentual
  }));

  const impressoesPorMesData: ChartDataPoint[] = dadosImpressoes.impressoesPorMes.map(item => ({
    label: item.mes,
    value: item.totalImpressoes,
    percentage: 0
  }));

  const custoBeneficioData: ChartDataPoint[] = dadosImpressoes.analiseCustoBeneficio.map(item => ({
    label: item.tipoEvento,
    value: item.percentualCustoImpressoes,
    percentage: 0
  }));

  // Dados formatados para gráficos melhorados
  const impressoesPorMesChartData = dadosImpressoes.impressoesPorMes.map(item => ({
    mes: item.mes,
    totalImpressoes: item.totalImpressoes,
    eventosComImpressoes: item.eventosComImpressoes,
    custoTotalImpressoes: item.custoTotalImpressoes
  }));

  const custoImpressoesPorTipoChartData = dadosImpressoes.analiseCustoBeneficio.map(item => ({
    tipoEvento: item.tipoEvento,
    percentualCusto: item.percentualCustoImpressoes,
    custoMedioImpressoes: item.custoMedioImpressoes,
    valorMedioEvento: item.valorMedioEvento,
    roiImpressoes: item.roiImpressoes
  }));

  const chartConfigImpressoes = {
    totalImpressoes: {
      label: "Total de Impressões",
      color: "#3B82F6"
    },
    eventosComImpressoes: {
      label: "Eventos com Impressões",
      color: "#10B981"
    },
    custoTotalImpressoes: {
      label: "Custo Total (R$)",
      color: "#8B5CF6"
    }
  };

  const chartConfigCusto = {
    percentualCusto: {
      label: "Percentual do Custo (%)",
      color: "#EF4444"
    },
    custoMedioImpressoes: {
      label: "Custo Médio (R$)",
      color: "#F59E0B"
    },
    valorMedioEvento: {
      label: "Valor Médio Evento (R$)",
      color: "#10B981"
    },
    roiImpressoes: {
      label: "ROI Impressões (%)",
      color: "#8B5CF6"
    }
  };

  const exportarCSV = () => {
    const csvData = [
      ['Relatório de Impressões dos Eventos'],
      [`Período: ${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`],
      [''],
      ['RESUMO GERAL'],
      ['Total de Impressões', dadosImpressoes.resumoGeral.totalImpressoes],
      ['Eventos com Impressões', dadosImpressoes.resumoGeral.eventosComImpressoes],
      ['Eventos sem Impressões', dadosImpressoes.resumoGeral.eventosSemImpressoes],
      ['Taxa de Utilização (%)', dadosImpressoes.resumoGeral.taxaUtilizacaoImpressoes.toFixed(2)],
      ['Custo Médio por Impressão', `R$ ${dadosImpressoes.resumoGeral.custoMedioPorImpressao.toFixed(2)}`],
      [''],
      ['IMPRESSÕES POR TIPO DE EVENTO'],
      ['Tipo de Evento', 'Total Impressões', 'Eventos com Impressões', 'Média por Evento', 'Percentual (%)'],
      ...dadosImpressoes.impressoesPorTipoEvento.map(item => [
        item.tipoEvento,
        item.totalImpressoes,
        item.eventosComImpressoes,
        item.mediaImpressoesPorEvento.toFixed(1),
        item.percentual.toFixed(2)
      ]),
      [''],
      ['ANÁLISE CUSTO-BENEFÍCIO'],
      ['Tipo de Evento', 'Valor Médio Evento', 'Custo Médio Impressões', 'Percentual Custo (%)', 'ROI Impressões (%)'],
      ...dadosImpressoes.analiseCustoBeneficio.map(item => [
        item.tipoEvento,
        item.valorMedioEvento.toFixed(2),
        item.custoMedioImpressoes.toFixed(2),
        item.percentualCustoImpressoes.toFixed(2),
        item.roiImpressoes.toFixed(2)
      ]),
      [''],
      ['IMPRESSÕES POR MÊS'],
      ['Mês', 'Total Impressões', 'Eventos com Impressões', 'Custo Total'],
      ...dadosImpressoes.impressoesPorMes.map(item => [
        item.mes,
        item.totalImpressoes,
        item.eventosComImpressoes,
        item.custoTotalImpressoes.toFixed(2)
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-impressoes-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'alta': return 'text-red-600 bg-red-50';
      case 'media': return 'text-yellow-600 bg-yellow-50';
      case 'baixa': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PrinterIcon className="h-5 w-5" />
            Relatório de Impressões dos Eventos
          </CardTitle>
          <CardDescription>
            Análise detalhada do uso de impressões e custos de insumos
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

      {/* Alertas */}
      {dadosImpressoes.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Alertas de Impressões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dadosImpressoes.alertas.map((alerta, index) => (
                <div key={index} className={`p-3 rounded-lg ${getSeveridadeColor(alerta.severidade)}`}>
                  <div className="font-medium">{alerta.mensagem}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Geral */}
      <StatGrid>
        <StatCard
          title="Total de Impressões"
          value={dadosImpressoes.resumoGeral.totalImpressoes.toLocaleString('pt-BR')}
          color="primary"
        />
        <StatCard
          title="Eventos com Impressões"
          value={dadosImpressoes.resumoGeral.eventosComImpressoes}
          color="info"
        />
        <StatCard
          title="Taxa de Utilização"
          value={`${dadosImpressoes.resumoGeral.taxaUtilizacaoImpressoes.toFixed(1)}%`}
          color={dadosImpressoes.resumoGeral.taxaUtilizacaoImpressoes >= 70 ? "success" : "warning"}
        />
        <StatCard
          title="Custo Médio por Impressão"
          value={`R$ ${dadosImpressoes.resumoGeral.custoMedioPorImpressao.toFixed(2)}`}
          color="info"
        />
      </StatGrid>

      {/* Impressões por Tipo de Evento */}
      <TabbedChart
        title="Impressões por Tipo de Evento"
        subtitle="Distribuição das impressões por categoria de evento"
        tabs={[
          {
            id: 'pizza',
            label: '🥧 Pizza',
            content: (
              <PieChart 
                data={impressoesPorTipoData}
                config={{ 
                  showLegend: true, 
                  showValues: true, 
                  showPercentages: true 
                }}
              />
            )
          },
          {
            id: 'barras',
            label: '📊 Barras',
            content: (
              <BarChart 
                data={impressoesPorTipoData}
                config={{ 
                  showValues: true, 
                  showPercentages: false 
                }}
              />
            )
          },
          {
            id: 'tabela',
            label: '📋 Tabela',
            content: (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo de Evento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total Impressões</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Eventos com Impressões</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Média por Evento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Percentual</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {dadosImpressoes.impressoesPorTipoEvento.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.tipoEvento}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.totalImpressoes.toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.eventosComImpressoes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.mediaImpressoesPorEvento.toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.percentual.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
        defaultTab="pizza"
      />

      {/* Análise Temporal e Custo-Benefício */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Impressões por Mês</CardTitle>
            <CardDescription>
              Evolução do uso de impressões, eventos e custos ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigImpressoes} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={impressoesPorMesChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="colorImpressoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                    label={{ value: 'Custo (R$)', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                          <div className="mb-2 text-sm font-semibold text-gray-900">
                            {data?.mes}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Total Impressões:</span>
                              <span className="font-semibold">{data?.totalImpressoes?.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Eventos com Impressões:</span>
                              <span className="font-semibold">{data?.eventosComImpressoes}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Custo Total:</span>
                              <span className="font-semibold">
                                R$ {typeof data?.custoTotalImpressoes === 'number' 
                                  ? data.custoTotalImpressoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                  : data?.custoTotalImpressoes}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="totalImpressoes" 
                    fill="url(#colorImpressoes)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Total de Impressões"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="eventosComImpressoes" 
                    fill="#10B981" 
                    name="Eventos com Impressões"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="custoTotalImpressoes" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="Custo Total (R$)"
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custo de Impressões por Tipo</CardTitle>
            <CardDescription>
              Análise completa: percentual de custo, valores e ROI por tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigCusto} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={custoImpressoesPorTipoChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="tipoEvento" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                    label={{ value: 'Valores (R$)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: 'Percentuais (%)', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0]?.payload;
                      return (
                        <div className="rounded-lg border bg-white p-3 shadow-lg">
                          <div className="mb-2 text-sm font-semibold text-gray-900">
                            {data?.tipoEvento}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Percentual Custo:</span>
                              <span className="font-semibold">{data?.percentualCusto?.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Custo Médio:</span>
                              <span className="font-semibold">
                                R$ {typeof data?.custoMedioImpressoes === 'number' 
                                  ? data.custoMedioImpressoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                  : data?.custoMedioImpressoes}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">Valor Médio Evento:</span>
                              <span className="font-semibold">
                                R$ {typeof data?.valorMedioEvento === 'number' 
                                  ? data.valorMedioEvento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                  : data?.valorMedioEvento}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-600">ROI Impressões:</span>
                              <span className={`font-semibold ${data?.roiImpressoes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {data?.roiImpressoes?.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    yAxisId="right"
                    dataKey="percentualCusto" 
                    fill="#EF4444" 
                    name="Percentual do Custo (%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="custoMedioImpressoes" 
                    fill="#F59E0B" 
                    name="Custo Médio (R$)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="valorMedioEvento" 
                    fill="#10B981" 
                    name="Valor Médio Evento (R$)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="roiImpressoes" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="ROI Impressões (%)"
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Eventos com Mais Impressões */}
      <Card>
        <CardHeader>
          <CardTitle>Top Eventos com Mais Impressões</CardTitle>
          <CardDescription>
            Eventos que mais utilizaram impressões no período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Impressões</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Valor Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Custo Impressões</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {dadosImpressoes.impressoesPorEvento.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.clienteNome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {format(item.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.tipoEvento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.quantidadeImpressoes.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      R$ {item.valorEvento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      R$ {item.custoImpressaoPorEvento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Tendências e Insights
          </CardTitle>
          <CardDescription>
            Análise das tendências de uso de impressões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Evento com Mais Impressões</h4>
              <p className="text-green-600 font-bold">{dadosImpressoes.tendencias.eventoComMaisImpressoes}</p>
            </div>
            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Evento com Menos Impressões</h4>
              <p className="text-red-600 font-bold">{dadosImpressoes.tendencias.eventoComMenosImpressoes}</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Crescimento de Impressões</h4>
              <p className={`font-bold ${dadosImpressoes.tendencias.crescimentoImpressoes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dadosImpressoes.tendencias.crescimentoImpressoes.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-800 mb-2">Tipos Mais Impressos</h4>
              <p className="text-purple-600 font-bold">{dadosImpressoes.tendencias.tiposEventoMaisImpressos.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
