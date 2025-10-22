'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Pagamento, 
  Evento,
  AnexoPagamento
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
  const [uploading, setUploading] = useState(false);
  const [anexos, setAnexos] = useState<AnexoPagamento[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pagamento) {
      setFormData({
        valor: pagamento.valor,
        dataPagamento: format(pagamento.dataPagamento, 'yyyy-MM-dd'),
        formaPagamento: pagamento.formaPagamento,
        observacoes: pagamento.observacoes || '',
        comprovante: pagamento.comprovante || ''
      });
      
      // Carregar anexos existentes para pagamentos em edição
      carregarAnexosExistentes();
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

  const carregarAnexosExistentes = async () => {
    if (!pagamento?.id) return;
    
    try {
      const response = await fetch(
        `/api/comprovantes?eventoId=${evento.id}&pagamentoId=${pagamento.id}`
      );
      
      if (response.ok) {
        const result = await response.json();
        setAnexos(result.anexos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar anexos existentes:', error);
    }
  };

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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Para novos pagamentos, não permitir upload até que o pagamento seja salvo
    if (!pagamento?.id) {
      setErrors(prev => ({
        ...prev,
        upload: 'Salve o pagamento primeiro antes de anexar arquivos'
      }));
      return;
    }

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventoId', evento.id);
        formData.append('pagamentoId', pagamento.id);

        const response = await fetch('/api/upload-comprovante', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erro no upload');
        }

        const result = await response.json();
        return result.anexo;
      });

      const uploadedAnexos = await Promise.all(uploadPromises);
      setAnexos(prev => [...prev, ...uploadedAnexos]);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      setErrors(prev => ({
        ...prev,
        upload: 'Erro ao fazer upload dos arquivos'
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAnexo = async (anexoId: string) => {
    try {
      const response = await fetch(
        `/api/comprovantes?eventoId=${evento.id}&pagamentoId=${pagamento?.id}&anexoId=${anexoId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setAnexos(prev => prev.filter(anexo => anexo.id !== anexoId));
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
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
            label="Comprovante (Texto)"
            value={formData.comprovante || ''}
            onChange={(e) => handleInputChange('comprovante', e.target.value)}
            placeholder="Número do comprovante ou referência"
          />

          {/* Seção de Upload de Arquivos */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Comprovantes (Arquivos)
            </label>
            
            {!pagamento?.id ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Salve o pagamento primeiro para anexar comprovantes
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="mb-2"
                  >
                    Selecionar Arquivos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mb-2"
                  >
                    {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Tipos aceitos: JPG, PNG, PDF, DOC, DOCX, TXT (máx. 5MB cada)
                  </p>
                </div>
              </div>
            )}

            {/* Lista de Anexos */}
            {anexos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Arquivos Anexados:</h4>
                {anexos.map((anexo) => (
                  <div key={anexo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{anexo.nome}</span>
                      <span className="text-xs text-gray-400">
                        ({(anexo.tamanho / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(anexo.url, '_blank')}
                      >
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnexo(anexo.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.upload && (
              <p className="text-sm text-red-600">{errors.upload}</p>
            )}
          </div>

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