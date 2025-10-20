import { useState, useEffect, useCallback } from 'react';
import { dataService } from '@/lib/data-service';
import { Cliente, Evento, Pagamento, TipoCusto, CustoEvento, DashboardData } from '@/types';
import { useCurrentUser } from './useAuth';

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook para clientes
export function useClientes(): UseDataResult<Cliente[]> {
  const [data, setData] = useState<Cliente[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getClientes(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useCliente(id: string): UseDataResult<Cliente> {
  const [data, setData] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!id || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getClienteById(id, userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cliente');
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para eventos
export function useEventos(): UseDataResult<Evento[]> {
  const [data, setData] = useState<Evento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getEventos(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useEvento(id: string): UseDataResult<Evento> {
  const [data, setData] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!id || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getEventoById(id, userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useEventosHoje(): UseDataResult<Evento[]> {
  const [data, setData] = useState<Evento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getEventosHoje(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos de hoje');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProximosEventos(limit?: number): UseDataResult<Evento[]> {
  const [data, setData] = useState<Evento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getProximosEventos(userId, limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar próximos eventos');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para pagamentos
export function usePagamentosPorEvento(eventoId: string): UseDataResult<Pagamento[]> {
  const [data, setData] = useState<Pagamento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!eventoId || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getPagamentosPorEvento(userId, eventoId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos do evento');
    } finally {
      setLoading(false);
    }
  }, [eventoId, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para tipos de custo
export function useTiposCusto(): UseDataResult<TipoCusto[]> {
  const [data, setData] = useState<TipoCusto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getTiposCusto(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tipos de custo');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para custos de evento
export function useCustosPorEvento(eventoId: string): UseDataResult<CustoEvento[]> {
  const [data, setData] = useState<CustoEvento[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!eventoId || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getCustosPorEvento(userId, eventoId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar custos do evento');
    } finally {
      setLoading(false);
    }
  }, [eventoId, userId]); // refreshKey added here

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para dashboard
export function useDashboardData(): UseDataResult<DashboardData> {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await dataService.getDashboardData(userId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
