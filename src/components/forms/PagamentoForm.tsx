'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Pagamento, 
  Evento
} from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PagamentoFormProps {
  pagamento?: Pagamento;
  evento: Evento;
  onSave: (pagamento: Pagamento) => void;
  onCancel: () => void;
}

interface FormData {
  valor: number;
  dataPagamento: string;
  formaPagamento: 'Dinheiro' | 'Cartão de crédito' | 'Depósito bancário' | 'PIX' | 'Transferência';
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

export default function PagamentoForm({ pagamento, evento, onSave, onCancel }: PagamentoFormProps) {
  const [formData, setFormData] = useState<FormData>({
    valor: 0,
    dataPagamento: '',
    formaPagamento: 'PIX',
    observacoes: '',
    comprovante: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (pagamento) {
      setFormData({
        valor: pagamento.valor,
        dataPagamento: format(pagamento.dataPagamento, 'yyyy-MM-dd'),
        formaPagamento: pagamento.formaPagamento,
        observacoes: pagamento.observacoes || '',
        comprovante: pagamento.comprovante || ''
      });
    } else {
      // Preencher dados sugeridos para novo pagamento
      const hoje = new Date();
      const valorSugerido = evento.valorTotal * 0.3; // Sugerir 30% do valor total
      
      setFormData({
        valor: Math.round(valorSugerido * 100) / 100, // Arredondar para 2 casas decimais
        dataPagamento: format(hoje, 'yyyy-MM-dd'),
        formaPagamento: 'PIX', // PIX como padrão
        observacoes: `Pagamento parcial - ${format(hoje, 'dd/MM/yyyy', { locale: ptBR })}`,
        comprovante: ''
      });
    }
  }, [pagamento, evento]);

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

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.dataPagamento) {
      newErrors.dataPagamento = 'Data de pagamento é obrigatória';
    }

    if (!formData.formaPagamento) {
      newErrors.formaPagamento = 'Forma de pagamento é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const pagamentoData = {
        eventoId: evento.id,
        valor: formData.valor,
        dataPagamento: new Date(formData.dataPagamento),
        formaPagamento: formData.formaPagamento,
        status: 'Pago' as const,
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
      {/* Informações do Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Evento</label>
              <div className="mt-1 text-sm text-gray-900">
                {evento.contratante} - {format(evento.dataEvento, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Valor Total</label>
              <div className="mt-1 text-sm text-gray-900">
                R$ {evento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Dia Final de Pagamento</label>
              <div className="mt-1 text-sm text-gray-900">
                {format(evento.diaFinalPagamento, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sugestões de Valores (apenas para novo pagamento) */}
      {!pagamento && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Sugestões de Valores</CardTitle>
            <CardDescription className="text-blue-700">
              Valores sugeridos baseados no valor total do evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  R$ {(evento.valorTotal * 0.25).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-blue-700">25% (Entrada)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  R$ {(evento.valorTotal * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-blue-700">50% (Meio)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  R$ {(evento.valorTotal * 0.75).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-blue-700">75% (Quase Total)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-900">
                  R$ {evento.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-blue-700">100% (Total)</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, valor: evento.valorTotal }))}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Usar Valor Total
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Input
              label="Data do Pagamento *"
              type="date"
              value={formData.dataPagamento}
              onChange={(e) => handleInputChange('dataPagamento', e.target.value)}
              error={errors.dataPagamento}
            />
          </div>

          <Select
            label="Forma de Pagamento *"
            options={formaPagamentoOptions}
            value={formData.formaPagamento}
            onChange={(e) => handleInputChange('formaPagamento', e.target.value)}
            error={errors.formaPagamento}
          />


          <Input
            label="Comprovante"
            value={formData.comprovante || ''}
            onChange={(e) => handleInputChange('comprovante', e.target.value)}
            placeholder="Número do comprovante ou referência"
          />

          <Textarea
            label="Observações"
            value={formData.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            rows={3}
            placeholder="Observações sobre este pagamento"
          />
        </CardContent>
      </Card>

      {/* Aviso sobre Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800">
            <strong>Informação:</strong> Todos os pagamentos são considerados como &quot;Pago&quot; independente da data.
            <br />
            <strong>Valor Pendente:</strong> Aparece até o dia final de pagamento para valores não pagos.
            <br />
            <strong>Valor Atrasado:</strong> Aparece após o dia final de pagamento para valores não pagos.
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {pagamento ? 'Atualizar Pagamento' : 'Adicionar Pagamento'}
        </Button>
      </div>
    </form>
  );
}