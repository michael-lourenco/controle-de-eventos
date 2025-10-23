'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import SelectWithSearch from '@/components/ui/SelectWithSearch';
import { 
  ServicoEvento, 
  Evento
} from '@/types';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';

interface ServicoFormProps {
  servico?: ServicoEvento;
  evento: Evento;
  onSave: (servico: ServicoEvento) => void;
  onCancel: () => void;
}

interface FormData {
  tipoServicoId: string;
  observacoes?: string;
}

interface TipoServicoOption {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export default function ServicoForm({ servico, evento, onSave, onCancel }: ServicoFormProps) {
  const { userId } = useCurrentUser();
  const [formData, setFormData] = useState<FormData>({
    tipoServicoId: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tiposServico, setTiposServico] = useState<TipoServicoOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar tipos de serviço do Firestore
  useEffect(() => {
    const carregarTiposServico = async () => {
      if (!userId) {
        console.log('ServicoForm: userId não disponível ainda');
        return;
      }

      try {
        console.log('ServicoForm: Carregando tipos de serviço');
        const tipos = await dataService.getTiposServicoAtivos(userId);
        console.log('ServicoForm: Tipos carregados:', tipos);
        
        const opcoes = tipos.map(tipo => ({
          id: tipo.id,
          nome: tipo.nome,
          descricao: tipo.descricao,
          ativo: tipo.ativo
        }));
        
        setTiposServico(opcoes);
      } catch (error) {
        console.error('Erro ao carregar tipos de serviço:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTiposServico();
  }, [userId]);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (servico) {
      setFormData({
        tipoServicoId: servico.tipoServicoId,
        observacoes: servico.observacoes || ''
      });
    }
  }, [servico]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipoServicoId) {
      newErrors.tipoServicoId = 'Tipo de serviço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!userId) {
      console.error('userId não disponível');
      return;
    }

    try {
      // Buscar dados completos do tipo de serviço
      const tipoServico = await dataService.getTipoServicoById(formData.tipoServicoId, userId);
      
      if (!tipoServico) {
        console.error('Tipo de serviço não encontrado');
        return;
      }

      const servicoData: ServicoEvento = {
        id: servico?.id || '',
        eventoId: evento.id,
        tipoServicoId: formData.tipoServicoId,
        tipoServico: tipoServico,
        observacoes: formData.observacoes,
        dataCadastro: servico?.dataCadastro || new Date()
      };

      onSave(servicoData);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const handleCreateNewTipoServico = async (nome: string) => {
    console.log('ServicoForm: Criando novo tipo de serviço:', nome);
    if (!userId) {
      console.error('ServicoForm: userId não disponível');
      return null;
    }

    try {
      console.log('ServicoForm: Chamando dataService.createTipoServico');
      const novoTipo = await dataService.createTipoServico({
        nome,
        descricao: '',
        ativo: true
      }, userId);

      console.log('ServicoForm: Tipo criado com sucesso:', novoTipo);

      // Adicionar à lista de opções
      setTiposServico(prev => [...prev, {
        id: novoTipo.id,
        nome: novoTipo.nome,
        descricao: novoTipo.descricao,
        ativo: novoTipo.ativo
      }]);

      // Definir o novo tipo como selecionado
      setFormData(prev => ({
        ...prev,
        tipoServicoId: novoTipo.id
      }));

      // Limpar erro se existir
      if (errors.tipoServicoId) {
        setErrors(prev => ({
          ...prev,
          tipoServicoId: ''
        }));
      }

      console.log('ServicoForm: Novo tipo selecionado:', novoTipo.id);
      return novoTipo.id;
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-text-secondary">Carregando tipos de serviço...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {servico ? 'Editar Serviço' : 'Novo Serviço'}
        </CardTitle>
        <CardDescription>
          {servico ? 'Atualize as informações do serviço' : 'Adicione um novo serviço para este evento'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
                <SelectWithSearch
                  label="Tipo de Serviço"
                  placeholder="Selecione ou crie um tipo de serviço"
                  value={formData.tipoServicoId}
                  onChange={(value) => handleInputChange('tipoServicoId', value)}
                  options={tiposServico.map(tipo => ({
                    value: tipo.id,
                    label: tipo.nome,
                    description: tipo.descricao
                  }))}
                  onCreateNew={handleCreateNewTipoServico}
                  allowCreate={true}
                  error={errors.tipoServicoId}
                />
          </div>

          <div>
            <Textarea
              label="Observações"
              placeholder="Observações adicionais sobre o serviço (opcional)"
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="outline"
            >
              {servico ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
