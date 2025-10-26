'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { CanalEntrada } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CanaisEntradaPage() {
  const { userId } = useCurrentUser();
  const [canaisEntrada, setCanaisEntrada] = useState<CanalEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoCanal, setNovoCanal] = useState({
    nome: '',
    descricao: ''
  });
  const [editandoCanal, setEditandoCanal] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);

  // Carregar canais de entrada
  useEffect(() => {
    const carregarCanaisEntrada = async () => {
      if (!userId) {
        console.log('CanaisEntradaPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('CanaisEntradaPage: Carregando canais de entrada');
        const canais = await dataService.getCanaisEntrada(userId);
        console.log('CanaisEntradaPage: Canais carregados:', canais);
        setCanaisEntrada(canais);
      } catch (error) {
        console.error('CanaisEntradaPage: Erro ao carregar canais de entrada:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCanaisEntrada();
  }, [userId]);

  // Filtrar canais de entrada
  const canaisFiltrados = canaisEntrada.filter(canal =>
    canal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canal.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovoCanal = async () => {
    if (!userId || !novoCanal.nome.trim()) return;

    try {
      const novoCanalData = await dataService.createCanalEntrada({
        nome: novoCanal.nome.trim(),
        descricao: novoCanal.descricao.trim() || '',
        ativo: true,
        dataCadastro: new Date()
      }, userId);
      
      setCanaisEntrada(prev => [novoCanalData, ...prev]);
      setNovoCanal({ nome: '', descricao: '' });
      setMostrarFormNovo(false);
    } catch (error) {
      console.error('Erro ao criar canal de entrada:', error);
    }
  };

  const handleEditarCanal = async (canal: CanalEntrada) => {
    if (!userId || !editandoCanal.nome.trim()) return;

    try {
      const canalAtualizado = await dataService.updateCanalEntrada(canal.id, {
        nome: editandoCanal.nome.trim(),
        descricao: editandoCanal.descricao.trim() || '',
        ativo: editandoCanal.ativo
      }, userId);
      
      setCanaisEntrada(prev => prev.map(c => c.id === canal.id ? canalAtualizado : c));
      setEditandoId(null);
    } catch (error) {
      console.error('Erro ao atualizar canal de entrada:', error);
    }
  };

  const handleExcluirCanal = async (canal: CanalEntrada) => {
    if (!userId) return;

    try {
      await dataService.deleteCanalEntrada(canal.id, userId);
      setCanaisEntrada(prev => prev.filter(c => c.id !== canal.id));
    } catch (error) {
      console.error('Erro ao excluir canal de entrada:', error);
    }
  };

  const iniciarEdicao = (canal: CanalEntrada) => {
    setEditandoId(canal.id);
    setEditandoCanal({
      nome: canal.nome,
      descricao: canal.descricao,
      ativo: canal.ativo
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoCanal({ nome: '', descricao: '', ativo: true });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando canais de entrada...</div>
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
            <h1 className="text-2xl font-bold text-text-primary">Canais de Entrada</h1>
            <p className="text-text-secondary">
              Gerencie os canais pelos quais os clientes chegam
            </p>
          </div>
          <Button
            onClick={() => setMostrarFormNovo(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Novo Canal
          </Button>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <Input
              label="Buscar"
              placeholder="Buscar canais de entrada..."
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
                  <p className="text-sm font-medium text-text-secondary">Total de Canais</p>
                  <p className="text-2xl font-bold text-text-primary">{canaisFiltrados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Canais Ativos</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {canaisFiltrados.filter(c => c.ativo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário Novo Canal - No TOPO */}
        {mostrarFormNovo && (
          <Card>
            <CardHeader>
              <CardTitle>Novo Canal de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Nome *"
                  placeholder="Ex: Instagram, Boca a boca, Google..."
                  value={novoCanal.nome}
                  onChange={(e) => setNovoCanal(prev => ({ ...prev, nome: e.target.value }))}
                />
                <Textarea
                  label="Descrição"
                  placeholder="Descrição opcional do canal de entrada"
                  value={novoCanal.descricao}
                  onChange={(e) => setNovoCanal(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarFormNovo(false);
                    setNovoCanal({ nome: '', descricao: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNovoCanal}
                  disabled={!novoCanal.nome.trim()}
                >
                  Criar Canal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Canais */}
        <div className="space-y-4">
          {canaisFiltrados.map((canal) => (
            <Card key={canal.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {editandoId === canal.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Nome *"
                        value={editandoCanal.nome}
                        onChange={(e) => setEditandoCanal(prev => ({ ...prev, nome: e.target.value }))}
                      />
                      <Textarea
                        label="Descrição"
                        value={editandoCanal.descricao}
                        onChange={(e) => setEditandoCanal(prev => ({ ...prev, descricao: e.target.value }))}
                        rows={3}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="ativo-edit"
                          checked={editandoCanal.ativo}
                          onChange={(e) => setEditandoCanal(prev => ({ ...prev, ativo: e.target.checked }))}
                          className="rounded border-border"
                        />
                        <label htmlFor="ativo-edit" className="text-sm text-text-primary">
                          Canal ativo
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
                        onClick={() => handleEditarCanal(canal)}
                        disabled={!editandoCanal.nome.trim()}
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
                          {canal.nome}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          canal.ativo 
                            ? 'bg-success-bg text-success-text' 
                            : 'bg-error-bg text-error-text'
                        }`}>
                          {canal.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      {canal.descricao && (
                        <p className="text-text-secondary mb-2">{canal.descricao}</p>
                      )}
                      <p className="text-sm text-text-muted">
                        Criado em {new Date(canal.dataCadastro).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => iniciarEdicao(canal)}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirCanal(canal)}
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

        {canaisFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm ? 'Nenhum canal encontrado' : 'Nenhum canal de entrada cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca.'
                  : 'Comece criando um novo canal de entrada.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}