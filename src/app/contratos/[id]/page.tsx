'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Contrato } from '@/types';
import { ArrowLeftIcon, DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ContratoViewPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    loadContrato();
  }, [params.id]);

  const loadContrato = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contratos/${params.id}`);
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: contrato }
        const contratoData = result.data || result;
        setContrato(contratoData);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Erro ao carregar contrato', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar contrato:', error);
      showToast('Erro ao carregar contrato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarPDF = async () => {
    if (!contrato) return;
    try {
      setGerandoPDF(true);
      const response = await fetch(`/api/contratos/${contrato.id}/gerar-pdf`, { method: 'POST' });
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: { pdfUrl, ... } }
        const pdfData = result.data || result;
        showToast('PDF gerado com sucesso', 'success');
        if (pdfData.pdfUrl) {
          window.open(pdfData.pdfUrl, '_blank');
        }
        loadContrato();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Erro ao gerar PDF', 'error');
      }
    } catch (error) {
      showToast('Erro ao gerar PDF', 'error');
    } finally {
      setGerandoPDF(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </Layout>
    );
  }

  if (!contrato) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Contrato não encontrado</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.push('/contratos')} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{contrato.numeroContrato}</h1>
            <p className="text-text-secondary">{contrato.modeloContrato?.nome}</p>
          </div>
          <div className="flex gap-2">
            {contrato.status === 'rascunho' && (
              <Button onClick={handleGerarPDF} disabled={gerandoPDF}>
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                {gerandoPDF ? 'Gerando...' : 'Gerar PDF'}
              </Button>
            )}
            {contrato.pdfUrl && (
              <Button variant="outline" onClick={() => window.open(contrato.pdfUrl, '_blank')}>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> <span className="capitalize">{contrato.status || 'N/A'}</span></p>
              <p><strong>Data de Criação:</strong> {
                contrato.dataCadastro 
                  ? (contrato.dataCadastro instanceof Date 
                      ? contrato.dataCadastro.toLocaleDateString('pt-BR')
                      : new Date(contrato.dataCadastro).toLocaleDateString('pt-BR'))
                  : 'N/A'
              }</p>
              {contrato.dataGeracao && (
                <p><strong>Data de Geração:</strong> {
                  contrato.dataGeracao instanceof Date
                    ? contrato.dataGeracao.toLocaleDateString('pt-BR')
                    : new Date(contrato.dataGeracao).toLocaleDateString('pt-BR')
                }</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

