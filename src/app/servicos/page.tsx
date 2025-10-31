'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { TipoServico } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function ServicosPage() {
  const { userId } = useCurrentUser();
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoTipo, setNovoTipo] = useState({ nome: '', descricao: '' });
  const [editandoTipo, setEditandoTipo] = useState({ nome: '', descricao: '', ativo: true });
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);

  // Carregar tipos de serviço
  useEffect(() => {
    const carregarTiposServico = async () => {
      if (!userId) {
        console.log('ServicosPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('ServicosPage: Carregando tipos de serviço');
        const tipos = await dataService.getTiposServicos(userId);
        console.log('ServicosPage: Tipos carregados:', tipos);
        setTiposServico(tipos);
      } catch (error) {
        console.error('Erro ao carregar tipos de serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTiposServico();
  }, [userId]);

  // Filtrar tipos de serviço
  const tiposFiltrados = tiposServico.filter(tipo => 
    tipo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovoTipo = async () => {
    if (!userId || !novoTipo.nome.trim()) return;

    try {
      const novoTipoServico = await dataService.createTipoServico({
        nome: novoTipo.nome.trim(),
        descricao: novoTipo.descricao.trim() || '',
        ativo: true
      }, userId);
      
      setTiposServico(prev => [...prev, novoTipoServico]);
      setNovoTipo({ nome: '', descricao: '' });
      setMostrarFormNovo(false);
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error);
    }
  };

  const handleEditarTipo = async (tipo: TipoServico) => {
    if (!userId || !editandoTipo.nome.trim()) return;

    try {
      const tipoAtualizado = await dataService.updateTipoServico(tipo.id, {
        nome: editandoTipo.nome.trim(),
        descricao: editandoTipo.descricao.trim() || '',
        ativo: editandoTipo.ativo
      }, userId);
      
      setTiposServico(prev => prev.map(t => t.id === tipo.id ? tipoAtualizado : t));
      setEditandoId(null);
    } catch (error) {
      console.error('Erro ao atualizar tipo de serviço:', error);
    }
  };

  const handleExcluirTipo = async (tipo: TipoServico) => {
    if (!userId) return;

    try {
      await dataService.deleteTipoServico(userId, tipo.id);
      setTiposServico(prev => prev.filter(t => t.id !== tipo.id));
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
    }
  };

  const iniciarEdicao = (tipo: TipoServico) => {
    setEditandoId(tipo.id);
    setEditandoTipo({ nome: tipo.nome, descricao: tipo.descricao || '', ativo: tipo.ativo });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoTipo({ nome: '', descricao: '', ativo: true });
  };

  const getTipoServicoColor = (nome: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-gray-100 text-gray-800'
    ];
    
    let hash = 0;
    for (let i = 0; i < nome.length; i++) {
      hash = ((hash << 5) - hash + nome.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando tipos de serviço...</div>
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
            <h1 className="text-2xl font-bold text-text-primary">Tipos de Serviço</h1>
            <p className="text-text-secondary">
              Gerencie os tipos de serviços disponíveis
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
              placeholder="Nome ou descrição do tipo de serviço..."
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
                <TagIcon className="h-8 w-8 text-primary mr-3" />
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
                <TagIcon className="h-8 w-8 text-success mr-3" />
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

        {/* Formulário Novo Tipo */}
        {mostrarFormNovo && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Tipo de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome"
                placeholder="Nome do tipo de serviço"
                value={novoTipo.nome}
                onChange={(e) => setNovoTipo(prev => ({ ...prev, nome: e.target.value }))}
              />
              <Textarea
                label="Descrição"
                placeholder="Descrição do tipo de serviço (opcional)"
                value={novoTipo.descricao}
                onChange={(e) => setNovoTipo(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
              />
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
                    <Input
                      label="Nome"
                      value={editandoTipo.nome}
                      onChange={(e) => setEditandoTipo(prev => ({ ...prev, nome: e.target.value }))}
                    />
                    <Textarea
                      label="Descrição"
                      value={editandoTipo.descricao}
                      onChange={(e) => setEditandoTipo(prev => ({ ...prev, descricao: e.target.value }))}
                      rows={3}
                    />
                    <div className="flex items-center gap-2 rounded-md border border-border/80 bg-surface/60 px-3 py-2">
                      <input
                        id={`ativo-${tipo.id}`}
                        type="checkbox"
                        className="rounded border-border"
                        checked={editandoTipo.ativo}
                        onChange={(e) => setEditandoTipo(prev => ({ ...prev, ativo: e.target.checked }))}
                      />
                      <label htmlFor={`ativo-${tipo.id}`} className="text-sm text-text-primary">
                        Tipo de serviço ativo
                      </label>
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoServicoColor(tipo.nome)}`}>
                          {tipo.nome}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tipo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tipo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      {tipo.descricao && (
                        <p className="text-sm text-text-secondary">
                          {tipo.descricao}
                        </p>
                      )}
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
              <TagIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca.'
                  : 'Comece criando um novo tipo de serviço.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
