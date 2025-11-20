'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { ModeloContrato, CampoContrato, Evento } from '@/types';
import { ContratoService } from '@/lib/services/contrato-service';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

function NovoContratoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const eventoId = searchParams.get('eventoId');

  const [passo, setPasso] = useState(1);
  const [modelos, setModelos] = useState<ModeloContrato[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloContrato | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [dadosPreenchidos, setDadosPreenchidos] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [configExistente, setConfigExistente] = useState<boolean | null>(null);

  useEffect(() => {
    loadModelos();
    if (eventoId) {
      loadEvento();
    }
  }, [eventoId]);

  useEffect(() => {
    if (modeloSelecionado && Object.keys(dadosPreenchidos).length > 0) {
      gerarPreview();
    }
  }, [modeloSelecionado, dadosPreenchidos]);

  const loadModelos = async () => {
    try {
      const response = await fetch('/api/modelos-contrato');
      if (response.ok) {
        const data = await response.json();
        setModelos(data);
        
        if (data.length === 0) {
          const seedResponse = await fetch('/api/seed/modelos-contrato', { method: 'POST' });
          if (seedResponse.ok) {
            const seedData = await seedResponse.json();
            if (seedData.success) {
              showToast('Modelos de contrato inicializados!', 'success');
              const reloadResponse = await fetch('/api/modelos-contrato');
              if (reloadResponse.ok) {
                const reloadData = await reloadResponse.json();
                setModelos(reloadData);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
    }
  };

  const loadEvento = async () => {
    try {
      const response = await fetch(`/api/eventos/${eventoId}`);
      if (response.ok) {
        const data = await response.json();
        setEvento(data);
        if (data && modeloSelecionado) {
          const dados = await ContratoService.preencherDadosDoEvento(data, modeloSelecionado);
          setDadosPreenchidos(dados);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    }
  };

  const handleSelecionarModelo = async (modelo: ModeloContrato) => {
    setModeloSelecionado(modelo);
    setPasso(2);

    if (evento) {
      const dados = await ContratoService.preencherDadosDoEvento(evento, modelo);
      setDadosPreenchidos(dados);
    } else {
      // Buscar campos fixos via API
      try {
        const configResponse = await fetch('/api/configuracao-contrato');
        
        if (configResponse.ok) {
          const config = await configResponse.json();
          if (config && config.id) {
            setConfigExistente(true);
            // Buscar campos fixos formatados
            const camposFixosResponse = await fetch('/api/configuracao-contrato/campos-fixos');
            if (camposFixosResponse.ok) {
              const camposFixos = await camposFixosResponse.json();
              setDadosPreenchidos(camposFixos);
            } else {
              setConfigExistente(false);
            }
          } else {
            setConfigExistente(false);
            showToast('Configure os dados da empresa antes de criar contratos', 'warning');
          }
        } else {
          setConfigExistente(false);
          showToast('Configure os dados da empresa antes de criar contratos', 'warning');
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        setConfigExistente(false);
      }
    }
  };

  const gerarPreview = async () => {
    if (!modeloSelecionado) return;
    try {
      const response = await fetch('/api/contratos/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeloContratoId: modeloSelecionado.id, dadosPreenchidos })
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.html);
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
    }
  };

  const handleInicializarModelos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seed/modelos-contrato', { method: 'POST' });
      if (response.ok) {
        showToast('Modelos inicializados com sucesso!', 'success');
        await loadModelos();
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao inicializar modelos', 'error');
      }
    } catch (error) {
      showToast('Erro ao inicializar modelos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!modeloSelecionado) return;

    const validacao = ContratoService.validarDadosPreenchidos(dadosPreenchidos, modeloSelecionado.campos);
    if (!validacao.valido) {
      showToast(`Erro: ${validacao.erros.join(', ')}`, 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: eventoId || undefined,
          modeloContratoId: modeloSelecionado.id,
          dadosPreenchidos,
          status: 'rascunho'
        })
      });

      if (response.ok) {
        const contrato = await response.json();
        showToast('Contrato criado com sucesso', 'success');
        router.push(`/contratos/${contrato.id}`);
      } else {
        const error = await response.json();
        showToast(error.error || 'Erro ao criar contrato', 'error');
      }
    } catch (error) {
      showToast('Erro ao criar contrato', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderCampo = (campo: CampoContrato) => {
    const valor = dadosPreenchidos[campo.chave] || campo.valorPadrao || '';

    switch (campo.tipo) {
      case 'textarea':
        return (
          <div key={campo.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">{campo.label}{campo.obrigatorio && ' *'}</label>
            <Textarea
              value={valor}
              onChange={(e) => setDadosPreenchidos({ ...dadosPreenchidos, [campo.chave]: e.target.value })}
              required={campo.obrigatorio}
            />
          </div>
        );
      case 'select':
        return (
          <div key={campo.id} className="mb-4">
            <label className="block text-sm font-medium mb-1">{campo.label}{campo.obrigatorio && ' *'}</label>
            <select
              value={valor}
              onChange={(e) => setDadosPreenchidos({ ...dadosPreenchidos, [campo.chave]: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              required={campo.obrigatorio}
            >
              <option value="">Selecione...</option>
              {campo.opcoes?.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={campo.id} className="mb-4">
            <Input
              label={campo.label}
              type={campo.tipo === 'date' ? 'date' : campo.tipo === 'number' || campo.tipo === 'currency' ? 'number' : 'text'}
              value={valor}
              onChange={(e) => setDadosPreenchidos({ ...dadosPreenchidos, [campo.chave]: e.target.value })}
              required={campo.obrigatorio}
            />
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-3xl font-bold text-text-primary mb-6">Novo Contrato</h1>

        {passo === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Selecione o Modelo de Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              {modelos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-secondary mb-4">Nenhum modelo disponível</p>
                  <Button onClick={handleInicializarModelos} variant="outline" disabled={loading}>
                    {loading ? 'Inicializando...' : 'Inicializar Modelos'}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-end">
                    <Button 
                      onClick={handleInicializarModelos} 
                      variant="outline" 
                      size="sm"
                      disabled={loading}
                      title="Clique para sincronizar/atualizar modelos de contrato"
                    >
                      {loading ? 'Sincronizando...' : '🔄 Sincronizar Modelos'}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {modelos.map((modelo) => (
                    <div
                      key={modelo.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSelecionarModelo(modelo)}
                    >
                      <h3 className="font-semibold">{modelo.nome}</h3>
                      {modelo.descricao && <p className="text-sm text-text-secondary">{modelo.descricao}</p>}
                    </div>
                  ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {passo === 2 && modeloSelecionado && (
          <>
            {configExistente === false && !evento && (
              <Card className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">
                    Configuração Necessária
                  </CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Você precisa configurar os dados fixos da empresa antes de criar contratos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/contratos/configuracao')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                  >
                    Configurar Dados da Empresa
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Preencher Dados do Contrato</CardTitle>
                <CardDescription>Modelo: {modeloSelecionado.nome}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modeloSelecionado.campos
                    .sort((a, b) => a.ordem - b.ordem)
                    .map(campo => renderCampo(campo))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Preview do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded p-4 bg-white" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={() => setPasso(1)} variant="outline">
                Voltar
              </Button>
              <Button onClick={handleSalvar} disabled={loading} className="bg-primary">
                {loading ? 'Salvando...' : 'Salvar Contrato'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default function NovoContratoPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando...</p>
          </div>
        </div>
      </Layout>
    }>
      <NovoContratoPageContent />
    </Suspense>
  );
}

