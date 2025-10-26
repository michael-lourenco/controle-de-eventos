'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { TipoCusto } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function TiposCustosPage() {
  const { userId } = useCurrentUser();
  const [tiposCusto, setTiposCusto] = useState<TipoCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoTipo, setNovoTipo] = useState({
    nome: '',
    descricao: ''
  });
  const [editandoTipo, setEditandoTipo] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);

  // Carregar tipos de custo
  useEffect(() => {
    const carregarTiposCusto = async () => {
      if (!userId) {
        console.log('TiposCustosPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('TiposCustosPage: Carregando tipos de custo');
        const tipos = await dataService.getTiposCusto(userId);
        console.log('TiposCustosPage: Tipos carregados:', tipos);
        setTiposCusto(tipos);
      } catch (error) {
        console.error('TiposCustosPage: Erro ao carregar tipos de custo:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTiposCusto();
  }, [userId]);

  // Filtrar tipos de custo
  const tiposFiltrados = tiposCusto.filter(tipo =>
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovoTipo = async () => {
    if (!userId || !novoTipo.nome.trim()) return;

    try {
      const novoTipoData = await dataService.createTipoCusto({
        nome: novoTipo.nome.trim(),
        descricao: novoTipo.descricao.trim() || '',
        ativo: true
      }, userId);
      
      setTiposCusto(prev => [novoTipoData, ...prev]);
      setNovoTipo({ nome: '', descricao: '' });
      setMostrarFormNovo(false);
    } catch (error) {
      console.error('Erro ao criar tipo de custo:', error);
    }
  };

  const handleEditarTipo = async (tipo: TipoCusto) => {
    if (!userId || !editandoTipo.nome.trim()) return;

    try {
      const tipoAtualizado = await dataService.updateTipoCusto(tipo.id, {
        nome: editandoTipo.nome.trim(),
        descricao: editandoTipo.descricao.trim() || '',
        ativo: editandoTipo.ativo
      }, userId);
      
      setTiposCusto(prev => prev.map(t => t.id === tipo.id ? tipoAtualizado : t));
      setEditandoId(null);
    } catch (error) {
      console.error('Erro ao atualizar tipo de custo:', error);
    }
  };

  const handleExcluirTipo = async (tipo: TipoCusto) => {
    if (!userId) return;

    try {
      await dataService.deleteTipoCusto(tipo.id, userId);
      setTiposCusto(prev => prev.filter(t => t.id !== tipo.id));
    } catch (error) {
      console.error('Erro ao excluir tipo de custo:', error);
    }
  };

  const iniciarEdicao = (tipo: TipoCusto) => {
    setEditandoId(tipo.id);
    setEditandoTipo({
      nome: tipo.nome,
      descricao: tipo.descricao,
      ativo: tipo.ativo
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoTipo({ nome: '', descricao: '', ativo: true });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando tipos de custo...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Tipos de Custo</h1>
            <p className="text-text-secondary">
              Gerencie os tipos de custo para eventos
            </p>
          </div>
          <Button
            onClick={() => setMostrarFormNovo(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Novo Tipo
          </Button>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <Input
              label="Buscar"
              placeholder="Buscar tipos de custo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total de Tipos</p>
                  <p className="text-2xl font-bold text-text-primary">{tiposFiltrados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Tipos Ativos</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {tiposFiltrados.filter(t => t.ativo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário Novo Tipo - No TOPO */}
        {mostrarFormNovo && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Tipo de Custo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nome *"
                  placeholder="Ex: TOTEM, PROMOTER, MOTORISTA..."
                  value={novoTipo.nome}
                  onChange={(e) => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
                />
                <Textarea
                  label="Descrição"
                  placeholder="Descrição do tipo de custo"
                  value={novoTipo.descricao}
                  onChange={(e) => setNovoTipo(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarFormNovo(false);
                    setNovoTipo({ nome: '', descricao: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNovoTipo}
                  disabled={!novoTipo.nome.trim()}
                >
                  Criar Tipo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Tipos */}
        <div className="space-y-4">
          {tiposFiltrados.map((tipo) => (
            <Card key={tipo.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {editandoId === tipo.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Nome *"
                        value={editandoTipo.nome}
                        onChange={(e) => setEditandoTipo(prev => ({ ...prev, nome: e.target.value }))}
                      />
                      <Textarea
                        label="Descrição"
                        value={editandoTipo.descricao}
                        onChange={(e) => setEditandoTipo(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo-edit"
                          checked={editandoTipo.ativo}
                          onChange={(e) => setEditandoTipo(prev => ({ ...prev, ativo: e.target.checked }))}
                          className="rounded border-border"
                        />
                        <label htmlFor="ativo-edit" className="text-sm text-text-primary">
                          Tipo ativo
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={cancelarEdicao}
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditarTipo(tipo)}
                        disabled={!editandoTipo.nome.trim()}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {tipo.nome}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tipo.ativo 
                            ? 'bg-success-bg text-success-text' 
                            : 'bg-error-bg text-error-text'
                        }`}>
                          {tipo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      {tipo.descricao && (
                        <p className="text-text-secondary mb-2">{tipo.descricao}</p>
                      )}
                      <p className="text-sm text-text-muted">
                        Criado em {new Date(tipo.dataCadastro).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => iniciarEdicao(tipo)}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirTipo(tipo)}
                        title="Excluir"
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tiposFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo de custo cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca.'
                  : 'Comece criando um novo tipo de custo.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}