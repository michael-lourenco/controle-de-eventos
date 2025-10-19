import { 
  clientes, 
  eventos, 
  pagamentos, 
  tiposCusto, 
  custosEvento, 
  anexosEvento,
  servicos,
  pacotesServico,
  promoters,
  insumos
} from '../mockData';
import { repositoryFactory } from '../repositories/repository-factory';

export interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    collection: string;
    inserted: number;
    errors: string[];
  }[];
}

export class MigrationService {
  private clienteRepo = repositoryFactory.getClienteRepository();
  private eventoRepo = repositoryFactory.getEventoRepository();
  private pagamentoRepo = repositoryFactory.getPagamentoRepository();
  private tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
  private custoEventoRepo = repositoryFactory.getCustoEventoRepository();

  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: 'Migração iniciada',
      details: []
    };

    try {
      console.log('🚀 Iniciando migração completa dos dados...');

      // 1. Migrar tipos de custo primeiro (sem dependências)
      const tiposCustoResult = await this.migrateTiposCusto();
      result.details.push(tiposCustoResult);

      // 2. Migrar clientes
      const clientesResult = await this.migrateClientes();
      result.details.push(clientesResult);

      // 3. Migrar eventos (dependem de clientes)
      const eventosResult = await this.migrateEventos();
      result.details.push(eventosResult);

      // 4. Migrar pagamentos (dependem de eventos)
      const pagamentosResult = await this.migratePagamentos();
      result.details.push(pagamentosResult);

      // 5. Migrar custos de eventos (dependem de eventos e tipos de custo)
      const custosResult = await this.migrateCustosEvento();
      result.details.push(custosResult);

      // Verificar se houve erros
      const hasErrors = result.details.some(detail => detail.errors.length > 0);
      result.success = !hasErrors;
      result.message = hasErrors ? 'Migração concluída com erros' : 'Migração concluída com sucesso!';

      console.log('✅ Migração concluída:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      result.success = false;
      result.message = 'Erro durante migração: ' + (error as Error).message;
      return result;
    }
  }

  private async migrateClientes() {
    console.log('📝 Migrando clientes...');
    const result = {
      collection: 'controle_clientes',
      inserted: 0,
      errors: [] as string[]
    };

    try {
      for (const cliente of clientes) {
        try {
          await this.clienteRepo.create(cliente);
          result.inserted++;
        } catch (error) {
          result.errors.push(`Erro ao inserir cliente ${cliente.nome}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Erro geral ao migrar clientes: ${error}`);
    }

    return result;
  }

  private async migrateEventos() {
    console.log('📝 Migrando eventos...');
    const result = {
      collection: 'controle_eventos',
      inserted: 0,
      errors: [] as string[]
    };

    try {
      for (const evento of eventos) {
        try {
          await this.eventoRepo.create(evento);
          result.inserted++;
        } catch (error) {
          result.errors.push(`Erro ao inserir evento ${evento.contratante}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Erro geral ao migrar eventos: ${error}`);
    }

    return result;
  }

  private async migratePagamentos() {
    console.log('📝 Migrando pagamentos...');
    const result = {
      collection: 'controle_pagamentos',
      inserted: 0,
      errors: [] as string[]
    };

    try {
      for (const pagamento of pagamentos) {
        try {
          await this.pagamentoRepo.create(pagamento);
          result.inserted++;
        } catch (error) {
          result.errors.push(`Erro ao inserir pagamento: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Erro geral ao migrar pagamentos: ${error}`);
    }

    return result;
  }

  private async migrateTiposCusto() {
    console.log('📝 Migrando tipos de custo...');
    const result = {
      collection: 'controle_tipo_custos',
      inserted: 0,
      errors: [] as string[]
    };

    try {
      for (const tipoCusto of tiposCusto) {
        try {
          await this.tipoCustoRepo.create(tipoCusto);
          result.inserted++;
        } catch (error) {
          result.errors.push(`Erro ao inserir tipo de custo ${tipoCusto.nome}: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Erro geral ao migrar tipos de custo: ${error}`);
    }

    return result;
  }

  private async migrateCustosEvento() {
    console.log('📝 Migrando custos de eventos...');
    const result = {
      collection: 'controle_custos',
      inserted: 0,
      errors: [] as string[]
    };

    try {
      for (const custo of custosEvento) {
        try {
          await this.custoEventoRepo.create(custo);
          result.inserted++;
        } catch (error) {
          result.errors.push(`Erro ao inserir custo: ${error}`);
        }
      }
    } catch (error) {
      result.errors.push(`Erro geral ao migrar custos de eventos: ${error}`);
    }

    return result;
  }

  async validateMigration(): Promise<{
    success: boolean;
    message: string;
    validation: {
      collection: string;
      expected: number;
      actual: number;
      status: 'success' | 'warning' | 'error';
    }[];
  }> {
    console.log('🔍 Validando migração...');
    
    const validation = [];
    let success = true;

    try {
      // Validar clientes
      const clientesCount = (await this.clienteRepo.findAll()).length;
      validation.push({
        collection: 'controle_clientes',
        expected: clientes.length,
        actual: clientesCount,
        status: clientesCount === clientes.length ? 'success' : 'error'
      });

      // Validar eventos
      const eventosCount = (await this.eventoRepo.findAll()).length;
      validation.push({
        collection: 'controle_eventos',
        expected: eventos.length,
        actual: eventosCount,
        status: eventosCount === eventos.length ? 'success' : 'error'
      });

      // Validar pagamentos
      const pagamentosCount = (await this.pagamentoRepo.findAll()).length;
      validation.push({
        collection: 'controle_pagamentos',
        expected: pagamentos.length,
        actual: pagamentosCount,
        status: pagamentosCount === pagamentos.length ? 'success' : 'error'
      });

      // Validar tipos de custo
      const tiposCustoCount = (await this.tipoCustoRepo.findAll()).length;
      validation.push({
        collection: 'controle_tipo_custos',
        expected: tiposCusto.length,
        actual: tiposCustoCount,
        status: tiposCustoCount === tiposCusto.length ? 'success' : 'error'
      });

      // Validar custos de eventos
      const custosCount = (await this.custoEventoRepo.findAll()).length;
      validation.push({
        collection: 'controle_custos',
        expected: custosEvento.length,
        actual: custosCount,
        status: custosCount === custosEvento.length ? 'success' : 'error'
      });

      // Verificar se há erros
      const hasErrors = validation.some(v => v.status === 'error');
      success = !hasErrors;

      return {
        success,
        message: success ? 'Validação concluída com sucesso!' : 'Validação encontrou discrepâncias',
        validation
      };

    } catch (error) {
      console.error('❌ Erro durante validação:', error);
      return {
        success: false,
        message: 'Erro durante validação: ' + (error as Error).message,
        validation
      };
    }
  }
}

export const migrationService = new MigrationService();
