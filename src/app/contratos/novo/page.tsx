'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { ModeloContrato, CampoContrato, Evento, ServicoEvento } from '@/types';
import { ContratoService } from '@/lib/services/contrato-service';
import { repositoryFactory } from '@/lib/repositories/repository-factory';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import LoadingHotmart from '@/components/LoadingHotmart';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';

function NovoContratoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { userId } = useCurrentUser();
  const eventoId = searchParams.get('eventoId');

  const [passo, setPasso] = useState(1);
  const [modelos, setModelos] = useState<ModeloContrato[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloContrato | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [servicosEvento, setServicosEvento] = useState<ServicoEvento[]>([]);
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

  // Atualizar dados quando serviços do evento forem carregados e modelo já estiver selecionado
  useEffect(() => {
    const atualizarDadosComServicos = async () => {
      if (evento && modeloSelecionado && servicosEvento.length > 0) {
        console.log('Atualizando dados com serviços carregados:', servicosEvento);
        try {
          const configResponse = await fetch('/api/configuracao-contrato/campos-fixos');
          if (configResponse.ok) {
            const camposFixosResult = await configResponse.json();
            const camposFixos = camposFixosResult.data || camposFixosResult;
            const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modeloSelecionado, servicosEvento);
            console.log('Dados do evento preenchidos:', dadosEvento);
            setDadosPreenchidos({ ...camposFixos, ...dadosEvento });
          } else {
            // Sem campos fixos, usar apenas dados do evento
            const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modeloSelecionado, servicosEvento);
            console.log('Dados do evento preenchidos (sem campos fixos):', dadosEvento);
            setDadosPreenchidos(dadosEvento);
          }
        } catch (error) {
          console.error('Erro ao atualizar dados com serviços:', error);
        }
      }
    };

    atualizarDadosComServicos();
  }, [servicosEvento, evento, modeloSelecionado]);

  const loadModelos = async () => {
    try {
      const response = await fetch('/api/modelos-contrato');
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: modelos[] }
        const modelosData = result.data || result;
        const modelosArray = Array.isArray(modelosData) ? modelosData : [];
        setModelos(modelosArray);
        
        if (modelosArray.length === 0) {
          const seedResponse = await fetch('/api/seed/modelos-contrato', { method: 'POST' });
          if (seedResponse.ok) {
            const seedData = await seedResponse.json();
            if (seedData.success) {
              showToast('Modelos de contrato inicializados!', 'success');
              const reloadResponse = await fetch('/api/modelos-contrato');
              if (reloadResponse.ok) {
                const reloadResult = await reloadResponse.json();
                const reloadModelos = reloadResult.data || reloadResult;
                setModelos(Array.isArray(reloadModelos) ? reloadModelos : []);
              }
            }
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Erro ao carregar modelos:', errorData);
        showToast(errorData.error || 'Erro ao carregar modelos', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      showToast('Erro ao carregar modelos', 'error');
    }
  };

  const loadEvento = async () => {
    try {
      const response = await fetch(`/api/eventos/${eventoId}`);
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: evento }
        const eventoData = result.data || result;
        setEvento(eventoData);
        
        // Buscar serviços do evento
        let servicos: ServicoEvento[] = [];
        if (userId && eventoId) {
          try {
            servicos = await dataService.getServicosEvento(userId, eventoId);
            setServicosEvento(servicos);
          } catch (error) {
            console.error('Erro ao carregar serviços do evento:', error);
            // Não mostrar erro ao usuário, apenas log
          }
        }
        
        // Se já houver modelo selecionado, preencher dados com os serviços carregados
        if (eventoData && modeloSelecionado) {
          const dados = await ContratoService.preencherDadosDoEvento(eventoData, modeloSelecionado, servicos);
          setDadosPreenchidos(dados);
        }
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Erro ao carregar evento', 'error');
      }
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      showToast('Erro ao carregar evento', 'error');
    }
  };

  const handleSelecionarModelo = async (modelo: ModeloContrato) => {
    setModeloSelecionado(modelo);
    setPasso(2);

    // Se houver evento mas serviços ainda não foram carregados, tentar carregar agora
    let servicosParaUsar = servicosEvento;
    if (evento && eventoId && userId && servicosEvento.length === 0) {
      try {
        console.log('handleSelecionarModelo: Serviços não carregados, carregando agora...');
        servicosParaUsar = await dataService.getServicosEvento(userId, eventoId);
        setServicosEvento(servicosParaUsar);
        console.log('handleSelecionarModelo: Serviços carregados:', servicosParaUsar.length);
      } catch (error) {
        console.error('Erro ao carregar serviços no handleSelecionarModelo:', error);
      }
    }

    // Sempre buscar campos fixos via API (mesmo quando há evento)
    try {
      const configResponse = await fetch('/api/configuracao-contrato');
      
      if (configResponse.ok) {
        const configResult = await configResponse.json();
        // createApiResponse retorna { data: config }
        const config = configResult.data || configResult;
        if (config && config.id) {
          setConfigExistente(true);
          // Buscar campos fixos formatados
          const camposFixosResponse = await fetch('/api/configuracao-contrato/campos-fixos');
          if (camposFixosResponse.ok) {
            const camposFixosResult = await camposFixosResponse.json();
            // createApiResponse retorna { data: camposFixos }
            const camposFixos = camposFixosResult.data || camposFixosResult;
            
          // Se houver evento, mesclar dados do evento com campos fixos
          if (evento) {
            console.log('handleSelecionarModelo: Preenchendo dados com evento e', servicosParaUsar.length, 'serviços');
            console.log('handleSelecionarModelo: Cliente do evento:', evento.cliente);
            const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modelo, servicosParaUsar);
            console.log('handleSelecionarModelo: Dados do evento:', dadosEvento);
            console.log('handleSelecionarModelo: nome_cliente =', dadosEvento.nome_cliente);
            console.log('handleSelecionarModelo: cpf_cliente =', dadosEvento.cpf_cliente);
            console.log('handleSelecionarModelo: telefone_cliente =', dadosEvento.telefone_cliente);
            // Mesclar: campos fixos primeiro, depois dados do evento (evento sobrescreve campos fixos se houver conflito)
            const dadosMesclados = { ...camposFixos, ...dadosEvento };
            console.log('handleSelecionarModelo: Dados mesclados:', dadosMesclados);
            console.log('handleSelecionarModelo: data_evento =', dadosMesclados.data_evento);
            console.log('handleSelecionarModelo: tipo_servico =', dadosMesclados.tipo_servico);
            console.log('handleSelecionarModelo: data_contrato =', dadosMesclados.data_contrato);
            setDadosPreenchidos(dadosMesclados);
          } else {
            // Sem evento, usar apenas campos fixos e adicionar data_contrato
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const dia = String(hoje.getDate()).padStart(2, '0');
            const dataContrato = `${ano}-${mes}-${dia}`;
            setDadosPreenchidos({ ...camposFixos, data_contrato: dataContrato });
          }
          } else {
            setConfigExistente(false);
            // Se houver evento, ainda tentar preencher com dados do evento
            if (evento) {
              const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modelo, servicosParaUsar);
              setDadosPreenchidos(dadosEvento);
            }
          }
        } else {
          setConfigExistente(false);
          // Se houver evento, ainda tentar preencher com dados do evento
          if (evento) {
            const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modelo, servicosParaUsar);
            setDadosPreenchidos(dadosEvento);
          }
          showToast('Configure os dados da empresa antes de criar contratos', 'warning');
        }
      } else {
        setConfigExistente(false);
        // Se houver evento, ainda tentar preencher com dados do evento
        if (evento) {
          const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modelo, servicosParaUsar);
          setDadosPreenchidos(dadosEvento);
        }
        showToast('Configure os dados da empresa antes de criar contratos', 'warning');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      setConfigExistente(false);
      // Se houver evento, ainda tentar preencher com dados do evento
      if (evento) {
        const dadosEvento = await ContratoService.preencherDadosDoEvento(evento, modelo, servicosParaUsar);
        setDadosPreenchidos(dadosEvento);
      }
    }
  };

  const gerarPreview = async () => {
    if (!modeloSelecionado) return;
    try {
      const response = await fetch('/api/contratos/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          modeloContratoId: modeloSelecionado.id, 
          dadosPreenchidos,
          eventoId: eventoId || undefined // Incluir eventoId se disponível
        })
      });
      if (response.ok) {
        const result = await response.json();
        // createApiResponse retorna { data: { html: ... } }
        const previewData = result.data || result;
        setPreviewHtml(previewData.html || '');
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
        const result = await response.json();
        // createApiResponse retorna { data: contrato }
        const contrato = result.data || result;
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
    
    // Log para debug dos campos problemáticos
    if (campo.chave === 'data_evento' || campo.chave === 'tipo_servico' || campo.chave === 'data_contrato' || campo.chave === 'valor_total_formatado' || campo.chave === 'servicos_incluidos' || campo.chave === 'duracao_servico' || campo.chave === 'horario_termino') {
      console.log(`Campo ${campo.chave} (${campo.label}): valor =`, valor, 'dadosPreenchidos =', dadosPreenchidos[campo.chave]);
    }

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
        // Para campos currency, usar text para aceitar valor formatado
        const inputType = campo.tipo === 'date' 
          ? 'date' 
          : campo.tipo === 'currency' 
            ? 'text' 
            : campo.tipo === 'number' 
              ? 'number' 
              : 'text';
        
        return (
          <div key={campo.id} className="mb-4">
            <Input
              label={campo.label}
              type={inputType}
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
                      className="border border-border rounded-lg p-4 cursor-pointer bg-surface hover:bg-surface-hover hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      onClick={() => handleSelecionarModelo(modelo)}
                    >
                      <h3 className="font-semibold text-text-primary">{modelo.nome}</h3>
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
                <div className="border rounded p-4 bg-white text-gray-900 [&_*]:text-gray-900 [&_*]:dark:text-gray-900" dangerouslySetInnerHTML={{ __html: previewHtml }} />
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
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingHotmart size="md" />
            <p className="mt-4 text-text-secondary">Carregando...</p>
          </div>
        </div>
      </Layout>
    }>
      <NovoContratoPageContent />
    </Suspense>
  );
}

