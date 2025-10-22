'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { TipoCusto } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function TiposCustosPage() {
  const { userId } = useCurrentUser();
  const [tiposCusto, setTiposCusto] = useState<TipoCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoCusto | null>(null);
  const [tipoParaExcluir, setTipoParaExcluir] = useState<TipoCusto | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        console.error('Erro ao carregar tipos de custo:', error);
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

  const handleNovoTipo = () => {
    setTipoEditando(null);
    setFormData({ nome: '', descricao: '', ativo: true });
    setErrors({});
    setShowForm(true);
  };

  const handleEditarTipo = (tipo: TipoCusto) => {
    setTipoEditando(tipo);
    setFormData({
      nome: tipo.nome,
      descricao: tipo.descricao,
      ativo: tipo.ativo
    });
    setErrors({});
    setShowForm(true);
  };

  const handleExcluirTipo = (tipo: TipoCusto) => {
    setTipoParaExcluir(tipo);
  };

  const handleConfirmarExclusao = async () => {
    if (tipoParaExcluir && userId) {
      try {
        await dataService.deleteTipoCusto(tipoParaExcluir.id, userId);
        setTiposCusto(prev => prev.filter(t => t.id !== tipoParaExcluir.id));
        setTipoParaExcluir(null);
      } catch (error) {
        console.error('Erro ao excluir tipo de custo:', error);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!userId) return;

    try {
      if (tipoEditando) {
        const tipoAtualizado = await dataService.updateTipoCusto(tipoEditando.id, formData, userId);
        setTiposCusto(prev => prev.map(t => t.id === tipoEditando.id ? tipoAtualizado : t));
      } else {
        const novoTipo = await dataService.createTipoCusto(formData, userId);
        setTiposCusto(prev => [novoTipo, ...prev]);
      }
      
      setShowForm(false);
      setTipoEditando(null);
      setFormData({ nome: '', descricao: '', ativo: true });
    } catch (error) {
      console.error('Erro ao salvar tipo de custo:', error);
    }
  };

  const handleCancelar = () => {
    setShowForm(false);
    setTipoEditando(null);
    setFormData({ nome: '', descricao: '', ativo: true });
    setErrors({});
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
              Gerencie os tipos de custos disponíveis
            </p>
          </div>
          <Button onClick={handleNovoTipo}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {tipoEditando ? 'Editar Tipo de Custo' : 'Novo Tipo de Custo'}
              </CardTitle>
              <CardDescription>
                {tipoEditando ? 'Atualize as informações do tipo' : 'Crie um novo tipo de custo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="Nome"
                    placeholder="Ex: Aluguel, Decoração, Buffet..."
                    value={formData.nome}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, nome: e.target.value }));
                      if (errors.nome) setErrors(prev => ({ ...prev, nome: '' }));
                    }}
                    error={errors.nome}
                    required
                  />
                </div>
                <div>
                  <Textarea
                    label="Descrição"
                    placeholder="Descreva o tipo de custo..."
                    value={formData.descricao}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, descricao: e.target.value }));
                      if (errors.descricao) setErrors(prev => ({ ...prev, descricao: '' }));
                    }}
                    error={errors.descricao}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <label htmlFor="ativo" className="text-sm text-text-primary">
                    Ativo
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelar}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="outline">
                    {tipoEditando ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Buscar tipos de custo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tipos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiposFiltrados.map((tipo) => (
            <Card key={tipo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <TagIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{tipo.nome}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarTipo(tipo)}
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
                <CardDescription>{tipo.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tipo.ativo 
                      ? 'bg-success-bg text-success-text' 
                      : 'bg-error-bg text-error-text'
                  }`}>
                    {tipo.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-text-muted">
                    {format(tipo.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tiposFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo de custo cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece criando um novo tipo de custo.'
                }
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={handleNovoTipo}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Novo Tipo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {tipoParaExcluir && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 modal-card">
              <CardHeader>
                <CardTitle>Confirmar Exclusão</CardTitle>
                <CardDescription>
                  Tem certeza que deseja excluir o tipo de custo <strong>{tipoParaExcluir.nome}</strong>?
                  <br />
                  Esta ação não pode ser desfeita.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setTipoParaExcluir(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleConfirmarExclusao}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
