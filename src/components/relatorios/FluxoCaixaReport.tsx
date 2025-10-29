'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Evento, Pagamento, CustoEvento } from '@/types';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownTrayIcon, ChartBarIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { 
  StatCard, 
  StatGrid, 
  TabbedChart, 
  PieChart, 
  BarChart,
  ChartDataPoint 
} from '@/components/charts';

interface FluxoCaixaReportProps {
  eventos: Evento[];
  pagamentos: Pagamento[];
  custos: CustoEvento[];
}

export default function FluxoCaixaReport({ eventos, pagamentos, custos }: FluxoCaixaReportProps) {
  const [dataInicio, setDataInicio] = useState(
    format(subMonths(new Date(), 11), 'yyyy-MM-dd')
  );
  const [dataFim, setDataFim] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const dadosFluxoCaixa = useMemo(() => {
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    
    // Filtrar dados do período
    const pagamentosPeriodo = pagamentos.filter(p => {
      const dataPag = new Date(p.dataPagamento);
      return dataPag >= inicio && dataPag <= fim && p.status === 'Pago';
    });

    const custosPeriodo = custos.filter(c => {
      const dataCusto = new Date(c.dataCadastro);
      return dataCusto >= inicio && dataCusto <= fim;
    });

    // Calcular receitas por mês
    const receitasPorMes: Record<string, number> = {};
    pagamentosPeriodo.forEach(pagamento => {
      const mes = format(new Date(pagamento.dataPagamento), 'yyyy-MM');
      receitasPorMes[mes] = (receitasPorMes[mes] || 0) + pagamento.valor;
    });

    // Calcular despesas por mês
    const despesasPorMes: Record<string, number> = {};
    custosPeriodo.forEach(custo => {
      const mes = format(new Date(custo.dataCadastro), 'yyyy-MM');
      despesasPorMes[mes] = (despesasPorMes[mes] || 0) + custo.valor;
    });

    // Gerar fluxo mensal
    const meses = eachMonthOfInterval({ start: inicio, end: fim });
    const fluxoMensal = meses.map(mes => {
      const mesKey = format(mes, 'yyyy-MM');
      const receitas = receitasPorMes[mesKey] || 0;
      const despesas = despesasPorMes[mesKey] || 0;
      const saldo = receitas - despesas;
      
      return {
        mes: format(mes, 'MMM/yyyy', { locale: ptBR }),
        ano: mes.getFullYear(),
        receitas,
        despesas,
        saldo,
        saldoAcumulado: 0 // Será calculado depois
      };
    });

    // Calcular saldo acumulado
    let saldoAcumulado = 0;
    fluxoMensal.forEach(item => {
      saldoAcumulado += item.saldo;
      item.saldoAcumulado = saldoAcumulado;
    });

    // Receitas por forma de pagamento
    const receitasPorForma: Record<string, number> = {};
    pagamentosPeriodo.forEach(pagamento => {
      receitasPorForma[pagamento.formaPagamento] = 
        (receitasPorForma[pagamento.formaPagamento] || 0) + pagamento.valor;
    });

    const totalReceitas = Object.values(receitasPorForma).reduce((sum, val) => sum + val, 0);
    const receitasPorFormaPagamento = Object.entries(receitasPorForma).map(([forma, valor]) => ({
      formaPagamento: forma,
      valor,
      percentual: totalReceitas > 0 ? (valor / totalReceitas) * 100 : 0
    }));

    // Despesas por categoria
    const despesasPorCategoria: Record<string, number> = {};
    custosPeriodo.forEach(custo => {
      const categoria = custo.tipoCusto.nome;
      despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + custo.valor;
    });

    const totalDespesas = Object.values(despesasPorCategoria).reduce((sum, val) => sum + val, 0);
    const despesasPorCategoriaData = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0
    }));

    // Resumo geral
    const receitaTotal = totalReceitas;
    const despesaTotal = totalDespesas;
    const saldoAtual = receitaTotal - despesaTotal;
    const saldoAnterior = fluxoMensal.length > 1 ? 
      fluxoMensal[fluxoMensal.length - 2].saldoAcumulado : 0;
    const variacaoSaldo = saldoAtual - saldoAnterior;
    const percentualVariacao = saldoAnterior !== 0 ? (variacaoSaldo / Math.abs(saldoAnterior)) * 100 : 0;

    // Projeção (simples baseada na média dos últimos 3 meses)
    const ultimos3Meses = fluxoMensal.slice(-3);
    const mediaReceita = ultimos3Meses.reduce((sum, m) => sum + m.receitas, 0) / ultimos3Meses.length;
    const mediaDespesa = ultimos3Meses.reduce((sum, m) => sum + m.despesas, 0) / ultimos3Meses.length;
    
    const proximos3Meses = [];
    for (let i = 1; i <= 3; i++) {
      const mesProjecao = new Date(fim);
      mesProjecao.setMonth(mesProjecao.getMonth() + i);
      proximos3Meses.push({
        mes: format(mesProjecao, 'MMM/yyyy', { locale: ptBR }),
        receitaProjetada: mediaReceita,
        despesaProjetada: mediaDespesa,
        saldoProjetado: mediaReceita - mediaDespesa
      });
    }

    // Determinar tendência
    const crescimento = ultimos3Meses.length >= 2 ? 
      ultimos3Meses[ultimos3Meses.length - 1].saldo - ultimos3Meses[0].saldo : 0;
    const tendencia = crescimento > 0 ? 'crescimento' : crescimento < 0 ? 'declinio' : 'estavel';

    // Alertas
    const alertas = [];
    if (saldoAtual < 0) {
      alertas.push({
        tipo: 'saldo_negativo' as const,
        mensagem: 'Saldo atual negativo detectado',
        severidade: 'alta' as const
      });
    }
    if (percentualVariacao < -20) {
      alertas.push({
        tipo: 'declinio_receita' as const,
        mensagem: 'Declínio significativo nas receitas',
        severidade: 'media' as const
      });
    }

    return {
      periodo: { inicio, fim },
      resumoGeral: {
        receitaTotal,
        despesaTotal,
        saldoAtual,
        saldoAnterior,
        variacaoSaldo,
        percentualVariacao
      },
      fluxoMensal,
      receitasPorFormaPagamento,
      despesasPorCategoria: despesasPorCategoriaData,
      projecao: {
        proximos3Meses,
        tendencia,
        confiabilidade: 75 // Baseado na estabilidade dos dados
      },
      alertas
    };
  }, [dataInicio, dataFim, pagamentos, custos]);

  // Converter dados para formato dos gráficos
  const receitasPorFormaData: ChartDataPoint[] = dadosFluxoCaixa.receitasPorFormaPagamento.map(item => ({
    label: item.formaPagamento,
    value: item.valor,
    percentage: item.percentual
  }));

  const despesasPorCategoriaData: ChartDataPoint[] = dadosFluxoCaixa.despesasPorCategoria.map(item => ({
    label: item.categoria,
    value: item.valor,
    percentage: item.percentual
  }));

  const fluxoMensalData: ChartDataPoint[] = dadosFluxoCaixa.fluxoMensal.map(item => ({
    label: item.mes,
    value: item.saldo,
    percentage: 0
  }));

  // Dados formatados para o gráfico combinado
  const fluxoMensalChartData = dadosFluxoCaixa.fluxoMensal.map(item => ({
    mes: item.mes,
    receitas: item.receitas,
    despesas: item.despesas,
    saldo: item.saldo,
    saldoAcumulado: item.saldoAcumulado
  }));

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#10B981"
    },
    despesas: {
      label: "Despesas",
      color: "#EF4444"
    },
    saldo: {
      label: "Saldo",
      color: "#3B82F6"
    },
    saldoAcumulado: {
      label: "Saldo Acumulado",
      color: "#8B5CF6"
    }
  };

  const exportarCSV = () => {
    const csvData = [
      ['Relatório de Fluxo de Caixa'],
      [`Período: ${format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}`],
      [''],
      ['RESUMO GERAL'],
      ['Receita Total', dadosFluxoCaixa.resumoGeral.receitaTotal],
      ['Despesa Total', dadosFluxoCaixa.resumoGeral.despesaTotal],
      ['Saldo Atual', dadosFluxoCaixa.resumoGeral.saldoAtual],
      ['Variação do Saldo', dadosFluxoCaixa.resumoGeral.variacaoSaldo],
      ['Percentual de Variação (%)', dadosFluxoCaixa.resumoGeral.percentualVariacao.toFixed(2)],
      [''],
      ['FLUXO MENSAL'],
      ['Mês', 'Receitas', 'Despesas', 'Saldo', 'Saldo Acumulado'],
      ...dadosFluxoCaixa.fluxoMensal.map(item => [
        item.mes,
        item.receitas,
        item.despesas,
        item.saldo,
        item.saldoAcumulado
      ]),
      [''],
      ['RECEITAS POR FORMA DE PAGAMENTO'],
      ['Forma de Pagamento', 'Valor', 'Percentual (%)'],
      ...dadosFluxoCaixa.receitasPorFormaPagamento.map(item => [
        item.formaPagamento,
        item.valor,
        item.percentual.toFixed(2)
      ]),
      [''],
      ['DESPESAS POR CATEGORIA'],
      ['Categoria', 'Valor', 'Percentual (%)'],
      ...dadosFluxoCaixa.despesasPorCategoria.map(item => [
        item.categoria,
        item.valor,
        item.percentual.toFixed(2)
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fluxo-caixa-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
            <ChartBarIcon className="h-5 w-5" />
            Relatório de Fluxo de Caixa
          </CardTitle>
          <CardDescription>
            Análise completa do fluxo de caixa mensal com projeções
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
      {dadosFluxoCaixa.alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dadosFluxoCaixa.alertas.map((alerta, index) => (
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
          title="Receita Total"
          value={`R$ ${dadosFluxoCaixa.resumoGeral.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="success"
        />
        <StatCard
          title="Despesa Total"
          value={`R$ ${dadosFluxoCaixa.resumoGeral.despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="error"
        />
        <StatCard
          title="Saldo Atual"
          value={`R$ ${dadosFluxoCaixa.resumoGeral.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color={dadosFluxoCaixa.resumoGeral.saldoAtual >= 0 ? "success" : "error"}
          trend={{
            value: Math.abs(dadosFluxoCaixa.resumoGeral.percentualVariacao),
            isPositive: dadosFluxoCaixa.resumoGeral.percentualVariacao >= 0
          }}
        />
        <StatCard
          title="Variação do Saldo"
          value={`${dadosFluxoCaixa.resumoGeral.percentualVariacao.toFixed(1)}%`}
          color={dadosFluxoCaixa.resumoGeral.percentualVariacao >= 0 ? "success" : "error"}
        />
      </StatGrid>

      {/* Fluxo Mensal */}
      <TabbedChart
        title="Fluxo de Caixa Mensal"
        subtitle="Evolução das receitas, despesas e saldo ao longo do tempo"
        tabs={[
          {
            id: 'grafico',
            label: '📊 Gráfico',
            content: (
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={fluxoMensalChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
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
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-white p-3 shadow-lg">
                            <div className="mb-2 text-sm font-semibold text-gray-900">
                              {payload[0]?.payload?.mes}
                            </div>
                            <div className="space-y-1">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between gap-4 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-gray-600">{entry.name}:</span>
                                  </div>
                                  <span className="font-semibold text-gray-900">
                                    {typeof entry.value === 'number' 
                                      ? `R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                      : entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="receitas" 
                      fill="#10B981" 
                      name="Receitas"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="despesas" 
                      fill="#EF4444" 
                      name="Despesas"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="saldoAcumulado" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      name="Saldo Acumulado"
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Mês</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Receitas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Despesas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Saldo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Saldo Acumulado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {dadosFluxoCaixa.fluxoMensal.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.mes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          R$ {item.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          R$ {item.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {item.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.saldoAcumulado >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {item.saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        ]}
        defaultTab="grafico"
      />

      {/* Análise de Receitas e Despesas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Forma de Pagamento</CardTitle>
            <CardDescription>
              Distribuição das receitas por método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={receitasPorFormaData}
              config={{ 
                showLegend: true, 
                showValues: true, 
                showPercentages: true 
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos custos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={despesasPorCategoriaData}
              config={{ 
                showLegend: true, 
                showValues: true, 
                showPercentages: true 
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Projeções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dadosFluxoCaixa.projecao.tendencia === 'crescimento' ? (
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            ) : dadosFluxoCaixa.projecao.tendencia === 'declinio' ? (
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
            ) : (
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
            )}
            Projeções para os Próximos 3 Meses
          </CardTitle>
          <CardDescription>
            Tendência: {dadosFluxoCaixa.projecao.tendencia} | 
            Confiabilidade: {dadosFluxoCaixa.projecao.confiabilidade}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dadosFluxoCaixa.projecao.proximos3Meses.map((projecao, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-text-primary mb-2">{projecao.mes}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Receita:</span>
                    <span className="text-green-600 font-medium">
                      R$ {projecao.receitaProjetada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Despesa:</span>
                    <span className="text-red-600 font-medium">
                      R$ {projecao.despesaProjetada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-text-secondary font-medium">Saldo:</span>
                    <span className={`font-bold ${
                      projecao.saldoProjetado >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      R$ {projecao.saldoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
