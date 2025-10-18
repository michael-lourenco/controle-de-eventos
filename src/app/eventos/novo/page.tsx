'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/Layout';
import EventoForm from '@/components/forms/EventoForm';
import { Evento } from '@/types';
import {
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function NovoEventoPage() {
  const router = useRouter();

  const handleSave = (novoEvento: Evento) => {
    // O evento já foi criado no mockData pela função createEvento
    router.push(`/eventos/${novoEvento.id}`);
  };

  const handleCancel = () => {
    router.push('/eventos');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/eventos')}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo Evento</h1>
              <p className="text-gray-600">Cadastre um novo evento no sistema</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Evento</CardTitle>
            <CardDescription>
              Preencha todas as informações necessárias para cadastrar o evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventoForm
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
