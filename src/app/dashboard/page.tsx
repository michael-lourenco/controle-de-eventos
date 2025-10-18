'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Layout from '@/components/Layout';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  getEventosHoje,
  getPagamentosPendentes,
  getPagamentosAtrasados,
  getEventosProximos,
  calcularValorTotalPendente,
  calcularReceitaMes,
  calcularReceitaAno,
  pagamentos
} from '@/lib/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const eventosHoje = getEventosHoje();
  const pagamentosPendentes = getPagamentosPendentes();
  const pagamentosAtrasados = getPagamentosAtrasados();
  const eventosProximos = getEventosProximos(7);
  const valorTotalPendente = calcularValorTotalPendente();
  
  const hoje = new Date();
  const receitaMes = calcularReceitaMes(hoje.getFullYear(), hoje.getMonth() + 1);
  const receitaAno = calcularReceitaAno(hoje.getFullYear());

  const stats = [
    {
      name: 'Eventos Hoje',
      value: eventosHoje.length,
      icon: CalendarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Receita do Mês',
      value: `R$ ${receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pagamentos Pendentes',
      value: pagamentosPendentes.length,
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Valor Pendente',
      value: `R$ ${valorTotalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Visão geral do sistema Click-se
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Eventos de Hoje
              </CardTitle>
              <CardDescription>
                {format(hoje, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventosHoje.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum evento agendado para hoje</p>
              ) : (
                <div className="space-y-3">
                  {eventosHoje.map((evento) => (
                    <div key={evento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{evento.cliente.nome}</p>
                        <p className="text-sm text-gray-600">{evento.local}</p>
                        <p className="text-sm text-gray-500">{evento.horarioInicioServico}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {evento.tipoEvento}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagamentos Atrasados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                Pagamentos Atrasados
              </CardTitle>
              <CardDescription>
                {pagamentosAtrasados.length} pagamentos em atraso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pagamentosAtrasados.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum pagamento em atraso</p>
              ) : (
                <div className="space-y-3">
                  {pagamentosAtrasados.slice(0, 5).map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{pagamento.contrato.evento.cliente.nome}</p>
                        <p className="text-sm text-gray-600">
                          Vencido em {format(pagamento.dataVencimento, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">Parcela {pagamento.numeroParcela}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Eventos Próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-green-600" />
              Próximos Eventos (7 dias)
            </CardTitle>
            <CardDescription>
              Eventos agendados para os próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventosProximos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum evento nos próximos 7 dias</p>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventosProximos.map((evento) => (
                      <tr key={evento.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {evento.cliente.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {evento.local}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {evento.tipoEvento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {evento.status}
                          </span>
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
              <div className="text-3xl font-bold text-green-600">
                R$ {receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {format(hoje, 'MMMM yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receita do Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {receitaAno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {hoje.getFullYear()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {pagamentos.length}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Registros no sistema
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
