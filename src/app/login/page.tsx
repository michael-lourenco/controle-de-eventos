'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { signIn } from 'next-auth/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password: senha,
        redirect: false
      });
      
      console.log('Resultado do signIn:', result);
      
      if (result?.error) {
        console.error('Erro no login:', result.error);
        setError('Email ou senha inválidos');
      } else if (result?.ok) {
        console.log('Login bem-sucedido, redirecionando...');
        router.push('/dashboard');
        router.refresh();
      } else {
        console.error('Resultado inesperado:', result);
        setError('Erro inesperado. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no catch:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Click-se</h1>
          <h2 className="text-2xl font-semibold text-text-primary">
            Sistema de Controle
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Faça login para acessar o sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-text-muted" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-text-muted" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!email || !senha}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Criar conta
                </button>
              </p>
            </div>

            <div className="mt-4 p-4 bg-primary/10 rounded-md">
              <h3 className="text-sm font-medium text-primary mb-2">
                Credenciais para teste (desenvolvimento):
              </h3>
              <div className="text-xs text-primary/80 space-y-1">
                <p><strong>Admin:</strong> admin@clickse.com / qualquer senha</p>
                <p><strong>Usuário:</strong> user@clickse.com / qualquer senha</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
