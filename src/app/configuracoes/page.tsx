'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function ConfiguracoesPage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
          <p className="text-text-secondary mt-2">Gerencie as configurações do sistema</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Configuração de Contratos */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => router.push('/contratos/configuracao')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Configuração de contratos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Configure os dados fixos da empresa que serão usados nos contratos (razão social, CNPJ, endereço, etc.)
              </p>
              <Button variant="outline" className="w-full">
                Configurar
              </Button>
            </CardContent>
          </Card>

          {/* Configuração de Google Calendar */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => router.push('/configuracoes/calendario')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Google Calendar</CardTitle>
                  <CardDescription>Integração com calendário</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Configure a integração com o Google Calendar para sincronizar seus eventos
              </p>
              <Button variant="outline" className="w-full">
                Configurar
              </Button>
            </CardContent>
          </Card>

          {/* Planos */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => router.push('/planos')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Planos</CardTitle>
                  <CardDescription>Visualizar planos disponíveis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Visualize e compare os planos disponíveis para sua conta
              </p>
              <Button variant="outline" className="w-full">
                Ver Planos
              </Button>
            </CardContent>
          </Card>

          {/* Assinatura */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                onClick={() => router.push('/assinatura')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle>Assinatura</CardTitle>
                  <CardDescription>Gerenciar sua assinatura</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Gerencie sua assinatura atual, altere de plano ou cancele
              </p>
              <Button variant="outline" className="w-full">
                Gerenciar Assinatura
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

