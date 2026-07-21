import { BaseSupabaseRepository } from './base-supabase-repository';
import { TipoCustoFixo } from '@/types';
import { generateUUID } from '@/lib/utils/uuid';

export class TipoCustoFixoSupabaseRepository extends BaseSupabaseRepository<TipoCustoFixo> {
  constructor() {
    super('tipo_custos_fixos', undefined, true);
  }

  protected convertFromSupabase(row: any): TipoCustoFixo {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      ativo: row.ativo,
      dataCadastro: new Date(row.data_cadastro),
    };
  }

  protected convertToSupabase(entity: Partial<TipoCustoFixo>): any {
    const data: any = {};
    if (entity.nome !== undefined) data.nome = entity.nome;
    if (entity.descricao !== undefined) data.descricao = entity.descricao || null;
    if (entity.ativo !== undefined) data.ativo = entity.ativo;
    if (entity.dataCadastro !== undefined) data.data_cadastro = entity.dataCadastro.toISOString();
    return data;
  }

  async getAtivos(userId: string): Promise<TipoCustoFixo[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw new Error(`Erro ao buscar tipos de custo fixo ativos: ${error.message}`);
    return (data || []).map(row => this.convertFromSupabase(row));
  }

  async getInativos(userId: string): Promise<TipoCustoFixo[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('ativo', false)
      .order('nome', { ascending: true });

    if (error) throw new Error(`Erro ao buscar tipos de custo fixo inativos: ${error.message}`);
    return (data || []).map(row => this.convertFromSupabase(row));
  }

  async createTipoCustoFixo(
    tipo: Omit<TipoCustoFixo, 'id' | 'dataCadastro'>,
    userId: string
  ): Promise<TipoCustoFixo> {
    const id = generateUUID();
    const supabaseData = this.convertToSupabase({ ...tipo, dataCadastro: new Date() });
    supabaseData.id = id;
    supabaseData.user_id = userId;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar tipo de custo fixo: ${error.message}`);
    return this.convertFromSupabase(data);
  }

  async findAll(userId?: string): Promise<TipoCustoFixo[]> {
    if (!userId) throw new Error('userId é obrigatório para buscar tipos de custo fixo');
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('nome', { ascending: true });

    if (error) throw new Error(`Erro ao buscar tipos de custo fixo: ${error.message}`);
    return (data || []).map(row => this.convertFromSupabase(row));
  }

  async findById(id: string, userId?: string): Promise<TipoCustoFixo | null> {
    if (!userId) throw new Error('userId é obrigatório para buscar tipo de custo fixo');
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar tipo de custo fixo: ${error.message}`);
    }
    return data ? this.convertFromSupabase(data) : null;
  }

  async updateTipoCustoFixo(id: string, tipo: Partial<TipoCustoFixo>, userId: string): Promise<TipoCustoFixo> {
    const supabaseData = this.convertToSupabase(tipo);
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(supabaseData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar tipo de custo fixo: ${error.message}`);
    return this.convertFromSupabase(data);
  }

  async deleteTipoCustoFixo(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ ativo: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Erro ao inativar tipo de custo fixo: ${error.message}`);
  }

  async reativarTipoCustoFixo(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ ativo: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Erro ao reativar tipo de custo fixo: ${error.message}`);
  }
}
