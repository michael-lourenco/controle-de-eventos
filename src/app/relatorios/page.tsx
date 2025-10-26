'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Layout from '@/components/Layout';
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useEventos, useDashboardData, useAllPagamentos, useAllServicos, useTiposServicos, useClientes, useCanaisEntrada } from '@/hooks/useData';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import PerformanceEventosReport from '@/components/relatorios/PerformanceEventosReport';
import FluxoCaixaReport from '@/components/relatorios/FluxoCaixaReport';
import ServicosReport from '@/components/relatorios/ServicosReport';
import CanaisEntradaReport from '@/components/relatorios/CanaisEntradaReport';

export default function RelatoriosPage() {
  const { data: eventos, loading: loadingEventos } = useEventos();
  const { data: dashboardData, loading: loadingDashboard } = useDashboardData();
  const { data: pagamentos, loading: loadingPagamentos } = useAllPagamentos();
  const { data: servicos, loading: loadingServicos } = useAllServicos();
  const { data: tiposServicos, loading: loadingTiposServicos } = useTiposServicos();
  const { data: clientes, loading: loadingClientes } = useClientes();
  const { data: canaisEntrada, loading: loadingCanaisEntrada } = useCanaisEntrada();
  
  const [periodoInicio, setPeriodoInicio] = useState(
    format(startOfMonth(subMonths(new Date(), 6)), 'yyyy-MM-dd')
  );
  const [periodoFim, setPeriodoFim] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  
  const loading = loadingEventos || loadingDashboard || loadingPagamentos || loadingServicos || loadingTiposServicos || loadingClientes || loadingCanaisEntrada;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Carregando relatórios...</div>
        </div>
      </Layout>
    );
  }
  
  if (!eventos || !dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Nenhum dado disponível para relatórios</div>
        </div>
      </Layout>
    );
  }

  // Cálculos para o período selecionado
  const dataInicio = new Date(periodoInicio);
  const dataFim = new Date(periodoFim);

  const eventosPeriodo = eventos.filter(evento => {
    const dataEvento = new Date(evento.dataEvento);
    return dataEvento >= dataInicio && dataEvento <= dataFim;
  });

  const receitaTotal = dashboardData.resumoFinanceiro.receitaTotal;
  const pagamentosPendentes = dashboardData.pagamentosPendentes;
  const pagamentosAtrasados = []; // Com a nova lógica, não há mais status "Atrasado" nos pagamentos

  // Estatísticas por tipo de evento
  const eventosPorTipo = eventosPeriodo.reduce((acc, evento) => {
    acc[evento.tipoEvento] = (acc[evento.tipoEvento] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Receita por mês no período
  const receitaPorMes = dashboardData.graficos.receitaMensal;

  // Status dos pagamentos
  const statusPagamentos = {
    pago: dashboardData.graficos.statusPagamentos.find(s => s.status === 'Pago')?.quantidade || 0,
    pendente: dashboardData.graficos.statusPagamentos.find(s => s.status === 'Pendente')?.quantidade || 0,
    atrasado: dashboardData.graficos.statusPagamentos.find(s => s.status === 'Atrasado')?.quantidade || 0,
    cancelado: dashboardData.graficos.statusPagamentos.find(s => s.status === 'Cancelado')?.quantidade || 0
  };

  // Total de pagamentos para cálculo de porcentagem
  const totalPagamentos = Object.values(statusPagamentos).reduce((total, quantidade) => total + quantidade, 0);

  const handleGerarRelatorio = () => {
    // Aqui seria implementada a geração do relatório em PDF/Excel
    console.log('Gerando relatório para o período:', periodoInicio, 'até', periodoFim);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Relatórios</h1>
          <p className="text-gray-600">
            Análise financeira e estatísticas do negócio
          </p>
        </div>

        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <CardTitle>Período de Análise</CardTitle>
            <CardDescription>
              Selecione o período para gerar os relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Input
                  label="Data Início"
                  type="date"
                  value={periodoInicio}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Data Fim"
                  type="date"
                  value={periodoFim}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleGerarRelatorio} className="w-full">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-green-100">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Receita Total</p>
                  <p className="text-2xl font-semibold text-text-primary">
                    R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Eventos Realizados</p>
                  <p className="text-2xl font-semibold text-text-primary">
                    {eventosPeriodo.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-yellow-100">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Pagamentos Pendentes</p>
                  <p className="text-2xl font-semibold text-text-primary">
                    {pagamentosPendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-red-100">
                  <ChartBarIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Pagamentos Atrasados</p>
                  <p className="text-2xl font-semibold text-text-primary">
                    {pagamentosAtrasados.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Eventos por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos por Tipo</CardTitle>
              <CardDescription>
                Distribuição dos eventos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(eventosPorTipo).map(([tipo, quantidade]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{tipo}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(quantidade / eventosPeriodo.length) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-primary w-8 text-right">
                        {quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status dos Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Pagamentos</CardTitle>
              <CardDescription>
                Distribuição por status de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusPagamentos).map(([status, quantidade]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'pago' ? 'bg-green-600' :
                            status === 'pendente' ? 'bg-yellow-600' :
                            status === 'atrasado' ? 'bg-red-600' : 'bg-gray-600'
                          }`}
                          style={{ 
                            width: totalPagamentos > 0 ? `${(quantidade / totalPagamentos) * 100}%` : '0%'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-text-primary w-8 text-right">
                        {quantidade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receita Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal (Últimos 12 meses)</CardTitle>
            <CardDescription>
              Evolução da receita ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receitaPorMes.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-20">
                    {item.mes}
                  </span>
                  <div className="flex items-center flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.valor / Math.max(...receitaPorMes.map(r => r.valor))) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-text-primary w-24 text-right">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Performance de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">📊 Relatório de Performance de Eventos</CardTitle>
            <CardDescription>
              Análise detalhada de performance dos eventos com exportação CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceEventosReport eventos={eventos} />
          </CardContent>
        </Card>

        {/* Relatório de Fluxo de Caixa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">💰 Relatório de Fluxo de Caixa</CardTitle>
            <CardDescription>
              Análise completa do fluxo de caixa mensal com projeções e alertas financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FluxoCaixaReport 
              eventos={eventos} 
              pagamentos={pagamentos || []} 
              custos={[]} 
            />
          </CardContent>
        </Card>

        {/* Relatório de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">🔧 Relatório de Serviços por Tipo</CardTitle>
            <CardDescription>
              Análise detalhada da utilização de serviços por tipo e evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServicosReport 
              eventos={eventos} 
              servicos={servicos || []} 
              tiposServicos={tiposServicos || []} 
            />
          </CardContent>
        </Card>

        {/* Relatório de Canais de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">📈 Relatório de Canais de Entrada</CardTitle>
            <CardDescription>
              Análise detalhada da origem dos leads e efetividade dos canais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CanaisEntradaReport 
              clientes={clientes || []} 
              canaisEntrada={canaisEntrada || []} 
              eventos={eventos} 
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline">
            <EyeIcon className="h-4 w-4 mr-2" />
            Visualizar Relatório
          </Button>
          <Button>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>
    </Layout>
  );
}
