'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { subcollectionMigrationService, MigrationResult } from '@/lib/migration/subcollection-migration';
import Layout from '@/components/layout';

export default function MigrationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigration = async () => {
    setLoading(true);
    setResult(null);

    try {
      const migrationResult = await subcollectionMigrationService.migrateToSubcollections();
      setResult(migrationResult);
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro na migração',
        migratedCount: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Migração para Subcollections</h1>
          <p className="text-gray-600 mt-2">
            Migre os dados existentes para a nova estrutura de subcollections do Firestore
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informações sobre a migração */}
          <Card>
            <CardHeader>
              <CardTitle>Estrutura Atual vs Nova Estrutura</CardTitle>
              <CardDescription>
                Entenda as mudanças que serão feitas na estrutura dos dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Estrutura Atual (Collections Globais)</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• controle_clientes (com userId)</li>
                    <li>• controle_eventos (com userId)</li>
                    <li>• controle_tipo_custos (com userId)</li>
                    <li>• controle_pagamentos (com eventoId)</li>
                    <li>• controle_custos (com eventoId)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Nova Estrutura (Subcollections)</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• controle_users/{'{userId}'}/clientes</li>
                    <li>• controle_users/{'{userId}'}/eventos</li>
                    <li>• controle_users/{'{userId}'}/tipo_custos</li>
                    <li>• controle_users/{'{userId}'}/eventos/{'{eventoId}'}/pagamentos</li>
                    <li>• controle_users/{'{userId}'}/eventos/{'{eventoId}'}/custos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefícios */}
          <Card>
            <CardHeader>
              <CardTitle>Benefícios da Nova Estrutura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Dados isolados por usuário</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Queries mais rápidas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Segurança aprimorada</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Tipos de custo personalizados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Melhor escalabilidade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-green-600">✓</Badge>
                    <span className="text-sm">Menos campos userId</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso importante */}
          <Alert>
            <AlertDescription>
              <strong>⚠️ ATENÇÃO:</strong> Esta migração irá mover todos os dados existentes para a nova estrutura 
              e remover as collections antigas. Certifique-se de que não há dados importantes que possam ser perdidos.
              Como estamos em desenvolvimento, não há backup automático.
            </AlertDescription>
          </Alert>

          {/* Botão de migração */}
          <Card>
            <CardHeader>
              <CardTitle>Executar Migração</CardTitle>
              <CardDescription>
                Clique no botão abaixo para iniciar a migração dos dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMigration} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Migrando...' : 'Iniciar Migração'}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da migração */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Resultado da Migração</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Sucesso' : 'Erro'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{result.message}</p>
                  
                  {result.migratedCount > 0 && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>{result.migratedCount}</strong> documentos migrados com sucesso
                      </p>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-md">
                      <p className="text-sm text-red-800 font-semibold mb-2">Erros encontrados:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
