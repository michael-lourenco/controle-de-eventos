'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Assinatura, Plano, Funcionalidade, CategoriaFuncionalidade } from '@/types/funcionalidades';
import { CheckIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { usePlano } from '@/lib/hooks/usePlano';
import LimiteUso from '@/components/LimiteUso';

export default function AssinaturaPage() {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const { limites, loading: loadingLimites } = usePlano();

  useEffect(() => {
    loadAssinatura();
  }, []);

  const loadAssinatura = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assinaturas');
      const data = await res.json();
      
      if (data.assinatura) {
        setAssinatura(data.assinatura);
        
        if (data.assinatura.planoId) {
          const planoRes = await fetch(`/api/planos/${data.assinatura.planoId}`);
          const planoData = await planoRes.json();
          setPlano(planoData.plano);
        }

        // Carregar detalhes das funcionalidades habilitadas
        if (data.assinatura.funcionalidadesHabilitadas && data.assinatura.funcionalidadesHabilitadas.length > 0) {
          try {
            const funcRes = await fetch('/api/funcionalidades/por-ids', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: data.assinatura.funcionalidadesHabilitadas })
            });
            const funcData = await funcRes.json();
            if (funcData.funcionalidades) {
              setFuncionalidades(funcData.funcionalidades);
            }
          } catch (error) {
            console.error('Erro ao carregar funcionalidades:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      trial: { text: 'Trial', color: 'bg-info-bg text-info-text', icon: ClockIcon },
      active: { text: 'Ativa', color: 'bg-success-bg text-success-text', icon: CheckIcon },
      cancelled: { text: 'Cancelada', color: 'bg-warning-bg text-warning-text', icon: ClockIcon },
      expired: { text: 'Expirada', color: 'bg-error-bg text-error-text', icon: XCircleIcon },
      suspended: { text: 'Suspensa', color: 'bg-surface text-text-secondary', icon: XCircleIcon }
    };

    const badge = badges[status as keyof typeof badges] || badges.expired;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (date?: Date | string | any) => {
    if (!date) return 'N/A';
    
    // Se for Timestamp do Firestore
    if (date && typeof date === 'object' && 'seconds' in date) {
      const d = new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('pt-BR');
    }
    
    // Se for string
    if (typeof date === 'string') {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('pt-BR');
    }
    
    // Se for Date
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('pt-BR');
    }
    
    // Tentar converter para Date
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('pt-BR');
    } catch {
      return 'N/A';
    }
  };

  if (loading || loadingLimites) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!assinatura) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Minha Assinatura</h1>
            <p className="text-text-secondary">Gerencie sua assinatura</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">Você não possui uma assinatura ativa.</p>
                <Button onClick={() => window.location.href = '/planos'}>
                  Ver Planos Disponíveis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Minha Assinatura</h1>
          <p className="text-text-secondary">Gerencie sua assinatura e funcionalidades</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações da Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle>Assinatura Atual</CardTitle>
              <CardDescription>Informações sobre sua assinatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Status</label>
                <div className="mt-1">
                  {getStatusBadge(assinatura.status)}
                </div>
              </div>

              {plano && (
                <>
                  <div>
                    <label className="text-sm font-medium text-text-primary">Plano</label>
                    <p className="mt-1 text-lg font-semibold text-text-primary">{plano.nome}</p>
                    <p className="text-sm text-text-secondary">{plano.descricao}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-primary">Valor</label>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      R$ {plano.preco.toFixed(2)} / {plano.intervalo}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-text-primary">Data de Início</label>
                <p className="mt-1 text-text-secondary">{formatDate(assinatura.dataInicio)}</p>
              </div>

              {assinatura.dataFim && (
                <div>
                  <label className="text-sm font-medium text-text-primary">Data de Fim</label>
                  <p className="mt-1 text-text-secondary">{formatDate(assinatura.dataFim)}</p>
                </div>
              )}

              {assinatura.dataRenovacao && (
                <div>
                  <label className="text-sm font-medium text-text-primary">Próxima Renovação</label>
                  <p className="mt-1 text-text-secondary">{formatDate(assinatura.dataRenovacao)}</p>
                </div>
              )}

              {assinatura.status === 'trial' && assinatura.dataFim && (
                <div className="p-4 bg-info-bg rounded-md">
                  <p className="text-sm text-info-text">
                    <strong>Período Trial:</strong> Sua assinatura expira em {formatDate(assinatura.dataFim)}.
                    Após esta data, o valor será cobrado automaticamente.
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text-primary">ID Hotmart</label>
                <p className="mt-1 text-sm font-mono text-text-muted">{assinatura.hotmartSubscriptionId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades Habilitadas */}
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades Disponíveis</CardTitle>
              <CardDescription>Funcionalidades habilitadas no seu plano</CardDescription>
            </CardHeader>
            <CardContent>
              {funcionalidades.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-text-muted text-center py-4">
                    {assinatura.funcionalidadesHabilitadas.length === 0 
                      ? 'Nenhuma funcionalidade habilitada'
                      : 'Carregando funcionalidades...'}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/planos'}
                  >
                    Ver Detalhes do Plano
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-text-secondary">
                    {funcionalidades.length} funcionalidade(s) ativa(s)
                  </p>
                  
                  {/* Agrupar por categoria */}
                  {(() => {
                    const categorias: Record<CategoriaFuncionalidade, Funcionalidade[]> = {
                      'EVENTOS': [],
                      'FINANCEIRO': [],
                      'RELATORIOS': [],
                      'INTEGRACAO': [],
                      'ADMIN': []
                    };

                    funcionalidades.forEach(func => {
                      if (categorias[func.categoria]) {
                        categorias[func.categoria].push(func);
                      }
                    });

                    const categoriasComFunc = Object.entries(categorias).filter(([_, funcs]) => funcs.length > 0);

                    return (
                      <div className="space-y-4">
                        {categoriasComFunc.map(([categoria, funcs]) => (
                          <div key={categoria} className="space-y-2">
                            <h4 className="text-sm font-semibold text-text-primary uppercase">
                              {categoria === 'EVENTOS' && '📅 '}
                              {categoria === 'FINANCEIRO' && '💰 '}
                              {categoria === 'RELATORIOS' && '📊 '}
                              {categoria === 'INTEGRACAO' && '🔗 '}
                              {categoria === 'ADMIN' && '⚙️ '}
                              {categoria}
                            </h4>
                            <div className="space-y-1 pl-4">
                              {funcs.map(func => (
                                <div key={func.id} className="flex items-start gap-2 py-1">
                                  <CheckIcon className="h-4 w-4 text-success-text mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary">{func.nome}</p>
                                    {func.descricao && (
                                      <p className="text-xs text-text-secondary mt-0.5">{func.descricao}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => window.location.href = '/planos'}
                  >
                    Ver Todos os Planos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Limites de Uso */}
        {limites && (limites.eventosLimiteMes || limites.clientesLimite || limites.usuariosLimite || limites.armazenamentoLimite) && (
          <Card>
            <CardHeader>
              <CardTitle>Limites de Uso</CardTitle>
              <CardDescription>Consumo atual dos recursos do seu plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {limites.eventosLimiteMes !== undefined && (
                  <LimiteUso
                    tipo="eventos"
                    usado={limites.eventosMesAtual}
                    limite={limites.eventosLimiteMes}
                    periodo="mes"
                  />
                )}
                {limites.clientesLimite !== undefined && (
                  <LimiteUso
                    tipo="clientes"
                    usado={limites.clientesTotal}
                    limite={limites.clientesLimite}
                    periodo="total"
                  />
                )}
                {limites.usuariosLimite !== undefined && (
                  <LimiteUso
                    tipo="usuarios"
                    usado={limites.usuariosConta}
                    limite={limites.usuariosLimite}
                    periodo="total"
                  />
                )}
                {limites.armazenamentoLimite !== undefined && (
                  <LimiteUso
                    tipo="armazenamento"
                    usado={limites.armazenamentoUsado}
                    limite={limites.armazenamentoLimite}
                    periodo="total"
                    unidade="GB"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico */}
        {assinatura.historico && assinatura.historico.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
              <CardDescription>Eventos relacionados à sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assinatura.historico
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((evento, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-md hover:bg-surface-hover transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">{evento.acao}</p>
                        <p className="text-xs text-text-muted mt-1">{formatDate(evento.data)}</p>
                        {evento.detalhes && (
                          <p className="text-xs text-text-secondary mt-1">
                            {JSON.stringify(evento.detalhes, null, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>Gerenciar sua assinatura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/planos'}
            >
              Ver Planos Disponíveis
            </Button>
            {assinatura.status === 'active' || assinatura.status === 'trial' ? (
              <Button 
                variant="outline" 
                className="w-full text-error hover:text-error-text hover:bg-error-bg"
                onClick={() => {
                  if (confirm('Tem certeza que deseja cancelar sua assinatura?')) {
                    alert('Para cancelar sua assinatura, acesse sua conta na Hotmart ou entre em contato com o suporte.');
                  }
                }}
              >
                Cancelar Assinatura
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

