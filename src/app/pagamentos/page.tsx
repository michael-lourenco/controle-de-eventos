'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/Layout';
import {
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function PagamentosPage() {
  // Página temporariamente desabilitada - pagamentos agora são gerenciados dentro dos eventos
  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Página em Reestruturação</h3>
          <p className="mt-1 text-sm text-gray-500">
            Os pagamentos agora são gerenciados dentro de cada evento.
          </p>
          <div className="mt-6">
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}