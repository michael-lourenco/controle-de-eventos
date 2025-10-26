'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Evento, ServicoEvento, TipoServico } from '@/types';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownTrayIcon, ChartBarIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { 
  StatCard, 
  StatGrid, 
  TabbedChart, 
  PieChart, 
  BarChart,
  ChartDataPoint 
} from '@/components/charts';

interface ServicosReportProps {
  eventos: Evento[];
  servicos: ServicoEvento[];
  tiposServicos: TipoServico[];
}

export default function ServicosReport({ eventos, servicos, tiposServicos }: ServicosReportProps) {
  const [dataInicio, setDataInicio] = useState(
    format(subMonths(new Date(), 11), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const dadosServicos = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Filtrar eventos do período
    const eventosPeriodo = eventos.filter(evento => {
      const dataEvento = new Date(evento.dataEvento);
      return dataEvento >= inicio && dataEvento <= fim;
    });

    // Filtrar serviços dos eventos do período
    const servicosPeriodo = servicos.filter(servico => {
      return eventosPeriodo.some(evento => evento.id === servico.eventoId);
    });

    // Criar mapa de tipos de serviços
    const tiposMap = new Map(tiposServicos.map(tipo => [tipo.id, tipo]));

    // Resumo geral
    const totalServicos = servicosPeriodo.length;
    const tiposServicosUnicos = new Set(servicosPeriodo.map(s => s.tipoServicoId)).size;
    const eventosComServicos = new Set(servicosPeriodo.map(s => s.eventoId)).size;
    const eventosSemServicos = eventosPeriodo.length - eventosComServicos;
    const taxaUtilizacaoServicos = eventosPeriodo.length > 0 ? (eventosComServicos / eventosPeriodo.length) * 100 : 0;

    // Serviços por tipo
    const servicosPorTipoMap: Record<string, { quantidade: number; eventos: Set<string> }> = {};
    servicosPeriodo.forEach(servico => {
      const tipoNome = tiposMap.get(servico.tipoServicoId)?.nome || 'Tipo não encontrado';
      if (!servicosPorTipoMap[tipoNome]) {
        servicosPorTipoMap[tipoNome] = { quantidade: 0, eventos: new Set() };
      }
      servicosPorTipoMap[tipoNome].quantidade++;
      servicosPorTipoMap[tipoNome].eventos.add(servico.eventoId);
    });

    const servicosPorTipo = Object.entries(servicosPorTipoMap).map(([tipoServico, dados]) => ({
      tipoServico,
      quantidade: dados.quantidade,
      percentual: totalServicos > 0 ? (dados.quantidade / totalServicos) * 100 : 0,
      eventosUtilizando: dados.eventos.size
    }));

    // Serviços por evento
    const servicosPorEventoMap: Record<string, { servicos: ServicoEvento[]; evento: Evento }> = {};
    servicosPeriodo.forEach(servico => {
      const evento = eventosPeriodo.find(e => e.id === servico.eventoId);
      if (evento) {
        if (!servicosPorEventoMap[servico.eventoId]) {
          servicosPorEventoMap[servico.eventoId] = { servicos: [], evento };
        }
        servicosPorEventoMap[servico.eventoId].servicos.push(servico);
      }
    });

    const servicosPorEvento = Object.values(servicosPorEventoMap).map(({ servicos: servicosEvento, evento }) => ({
      eventoId: evento.id,
      clienteNome: evento.cliente.nome,
      dataEvento: evento.dataEvento,
      tipoEvento: evento.tipoEvento,
      quantidadeServicos: servicosEvento.length,
      tiposServicos: servicosEvento.map(s => tiposMap.get(s.tipoServicoId)?.nome || 'Tipo não encontrado')
    }));

    // Serviços por mês
    const servicosPorMesMap: Record<string, { quantidade: number; tipos: Set<string> }> = {};
    servicosPeriodo.forEach(servico => {
      const evento = eventosPeriodo.find(e => e.id === servico.eventoId);
      if (evento) {
        const mes = format(new Date(evento.dataEvento), 'yyyy-MM');
        if (!servicosPorMesMap[mes]) {
          servicosPorMesMap[mes] = { quantidade: 0, tipos: new Set() };
        }
        servicosPorMesMap[mes].quantidade++;
        servicosPorMesMap[mes].tipos.add(servico.tipoServicoId);
      }
    });

    const meses = eachMonthOfInterval({ start: inicio, end: fim });
    const servicosPorMes = meses.map(mes => {
      const mesKey = format(mes, 'yyyy-MM');
      const dados = servicosPorMesMap[mesKey] || { quantidade: 0, tipos: new Set() };
      return {
        mes: format(mes, 'MMM/yyyy', { locale: ptBR }),
        ano: mes.getFullYear(),
        quantidadeServicos: dados.quantidade,
        tiposUnicos: dados.tipos.size
      };
    });

    // Serviços por tipo de evento
    const servicosPorTipoEventoMap: Record<string, { quantidade: number; tipos: Record<string, number> }> = {};
    servicosPeriodo.forEach(servico => {
      const evento = eventosPeriodo.find(e => e.id === servico.eventoId);
      if (evento) {
        const tipoNome = tiposMap.get(servico.tipoServicoId)?.nome || 'Tipo não encontrado';
        if (!servicosPorTipoEventoMap[evento.tipoEvento]) {
          servicosPorTipoEventoMap[evento.tipoEvento] = { quantidade: 0, tipos: {} };
        }
        servicosPorTipoEventoMap[evento.tipoEvento].quantidade++;
        servicosPorTipoEventoMap[evento.tipoEvento].tipos[tipoNome] = 
          (servicosPorTipoEventoMap[evento.tipoEvento].tipos[tipoNome] || 0) + 1;
      }
    });

    const servicosPorTipoEvento = Object.entries(servicosPorTipoEventoMap).map(([tipoEvento, dados]) => ({
      tipoEvento,
      quantidadeServicos: dados.quantidade,
      tiposMaisUtilizados: Object.entries(dados.tipos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([tipoServico, quantidade]) => ({ tipoServico, quantidade }))
    }));

    // Tendências
    const servicoMaisUtilizado = servicosPorTipo.length > 0 ? 
      servicosPorTipo.reduce((max, atual) => atual.quantidade > max.quantidade ? atual : max).tipoServico : 'N/A';
    const servicoMenosUtilizado = servicosPorTipo.length > 0 ? 
      servicosPorTipo.reduce((min, atual) => atual.quantidade < min.quantidade ? atual : min).tipoServico : 'N/A';
    
    const crescimentoUtilizacao = servicosPorMes.length >= 2 ? 
      ((servicosPorMes[servicosPorMes.length - 1].quantidadeServicos - servicosPorMes[0].quantidadeServicos) / 
       Math.max(servicosPorMes[0].quantidadeServicos, 1)) * 100 : 0;

    const tiposEmAlta = servicosPorTipo
      .filter(tipo => tipo.percentual > 10)
      .map(tipo => tipo.tipoServico);

    // Alertas
    const alertas = [];
    if (eventosSemServicos > 0) {
      alertas.push({
        tipo: 'evento_sem_servicos' as const,
        mensagem: `${eventosSemServicos} eventos sem serviços cadastrados`,
        severidade: 'media' as const
      });
    }
    
    const servicoPoucoUtilizado = servicosPorTipo.find(tipo => tipo.percentual < 5);
    if (servicoPoucoUtilizado) {
      alertas.push({
        tipo: 'servico_pouco_utilizado' as const,
        mensagem: `${servicoPoucoUtilizado.tipoServico} com baixa utilização (${servicoPoucoUtilizado.percentual.toFixed(1)}%)`,
        severidade: 'baixa' as const
      });
    }

    return {
      periodo: { inicio, fim },
      resumoGeral: {
        totalServicos,
        tiposServicosUnicos,
        eventosComServicos,
        eventosSemServicos,
        taxaUtilizacaoServicos
      },
      servicosPorTipo,
      servicosPorEvento,
      servicosPorMes,
      servicosPorTipoEvento,
      tendencias: {
        servicoMaisUtilizado,
        servicoMenosUtilizado,
        crescimentoUtilizacao,
        tiposEmAlta
      },
      alertas
    };
  }, [dataInicio, dataFim, eventos, servicos, tiposServicos]);

  // Converter dados para formato dos gráficos
  const servicosPorTipoData: ChartDataPoint[] = dadosServicos.servicosPorTipo.map(item => ({
    label: item.tipoServico,
    value: item.quantidade,
    percentage: item.percentual
  }));

  const servicosPorMesData: ChartDataPoint[] = dadosServicos.servicosPorMes.map(item => ({
    label: item.mes,
    value: item.quantidadeServicos,
    percentage: 0
  }));

  const servicosPorTipoEventoData: ChartDataPoint[] = dadosServicos.servicosPorTipoEvento.map(item => ({
    label: item.tipoEvento,
    value: item.quantidadeServicos,
    percentage: 0
  }));

  const exportarCSV = () => {
    const csvData = [
      ['Relatório de Serviços por Tipo'],
      [`Período: ${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`],
      [''],
      ['RESUMO GERAL'],
      ['Total de Serviços', dadosServicos.resumoGeral.totalServicos],
      ['Tipos de Serviços Únicos', dadosServicos.resumoGeral.tiposServicosUnicos],
      ['Eventos com Serviços', dadosServicos.resumoGeral.eventosComServicos],
      ['Eventos sem Serviços', dadosServicos.resumoGeral.eventosSemServicos],
      ['Taxa de Utilização (%)', dadosServicos.resumoGeral.taxaUtilizacaoServicos.toFixed(2)],
      [''],
      ['SERVIÇOS POR TIPO'],
      ['Tipo de Serviço', 'Quantidade', 'Percentual (%)', 'Eventos Utilizando'],
      ...dadosServicos.servicosPorTipo.map(item => [
        item.tipoServico,
        item.quantidade,
        item.percentual.toFixed(2),
        item.eventosUtilizando
      ]),
      [''],
      ['SERVIÇOS POR EVENTO'],
      ['Cliente', 'Data do Evento', 'Tipo de Evento', 'Quantidade de Serviços', 'Tipos de Serviços'],
      ...dadosServicos.servicosPorEvento.map(item => [
        item.clienteNome,
        format(item.dataEvento, 'dd/MM/yyyy', { locale: ptBR }),
        item.tipoEvento,
        item.quantidadeServicos,
        item.tiposServicos.join(', ')
      ]),
      [''],
      ['SERVIÇOS POR MÊS'],
      ['Mês', 'Quantidade de Serviços', 'Tipos Únicos'],
      ...dadosServicos.servicosPorMes.map(item => [
        item.mes,
        item.quantidadeServicos,
        item.tiposUnicos
      ]),
      [''],
      ['SERVIÇOS POR TIPO DE EVENTO'],
      ['Tipo de Evento', 'Quantidade de Serviços', 'Tipos Mais Utilizados'],
      ...dadosServicos.servicosPorTipoEvento.map(item => [
        item.tipoEvento,
        item.quantidadeServicos,
        item.tiposMaisUtilizados.map(t => `${t.tipoServico} (${t.quantidade})`).join(', ')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-servicos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
            <WrenchScrewdriverIcon className="h-5 w-5" />
            Relatório de Serviços por Tipo
          </CardTitle>
          <CardDescription>
            Análise detalhada da utilização de serviços por tipo e evento
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
      {dadosServicos.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Alertas de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dadosServicos.alertas.map((alerta, index) => (
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
          title="Total de Serviços"
          value={dadosServicos.resumoGeral.totalServicos}
          color="primary"
        />
        <StatCard
          title="Tipos Únicos"
          value={dadosServicos.resumoGeral.tiposServicosUnicos}
          color="info"
        />
        <StatCard
          title="Eventos com Serviços"
          value={dadosServicos.resumoGeral.eventosComServicos}
          color="success"
        />
        <StatCard
          title="Taxa de Utilização"
          value={`${dadosServicos.resumoGeral.taxaUtilizacaoServicos.toFixed(1)}%`}
          color={dadosServicos.resumoGeral.taxaUtilizacaoServicos >= 80 ? "success" : "warning"}
        />
      </StatGrid>

      {/* Serviços por Tipo */}
      <TabbedChart
        title="Serviços por Tipo"
        subtitle="Distribuição dos serviços contratados por tipo"
        tabs={[
          {
            id: 'pizza',
            label: '🥧 Pizza',
            content: (
              <PieChart 
                data={servicosPorTipoData}
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
                data={servicosPorTipoData}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo de Serviço</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Percentual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Eventos Utilizando</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {dadosServicos.servicosPorTipo.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.tipoServico}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.quantidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.percentual.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{item.eventosUtilizando}</td>
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

      {/* Análise Temporal e por Tipo de Evento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Serviços por Mês</CardTitle>
            <CardDescription>
              Evolução da utilização de serviços ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={servicosPorMesData}
              config={{ 
                showValues: true, 
                showPercentages: false 
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços por Tipo de Evento</CardTitle>
            <CardDescription>
              Distribuição de serviços por tipo de evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={servicosPorTipoEventoData}
              config={{ 
                showValues: true, 
                showPercentages: false 
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tendências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Tendências e Insights
          </CardTitle>
          <CardDescription>
            Análise das tendências de utilização de serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Serviço Mais Utilizado</h4>
              <p className="text-green-600 font-bold">{dadosServicos.tendencias.servicoMaisUtilizado}</p>
            </div>
            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Serviço Menos Utilizado</h4>
              <p className="text-red-600 font-bold">{dadosServicos.tendencias.servicoMenosUtilizado}</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Crescimento</h4>
              <p className={`font-bold ${dadosServicos.tendencias.crescimentoUtilizacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dadosServicos.tendencias.crescimentoUtilizacao.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-800 mb-2">Tipos em Alta</h4>
              <p className="text-purple-600 font-bold">{dadosServicos.tendencias.tiposEmAlta.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
