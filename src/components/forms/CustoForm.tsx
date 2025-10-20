'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import SelectWithSearch from '@/components/ui/SelectWithSearch';
import { 
  CustoEvento, 
  Evento
} from '@/types';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';

interface CustoFormProps {
  custo?: CustoEvento;
  evento: Evento;
  onSave: (custo: CustoEvento) => void;
  onCancel: () => void;
}

interface FormData {
  tipoCustoId: string;
  valor: number;
  quantidade?: number;
  observacoes?: string;
}


export default function CustoForm({ custo, evento, onSave, onCancel }: CustoFormProps) {
  const { userId } = useCurrentUser();
  const [formData, setFormData] = useState<FormData>({
    tipoCustoId: '',
    valor: 0,
    quantidade: 1,
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tiposCusto, setTiposCusto] = useState<Array<{
    id: string;
    nome: string;
    descricao?: string;
    ativo: boolean;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Carregar tipos de custo do Firestore
  useEffect(() => {
    const carregarTiposCusto = async () => {
      if (!userId) {
        console.log('CustoForm: userId não disponível ainda');
        return;
      }
      
      try {
        setLoading(true);
        const tipos = await dataService.getTiposCusto(userId);
        setTiposCusto(tipos);
        console.log('CustoForm: Tipos de custo carregados:', tipos);
      } catch (error) {
        console.error('Erro ao carregar tipos de custo:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTiposCusto();
  }, [userId]);

  useEffect(() => {
    if (custo) {
      setFormData({
        tipoCustoId: custo.tipoCustoId,
        valor: custo.valor,
        quantidade: custo.quantidade || 1,
        observacoes: custo.observacoes || ''
      });
    }
  }, [custo]);


  const handleInputChange = (field: string, value: string | number) => {
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

    if (!formData.tipoCustoId) {
      newErrors.tipoCustoId = 'Selecione um tipo de custo';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (formData.quantidade && formData.quantidade <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateNewTipoCusto = async (nome: string) => {
    if (!userId) {
      console.error('CustoForm: userId não disponível para criar tipo de custo');
      return;
    }
    
    try {
      const novoTipoCusto = await dataService.createTipoCusto({
        nome,
        descricao: '',
        ativo: true
      }, userId);
      
      // Atualizar a lista de tipos de custo
      setTiposCusto(prev => [...prev, novoTipoCusto]);
      
      setFormData(prev => ({
        ...prev,
        tipoCustoId: novoTipoCusto.id
      }));
      
      // Limpar erro se existir
      if (errors.tipoCustoId) {
        setErrors(prev => ({
          ...prev,
          tipoCustoId: ''
        }));
      }
    } catch (error) {
      console.error('Erro ao criar novo tipo de custo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const tipoCusto = tiposCusto.find(tipo => tipo.id === formData.tipoCustoId);
      if (!tipoCusto) {
        setErrors({ tipoCustoId: 'Tipo de custo não encontrado' });
        return;
      }

      const custoData = {
        eventoId: evento.id,
        tipoCustoId: tipoCusto.id,
        tipoCusto,
        valor: formData.valor,
        quantidade: formData.quantidade || undefined,
        observacoes: formData.observacoes || undefined
      };

      onSave(custoData as CustoEvento);
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
    }
  };

  // Preparar opções para o dropdown
  const tipoCustoOptions = tiposCusto
    .filter(tipo => tipo.ativo)
    .map(tipo => ({
      value: tipo.id,
      label: tipo.nome,
      description: tipo.descricao || ''
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tipos de custo...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Custo */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Custo</CardTitle>
          <CardDescription>
            Selecione um tipo existente ou crie um novo digitando o nome
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectWithSearch
            label="Tipo de Custo *"
            options={tipoCustoOptions}
            value={formData.tipoCustoId}
            onChange={(value) => handleInputChange('tipoCustoId', value)}
            onCreateNew={handleCreateNewTipoCusto}
            placeholder="Selecione ou digite para criar um novo tipo"
            error={errors.tipoCustoId}
            allowCreate={true}
          />
        </CardContent>
      </Card>

      {/* Dados do Custo */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Custo</CardTitle>
          <CardDescription>
            {custo ? 'Edite as informações do custo' : 'Preencha os dados do novo custo'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Valor *"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
              error={errors.valor}
            />
            <Input
              label="Quantidade"
              type="number"
              min="1"
              value={formData.quantidade || ''}
              onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || 1)}
              error={errors.quantidade}
            />
          </div>

          <Textarea
            label="Observações"
            value={formData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            placeholder="Observações sobre este custo"
          />
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {custo ? 'Atualizar Custo' : 'Adicionar Custo'}
        </Button>
      </div>
    </form>
  );
}
