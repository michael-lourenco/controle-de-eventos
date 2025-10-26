'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Cliente, CanalEntrada, Evento } from '@/types';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownTrayIcon, ChartBarIcon, ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { 
  StatCard, 
  StatGrid, 
  TabbedChart, 
  PieChart, 
  BarChart,
  ChartDataPoint 
} from '@/components/charts';

interface CanaisEntradaReportProps {
  clientes: Cliente[];
  canaisEntrada: CanalEntrada[];
  eventos: Evento[];
}

export default function CanaisEntradaReport({ clientes, canaisEntrada, eventos }: CanaisEntradaReportProps) {
  const [dataInicio, setDataInicio] = useState(
    format(subMonths(new Date(), 11), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const dadosCanaisEntrada = useMemo(() => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Filtrar clientes do período
    const clientesPeriodo = clientes.filter(cliente => {
      const dataCadastro = new Date(cliente.dataCadastro);
      return dataCadastro >= inicio && dataCadastro <= fim;
    });

    // Criar mapa de canais
    const canaisMap = new Map(canaisEntrada.map(canal => [canal.id, canal]));

    // Resumo geral
    const totalClientes = clientesPeriodo.length;
    const clientesComCanal = clientesPeriodo.filter(c => c.canalEntradaId).length;
    const clientesSemCanal = totalClientes - clientesComCanal;
    const taxaPreenchimento = totalClientes > 0 ? (clientesComCanal / totalClientes) * 100 : 0;
    const canaisAtivos = new Set(clientesPeriodo.map(c => c.canalEntradaId).filter(Boolean)).size;

    // Clientes por canal
    const clientesPorCanalMap: Record<string, { quantidade: number; eventos: Evento[] }> = {};
    clientesPeriodo.forEach(cliente => {
      if (cliente.canalEntradaId) {
        if (!clientesPorCanalMap[cliente.canalEntradaId]) {
          clientesPorCanalMap[cliente.canalEntradaId] = { quantidade: 0, eventos: [] };
        }
        clientesPorCanalMap[cliente.canalEntradaId].quantidade++;
        
        // Buscar eventos deste cliente
        const eventosCliente = eventos.filter(e => e.clienteId === cliente.id);
        clientesPorCanalMap[cliente.canalEntradaId].eventos.push(...eventosCliente);
      }
    });

    const clientesPorCanal = Object.entries(clientesPorCanalMap).map(([canalId, dados]) => {
      const canal = canaisMap.get(canalId);
      const valorTotalEventos = dados.eventos.reduce((sum, evento) => sum + evento.valorTotal, 0);
      const ticketMedio = dados.quantidade > 0 ? valorTotalEventos / dados.quantidade : 0;
      
      return {
        canalId,
        canalNome: canal?.nome || 'Canal não encontrado',
        quantidade: dados.quantidade,
        percentual: totalClientes > 0 ? (dados.quantidade / totalClientes) * 100 : 0,
        valorTotalEventos,
        ticketMedio
      };
    });

    // Clientes por mês
    const clientesPorMesMap: Record<string, { total: number; porCanal: Record<string, number> }> = {};
    clientesPeriodo.forEach(cliente => {
      const mes = format(new Date(cliente.dataCadastro), 'yyyy-MM');
      if (!clientesPorMesMap[mes]) {
        clientesPorMesMap[mes] = { total: 0, porCanal: {} };
      }
      clientesPorMesMap[mes].total++;
      
      if (cliente.canalEntradaId) {
        const canalNome = canaisMap.get(cliente.canalEntradaId)?.nome || 'Sem canal';
        clientesPorMesMap[mes].porCanal[canalNome] = 
          (clientesPorMesMap[mes].porCanal[canalNome] || 0) + 1;
      }
    });

    const meses = eachMonthOfInterval({ start: inicio, end: fim });
    const clientesPorMes = meses.map(mes => {
      const mesKey = format(mes, 'yyyy-MM');
      const dados = clientesPorMesMap[mesKey] || { total: 0, porCanal: {} };
      return {
        mes: format(mes, 'MMM/yyyy', { locale: ptBR }),
        ano: mes.getFullYear(),
        totalClientes: dados.total,
        porCanal: dados.porCanal
      };
    });

    // Conversão por canal
    const conversaoPorCanal = clientesPorCanal.map(canal => {
      const eventosCanal = eventos.filter(e => {
        const cliente = clientesPeriodo.find(c => c.id === e.clienteId);
        return cliente?.canalEntradaId === canal.canalId;
      });
      
      const receitaGerada = eventosCanal.reduce((sum, evento) => sum + evento.valorTotal, 0);
      const taxaConversao = canal.quantidade > 0 ? (eventosCanal.length / canal.quantidade) * 100 : 0;
      
      return {
        canalNome: canal.canalNome,
        totalLeads: canal.quantidade,
        eventosGerados: eventosCanal.length,
        taxaConversao,
        receitaGerada
      };
    });

    // Tendências
    const canalMaisEfetivo = conversaoPorCanal.length > 0 ? 
      conversaoPorCanal.reduce((max, atual) => atual.taxaConversao > max.taxaConversao ? atual : max).canalNome : 'N/A';
    const canalMenosEfetivo = conversaoPorCanal.length > 0 ? 
      conversaoPorCanal.reduce((min, atual) => atual.taxaConversao < min.taxaConversao ? atual : min).canalNome : 'N/A';
    
    const crescimentoLeads = clientesPorMes.length >= 2 ? 
      ((clientesPorMes[clientesPorMes.length - 1].totalClientes - clientesPorMes[0].totalClientes) / 
       Math.max(clientesPorMes[0].totalClientes, 1)) * 100 : 0;

    const canaisEmAlta = clientesPorCanal
      .filter(canal => canal.percentual > 15)
      .map(canal => canal.canalNome);

    // Alertas
    const alertas = [];
    if (clientesSemCanal > 0) {
      alertas.push({
        tipo: 'clientes_sem_canal' as const,
        mensagem: `${clientesSemCanal} clientes sem canal de entrada cadastrado`,
        severidade: 'media' as const
      });
    }
    
    const canalBaixaConversao = conversaoPorCanal.find(canal => canal.taxaConversao < 30);
    if (canalBaixaConversao) {
      alertas.push({
        tipo: 'baixa_conversao' as const,
        mensagem: `${canalBaixaConversao.canalNome} com baixa taxa de conversão (${canalBaixaConversao.taxaConversao.toFixed(1)}%)`,
        severidade: 'baixa' as const
      });
    }

    const canaisInativos = canaisEntrada.filter(canal => !canal.ativo);
    if (canaisInativos.length > 0) {
      alertas.push({
        tipo: 'canal_inativo' as const,
        mensagem: `${canaisInativos.length} canais inativos encontrados`,
        severidade: 'baixa' as const
      });
    }

    return {
      periodo: { inicio, fim },
      resumoGeral: {
        totalClientes,
        canaisAtivos,
        clientesSemCanal,
        taxaPreenchimento
      },
      clientesPorCanal,
      clientesPorMes,
      conversaoPorCanal,
      tendencias: {
        canalMaisEfetivo,
        canalMenosEfetivo,
        crescimentoLeads,
        canaisEmAlta
      },
      alertas
    };
  }, [dataInicio, dataFim, clientes, canaisEntrada, eventos]);

  // Converter dados para formato dos gráficos
  const clientesPorCanalData: ChartDataPoint[] = dadosCanaisEntrada.clientesPorCanal.map(item => ({
    label: item.canalNome,
    value: item.quantidade,
    percentage: item.percentual
  }));

  const clientesPorMesData: ChartDataPoint[] = dadosCanaisEntrada.clientesPorMes.map(item => ({
    label: item.mes,
    value: item.totalClientes,
    percentage: 0
  }));

  const conversaoPorCanalData: ChartDataPoint[] = dadosCanaisEntrada.conversaoPorCanal.map(item => ({
    label: item.canalNome,
    value: item.taxaConversao,
    percentage: 0
  }));

  const exportarCSV = () => {
    const csvData = [
      ['Relatório de Canais de Entrada'],
      [`Período: ${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`],
      [''],
      ['RESUMO GERAL'],
      ['Total de Clientes', dadosCanaisEntrada.resumoGeral.totalClientes],
      ['Canais Ativos', dadosCanaisEntrada.resumoGeral.canaisAtivos],
      ['Clientes sem Canal', dadosCanaisEntrada.resumoGeral.clientesSemCanal],
      ['Taxa de Preenchimento (%)', dadosCanaisEntrada.resumoGeral.taxaPreenchimento.toFixed(2)],
      [''],
      ['CLIENTES POR CANAL'],
      ['Canal', 'Quantidade', 'Percentual (%)', 'Valor Total Eventos', 'Ticket Médio'],
      ...dadosCanaisEntrada.clientesPorCanal.map(item => [
        item.canalNome,
        item.quantidade,
        item.percentual.toFixed(2),
        item.valorTotalEventos,
        item.ticketMedio.toFixed(2)
      ]),
      [''],
      ['CONVERSÃO POR CANAL'],
      ['Canal', 'Total Leads', 'Eventos Gerados', 'Taxa Conversão (%)', 'Receita Gerada'],
      ...dadosCanaisEntrada.conversaoPorCanal.map(item => [
        item.canalNome,
        item.totalLeads,
        item.eventosGerados,
        item.taxaConversao.toFixed(2),
        item.receitaGerada
      ]),
      [''],
      ['CLIENTES POR MÊS'],
      ['Mês', 'Total Clientes'],
      ...dadosCanaisEntrada.clientesPorMes.map(item => [
        item.mes,
        item.totalClientes
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-canais-entrada-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
            <UserPlusIcon className="h-5 w-5" />
            Relatório de Canais de Entrada
          </CardTitle>
          <CardDescription>
            Análise detalhada da origem dos leads e efetividade dos canais
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
      {dadosCanaisEntrada.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Alertas de Canais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dadosCanaisEntrada.alertas.map((alerta, index) => (
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
          title="Total de Clientes"
          value={dadosCanaisEntrada.resumoGeral.totalClientes}
          color="primary"
        />
        <StatCard
          title="Canais Ativos"
          value={dadosCanaisEntrada.resumoGeral.canaisAtivos}
          color="info"
        />
        <StatCard
          title="Taxa de Preenchimento"
          value={`${dadosCanaisEntrada.resumoGeral.taxaPreenchimento.toFixed(1)}%`}
          color={dadosCanaisEntrada.resumoGeral.taxaPreenchimento >= 80 ? "success" : "warning"}
        />
        <StatCard
          title="Clientes sem Canal"
          value={dadosCanaisEntrada.resumoGeral.clientesSemCanal}
          color={dadosCanaisEntrada.resumoGeral.clientesSemCanal === 0 ? "success" : "warning"}
        />
      </StatGrid>

      {/* Clientes por Canal */}
      <TabbedChart
        title="Clientes por Canal de Entrada"
        subtitle="Distribuição dos clientes por origem"
        tabs={[
          {
            id: 'pizza',
            label: '🥧 Pizza',
            content: (
              <PieChart 
                data={clientesPorCanalData}
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
                data={clientesPorCanalData}
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dadosCanaisEntrada.clientesPorCanal.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.canalNome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.percentual.toFixed(1)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {item.valorTotalEventos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {item.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
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

      {/* Análise Temporal e Conversão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clientes por Mês</CardTitle>
            <CardDescription>
              Evolução do número de clientes ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={clientesPorMesData}
              config={{ 
                showValues: true, 
                showPercentages: false 
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão por Canal</CardTitle>
            <CardDescription>
              Efetividade de cada canal em gerar eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={conversaoPorCanalData}
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
            Análise das tendências de canais de entrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">Canal Mais Efetivo</h4>
              <p className="text-green-600 font-bold">{dadosCanaisEntrada.tendencias.canalMaisEfetivo}</p>
            </div>
            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Canal Menos Efetivo</h4>
              <p className="text-red-600 font-bold">{dadosCanaisEntrada.tendencias.canalMenosEfetivo}</p>
            </div>
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">Crescimento de Leads</h4>
              <p className={`font-bold ${dadosCanaisEntrada.tendencias.crescimentoLeads >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dadosCanaisEntrada.tendencias.crescimentoLeads.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-purple-50">
              <h4 className="font-medium text-purple-800 mb-2">Canais em Alta</h4>
              <p className="text-purple-600 font-bold">{dadosCanaisEntrada.tendencias.canaisEmAlta.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
