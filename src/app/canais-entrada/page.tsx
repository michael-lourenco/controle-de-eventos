'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { CanalEntrada } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function CanaisEntradaPage() {
  const { userId } = useCurrentUser();
  const [canaisEntrada, setCanaisEntrada] = useState<CanalEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [canalEditando, setCanalEditando] = useState<CanalEntrada | null>(null);
  const [canalParaExcluir, setCanalParaExcluir] = useState<CanalEntrada | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Limpar formulário
  const limparFormulario = () => {
    setFormData({
      nome: '',
      descricao: '',
      ativo: true
    });
    setErrors({});
    setCanalEditando(null);
  };

  // Abrir formulário para novo canal
  const handleNovoCanal = () => {
    limparFormulario();
    setShowForm(true);
  };

  // Abrir formulário para editar canal
  const handleEditarCanal = (canal: CanalEntrada) => {
    setFormData({
      nome: canal.nome,
      descricao: canal.descricao,
      ativo: canal.ativo
    });
    setCanalEditando(canal);
    setShowForm(true);
  };

  // Cancelar edição
  const handleCancelar = () => {
    setShowForm(false);
    limparFormulario();
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar canal
  const handleSalvar = async () => {
    if (!validateForm() || !userId) return;

    try {
      if (canalEditando) {
        // Atualizar canal existente
        await dataService.updateCanalEntrada(canalEditando.id, formData, userId);
        setCanaisEntrada(prev =>
          prev.map(canal =>
            canal.id === canalEditando.id
              ? { ...canal, ...formData }
              : canal
          )
        );
      } else {
        // Criar novo canal
        const novoCanal = await dataService.createCanalEntrada({
          ...formData,
          dataCadastro: new Date()
        }, userId);
        setCanaisEntrada(prev => [novoCanal, ...prev]);
      }

      setShowForm(false);
      limparFormulario();
    } catch (error) {
      console.error('Erro ao salvar canal de entrada:', error);
    }
  };

  // Excluir canal
  const handleExcluir = async () => {
    if (!canalParaExcluir || !userId) return;

    try {
      await dataService.deleteCanalEntrada(canalParaExcluir.id, userId);
      setCanaisEntrada(prev =>
        prev.filter(canal => canal.id !== canalParaExcluir.id)
      );
      setCanalParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir canal de entrada:', error);
    }
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
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Canais de Entrada</h1>
            <p className="text-text-secondary">Gerencie os canais pelos quais os clientes chegam</p>
          </div>
          <Button onClick={handleNovoCanal} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Novo Canal
          </Button>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Buscar canais de entrada..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Canais */}
        <div className="grid gap-4">
          {canaisFiltrados.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TagIcon className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted">
                  {searchTerm ? 'Nenhum canal encontrado' : 'Nenhum canal de entrada cadastrado'}
                </p>
              </CardContent>
            </Card>
          ) : (
            canaisFiltrados.map((canal) => (
              <Card key={canal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
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
                        Criado em {format(canal.dataCadastro, 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarCanal(canal)}
                        className="hover:bg-accent/10 hover:text-accent"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCanalParaExcluir(canal)}
                        className="hover:bg-error/10 hover:text-error"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Formulário */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {canalEditando ? 'Editar Canal de Entrada' : 'Novo Canal de Entrada'}
              </CardTitle>
              <CardDescription>
                {canalEditando ? 'Atualize as informações do canal' : 'Preencha as informações do novo canal'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome *"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                error={errors.nome}
                placeholder="Ex: Instagram, Boca a boca, Google..."
              />
              <Textarea
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição opcional do canal de entrada"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="ativo" className="text-sm text-text-primary">
                  Canal ativo
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancelar}>
                  Cancelar
                </Button>
                <Button onClick={handleSalvar}>
                  {canalEditando ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {canalParaExcluir && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 modal-card">
              <CardHeader>
                <CardTitle>Confirmar Exclusão</CardTitle>
                <CardDescription>
                  Tem certeza que deseja excluir o canal &quot;{canalParaExcluir.nome}&quot;? Esta ação não pode ser desfeita.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCanalParaExcluir(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleExcluir}
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
