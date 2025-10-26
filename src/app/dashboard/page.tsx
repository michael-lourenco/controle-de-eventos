'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useDashboardData } from '@/hooks/useData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const { data: dashboardData, loading, error } = useDashboardData();
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando dados do dashboard...</div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">Erro ao carregar dados: {error}</div>
        </div>
      </Layout>
    );
  }
  
  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Nenhum dado disponível</div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      name: 'Receita Total',
      value: `R$ ${dashboardData.resumoFinanceiro.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      color: 'text-success',
      bgColor: 'bg-success-bg'
    },
    {
      name: 'Valor a Receber',
      value: `R$ ${dashboardData.resumoFinanceiro.valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ClockIcon,
      color: 'text-warning',
      bgColor: 'bg-warning-bg'
    },
    {
      name: 'Valor Atrasado',
      value: `R$ ${dashboardData.resumoFinanceiro.valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ExclamationTriangleIcon,
      color: 'text-error',
      bgColor: 'bg-error-bg'
    },
    {
      name: 'Total de Eventos',
      value: dashboardData.resumoFinanceiro.totalEventos,
      icon: CalendarIcon,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      name: 'Eventos Concluídos',
      value: dashboardData.resumoFinanceiro.eventosConcluidos,
      icon: CalendarIcon,
      color: 'text-success',
      bgColor: 'bg-success-bg'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">
            Visão geral do sistema Click-se
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4 p-6">
                  {/* Ícone */}
                  <div className={`flex-shrink-0 rounded-full p-6 ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-medium text-text-secondary leading-tight">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-text-primary leading-none">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Eventos Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-info" />
                  Eventos de Hoje
                </div>
                <span className="text-2xl font-bold text-primary">
                  {dashboardData.eventosHoje}
                </span>
              </CardTitle>
              <CardDescription>
                {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.eventosHoje === 0 ? (
                <p className="text-text-muted text-center py-4">Nenhum evento agendado para hoje</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.eventosHojeLista?.map((evento) => (
                    <div key={evento.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{evento.cliente.nome}</p>
                        <p className="text-sm text-text-secondary">{evento.local}</p>
                        <p className="text-sm text-text-muted">{evento.chegadaNoLocal}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {evento.tipoEvento}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/eventos/${evento.id}`)}
                          title="Visualizar"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valores Atrasados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-error" />
                Valores Atrasados
              </CardTitle>
              <CardDescription>
                Eventos com valores em atraso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.pagamentosPendentes === 0 ? (
                <p className="text-text-muted text-center py-4">Nenhum pagamento pendente</p>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-error">
                    {dashboardData.pagamentosPendentes}
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    Pagamentos pendentes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Eventos Próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-success" />
              Próximos Eventos (7 dias)
            </CardTitle>
            <CardDescription>
              Eventos agendados para os próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.eventosProximos.length === 0 ? (
              <p className="text-text-muted text-center py-4">Nenhum evento nos próximos 7 dias</p>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-surface">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {dashboardData.eventosProximos.map((evento) => (
                      <tr key={evento.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          {evento.cliente.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {evento.local}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {evento.tipoEvento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-bg text-success-text">
                            {evento.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/eventos/${evento.id}`)}
                            title="Visualizar"
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                R$ {dashboardData.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-text-muted mt-1">
                {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita do Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">
                R$ {dashboardData.receitaAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-text-muted mt-1">
                {new Date().getFullYear()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary">
                {dashboardData.pagamentosPendentes}
              </div>
              <p className="text-sm text-text-muted mt-1">
                Registros no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
