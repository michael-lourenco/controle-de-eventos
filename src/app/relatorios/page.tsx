'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAllEventos, useDashboardData, useAllPagamentos, useAllServicos, useTiposServicos, useAllClientes, useCanaisEntrada, useAllCustos } from '@/hooks/useData';
import PerformanceEventosReport from '@/components/relatorios/PerformanceEventosReport';
import FluxoCaixaReport from '@/components/relatorios/FluxoCaixaReport';
import ServicosReport from '@/components/relatorios/ServicosReport';
import CanaisEntradaReport from '@/components/relatorios/CanaisEntradaReport';
import ImpressoesReport from '@/components/relatorios/ImpressoesReport';
import ReceitaMensalReport from '@/components/relatorios/ReceitaMensalReport';
import DetalhamentoReceberReport from '@/components/relatorios/DetalhamentoReceberReport';
import PlanoBloqueio from '@/components/PlanoBloqueio';

export default function RelatoriosPage() {
  // Usar hooks que incluem arquivados para relatórios completos
  const { data: eventos, loading: loadingEventos } = useAllEventos();
  const { data: dashboardData, loading: loadingDashboard } = useDashboardData();
  const { data: pagamentos, loading: loadingPagamentos } = useAllPagamentos();
  const { data: servicos, loading: loadingServicos } = useAllServicos();
  const { data: tiposServicos, loading: loadingTiposServicos } = useTiposServicos();
  const { data: clientes, loading: loadingClientes } = useAllClientes();
  const { data: canaisEntrada, loading: loadingCanaisEntrada } = useCanaisEntrada();
  const { data: custos, loading: loadingCustos } = useAllCustos();
  
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
          <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
            {/* Gradientes indicadores de scroll - aparecem nas bordas */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-surface via-surface/80 to-transparent pointer-events-none z-10 md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-surface via-surface/80 to-transparent pointer-events-none z-10 md:hidden" />
            
            {/* Container com scroll */}
            <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('total-receber');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
            >
              Total a Receber
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.getElementById('receita-mensal-relatorio');
                if (element) {
                  const offset = 120;
                  const elementPosition = element.offsetTop - offset;
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' });
                }
              }}
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
            >
              Receita Mensal
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
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
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
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
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
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
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
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
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
              className="text-text-primary hover:bg-surface-hover whitespace-nowrap flex-shrink-0"
            >
              Impressões
            </Button>
            </div>
          </div>
        </div>
        {/* Detalhamento do Valor a Receber */}
        <div id="total-receber">
          <DetalhamentoReceberReport
            eventos={eventos}
            pagamentos={pagamentos || []}
            dashboardTotals={{
              pendente: dashboardData.resumoFinanceiro.valorPendente,
              atrasado: dashboardData.resumoFinanceiro.valorAtrasado
            }}
          />
        </div>

        {/* Relatório de Receita Mensal */}
        <div id="receita-mensal-relatorio">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">💰 Relatório de Receita Mensal</CardTitle>
              <CardDescription>
                Análise detalhada da receita mensal com exportação CSV (máximo 24 meses)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReceitaMensalReport eventos={eventos} pagamentos={pagamentos || []} />
            </CardContent>
          </Card>
        </div>

        {/* Relatório de Performance de Eventos */}
        <div id="performance-eventos">
          <PlanoBloqueio funcionalidade="RELATORIOS_AVANCADOS">
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
          </PlanoBloqueio>
        </div>

        {/* Relatório de Fluxo de Caixa */}
        <div id="fluxo-caixa">
          <PlanoBloqueio funcionalidade="FLUXO_CAIXA">
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
          </PlanoBloqueio>
        </div>

        {/* Relatório de Serviços */}
        <div id="servicos-tipo">
          <PlanoBloqueio funcionalidade="RELATORIOS_AVANCADOS">
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
          </PlanoBloqueio>
        </div>

        {/* Relatório de Canais de Entrada */}
        <div id="canais-entrada">
          <PlanoBloqueio funcionalidade="RELATORIOS_AVANCADOS">
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
          </PlanoBloqueio>
        </div>

        {/* Relatório de Impressões */}
        <div id="impressoes">
          <PlanoBloqueio funcionalidade="RELATORIOS_AVANCADOS">
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
          </PlanoBloqueio>
        </div>

        {/* Relatórios Full - Apenas Premium */}
        <div id="relatorios-full">
          <PlanoBloqueio 
            funcionalidade="RELATORIOS_FULL"
            mensagem="Relatórios Full com métricas completas e detalhadas estão disponíveis apenas no plano Premium"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">⭐ Relatórios Full - Premium</CardTitle>
                <CardDescription>
                  Métricas completas e detalhadas para melhor tomada de decisão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-text-secondary">
                    Esta seção contém relatórios avançados com análises mais profundas e métricas adicionais.
                    Em breve, novos relatórios serão adicionados aqui exclusivamente para o plano Premium.
                  </p>
                  {/* Aqui podem ser adicionados relatórios específicos do Premium no futuro */}
                </div>
              </CardContent>
            </Card>
          </PlanoBloqueio>
        </div>
      </div>
    </Layout>
  );
}
