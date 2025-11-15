'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { useCurrentUser } from '@/hooks/useAuth';
import { dataService } from '@/lib/data-service';
import { Cliente, CanalEntrada } from '@/types';
import SelectWithSearch from '@/components/ui/SelectWithSearch';
import PlanoBloqueio from '@/components/PlanoBloqueio';
import { usePlano } from '@/lib/hooks/usePlano';
import LimiteUso from '@/components/LimiteUso';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function ClientesPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { limites } = usePlano();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [canaisEntrada, setCanaisEntrada] = useState<CanalEntrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    cep: '',
    instagram: '',
    canalEntradaId: ''
  });
  const [editandoCliente, setEditandoCliente] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    endereco: '',
    cep: '',
    instagram: '',
    canalEntradaId: ''
  });
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);
  const [erroCliente, setErroCliente] = useState<string | null>(null);

  // Carregar clientes e canais de entrada
  useEffect(() => {
    const carregarDados = async () => {
      if (!userId) {
        console.log('ClientesPage: userId não disponível ainda');
        return;
      }

      try {
        console.log('ClientesPage: Carregando clientes e canais de entrada');
        const [clientesData, canaisData] = await Promise.all([
          dataService.getClientes(userId),
          dataService.getCanaisEntrada(userId)
        ]);
        console.log('ClientesPage: Dados carregados:', { clientesData, canaisData });
        setClientes(clientesData);
        setCanaisEntrada(canaisData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [userId]);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    (cliente.cpf && cliente.cpf.includes(searchTerm))
  );

  const handleNovoCliente = async () => {
    if (!userId || !novoCliente.nome.trim() || !novoCliente.email.trim() || !novoCliente.telefone.trim()) return;

    try {
      const novoClienteData = await dataService.createCliente({
        nome: novoCliente.nome.trim(),
        cpf: novoCliente.cpf.trim() || '',
        email: novoCliente.email.trim(),
        telefone: novoCliente.telefone.trim(),
        endereco: novoCliente.endereco.trim() || '',
        cep: novoCliente.cep.trim() || '',
        instagram: novoCliente.instagram.trim() || '',
        canalEntradaId: novoCliente.canalEntradaId || undefined
      }, userId);
      
      setClientes(prev => [...prev, novoClienteData]);
      setNovoCliente({
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        endereco: '',
        cep: '',
        instagram: '',
        canalEntradaId: ''
      });
      setMostrarFormNovo(false);
      setErroCliente(null);
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      
      // Tratar erros específicos de plano/limite
      if (error.status === 403 || error.message?.includes('plano') || error.message?.includes('limite')) {
        setErroCliente(error.message || 'Não é possível criar cliente. Verifique seu plano e limites.');
      } else {
        setErroCliente(error.message || 'Erro ao criar cliente. Tente novamente.');
      }
    }
  };

  const handleEditarCliente = async (cliente: Cliente) => {
    if (!userId || !editandoCliente.nome.trim() || !editandoCliente.email.trim() || !editandoCliente.telefone.trim()) return;

    try {
      const clienteAtualizado = await dataService.updateCliente(cliente.id, {
        nome: editandoCliente.nome.trim(),
        cpf: editandoCliente.cpf.trim() || '',
        email: editandoCliente.email.trim(),
        telefone: editandoCliente.telefone.trim(),
        endereco: editandoCliente.endereco.trim() || '',
        cep: editandoCliente.cep.trim() || '',
        instagram: editandoCliente.instagram.trim() || '',
        canalEntradaId: editandoCliente.canalEntradaId || undefined
      }, userId);
      
      setClientes(prev => prev.map(c => c.id === cliente.id ? clienteAtualizado : c));
      setEditandoId(null);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  };

  const handleExcluirCliente = async (cliente: Cliente) => {
    if (!userId) return;

    try {
      await dataService.deleteCliente(cliente.id, userId);
      setClientes(prev => prev.filter(c => c.id !== cliente.id));
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const iniciarEdicao = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setEditandoCliente({
      nome: cliente.nome,
      cpf: cliente.cpf || '',
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco || '',
      cep: cliente.cep || '',
      instagram: cliente.instagram || '',
      canalEntradaId: cliente.canalEntradaId || ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditandoCliente({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cep: '',
      instagram: '',
      canalEntradaId: ''
    });
  };

  const getCanalEntradaNome = (canalId?: string) => {
    if (!canalId) return 'Não informado';
    const canal = canaisEntrada.find(c => c.id === canalId);
    return canal ? canal.nome : 'Canal não encontrado';
  };

  const handleCreateCanalEntrada = async (nome: string) => {
    if (!userId) return;
    
    try {
      const novoCanal = await dataService.createCanalEntrada({
        nome,
        descricao: '',
        ativo: true,
        dataCadastro: new Date()
      }, userId);
      
      // Recarregar a lista de canais de entrada
      const canaisAtualizados = await dataService.getCanaisEntrada(userId);
      setCanaisEntrada(canaisAtualizados);
      
      // Retornar o ID do novo canal para atualizar automaticamente o campo
      return novoCanal.id;
    } catch (error) {
      console.error('Erro ao criar canal de entrada:', error);
    }
  };

  const handleCreateCanalEntradaParaNovoCliente = async (nome: string) => {
    const novoId = await handleCreateCanalEntrada(nome);
    if (novoId) {
      setNovoCliente(prev => ({ ...prev, canalEntradaId: novoId }));
    }
  };

  const handleCreateCanalEntradaParaEdicao = async (nome: string) => {
    const novoId = await handleCreateCanalEntrada(nome);
    if (novoId) {
      setEditandoCliente(prev => ({ ...prev, canalEntradaId: novoId }));
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Carregando clientes...</div>
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
            <h1 className="text-2xl font-bold text-text-primary">Clientes</h1>
            <p className="text-text-secondary">
              Gerencie os clientes cadastrados
            </p>
          </div>
          <Button
            onClick={() => setMostrarFormNovo(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Limite de Clientes */}
        {limites && limites.clientesLimite !== undefined && (
          <div className="max-w-md">
            <LimiteUso
              tipo="clientes"
              usado={limites.clientesTotal}
              limite={limites.clientesLimite}
              periodo="total"
            />
          </div>
        )}

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <Input
              label="Buscar"
              placeholder="Nome, email, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total de Clientes</p>
                  <p className="text-2xl font-bold text-text-primary">{clientesFiltrados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Com Canal de Entrada</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {clientesFiltrados.filter(c => c.canalEntradaId).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-warning mr-3" />
                <div>
                  <p className="text-sm font-medium text-text-secondary">Sem Canal de Entrada</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {clientesFiltrados.filter(c => !c.canalEntradaId).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário Novo Cliente */}
        {mostrarFormNovo && (
          <PlanoBloqueio limite="clientes">
            <Card>
              <CardHeader>
                <CardTitle>Novo Cliente</CardTitle>
              </CardHeader>
              {erroCliente && (
                <div className="mx-6 mb-4 p-3 rounded-lg bg-error-bg border border-error-border text-error-text text-sm">
                  {erroCliente}
                </div>
              )}
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome *"
                  placeholder="Nome completo do cliente"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                />
                <Input
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={novoCliente.cpf}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, cpf: e.target.value }))}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={novoCliente.email}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Telefone *"
                  placeholder="(00) 00000-0000"
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                />
                <Input
                  label="Endereço"
                  placeholder="Rua, número, bairro"
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, endereco: e.target.value }))}
                />
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={novoCliente.cep}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, cep: e.target.value }))}
                />
                <Input
                  label="Instagram"
                  placeholder="@usuario"
                  value={novoCliente.instagram}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, instagram: e.target.value }))}
                />
                <SelectWithSearch
                  label="Canal de Entrada"
                  placeholder="Selecione ou digite um canal de entrada"
                  options={canaisEntrada.map(canal => ({
                    value: canal.id,
                    label: canal.nome
                  })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))}
                  value={novoCliente.canalEntradaId}
                  onChange={(value) => setNovoCliente(prev => ({ ...prev, canalEntradaId: value }))}
                  onCreateNew={(nome) => handleCreateCanalEntradaParaNovoCliente(nome)}
                  allowCreate={true}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarFormNovo(false);
                    setNovoCliente({
                      nome: '',
                      cpf: '',
                      email: '',
                      telefone: '',
                      endereco: '',
                      cep: '',
                      instagram: '',
                      canalEntradaId: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNovoCliente}
                  disabled={!novoCliente.nome.trim() || !novoCliente.email.trim() || !novoCliente.telefone.trim()}
                >
                  Criar Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
          </PlanoBloqueio>
        )}

        {/* Lista de Clientes */}
        <div className="space-y-4">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {editandoId === cliente.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nome *"
                        value={editandoCliente.nome}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, nome: e.target.value }))}
                      />
                      <Input
                        label="CPF"
                        value={editandoCliente.cpf}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, cpf: e.target.value }))}
                      />
                      <Input
                        label="Email *"
                        type="email"
                        value={editandoCliente.email}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        label="Telefone *"
                        value={editandoCliente.telefone}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                      />
                      <Input
                        label="Endereço"
                        value={editandoCliente.endereco}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, endereco: e.target.value }))}
                      />
                      <Input
                        label="CEP"
                        value={editandoCliente.cep}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, cep: e.target.value }))}
                      />
                      <Input
                        label="Instagram"
                        value={editandoCliente.instagram}
                        onChange={(e) => setEditandoCliente(prev => ({ ...prev, instagram: e.target.value }))}
                      />
                      <SelectWithSearch
                        label="Canal de Entrada"
                        placeholder="Selecione ou digite um canal de entrada"
                        options={canaisEntrada.map(canal => ({
                          value: canal.id,
                          label: canal.nome
                        })).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))}
                        value={editandoCliente.canalEntradaId}
                        onChange={(value) => setEditandoCliente(prev => ({ ...prev, canalEntradaId: value }))}
                        onCreateNew={(nome) => handleCreateCanalEntradaParaEdicao(nome)}
                        allowCreate={true}
                      />
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
                        onClick={() => handleEditarCliente(cliente)}
                        disabled={!editandoCliente.nome.trim() || !editandoCliente.email.trim() || !editandoCliente.telefone.trim()}
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
                        <h3 className="text-lg font-semibold text-text-primary">{cliente.nome}</h3>
                        <span className="text-sm text-text-secondary">
                          Cadastrado em {formatarData(cliente.dataCadastro)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-text-secondary">Email:</span>
                          <span className="ml-2 text-text-primary">{cliente.email}</span>
                        </div>
                        <div>
                          <span className="font-medium text-text-secondary">Telefone:</span>
                          <span className="ml-2 text-text-primary">{cliente.telefone}</span>
                        </div>
                        {cliente.cpf && (
                          <div>
                            <span className="font-medium text-text-secondary">CPF:</span>
                            <span className="ml-2 text-text-primary">{cliente.cpf}</span>
                          </div>
                        )}
                        {cliente.endereco && (
                          <div>
                            <span className="font-medium text-text-secondary">Endereço:</span>
                            <span className="ml-2 text-text-primary">{cliente.endereco}</span>
                          </div>
                        )}
                        {cliente.instagram && (
                          <div>
                            <span className="font-medium text-text-secondary">Instagram:</span>
                            <span className="ml-2 text-text-primary">{cliente.instagram}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-text-secondary">Canal de Entrada:</span>
                          <span className="ml-2 text-text-primary">{getCanalEntradaNome(cliente.canalEntradaId)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/clientes/${cliente.id}`)}
                        title="Visualizar"
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => iniciarEdicao(cliente)}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluirCliente(cliente)}
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

        {clientesFiltrados.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {searchTerm 
                  ? 'Tente ajustar o termo de busca.'
                  : 'Comece criando um novo cliente.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
