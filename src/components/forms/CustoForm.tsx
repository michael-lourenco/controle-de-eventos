'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  CustoEvento, 
  TipoCusto,
  Evento
} from '@/types';
import { 
  tiposCusto,
  createTipoCusto,
  getTipoCustoById
} from '@/lib/mockData';

interface CustoFormProps {
  custo?: CustoEvento;
  evento: Evento;
  onSave: (custo: CustoEvento) => void;
  onCancel: () => void;
}

interface FormData {
  tipoCustoId: string;
  novoTipoCusto: {
    nome: string;
    descricao: string;
    categoria: 'Serviço' | 'Promoter' | 'Motorista' | 'Frete' | 'Insumos' | 'Impostos' | 'Outros';
  };
  valor: number;
  quantidade?: number;
  observacoes?: string;
}

const categoriaOptions = [
  { value: 'Serviço', label: 'Serviço' },
  { value: 'Promoter', label: 'Promoter' },
  { value: 'Motorista', label: 'Motorista' },
  { value: 'Frete', label: 'Frete' },
  { value: 'Insumos', label: 'Insumos' },
  { value: 'Impostos', label: 'Impostos' },
  { value: 'Outros', label: 'Outros' }
];

export default function CustoForm({ custo, evento, onSave, onCancel }: CustoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tipoCustoId: '',
    novoTipoCusto: {
      nome: '',
      descricao: '',
      categoria: 'Serviço'
    },
    valor: 0,
    quantidade: 1,
    observacoes: ''
  });

  const [isNovoTipoCusto, setIsNovoTipoCusto] = useState(false);
  const [tipoCustoSearch, setTipoCustoSearch] = useState('');
  const [tiposCustoFiltrados, setTiposCustoFiltrados] = useState<TipoCusto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (custo) {
      setFormData({
        tipoCustoId: custo.tipoCustoId,
        novoTipoCusto: {
          nome: '',
          descricao: '',
          categoria: 'Serviço'
        },
        valor: custo.valor,
        quantidade: custo.quantidade || 1,
        observacoes: custo.observacoes || ''
      });
    }
  }, [custo]);

  useEffect(() => {
    if (tipoCustoSearch.length > 1) {
      setTiposCustoFiltrados(
        tiposCusto.filter(tipo => 
          tipo.nome.toLowerCase().includes(tipoCustoSearch.toLowerCase()) &&
          tipo.ativo
        )
      );
    } else {
      setTiposCustoFiltrados([]);
    }
  }, [tipoCustoSearch]);

  const handleInputChange = (field: string, value: any) => {
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

  const handleNovoTipoCustoChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      novoTipoCusto: {
        ...prev.novoTipoCusto,
        [field]: value
      }
    }));
  };

  const handleTipoCustoSelect = (tipoCusto: TipoCusto) => {
    setFormData(prev => ({
      ...prev,
      tipoCustoId: tipoCusto.id
    }));
    setTipoCustoSearch(tipoCusto.nome);
    setTiposCustoFiltrados([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isNovoTipoCusto && !formData.tipoCustoId) {
      newErrors.tipoCustoId = 'Selecione um tipo de custo';
    }

    if (isNovoTipoCusto) {
      if (!formData.novoTipoCusto.nome) newErrors.novoTipoCustoNome = 'Nome é obrigatório';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let tipoCusto: TipoCusto;
      
      if (isNovoTipoCusto) {
        tipoCusto = createTipoCusto({
          ...formData.novoTipoCusto,
          ativo: true
        });
      } else {
        const tipoCustoExistente = getTipoCustoById(formData.tipoCustoId);
        if (!tipoCustoExistente) {
          setErrors({ tipoCustoId: 'Tipo de custo não encontrado' });
          return;
        }
        tipoCusto = tipoCustoExistente;
      }

      const custoData = {
        eventoId: evento.id,
        evento,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Custo */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Custo</CardTitle>
          <CardDescription>
            Selecione um tipo existente ou crie um novo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant={!isNovoTipoCusto ? 'primary' : 'outline'}
              onClick={() => setIsNovoTipoCusto(false)}
            >
              Tipo Existente
            </Button>
            <Button
              type="button"
              variant={isNovoTipoCusto ? 'primary' : 'outline'}
              onClick={() => setIsNovoTipoCusto(true)}
            >
              Novo Tipo
            </Button>
          </div>

          {!isNovoTipoCusto ? (
            <div>
              <Input
                label="Buscar Tipo de Custo"
                placeholder="Digite o nome do tipo de custo..."
                value={tipoCustoSearch}
                onChange={(e) => setTipoCustoSearch(e.target.value)}
                error={errors.tipoCustoId}
              />
              {tiposCustoFiltrados.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                  {tiposCustoFiltrados.map((tipo) => (
                    <div
                      key={tipo.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleTipoCustoSelect(tipo)}
                    >
                      <div className="font-medium">{tipo.nome}</div>
                      <div className="text-sm text-gray-500">{tipo.categoria}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Nome do Tipo *"
                value={formData.novoTipoCusto.nome}
                onChange={(e) => handleNovoTipoCustoChange('nome', e.target.value)}
                error={errors.novoTipoCustoNome}
              />
              <Select
                label="Categoria"
                options={categoriaOptions}
                value={formData.novoTipoCusto.categoria}
                onChange={(e) => handleNovoTipoCustoChange('categoria', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Descrição"
                  value={formData.novoTipoCusto.descricao}
                  onChange={(e) => handleNovoTipoCustoChange('descricao', e.target.value)}
                  rows={2}
                  placeholder="Descrição do tipo de custo"
                />
              </div>
            </div>
          )}
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
              onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value) || undefined)}
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
