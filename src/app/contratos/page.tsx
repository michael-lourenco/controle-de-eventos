'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Contrato } from '@/types';
import { PlusIcon, DocumentTextIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function ContratosPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [contratoParaExcluir, setContratoParaExcluir] = useState<Contrato | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadContratos();
  }, [filtroStatus]);

  const loadContratos = async () => {
    try {
      setLoading(true);
      const url = filtroStatus ? `/api/contratos?status=${filtroStatus}` : '/api/contratos';
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: contratos }
        const contratos = result.data || result;
        setContratos(Array.isArray(contratos) ? contratos : []);
      } else {
        const error = await response.json();
        console.error('Erro ao carregar contratos:', error);
        showToast(error.error || 'Erro ao carregar contratos', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      showToast('Erro ao carregar contratos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirContrato = (contrato: Contrato) => {
    setContratoParaExcluir(contrato);
    setShowDeleteDialog(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!contratoParaExcluir) return;

    try {
      const response = await fetch(`/api/contratos/${contratoParaExcluir.id}`, { method: 'DELETE' });
      if (response.ok) {
        showToast('Contrato excluído com sucesso', 'success');
        loadContratos();
        setContratoParaExcluir(null);
        setShowDeleteDialog(false);
      } else {
        showToast('Erro ao excluir contrato', 'error');
      }
    } catch (error) {
      showToast('Erro ao excluir contrato', 'error');
    }
  };

  const handleGerarPDF = async (id: string) => {
    try {
      const response = await fetch(`/api/contratos/${id}/gerar-pdf`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        showToast('PDF gerado com sucesso', 'success');
        if (data.pdfUrl) {
          window.open(data.pdfUrl, '_blank');
        }
        loadContratos();
      } else {
        showToast('Erro ao gerar PDF', 'error');
      }
    } catch (error) {
      showToast('Erro ao gerar PDF', 'error');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Contratos</h1>
            <p className="text-text-secondary mt-2">Gerencie seus contratos</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => router.push('/contratos/configuracao')}
              title="Configurar dados fixos da empresa"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Configurar Dados
            </Button>
            <Button onClick={() => router.push('/contratos/novo')} className="btn-add">
              <PlusIcon className="h-5 w-5 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lista de Contratos</CardTitle>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="">Todos os status</option>
                <option value="rascunho">Rascunho</option>
                <option value="gerado">Gerado</option>
                <option value="assinado">Assinado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : contratos.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                Nenhum contrato encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {contratos.map((contrato) => (
                  <div key={contrato.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{contrato.numeroContrato || 'Sem número'}</h3>
                      <p className="text-sm text-text-secondary">
                        {contrato.modeloContrato?.nome || 'Modelo não encontrado'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(contrato.dataCadastro).toLocaleDateString('pt-BR')}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
                        contrato.status === 'gerado' ? 'bg-green-100 text-green-800' :
                        contrato.status === 'assinado' ? 'bg-blue-100 text-blue-800' :
                        contrato.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contrato.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/contratos/${contrato.id}`)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      {contrato.status === 'gerado' && contrato.pdfUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contrato.pdfUrl, '_blank')}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {contrato.status === 'rascunho' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGerarPDF(contrato.id)}
                        >
                          <DocumentTextIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirContrato(contrato)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Excluir Contrato"
          description={
            contratoParaExcluir
              ? `Tem certeza que deseja excluir o contrato "${contratoParaExcluir.numeroContrato || 'Sem número'}"? Esta ação não pode ser desfeita.`
              : 'Tem certeza que deseja excluir este contrato?'
          }
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
          onConfirm={handleConfirmarExclusao}
        />
      </div>
    </Layout>
  );
}

