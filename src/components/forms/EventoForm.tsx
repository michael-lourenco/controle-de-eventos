'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Cliente, 
  Evento, 
  StatusEvento, 
  TipoEvento 
} from '@/types';
import { useClientes } from '@/hooks/useData';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';

interface EventoFormProps {
  evento?: Evento;
  onSave: (evento: Evento) => void;
  onCancel: () => void;
}

interface FormData {
  clienteId: string;
  novoCliente: {
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    endereco: string;
    cep: string;
    instagram?: string;
    comoConheceu?: string;
  };
  dataEvento: string;
  local: string;
  endereco: string;
  tipoEvento: TipoEvento;
  horarioInicio: string;
  horarioInicioServico: string;
  horarioTerminoServico: string;
  horarioDesmontagem: string;
  tempoEvento: string;
  contratante: string;
  numeroConvidados: number;
  quantidadeMesas?: number;
  hashtag?: string;
  numeroImpressoes?: number;
  cerimonialista?: {
    nome?: string;
    telefone?: string;
  };
  observacoes?: string;
  status: StatusEvento;
  valorTotal: number;
  diaFinalPagamento: string;
}

const tipoEventoOptions = [
  { value: TipoEvento.CASAMENTO, label: 'Casamento' },
  { value: TipoEvento.ANIVERSARIO_INFANTIL, label: 'Aniversário Infantil' },
  { value: TipoEvento.ANIVERSARIO_ADULTO, label: 'Aniversário Adulto' },
  { value: TipoEvento.QUINZE_ANOS, label: '15 Anos' },
  { value: TipoEvento.OUTROS, label: 'Outros' }
];

const statusOptions = [
  { value: StatusEvento.AGENDADO, label: 'Agendado' },
  { value: StatusEvento.CONFIRMADO, label: 'Confirmado' },
  { value: StatusEvento.EM_ANDAMENTO, label: 'Em andamento' },
  { value: StatusEvento.CONCLUIDO, label: 'Concluído' },
  { value: StatusEvento.CANCELADO, label: 'Cancelado' }
];

const diasSemana = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

