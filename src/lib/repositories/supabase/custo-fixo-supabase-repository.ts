import { BaseSupabaseRepository } from './base-supabase-repository';
import { CustoFixo, TipoCustoFixo } from '@/types';
import { generateUUID } from '@/lib/utils/uuid';

function mapTipoCustoFixo(row: any): TipoCustoFixo | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    ativo: row.ativo,
    dataCadastro: new Date(row.data_cadastro),
  };
}

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

export class CustoFixoSupabaseRepository extends BaseSupabaseRepository<CustoFixo> {
  constructor() {
    super('custos_fixos', undefined, true);
  }

  protected convertFromSupabase(row: any): CustoFixo {
    return {
      id: row.id,
      tipoCustoFixoId: row.tipo_custo_fixo_id,
      valor: parseFloat(row.valor) || 0,
      quantidade: row.quantidade || 1,
      dataPagamento: new Date(row.data_pagamento),
      descricao: row.descricao || undefined,
      removido: row.removido || false,
      dataRemocao: row.data_remocao ? new Date(row.data_remocao) : undefined,
      motivoRemocao: row.motivo_remocao || undefined,
      dataCadastro: new Date(row.data_cadastro),
      dataAtualizacao: row.data_atualizacao ? new Date(row.data_atualizacao) : undefined,
      tipoCustoFixo: mapTipoCustoFixo(row.tipo_custos_fixos),
    };
  }

  protected convertToSupabase(entity: Partial<CustoFixo>): any {
    const data: any = {};
    if (entity.tipoCustoFixoId !== undefined) data.tipo_custo_fixo_id = entity.tipoCustoFixoId;
    if (entity.valor !== undefined) data.valor = entity.valor;
    if (entity.quantidade !== undefined) data.quantidade = entity.quantidade || 1;
    if (entity.dataPagamento !== undefined) data.data_pagamento = toDateOnly(entity.dataPagamento);
    if (entity.descricao !== undefined) data.descricao = entity.descricao || null;
    if (entity.removido !== undefined) data.removido = entity.removido;
    if (entity.dataRemocao !== undefined) {
      data.data_remocao = entity.dataRemocao instanceof Date
        ? entity.dataRemocao.toISOString()
        : entity.dataRemocao || null;
    }
    if (entity.motivoRemocao !== undefined) data.motivo_remocao = entity.motivoRemocao || null;
    if (entity.dataCadastro !== undefined) {
      data.data_cadastro = entity.dataCadastro instanceof Date
        ? entity.dataCadastro.toISOString()
        : entity.dataCadastro;
    }
    return data;
  }

  private attachTipo(custo: CustoFixo, row: any): CustoFixo {
    if (row?.tipo_custos_fixos) {
      custo.tipoCustoFixo = mapTipoCustoFixo(row.tipo_custos_fixos);
    }
    return custo;
  }

  async findAll(userId?: string, apenasAtivos: boolean = true): Promise<CustoFixo[]> {
    if (!userId) throw new Error('userId é obrigatório para buscar custos fixos');

    let query = this.supabase
      .from(this.tableName)
      .select('*, tipo_custos_fixos(*)')
      .eq('user_id', userId)
      .order('data_pagamento', { ascending: false });

    if (apenasAtivos) {
      query = query.eq('removido', false);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao buscar custos fixos: ${error.message}`);

    return (data || []).map(row => this.attachTipo(this.convertFromSupabase(row), row));
  }

  async findById(id: string, userId?: string): Promise<CustoFixo | null> {
    if (!userId) throw new Error('userId é obrigatório para buscar custo fixo');

    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*, tipo_custos_fixos(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar custo fixo: ${error.message}`);
    }
    if (!data) return null;
    return this.attachTipo(this.convertFromSupabase(data), data);
  }

  async createCustoFixo(
    userId: string,
    custo: Omit<CustoFixo, 'id' | 'dataCadastro' | 'tipoCustoFixo'>
  ): Promise<CustoFixo> {
    const id = generateUUID();
    const supabaseData = this.convertToSupabase({
      ...custo,
      quantidade: custo.quantidade ?? 1,
      dataCadastro: new Date(),
    });
    supabaseData.id = id;
    supabaseData.user_id = userId;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(supabaseData)
      .select('*, tipo_custos_fixos(*)')
      .single();

    if (error) throw new Error(`Erro ao criar custo fixo: ${error.message}`);
    return this.attachTipo(this.convertFromSupabase(data), data);
  }

  async updateCustoFixo(
    userId: string,
    custoId: string,
    custo: Partial<CustoFixo>
  ): Promise<CustoFixo> {
    const supabaseData = this.convertToSupabase(custo);
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(supabaseData)
      .eq('id', custoId)
      .eq('user_id', userId)
      .select('*, tipo_custos_fixos(*)')
      .single();

    if (error) throw new Error(`Erro ao atualizar custo fixo: ${error.message}`);
    return this.attachTipo(this.convertFromSupabase(data), data);
  }

  async deleteCustoFixo(userId: string, custoId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', custoId)
      .eq('user_id', userId);

    if (error) throw new Error(`Erro ao excluir custo fixo: ${error.message}`);
  }

  async getTotalCustosFixos(userId: string): Promise<number> {
    const custos = await this.findAll(userId, true);
    return custos.reduce((sum, c) => sum + (c.valor * (c.quantidade || 1)), 0);
  }
}
