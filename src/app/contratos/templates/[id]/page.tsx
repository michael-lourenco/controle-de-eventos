'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ModeloContrato } from '@/types';
import ContractPreview from '@/components/ContractPreview';
import TemplateEditor, { TemplateEditorRef } from '@/components/TemplateEditor';

interface VariavelDisponivel {
  chave: string;
  label: string;
  tipo: 'unica' | 'multipla';
  categoria: 'configuracao' | 'customizada' | 'evento';
}

export default function EditarTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  const editorRef = useRef<TemplateEditorRef>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [variaveisDisponiveis, setVariaveisDisponiveis] = useState<VariavelDisponivel[]>([]);
  const [template, setTemplate] = useState<ModeloContrato | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    template: '',
    ativo: true
  });

  useEffect(() => {
    if (id) {
      loadTemplate();
      loadVariaveisDisponiveis();
    }
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/modelos-contrato/${id}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setTemplate(data);
        setFormData({
          nome: data.nome,
          descricao: data.descricao || '',
          template: data.template,
          ativo: data.ativo
        });
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao carregar template', 'error');
        router.push('/contratos/templates');
      }
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      showToast('Erro ao carregar template', 'error');
      router.push('/contratos/templates');
    } finally {
      setLoading(false);
    }
  };

  const loadVariaveisDisponiveis = async () => {
    try {
      const response = await fetch('/api/variaveis-contrato/disponiveis');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const metadados = data.metadados || {};
        
        const variaveis: VariavelDisponivel[] = [];
        
        (metadados.configuracoes || []).forEach((chave: string) => {
          variaveis.push({ chave, label: chave.replace(/_/g, ' '), tipo: 'unica', categoria: 'configuracao' });
        });
        
        (metadados.customizadas || []).forEach((chave: string) => {
          variaveis.push({ chave, label: chave.replace(/_/g, ' '), tipo: 'unica', categoria: 'customizada' });
        });
        
        (metadados.evento || []).forEach((chave: string) => {
          const tipo = chave === 'tipos_servico' ? 'multipla' : 'unica';
          variaveis.push({ chave, label: chave.replace(/_/g, ' '), tipo, categoria: 'evento' });
        });
        
        setVariaveisDisponiveis(variaveis);
      }
    } catch (error) {
      console.error('Erro ao carregar variáveis:', error);
    }
  };

  const inserirVariavel = (variavel: VariavelDisponivel) => {
    editorRef.current?.inserirVariavel(variavel);
  };

  const handlePreview = async () => {
    if (!formData.template.trim()) {
      showToast('Template não pode estar vazio', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/contratos/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: formData.template
        })
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setPreviewHtml(data.html || '');
        setMostrarPreview(true);
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao gerar preview', 'error');
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      showToast('Erro ao gerar preview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!formData.nome || !formData.template) {
      showToast('Nome e Template são obrigatórios', 'error');
      return;
    }

    try {
      setSalvando(true);
      const response = await fetch(`/api/modelos-contrato/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          descricao: formData.descricao,
          template: formData.template,
          ativo: formData.ativo
        })
      });

      if (response.ok) {
        showToast('Template atualizado com sucesso', 'success');
        router.push('/contratos/templates');
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao salvar template', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      showToast('Erro ao salvar template', 'error');
    } finally {
      setSalvando(false);
    }
  };

  if (loading && !template) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return null;
  }

  const variaveisPorCategoria = {
    configuracao: variaveisDisponiveis.filter(v => v.categoria === 'configuracao'),
    customizada: variaveisDisponiveis.filter(v => v.categoria === 'customizada'),
    evento: variaveisDisponiveis.filter(v => v.categoria === 'evento')
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/contratos/templates')}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Editar Template</h1>
            <p className="text-text-secondary mt-2">
              Edite seu template personalizado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Variáveis - Mesmo código do novo */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variáveis Disponíveis</CardTitle>
                <CardDescription>
                  Clique para inserir no template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {variaveisPorCategoria.configuracao.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary mb-2">Configuração</h4>
                    <div className="space-y-1">
                      {variaveisPorCategoria.configuracao.map((v) => (
                        <button
                          key={v.chave}
                          onClick={() => inserirVariavel(v)}
                          className="w-full text-left px-2 py-1 text-sm rounded hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {v.tipo === 'unica' ? '{{' : '['}{v.chave}{v.tipo === 'unica' ? '}}' : ']'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {variaveisPorCategoria.customizada.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary mb-2">Customizadas</h4>
                    <div className="space-y-1">
                      {variaveisPorCategoria.customizada.map((v) => (
                        <button
                          key={v.chave}
                          onClick={() => inserirVariavel(v)}
                          className="w-full text-left px-2 py-1 text-sm rounded hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {v.tipo === 'unica' ? '{{' : '['}{v.chave}{v.tipo === 'unica' ? '}}' : ']'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {variaveisPorCategoria.evento.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-text-primary mb-2">Evento</h4>
                    <div className="space-y-1">
                      {variaveisPorCategoria.evento.map((v) => (
                        <button
                          key={v.chave}
                          onClick={() => inserirVariavel(v)}
                          className="w-full text-left px-2 py-1 text-sm rounded hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {v.tipo === 'unica' ? '{{' : '['}{v.chave}{v.tipo === 'unica' ? '}}' : ']'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Editor de Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nome do Template *
                  </label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Descrição
                  </label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Template *
                  </label>
                  <TemplateEditor
                    ref={editorRef}
                    value={formData.template}
                    onChange={(html) => setFormData({ ...formData, template: html })}
                    variaveisDisponiveis={variaveisDisponiveis}
                    placeholder="Digite seu template aqui... Use a barra de ferramentas para formatar e clique nas variáveis na sidebar para inserir."
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
                    Ativo
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={loading}
                  >
                    {loading ? 'Gerando...' : 'Preview'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/contratos/templates')}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {mostrarPreview && previewHtml && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Visualização do contrato formatado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContractPreview html={previewHtml} className="max-h-[800px]" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
