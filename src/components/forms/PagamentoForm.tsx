'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Pagamento, 
  ContratoServico,
  StatusPagamento 
} from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PagamentoFormProps {
  pagamento?: Pagamento;
  contrato: ContratoServico;
  onSave: (pagamento: Pagamento) => void;
  onCancel: () => void;
}

interface FormData {
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  formaPagamento: 'Dinheiro' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX' | 'Transferência';
  numeroParcela?: number;
  totalParcelas?: number;
  status: StatusPagamento;
  observacoes?: string;
  comprovante?: string;
}

const formaPagamentoOptions = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Cartão de crédito', label: 'Cartão de crédito' },
  { value: 'Depósito bancário', label: 'Depósito bancário' },
  { value: 'PIX', label: 'PIX' },
  { value: 'Transferência', label: 'Transferência' }
];

const statusOptions = [
  { value: StatusPagamento.PENDENTE, label: 'Pendente' },
  { value: StatusPagamento.PAGO, label: 'Pago' },
  { value: StatusPagamento.ATRASADO, label: 'Atrasado' },
  { value: StatusPagamento.CANCELADO, label: 'Cancelado' }
];

export default function PagamentoForm({ pagamento, contrato, onSave, onCancel }: PagamentoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    valor: 0,
    dataVencimento: '',
    dataPagamento: '',
    formaPagamento: 'PIX',
    numeroParcela: 1,
    totalParcelas: contrato.parcelas || 1,
    status: StatusPagamento.PENDENTE,
    observacoes: '',
    comprovante: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pagamento) {
      setFormData({
        valor: pagamento.valor,
        dataVencimento: format(pagamento.dataVencimento, 'yyyy-MM-dd'),
        dataPagamento: pagamento.dataPagamento ? format(pagamento.dataPagamento, 'yyyy-MM-dd') : '',
        formaPagamento: pagamento.formaPagamento,
        numeroParcela: pagamento.numeroParcela || 1,
        totalParcelas: pagamento.totalParcelas || contrato.parcelas || 1,
        status: pagamento.status,
        observacoes: pagamento.observacoes || '',
        comprovante: pagamento.comprovante || ''
      });
    } else {
      // Para novo pagamento, calcular próximo número de parcela
      const proximaParcela = (contrato.parcelas || 1) + 1;
      setFormData(prev => ({
        ...prev,
        numeroParcela: proximaParcela,
        totalParcelas: contrato.parcelas || 1
      }));
    }
  }, [pagamento, contrato]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.dataVencimento) {
      newErrors.dataVencimento = 'Data de vencimento é obrigatória';
    }

    if (formData.status === StatusPagamento.PAGO && !formData.dataPagamento) {
      newErrors.dataPagamento = 'Data de pagamento é obrigatória quando status é Pago';
    }

    if (formData.numeroParcela && formData.totalParcelas && formData.numeroParcela > formData.totalParcelas) {
      newErrors.numeroParcela = 'Número da parcela não pode ser maior que total de parcelas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const pagamentoData = {
        contratoId: contrato.id,
        contrato,
        valor: formData.valor,
        dataVencimento: new Date(formData.dataVencimento),
        dataPagamento: formData.dataPagamento ? new Date(formData.dataPagamento) : undefined,
        formaPagamento: formData.formaPagamento,
        numeroParcela: formData.numeroParcela,
        totalParcelas: formData.totalParcelas,
        status: formData.status,
        observacoes: formData.observacoes || undefined,
        comprovante: formData.comprovante || undefined
      };

      onSave(pagamentoData as Pagamento);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Contrato */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Valor Total:</span>
              <div className="text-gray-600">R$ {contrato.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <span className="font-medium text-gray-900">Forma de Pagamento:</span>
              <div className="text-gray-600">{contrato.formaPagamento}</div>
            </div>
            <div>
              <span className="font-medium text-gray-900">Parcelas:</span>
              <div className="text-gray-600">{contrato.parcelas || 1}</div>
            </div>
            <div>
              <span className="font-medium text-gray-900">Dia de Vencimento:</span>
              <div className="text-gray-600">{contrato.diaVencimento || 'Não definido'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Pagamento</CardTitle>
          <CardDescription>
            {pagamento ? 'Edite as informações do pagamento' : 'Preencha os dados do novo pagamento'}
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
            <Select
              label="Status *"
              options={statusOptions}
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as StatusPagamento)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Data de Vencimento *"
              type="date"
              value={formData.dataVencimento}
              onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
              error={errors.dataVencimento}
            />
            <Input
              label="Data de Pagamento"
              type="date"
              value={formData.dataPagamento}
              onChange={(e) => handleInputChange('dataPagamento', e.target.value)}
              error={errors.dataPagamento}
              disabled={formData.status !== StatusPagamento.PAGO}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Forma de Pagamento"
              options={formaPagamentoOptions}
              value={formData.formaPagamento}
              onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
            />
            <Input
              label="Número da Parcela"
              type="number"
              min="1"
              value={formData.numeroParcela || ''}
              onChange={(e) => handleInputChange('numeroParcela', parseInt(e.target.value) || undefined)}
              error={errors.numeroParcela}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Total de Parcelas"
              type="number"
              min="1"
              value={formData.totalParcelas || ''}
              onChange={(e) => handleInputChange('totalParcelas', parseInt(e.target.value) || undefined)}
            />
            <Input
              label="Comprovante"
              value={formData.comprovante || ''}
              onChange={(e) => handleInputChange('comprovante', e.target.value)}
              placeholder="Número do comprovante ou referência"
            />
          </div>

          <Textarea
            label="Observações"
            value={formData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            placeholder="Observações adicionais sobre o pagamento"
          />
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {pagamento ? 'Atualizar Pagamento' : 'Criar Pagamento'}
        </Button>
      </div>
    </form>
  );
}
