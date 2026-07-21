'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SelectWithSearch from '@/components/ui/SelectWithSearch';
import { CustoFixo, AnexoCustoFixo, TipoCustoFixo } from '@/types';
import { dataService } from '@/lib/data-service';
import { useCurrentUser } from '@/hooks/useAuth';
import { usePlano } from '@/lib/hooks/usePlano';

interface CustoFixoFormProps {
  custo?: CustoFixo;
  onSave: (custo: CustoFixo) => void | Promise<void>;
  onCancel: () => void;
}

interface FormData {
  tipoCustoFixoId: string;
  valor: number;
  quantidade: number;
  dataPagamento: string;
  descricao: string;
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CustoFixoForm({ custo, onSave, onCancel }: CustoFixoFormProps) {
  const { userId } = useCurrentUser();
  const { temPermissao } = usePlano();
  const [temAnexos, setTemAnexos] = useState(false);
  const [anexos, setAnexos] = useState<AnexoCustoFixo[]>([]);
  const [anexosTemporarios, setAnexosTemporarios] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    tipoCustoFixoId: '',
    valor: 0,
    quantidade: 1,
    dataPagamento: hojeISO(),
    descricao: '',
  });
  const [valorInput, setValorInput] = useState('');
  const [tipos, setTipos] = useState<TipoCustoFixo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const lista = await dataService.getTiposCustoFixo(userId);
        setTipos(lista);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [userId]);

  useEffect(() => {
    if (custo) {
      const dataPag = custo.dataPagamento instanceof Date
        ? custo.dataPagamento.toISOString().slice(0, 10)
        : String(custo.dataPagamento).slice(0, 10);
      setFormData({
        tipoCustoFixoId: custo.tipoCustoFixoId,
        valor: custo.valor,
        quantidade: custo.quantidade || 1,
        dataPagamento: dataPag,
        descricao: custo.descricao || '',
      });
      setValorInput(custo.valor === 0 ? '' : String(custo.valor));
    }
  }, [custo]);

  useEffect(() => {
    temPermissao('ANEXOS_CUSTO_FIXO').then(setTemAnexos);
  }, [temPermissao]);

  const carregarAnexos = async (custoFixoId: string) => {
    try {
      const response = await fetch(`/api/anexos-custo-fixo?custoFixoId=${custoFixoId}`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setAnexos(data?.anexos || []);
      }
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    if (custo?.id && temAnexos) {
      carregarAnexos(custo.id);
    }
  }, [custo?.id, temAnexos]);

  const uploadAnexos = async (custoFixoId: string, files: File[]) => {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('custoFixoId', custoFixoId);
        const response = await fetch('/api/upload-anexo-custo-fixo', {
          method: 'POST',
          body: fd,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Erro no upload');
        }
        const result = await response.json();
        return result.anexo || result.data?.anexo;
      })
    );
    return uploaded.filter(Boolean);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !temAnexos) return;
    if (!custo?.id) {
      setAnexosTemporarios(prev => [...prev, ...Array.from(files)]);
      return;
    }
    setUploading(true);
    try {
      const novos = await uploadAnexos(custo.id, Array.from(files));
      setAnexos(prev => [...prev, ...novos]);
    } catch (e: any) {
      setErrors(prev => ({ ...prev, anexos: e.message || 'Erro no upload' }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAnexo = async (anexoId: string) => {
    if (!custo?.id) return;
    try {
      const response = await fetch(
        `/api/anexos-custo-fixo?custoFixoId=${custo.id}&anexoId=${anexoId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setAnexos(prev => prev.filter(a => a.id !== anexoId));
      }
    } catch {
      // silencioso
    }
  };

  const handleCreateTipo = async (nome: string) => {
    if (!userId || !nome.trim()) return;
    const criado = await dataService.createTipoCustoFixo(
      { nome: nome.trim(), descricao: '', ativo: true },
      userId
    );
    setTipos(prev => [...prev, criado]);
    setFormData(prev => ({ ...prev, tipoCustoFixoId: criado.id }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.tipoCustoFixoId) next.tipoCustoFixoId = 'Selecione o tipo';
    if (!formData.dataPagamento) next.dataPagamento = 'Informe a data de pagamento';
    if (!formData.valor || formData.valor <= 0) next.valor = 'Informe um valor válido';
    if (!formData.quantidade || formData.quantidade < 1) next.quantidade = 'Quantidade mínima: 1';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !validate()) return;

    setSaving(true);
    try {
      const payload = {
        tipoCustoFixoId: formData.tipoCustoFixoId,
        valor: formData.valor,
        quantidade: formData.quantidade || 1,
        dataPagamento: new Date(formData.dataPagamento + 'T12:00:00'),
        descricao: formData.descricao.trim(),
      };

      let salvo: CustoFixo;
      if (custo?.id) {
        salvo = await dataService.updateCustoFixo(userId, custo.id, payload);
      } else {
        salvo = await dataService.createCustoFixo(userId, { ...payload, removido: false });
        if (temAnexos && anexosTemporarios.length > 0 && salvo.id) {
          setUploading(true);
          const novos = await uploadAnexos(salvo.id, anexosTemporarios);
          setAnexos(novos);
          setAnexosTemporarios([]);
        }
      }

      await onSave(salvo);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Erro ao salvar' }));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-text-secondary p-4">Carregando formulário...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectWithSearch
        label="Tipo de custo fixo *"
        options={tipos.map(t => ({ value: t.id, label: t.nome, description: t.descricao || '' }))}
        value={formData.tipoCustoFixoId}
        onChange={(value) => setFormData(prev => ({ ...prev, tipoCustoFixoId: value }))}
        placeholder="Selecione ou digite para criar um novo tipo"
        onCreateNew={handleCreateTipo}
        allowCreate={true}
        error={errors.tipoCustoFixoId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Data de pagamento *</label>
          <Input
            type="date"
            value={formData.dataPagamento}
            onChange={(e) => setFormData(prev => ({ ...prev, dataPagamento: e.target.value }))}
          />
          {errors.dataPagamento && <p className="text-sm text-red-500 mt-1">{errors.dataPagamento}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Valor *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={valorInput}
            onChange={(e) => {
              setValorInput(e.target.value);
              setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }));
            }}
            placeholder="0,00"
          />
          {errors.valor && <p className="text-sm text-red-500 mt-1">{errors.valor}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Quantidade *</label>
          <Input
            type="number"
            min="1"
            value={formData.quantidade}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              quantidade: parseInt(e.target.value, 10) || 1,
            }))}
          />
          {errors.quantidade && <p className="text-sm text-red-500 mt-1">{errors.quantidade}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Descrição</label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          rows={3}
          placeholder="Detalhes do custo fixo"
        />
      </div>

      {temAnexos && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Anexos</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Enviando...' : 'Adicionar anexo'}
          </Button>
          {anexosTemporarios.length > 0 && (
            <ul className="mt-2 text-sm text-text-secondary">
              {anexosTemporarios.map((f, i) => (
                <li key={i}>{f.name} (será enviado ao salvar)</li>
              ))}
            </ul>
          )}
          {anexos.length > 0 && (
            <ul className="mt-2 space-y-1">
              {anexos.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {a.nome}
                  </a>
                  {custo?.id && (
                    <button
                      type="button"
                      className="text-red-500 text-xs"
                      onClick={() => handleDeleteAnexo(a.id)}
                    >
                      Remover
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {errors.anexos && <p className="text-sm text-red-500 mt-1">{errors.anexos}</p>}
        </div>
      )}

      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? 'Salvando...' : custo ? 'Atualizar' : 'Criar custo fixo'}
        </Button>
      </div>
    </form>
  );
}
