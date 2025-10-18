'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  AnexoEvento, 
  Evento
} from '@/types';
import { 
  createAnexoEvento, 
  updateAnexoEvento, 
  deleteAnexoEvento
} from '@/lib/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PlusIcon,
  TrashIcon,
  DocumentIcon,
  EyeIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AnexosEventoProps {
  evento: Evento;
  anexos: AnexoEvento[];
  onAnexosChange: () => void;
}

export default function AnexosEvento({ 
  evento, 
  anexos, 
  onAnexosChange 
}: AnexosEventoProps) {
  const [anexoParaExcluir, setAnexoParaExcluir] = useState<AnexoEvento | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return <DocumentIcon className="h-8 w-8 text-red-500" />;
      case 'Imagem':
        return <DocumentIcon className="h-8 w-8 text-blue-500" />;
      case 'Documento':
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-400" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Simular upload (em produção, enviaria para servidor)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const novoAnexo = createAnexoEvento({
        eventoId: evento.id,
        evento,
        nome: file.name,
        tipo: file.type === 'application/pdf' ? 'PDF' : 
              file.type.startsWith('image/') ? 'Imagem' : 'Documento',
        url: URL.createObjectURL(file), // Em produção, seria URL do servidor
        tamanho: file.size
      });
      
      onAnexosChange();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExcluirAnexo = (anexo: AnexoEvento) => {
    setAnexoParaExcluir(anexo);
  };

  const handleConfirmarExclusao = () => {
    if (anexoParaExcluir) {
      const sucesso = deleteAnexoEvento(anexoParaExcluir.id);
      if (sucesso) {
        onAnexosChange();
        setAnexoParaExcluir(null);
      }
    }
  };

  const handleVisualizarAnexo = (anexo: AnexoEvento) => {
    window.open(anexo.url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Upload de Anexos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Anexar Contrato PDF
          </CardTitle>
          <CardDescription>
            Faça upload do contrato em PDF para verificação rápida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
              <div className="text-sm text-gray-600">
                {isUploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Fazendo upload...
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Clique para fazer upload
                    </span>
                    <span className="block">ou arraste o arquivo aqui</span>
                    <span className="text-xs text-gray-500 mt-1">Apenas arquivos PDF</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Anexos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Anexos do Evento</CardTitle>
              <CardDescription>
                {anexos.length} anexo(s) registrado(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {anexos.length === 0 ? (
            <div className="text-center py-8">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum anexo registrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Faça upload do contrato PDF para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anexos.map((anexo) => (
                <div
                  key={anexo.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTipoIcon(anexo.tipo)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {anexo.nome}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-1">Tipo:</span>
                            {anexo.tipo}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">Tamanho:</span>
                            {formatFileSize(anexo.tamanho)}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">Upload:</span>
                            {format(anexo.dataUpload, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVisualizarAnexo(anexo)}
                        title="Visualizar anexo"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirAnexo(anexo)}
                        title="Excluir anexo"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aviso sobre Contrato */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Importante</h4>
              <p className="text-sm text-amber-700 mt-1">
                O contrato PDF é essencial para verificação rápida dos termos acordados. 
                Certifique-se de que o arquivo esteja legível e contenha todas as informações necessárias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      {anexoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirmar Exclusão</CardTitle>
              <CardDescription>
                Tem certeza que deseja excluir este anexo?
                <br />
                <strong>Arquivo:</strong> {anexoParaExcluir.nome}
                <br />
                Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setAnexoParaExcluir(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmarExclusao}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
