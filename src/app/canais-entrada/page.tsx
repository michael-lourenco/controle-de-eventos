'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { usePlano } from '@/lib/hooks/usePlano';
import { dataService } from '@/lib/data-service';
import { CanalEntrada } from '@/types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';
import { handlePlanoError } from '@/lib/utils/plano-errors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

export default function CanaisEntradaPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { temPermissao, statusPlano } = usePlano();
  const [canaisEntrada, setCanaisEntrada] = useState<CanalEntrada[]>([]);
  const [canaisInativos, setCanaisInativos] = useState<CanalEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'inativos'>('ativos');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [canalParaExcluir, setCanalParaExcluir] = useState<CanalEntrada | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { showToast } = useToast();
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
  const [temAcessoPersonalizado, setTemAcessoPersonalizado] = useState<boolean | null>(null);

  // Verificar acesso a criação personalizada
  useEffect(() => {
    const verificarAcesso = async () => {
      const acesso = await temPermissao('TIPOS_PERSONALIZADO');
      setTemAcessoPersonalizado(acesso);
    };
    verificarAcesso();
  }, [temPermissao]);

  // Carregar canais de entrada
  useEffect(() => {
    const carregarCanaisEntrada = async () => {
      if (!userId) {
        console.log('CanaisEntradaPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('CanaisEntradaPage: Carregando canais de entrada');
        const canais = await dataService.getCanaisEntradaAtivos(userId);
        const inativos = await dataService.getCanaisEntradaInativos(userId);
        console.log('CanaisEntradaPage: Canais carregados:', canais);
        setCanaisEntrada(canais);
        setCanaisInativos(inativos);
      } catch (error) {
        console.error('CanaisEntradaPage: Erro ao carregar canais de entrada:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCanaisEntrada();
  }, [userId]);

  const recarregarCanais = async () => {
    if (!userId) return;
    try {
      const canais = await dataService.getCanaisEntradaAtivos(userId);
      const inativos = await dataService.getCanaisEntradaInativos(userId);
      setCanaisEntrada(canais);
      setCanaisInativos(inativos);
    } catch (error) {
      console.error('Erro ao recarregar canais:', error);
    }
  };

  // Filtrar canais de entrada
  const canaisExibidos = abaAtiva === 'ativos' ? canaisEntrada : canaisInativos;
  const canaisFiltrados = canaisExibidos.filter(canal =>
    canal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canal.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovoCanal = async () => {
    if (!userId || !novoCanal.nome.trim()) return;

    try {
      await dataService.createCanalEntrada({
        nome: novoCanal.nome.trim(),
        descricao: novoCanal.descricao.trim() || '',
        ativo: true,
        dataCadastro: new Date()
      }, userId);
      
      showToast('Canal de entrada criado com sucesso!', 'success');
      await recarregarCanais();
      setNovoCanal({ nome: '', descricao: '' });
      setMostrarFormNovo(false);
    } catch (error: any) {
      console.error('Erro ao criar canal de entrada:', error);
      
      // Tratar erros de plano
      const erroTratado = handlePlanoError(error, showToast, () => router.push('/planos'));
      
      if (!erroTratado) {
        showToast(error.message || 'Erro ao criar canal de entrada. Tente novamente.', 'error');
      }
    }
  };

  const handleEditarCanal = async (canal: CanalEntrada) => {
    if (!userId || !editandoCanal.nome.trim()) return;

    try {
      await dataService.updateCanalEntrada(canal.id, {
        nome: editandoCanal.nome.trim(),
        descricao: editandoCanal.descricao.trim() || '',
        ativo: editandoCanal.ativo
      }, userId);
      
      showToast('Canal de entrada atualizado com sucesso!', 'success');
      await recarregarCanais();
      setEditandoId(null);
    } catch (error) {
      console.error('Erro ao atualizar canal de entrada:', error);
    }
  };

  const handleExcluirCanal = (canal: CanalEntrada) => {
    setCanalParaExcluir(canal);
    setShowDeleteDialog(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!canalParaExcluir || !userId) return;

    try {
      await dataService.deleteCanalEntrada(canalParaExcluir.id, userId);
      showToast('Canal de entrada inativado com sucesso!', 'success');
      await recarregarCanais();
      setCanalParaExcluir(null);
    } catch (error) {
      console.error('Erro ao inativar canal de entrada:', error);
      showToast('Erro ao inativar canal de entrada', 'error');
    }
  };

  const handleReativar = async (canal: CanalEntrada) => {
    if (!userId) return;

    try {
      await dataService.reativarCanalEntrada(canal.id, userId);
      showToast('Canal de entrada reativado com sucesso!', 'success');
      await recarregarCanais();
    } catch (error) {
      console.error('Erro ao reativar canal de entrada:', error);
      showToast('Erro ao reativar canal de entrada', 'error');
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
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <TagIcon className="h-6 w-6" />
              Canais de Entrada
            </h1>
            <p className="text-text-secondary">
              Gerencie os canais pelos quais os clientes chegam
            </p>
          </div>
          {temAcessoPersonalizado === true ? (
            <Button
              onClick={() => setMostrarFormNovo(true)}
              className="btn-add flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Novo Canal
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      disabled
                      className="cursor-not-allowed flex items-center gap-2"
                    >
                      <LockClosedIcon className="h-4 w-4" />
                      Novo Canal
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  sideOffset={8}
                  className="max-w-sm border border-warning bg-warning-bg shadow-lg p-0 z-50 rounded-md"
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    borderColor: 'var(--warning)',
                    color: 'var(--warning-text)'
                  }}
                >
                  <div className="p-4 space-y-4" style={{ color: 'var(--warning-text)' }}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--warning-text)' }} />
                        <div className="font-semibold" style={{ color: 'var(--warning-text)' }}>
                          Acesso Bloqueado
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--warning-text)', opacity: 0.8 }}>
                        Criar tipos personalizados está disponível apenas nos planos Profissional e Premium. No plano Básico você pode usar apenas os tipos padrão.
                      </div>
                    </div>
                    {statusPlano?.plano && (
                      <div className="text-sm" style={{ color: 'var(--warning-text)', opacity: 0.8 }}>
                        Plano atual: <span className="font-semibold" style={{ color: 'var(--warning-text)' }}>{statusPlano.plano.nome}</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={() => router.push('/assinatura')}
                      className="w-full"
                      variant="default"
                    >
                      Ver Planos Disponíveis
                    </Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Abas */}
        <Card>
          <CardContent className="p-0">
            <div className="flex gap-2 p-2">
              <button
                onClick={() => setAbaAtiva('ativos')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all rounded-lg cursor-pointer ${
                  abaAtiva === 'ativos'
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                Ativos ({canaisEntrada.length})
              </button>
              <button
                onClick={() => setAbaAtiva('inativos')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-all rounded-lg cursor-pointer ${
                  abaAtiva === 'inativos'
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                Inativos ({canaisInativos.length})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <Input
              label="Buscar"
              placeholder={`Buscar canais de entrada ${abaAtiva === 'ativos' ? 'ativos' : 'inativos'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

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
                      {abaAtiva === 'ativos' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExcluirCanal(canal)}
                          title="Inativar"
                          className="text-error hover:text-error hover:bg-error/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReativar(canal)}
                          title="Reativar"
                          className="text-success hover:text-success hover:bg-success/10"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </Button>
                      )}
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
                {searchTerm 
                  ? 'Nenhum canal encontrado' 
                  : abaAtiva === 'ativos' 
                    ? 'Nenhum canal de entrada ativo' 
                    : 'Nenhum canal de entrada inativo'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca.'
                  : abaAtiva === 'ativos'
                    ? 'Comece criando um novo canal de entrada.'
                    : 'Não há canais inativos no momento.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmação de Inativação */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Inativar Canal de Entrada"
          description={
            canalParaExcluir
              ? `Tem certeza que deseja inativar o canal de entrada "${canalParaExcluir.nome}"? Ele não aparecerá em listas de seleção, mas continuará disponível para clientes existentes.`
              : 'Tem certeza que deseja inativar este canal de entrada?'
          }
          confirmText="Inativar"
          cancelText="Cancelar"
          variant="default"
          onConfirm={handleConfirmarExclusao}
        />
      </div>
    </Layout>
  );
}