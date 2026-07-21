import { BaseSupabaseRepository } from './base-supabase-repository';
import { AnexoCustoFixo } from '@/types';
import { generateUUID } from '@/lib/utils/uuid';

export class AnexoCustoFixoSupabaseRepository extends BaseSupabaseRepository<AnexoCustoFixo> {
  constructor() {
    super('anexos_custo_fixo', undefined, true);
  }

  protected convertFromSupabase(row: any): AnexoCustoFixo {
    return {
      id: row.id,
      userId: row.user_id,
      custoFixoId: row.custo_fixo_id,
      nome: row.nome,
      tipo: row.tipo,
      tamanho: parseInt(row.tamanho) || 0,
      s3Key: row.s3_key,
      url: row.url,
      dataUpload: new Date(row.data_upload),
      dataCadastro: new Date(row.data_cadastro),
    };
  }

  protected convertToSupabase(entity: Partial<AnexoCustoFixo>): any {
    const data: any = {};
    if (entity.userId !== undefined) data.user_id = entity.userId;
    if (entity.custoFixoId !== undefined) data.custo_fixo_id = entity.custoFixoId;
    if (entity.nome !== undefined) data.nome = entity.nome;
    if (entity.tipo !== undefined) data.tipo = entity.tipo;
    if (entity.tamanho !== undefined) data.tamanho = entity.tamanho;
    if (entity.s3Key !== undefined) data.s3_key = entity.s3Key;
    if (entity.url !== undefined) data.url = entity.url;
    if (entity.dataUpload !== undefined) {
      data.data_upload = entity.dataUpload instanceof Date
        ? entity.dataUpload.toISOString()
        : entity.dataUpload;
    }
    if (entity.dataCadastro !== undefined) {
      data.data_cadastro = entity.dataCadastro instanceof Date
        ? entity.dataCadastro.toISOString()
        : entity.dataCadastro;
    }
    return data;
  }

  async findByCustoFixoId(userId: string, custoFixoId: string): Promise<AnexoCustoFixo[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('custo_fixo_id', custoFixoId)
      .order('data_upload', { ascending: false });

    if (error) throw new Error(`Erro ao buscar anexos de custo fixo: ${error.message}`);
    return (data || []).map(row => this.convertFromSupabase(row));
  }

  async createAnexo(
    userId: string,
    custoFixoId: string,
    anexo: Omit<AnexoCustoFixo, 'id' | 'dataCadastro'>
  ): Promise<AnexoCustoFixo> {
    const id = generateUUID();
    const supabaseData = this.convertToSupabase({
      ...anexo,
      userId,
      custoFixoId,
      dataCadastro: new Date(),
      dataUpload: anexo.dataUpload || new Date(),
    });
    supabaseData.id = id;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(supabaseData)
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar anexo de custo fixo: ${error.message}`);
    return this.convertFromSupabase(data);
  }

  async deleteAnexo(userId: string, custoFixoId: string, anexoId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', anexoId)
      .eq('user_id', userId)
      .eq('custo_fixo_id', custoFixoId);

    if (error) throw new Error(`Erro ao deletar anexo de custo fixo: ${error.message}`);
  }

  async getAnexoById(
    userId: string,
    custoFixoId: string,
    anexoId: string
  ): Promise<AnexoCustoFixo | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', anexoId)
      .eq('user_id', userId)
      .eq('custo_fixo_id', custoFixoId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar anexo de custo fixo: ${error.message}`);
    }
    return data ? this.convertFromSupabase(data) : null;
  }
}
