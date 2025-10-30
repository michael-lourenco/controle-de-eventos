'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useEventos, useDashboardData, useAllPagamentos, useAllServicos, useTiposServicos, useClientes, useCanaisEntrada, useAllCustos } from '@/hooks/useData';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import PerformanceEventosReport from '@/components/relatorios/PerformanceEventosReport';
import FluxoCaixaReport from '@/components/relatorios/FluxoCaixaReport';
import ServicosReport from '@/components/relatorios/ServicosReport';
import CanaisEntradaReport from '@/components/relatorios/CanaisEntradaReport';
import ImpressoesReport from '@/components/relatorios/ImpressoesReport';

export default function RelatoriosPage() {
  const { data: eventos, loading: loadingEventos } = useEventos();
  const { data: dashboardData, loading: loadingDashboard } = useDashboardData();
  const { data: pagamentos, loading: loadingPagamentos } = useAllPagamentos();
  const { data: servicos, loading: loadingServicos } = useAllServicos();
  const { data: tiposServicos, loading: loadingTiposServicos } = useTiposServicos();
  const { data: clientes, loading: loadingClientes } = useClientes();
  const { data: canaisEntrada, loading: loadingCanaisEntrada } = useCanaisEntrada();
  const { data: custos, loading: loadingCustos } = useAllCustos();
  
  const [periodoInicio, setPeriodoInicio] = useState(
    format(startOfMonth(subMonths(new Date(), 6)), 'yyyy-MM-dd')
  );
  const [periodoFim, setPeriodoFim] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  
  const loading = loadingEventos || loadingDashboard || loadingPagamentos || loadingServicos || loadingTiposServicos || loadingClientes || loadingCanaisEntrada || loadingCustos;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando relatórios...</div>
        </div>
      </Layout>
    );
  }
  
  if (!eventos || !dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Nenhum dado disponível para relatórios</div>
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
          <p className="text-text-secondary">
            Análise financeira e estatísticas do negócio
          </p>
        </div>

        {/* Submenu de Navegação Rápida */}
        <div className="sticky top-16 z-30 bg-surface/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('periodo-analise');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Período de Análise
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('performance-eventos');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Performance de Eventos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('fluxo-caixa');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Fluxo de Caixa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('servicos-tipo');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Serviços por Tipo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('canais-entrada');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Canais de Entrada
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('impressoes');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Impressões
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('receita-mensal');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover"
            >
              Receita Mensal
            </Button>
          </div>
        </div>

        {/* Filtros de Período */}
        <div id="periodo-analise">
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
        </div>

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
                    <span className="text-sm font-medium text-text-primary">{tipo}</span>
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
                    <span className="text-sm font-medium text-text-primary capitalize">
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
        <div id="receita-mensal">
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
                  <span className="text-sm font-medium text-text-primary w-20">
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
        </div>

        {/* Relatório de Performance de Eventos */}
        <div id="performance-eventos">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">📊 Performance de Eventos</CardTitle>
            <CardDescription>
              Análise detalhada de performance dos eventos com exportação CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceEventosReport eventos={eventos} />
          </CardContent>
        </Card>
        </div>

        {/* Relatório de Fluxo de Caixa */}
        <div id="fluxo-caixa">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">💰 Fluxo de Caixa</CardTitle>
            <CardDescription>
              Análise completa do fluxo de caixa mensal com projeções e alertas financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FluxoCaixaReport 
              eventos={eventos} 
              pagamentos={pagamentos || []} 
              custos={custos || []} 
            />
          </CardContent>
        </Card>
        </div>

        {/* Relatório de Serviços */}
        <div id="servicos-tipo">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">🔧 Serviços por Tipo</CardTitle>
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
        </div>

        {/* Relatório de Canais de Entrada */}
        <div id="canais-entrada">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">📈 Canais de Entrada</CardTitle>
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
        </div>

        {/* Relatório de Impressões */}
        <div id="impressoes">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">🖨️ Impressões</CardTitle>
            <CardDescription>
              Análise detalhada do uso de impressões e custos de insumos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImpressoesReport eventos={eventos} />
          </CardContent>
        </Card>
        </div>

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