export default function EventoForm({ evento, onSave, onCancel }: EventoFormProps) {
  const { data: clientes, loading: loadingClientes } = useClientes();
  const { userId, isLoading } = useCurrentUser();
  
  const [formData, setFormData] = useState<FormData>({
    clienteId: '',
    novoCliente: {
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cep: '',
      instagram: '',
      comoConheceu: ''
    },
    dataEvento: '',
    local: '',
    endereco: '',
    tipoEvento: TipoEvento.CASAMENTO,
    horarioInicio: '',
    horarioInicioServico: '',
    horarioTerminoServico: '',
    horarioDesmontagem: '',
    tempoEvento: '',
    contratante: '',
    numeroConvidados: 0,
    quantidadeMesas: 0,
    hashtag: '',
    numeroImpressoes: 0,
    cerimonialista: {
      nome: '',
      telefone: ''
    },
    observacoes: '',
    status: StatusEvento.AGENDADO,
    valorTotal: 0,
    diaFinalPagamento: ''
  });

  const [isNovoCliente, setIsNovoCliente] = useState(false);
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (evento) {
      setFormData({
        clienteId: evento.clienteId,
        novoCliente: {
          nome: '',
          cpf: '',
          email: '',
          telefone: '',
          endereco: '',
          cep: '',
          instagram: '',
          comoConheceu: ''
        },
        dataEvento: evento.dataEvento.toISOString().split('T')[0],
        local: evento.local,
        endereco: evento.endereco,
        tipoEvento: evento.tipoEvento as TipoEvento,
        horarioInicio: evento.horarioInicio,
        horarioInicioServico: evento.horarioInicioServico,
        horarioTerminoServico: evento.horarioTerminoServico,
        horarioDesmontagem: evento.horarioDesmontagem,
        tempoEvento: evento.tempoEvento,
        contratante: evento.contratante,
        numeroConvidados: evento.numeroConvidados,
        quantidadeMesas: evento.quantidadeMesas || 0,
        hashtag: evento.hashtag || '',
        numeroImpressoes: evento.numeroImpressoes || 0,
        cerimonialista: evento.cerimonialista || { nome: '', telefone: '' },
        observacoes: evento.observacoes || '',
        status: evento.status as StatusEvento,
        valorTotal: evento.valorTotal,
        diaFinalPagamento: evento.diaFinalPagamento.toISOString().split('T')[0]
      });
    }
  }, [evento]);

  useEffect(() => {
    if (clienteSearch.length > 2 && clientes) {
      const filtrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(clienteSearch.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados([]);
    }
  }, [clienteSearch, clientes]);

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNovoClienteChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      novoCliente: {
        ...prev.novoCliente,
        [field]: value
      }
    }));
  };

  const handleCerimonialistaChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      cerimonialista: {
        ...prev.cerimonialista,
        [field]: value
      }
    }));
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      clienteId: cliente.id
    }));
    setClienteSearch(cliente.nome);
    setClientesFiltrados([]);
  };

  const getDiaSemana = (data: string) => {
    if (!data) return '';
    const dataObj = new Date(data);
    return diasSemana[dataObj.getDay()];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isNovoCliente && !formData.clienteId) {
      newErrors.clienteId = 'Selecione um cliente';
    }

    if (isNovoCliente) {
      if (!formData.novoCliente.nome) newErrors.novoClienteNome = 'Nome é obrigatório';
      if (!formData.novoCliente.email) newErrors.novoClienteEmail = 'Email é obrigatório';
      if (!formData.novoCliente.telefone) newErrors.novoClienteTelefone = 'Telefone é obrigatório';
    }

    if (!formData.dataEvento) newErrors.dataEvento = 'Data do evento é obrigatória';
    if (!formData.local) newErrors.local = 'Local é obrigatório';
    if (!formData.endereco) newErrors.endereco = 'Endereço é obrigatório';
    if (!formData.contratante) newErrors.contratante = 'Nome do contratante é obrigatório';
    if (!formData.numeroConvidados || formData.numeroConvidados <= 0) newErrors.numeroConvidados = 'Número de convidados deve ser maior que zero';
    if (!formData.valorTotal || formData.valorTotal <= 0) newErrors.valorTotal = 'Valor total deve ser maior que zero';
    if (!formData.diaFinalPagamento) newErrors.diaFinalPagamento = 'Dia final de pagamento é obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EventoForm: handleSubmit chamado');
    
    if (isLoading) {
      console.log('EventoForm: sessão ainda carregando');
      return;
    }
    if (!userId) {
      console.error('EventoForm: usuário não autenticado, abortando criação');
      setErrors({ general: 'Usuário não autenticado' });
      return;
    }

    if (!validateForm()) {
      console.log('EventoForm: Validação falhou');
      return;
    }
    
    console.log('EventoForm: Validação passou, processando...');

    try {
      let cliente: Cliente;
      
      if (isNovoCliente) {
        cliente = await dataService.createCliente(formData.novoCliente, userId);
      } else {
        const clienteExistente = clientes?.find(c => c.id === formData.clienteId);
        if (!clienteExistente) {
          setErrors({ clienteId: 'Cliente não encontrado' });
          return;
        }
        cliente = clienteExistente;
      }

      const eventoData = {
        clienteId: cliente.id,
        cliente,
        dataEvento: new Date(formData.dataEvento),
        diaSemana: getDiaSemana(formData.dataEvento),
        local: formData.local,
        endereco: formData.endereco,
        tipoEvento: formData.tipoEvento,
        horarioInicio: formData.horarioInicio,
        horarioInicioServico: formData.horarioInicioServico,
        horarioTerminoServico: formData.horarioTerminoServico,
        horarioDesmontagem: formData.horarioDesmontagem,
        tempoEvento: formData.tempoEvento,
        contratante: formData.contratante,
        numeroConvidados: formData.numeroConvidados,
        quantidadeMesas: formData.quantidadeMesas || undefined,
        hashtag: formData.hashtag || undefined,
        numeroImpressoes: formData.numeroImpressoes || undefined,
        cerimonialista: formData.cerimonialista?.nome ? {
          nome: formData.cerimonialista.nome,
          telefone: formData.cerimonialista.telefone || ''
        } : undefined,
        observacoes: formData.observacoes || undefined,
        status: formData.status,
        valorTotal: formData.valorTotal,
        diaFinalPagamento: new Date(formData.diaFinalPagamento),
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      };

      if (evento) {
        const eventoAtualizado = await dataService.updateEvento(evento.id, eventoData);
        onSave(eventoAtualizado);
      } else {
        console.log('EventoForm: Criando novo evento com dados:', eventoData);
        const novoEvento = await dataService.createEvento(eventoData, userId);
        console.log('EventoForm: Evento criado:', novoEvento);
        onSave(novoEvento);
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
          <CardDescription>
            Selecione um cliente existente ou cadastre um novo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant={!isNovoCliente ? 'primary' : 'outline'}
              onClick={() => setIsNovoCliente(false)}
            >
              Cliente Existente
            </Button>
            <Button
              type="button"
              variant={isNovoCliente ? 'primary' : 'outline'}
              onClick={() => setIsNovoCliente(true)}
            >
              Novo Cliente
            </Button>
          </div>

          {!isNovoCliente ? (
            <div>
              <Input
                label="Buscar Cliente"
                placeholder="Digite o nome ou email do cliente..."
                value={clienteSearch}
                onChange={(e) => setClienteSearch(e.target.value)}
                error={errors.clienteId}
              />
              {clientesFiltrados.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      <div className="font-medium">{cliente.nome}</div>
                      <div className="text-sm text-gray-500">{cliente.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome *"
                value={formData.novoCliente.nome}
                onChange={(e) => handleNovoClienteChange('nome', e.target.value)}
                error={errors.novoClienteNome}
              />
              <Input
                label="CPF"
                value={formData.novoCliente.cpf}
                onChange={(e) => handleNovoClienteChange('cpf', e.target.value)}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.novoCliente.email}
                onChange={(e) => handleNovoClienteChange('email', e.target.value)}
                error={errors.novoClienteEmail}
              />
              <Input
                label="Telefone *"
                value={formData.novoCliente.telefone}
                onChange={(e) => handleNovoClienteChange('telefone', e.target.value)}
                error={errors.novoClienteTelefone}
              />
              <Input
                label="Endereço"
                value={formData.novoCliente.endereco}
                onChange={(e) => handleNovoClienteChange('endereco', e.target.value)}
              />
              <Input
                label="CEP"
                value={formData.novoCliente.cep}
                onChange={(e) => handleNovoClienteChange('cep', e.target.value)}
              />
              <Input
                label="Instagram"
                value={formData.novoCliente.instagram || ''}
                onChange={(e) => handleNovoClienteChange('instagram', e.target.value)}
              />
              <Input
                label="Como conheceu"
                value={formData.novoCliente.comoConheceu || ''}
                onChange={(e) => handleNovoClienteChange('comoConheceu', e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados do Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Evento</CardTitle>
          <CardDescription>
            Informações básicas sobre o evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Data do Evento *"
              type="date"
              value={formData.dataEvento}
              onChange={(e) => handleInputChange('dataEvento', e.target.value)}
              error={errors.dataEvento}
            />
            <Select
              label="Tipo de Evento"
              options={tipoEventoOptions}
              value={formData.tipoEvento}
              onChange={(e) => handleInputChange('tipoEvento', e.target.value as TipoEvento)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Local *"
              value={formData.local}
              onChange={(e) => handleInputChange('local', e.target.value)}
              error={errors.local}
            />
            <Input
              label="Endereço *"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              error={errors.endereco}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome do Contratante *"
              value={formData.contratante}
              onChange={(e) => handleInputChange('contratante', e.target.value)}
              error={errors.contratante}
            />
            <Input
              label="Número de Convidados *"
              type="number"
              value={formData.numeroConvidados}
              onChange={(e) => handleInputChange('numeroConvidados', parseInt(e.target.value) || 0)}
              error={errors.numeroConvidados}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Quantidade de Mesas"
              type="number"
              value={formData.quantidadeMesas || ''}
              onChange={(e) => handleInputChange('quantidadeMesas', parseInt(e.target.value) || undefined)}
            />
            <Input
              label="Hashtag"
              value={formData.hashtag || ''}
              onChange={(e) => handleInputChange('hashtag', e.target.value)}
            />
          </div>

          <Input
            label="Número de Impressões"
            type="number"
            value={formData.numeroImpressoes || ''}
            onChange={(e) => handleInputChange('numeroImpressoes', parseInt(e.target.value) || undefined)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Valor Total *"
              type="number"
              step="0.01"
              min="0"
              value={formData.valorTotal}
              onChange={(e) => handleInputChange('valorTotal', parseFloat(e.target.value) || 0)}
              error={errors.valorTotal}
            />
            <Input
              label="Dia Final de Pagamento *"
              type="date"
              value={formData.diaFinalPagamento}
              onChange={(e) => handleInputChange('diaFinalPagamento', e.target.value)}
              error={errors.diaFinalPagamento}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Horários</CardTitle>
          <CardDescription>
            Defina os horários do evento e do serviço
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Horário de Início do Evento"
              type="time"
              value={formData.horarioInicio}
              onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
            />
            <Input
              label="Horário de Início do Serviço"
              type="time"
              value={formData.horarioInicioServico}
              onChange={(e) => handleInputChange('horarioInicioServico', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Horário de Término do Serviço"
              type="time"
              value={formData.horarioTerminoServico}
              onChange={(e) => handleInputChange('horarioTerminoServico', e.target.value)}
            />
            <Input
              label="Horário de Desmontagem"
              type="time"
              value={formData.horarioDesmontagem}
              onChange={(e) => handleInputChange('horarioDesmontagem', e.target.value)}
            />
          </div>

          <Input
            label="Tempo de Evento"
            value={formData.tempoEvento}
            onChange={(e) => handleInputChange('tempoEvento', e.target.value)}
            placeholder="Ex: 4 HORAS"
          />
        </CardContent>
      </Card>

      {/* Cerimonialista */}
      <Card>
        <CardHeader>
          <CardTitle>Cerimonialista</CardTitle>
          <CardDescription>
            Informações do cerimonialista (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome do Cerimonialista"
              value={formData.cerimonialista?.nome || ''}
              onChange={(e) => handleCerimonialistaChange('nome', e.target.value)}
            />
            <Input
              label="Telefone do Cerimonialista"
              value={formData.cerimonialista?.telefone || ''}
              onChange={(e) => handleCerimonialistaChange('telefone', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Observações e Status */}
      <Card>
        <CardHeader>
          <CardTitle>Observações e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Observações"
            value={formData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
          />
          
          <Select
            label="Status do Evento"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as StatusEvento)}
          />
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {evento ? 'Atualizar Evento' : 'Criar Evento'}
        </Button>
      </div>
    </form>
  );
}
