import { BaseSupabaseRepository } from './base-supabase-repository';
import { getSupabaseClient } from '@/lib/supabase/client';
import { generateUUID } from '@/lib/utils/uuid';

export interface DashboardRelatorioPersistido {
  data: Record<string, any>;
  meta?: {
    totalEventos: number;
    totalPagamentos: number;
    geradoEm: string;
  };
}

export interface RelatorioPersistido {
  data: Record<string, any>;
  meta?: {
    geradoEm: string;
    [key: string]: any;
  };
}

export interface RelatorioDiario {
  id: string;
  dateKey: string;
  dataGeracao: Date;
  dashboard?: DashboardRelatorioPersistido;
  detalhamentoReceber?: RelatorioPersistido;
  receitaMensal?: RelatorioPersistido;
  performanceEventos?: RelatorioPersistido;
  fluxoCaixa?: RelatorioPersistido;
  servicos?: RelatorioPersistido;
  canaisEntrada?: RelatorioPersistido;
  impressoes?: RelatorioPersistido;
}

export class RelatoriosDiariosSupabaseRepository {
  private tableName = 'relatorios_diarios';
  private supabase = getSupabaseClient();

  private getDocId(userId: string, dateKey: string): string {
    // Usar dateKey como ID para garantir unicidade
    return `${userId}_${dateKey}`;
  }

  async getRelatorioDiario(userId: string, dateKey: string): Promise<RelatorioDiario | null> {
    if (!userId) {
      throw new Error('userId é obrigatório para acessar relatórios diários');
    }
    if (!dateKey) {
      throw new Error('dateKey é obrigatório para acessar relatórios diários');
    }

    const id = this.getDocId(userId, dateKey);

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar relatório diário: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      dateKey: data.date_key,
      dataGeracao: new Date(data.data_geracao),
      dashboard: data.dashboard || undefined,
      detalhamentoReceber: (data as any).detalhamento_receber || undefined,
      receitaMensal: (data as any).receita_mensal || undefined,
      performanceEventos: (data as any).performance_eventos || undefined,
      fluxoCaixa: (data as any).fluxo_caixa || undefined,
      servicos: (data as any).servicos || undefined,
      canaisEntrada: (data as any).canais_entrada || undefined,
      impressoes: (data as any).impressoes || undefined
    };
  }

  async salvarDashboard(
    userId: string,
    dateKey: string,
    payload: DashboardRelatorioPersistido,
    dataGeracao: Date
  ): Promise<void> {
    if (!userId) {
      throw new Error('userId é obrigatório para salvar relatório diário');
    }
    if (!dateKey) {
      throw new Error('dateKey é obrigatório para salvar relatório diário');
    }

    const id = this.getDocId(userId, dateKey);

    const { error } = await this.supabase
      .from(this.tableName)
      .upsert({
        id,
        user_id: userId,
        date_key: dateKey,
        data_geracao: dataGeracao.toISOString(),
        dashboard: payload
      }, {
        onConflict: 'id'
      });

    if (error) {
      throw new Error(`Erro ao salvar dashboard: ${error.message}`);
    }
  }

  async salvarRelatorio(
    userId: string,
    dateKey: string,
    tipoRelatorio: 'detalhamentoReceber' | 'receitaMensal' | 'performanceEventos' | 'fluxoCaixa' | 'servicos' | 'canaisEntrada' | 'impressoes',
    payload: RelatorioPersistido,
    dataGeracao: Date
  ): Promise<void> {
    if (!userId) {
      throw new Error('userId é obrigatório para salvar relatório diário');
    }
    if (!dateKey) {
      throw new Error('dateKey é obrigatório para salvar relatório diário');
    }

    const id = this.getDocId(userId, dateKey);

    // Mapear nome do campo para snake_case
    const campoMap: Record<string, string> = {
      detalhamentoReceber: 'detalhamento_receber',
      receitaMensal: 'receita_mensal',
      performanceEventos: 'performance_eventos',
      fluxoCaixa: 'fluxo_caixa',
      servicos: 'servicos',
      canaisEntrada: 'canais_entrada',
      impressoes: 'impressoes'
    };

    const campoSupabase = campoMap[tipoRelatorio];

    // Buscar registro existente
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const updateData: any = {
      id,
      user_id: userId,
      date_key: dateKey,
      data_geracao: dataGeracao.toISOString(),
      [campoSupabase]: payload
    };

    // Se já existe, fazer merge dos dados
    if (existing) {
      updateData.dashboard = existing.dashboard;
    }

    const { error } = await this.supabase
      .from(this.tableName)
      .upsert(updateData, {
        onConflict: 'id'
      });

    if (error) {
      throw new Error(`Erro ao salvar relatório ${tipoRelatorio}: ${error.message}`);
    }
  }

  async salvarMultiplosRelatorios(
    userId: string,
    dateKey: string,
    relatorios: Partial<Record<'detalhamentoReceber' | 'receitaMensal' | 'performanceEventos' | 'fluxoCaixa' | 'servicos' | 'canaisEntrada' | 'impressoes', RelatorioPersistido>>,
    dataGeracao: Date
  ): Promise<void> {
    if (!userId) {
      throw new Error('userId é obrigatório para salvar relatórios diários');
    }
    if (!dateKey) {
      throw new Error('dateKey é obrigatório para salvar relatórios diários');
    }

    const id = this.getDocId(userId, dateKey);

    // Mapear nomes dos campos para snake_case
    const campoMap: Record<string, string> = {
      detalhamentoReceber: 'detalhamento_receber',
      receitaMensal: 'receita_mensal',
      performanceEventos: 'performance_eventos',
      fluxoCaixa: 'fluxo_caixa',
      servicos: 'servicos',
      canaisEntrada: 'canais_entrada',
      impressoes: 'impressoes'
    };

    // Buscar registro existente
    const { data: existing } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const updateData: any = {
      id,
      user_id: userId,
      date_key: dateKey,
      data_geracao: dataGeracao.toISOString()
    };

    // Adicionar campos existentes
    if (existing) {
      updateData.dashboard = existing.dashboard;
    }

    // Adicionar novos relatórios
    Object.entries(relatorios).forEach(([key, value]) => {
      const campoSupabase = campoMap[key];
      if (campoSupabase && value) {
        updateData[campoSupabase] = value;
      }
    });

    const { error } = await this.supabase
      .from(this.tableName)
      .upsert(updateData, {
        onConflict: 'id'
      });

    if (error) {
      throw new Error(`Erro ao salvar múltiplos relatórios: ${error.message}`);
    }
  }
}
