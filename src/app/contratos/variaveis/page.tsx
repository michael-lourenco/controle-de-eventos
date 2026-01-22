'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { VariavelContrato } from '@/types';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const FORMATO_UNICA = '{{variavel}}';
const FORMATO_MULTIPLA = '[variavel]';

export default function VariaveisContratoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [variaveis, setVariaveis] = useState<VariavelContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [variavelParaExcluir, setVariavelParaExcluir] = useState<VariavelContrato | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    chave: '',
    label: '',
    tipo: 'unica' as 'unica' | 'multipla',
    valorPadrao: '',
    descricao: '',
    ordem: 0,
    ativo: true
  });

  useEffect(() => {
    loadVariaveis();
  }, []);

  const loadVariaveis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/variaveis-contrato');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setVariaveis(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao carregar variáveis', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar variáveis:', error);
      showToast('Erro ao carregar variáveis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setFormData({
      chave: '',
      label: '',
      tipo: 'unica',
      valorPadrao: '',
      descricao: '',
      ordem: 0,
      ativo: true
    });
    setEditandoId(null);
    setMostrarForm(true);
  };

  const handleEditar = (variavel: VariavelContrato) => {
    setFormData({
      chave: variavel.chave,
      label: variavel.label,
      tipo: variavel.tipo,
      valorPadrao: variavel.valorPadrao || '',
      descricao: variavel.descricao || '',
      ordem: variavel.ordem,
      ativo: variavel.ativo
    });
    setEditandoId(variavel.id);
    setMostrarForm(true);
  };

  const handleSalvar = async () => {
    if (!formData.chave || !formData.label) {
      showToast('Chave e Label são obrigatórios', 'error');
      return;
    }

    try {
      const url = editandoId 
        ? `/api/variaveis-contrato/${editandoId}`
        : '/api/variaveis-contrato';
      
      const method = editandoId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast(
          editandoId ? 'Variável atualizada com sucesso' : 'Variável criada com sucesso',
          'success'
        );
        setMostrarForm(false);
        setEditandoId(null);
        loadVariaveis();
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao salvar variável', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar variável:', error);
      showToast('Erro ao salvar variável', 'error');
    }
  };

  const handleExcluir = (variavel: VariavelContrato) => {
    setVariavelParaExcluir(variavel);
    setShowDeleteDialog(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!variavelParaExcluir) return;

    try {
      const response = await fetch(`/api/variaveis-contrato/${variavelParaExcluir.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Variável excluída com sucesso', 'success');
        loadVariaveis();
        setVariavelParaExcluir(null);
        setShowDeleteDialog(false);
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao excluir variável', 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir variável:', error);
      showToast('Erro ao excluir variável', 'error');
    }
  };

  const variaveisOrdenadas = [...variaveis].sort((a, b) => {
    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
    return a.label.localeCompare(b.label);
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/contratos')}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Variáveis de Contrato</h1>
            <p className="text-text-secondary mt-2">
              Crie variáveis customizadas para usar em seus templates de contrato
            </p>
          </div>
        </div>

        {!mostrarForm ? (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleNovo}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Nova Variável
              </Button>
            </div>

            {loading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-text-secondary">Carregando...</p>
                </CardContent>
              </Card>
            ) : variaveisOrdenadas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-text-secondary mb-4">Nenhuma variável cadastrada</p>
                  <Button onClick={handleNovo}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Criar Primeira Variável
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {variaveisOrdenadas.map((variavel) => (
                  <Card key={variavel.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-text-primary">{variavel.label}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              variavel.tipo === 'unica' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {variavel.tipo === 'unica' ? '{{' : '['}{variavel.chave}{variavel.tipo === 'unica' ? '}}' : ']'}
                            </span>
                            {!variavel.ativo && (
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                Inativa
                              </span>
                            )}
                          </div>
                          {variavel.descricao && (
                            <p className="text-sm text-text-secondary mb-2">{variavel.descricao}</p>
                          )}
                          {variavel.valorPadrao && (
                            <p className="text-sm text-text-secondary">
                              <strong>Valor padrão:</strong> {variavel.valorPadrao}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditar(variavel)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluir(variavel)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {editandoId ? 'Editar Variável' : 'Nova Variável'}
              </CardTitle>
              <CardDescription>
                {formData.tipo === 'unica' 
                  ? `Variável única será usada como {{${formData.chave || 'chave'}}} no template`
                  : `Variável múltipla será usada como [${formData.chave || 'chave'}] no template e retornará valores separados por vírgula`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Chave *
                </label>
                <Input
                  value={formData.chave}
                  onChange={(e) => setFormData({ ...formData, chave: e.target.value })}
                  placeholder="nome_empresa"
                  disabled={!!editandoId}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Apenas letras, números e underscore. Não pode ser alterada após criação.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Label *
                </label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Nome da Empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'unica' | 'multipla' })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface text-text-primary"
                >
                  <option value="unica">Única - formato: {FORMATO_UNICA}</option>
                  <option value="multipla">Múltipla - formato: {FORMATO_MULTIPLA}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Valor Padrão
                </label>
                <Input
                  value={formData.valorPadrao}
                  onChange={(e) => setFormData({ ...formData, valorPadrao: e.target.value })}
                  placeholder={formData.tipo === 'multipla' ? 'item1, item2, item3' : 'Valor padrão'}
                />
                {formData.tipo === 'multipla' && (
                  <p className="text-xs text-text-secondary mt-1">
                    Para variáveis múltiplas, separe os valores por vírgula
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Descrição
                </label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da variável"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Ordem
                </label>
                <Input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="ativo" className="text-sm text-text-primary">
                  Ativa
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSalvar}>
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarForm(false);
                    setEditandoId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmarExclusao}
          title="Excluir Variável"
          message={`Tem certeza que deseja excluir a variável "${variavelParaExcluir?.label}"?`}
        />
      </div>
    </Layout>
  );
}
