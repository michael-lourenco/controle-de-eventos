import { db } from '../firebase';
import { COLLECTIONS } from './collections';
import { 
  clientes, 
  eventos, 
  pagamentos, 
  tiposCusto, 
  custosEvento, 
  anexosEvento 
} from '../mockData';

export async function initializeCollections() {
  console.log('🚀 Iniciando inicialização das collections do Firestore...');
  
  try {
    // Verificar se as collections já existem
    const collections = [
      COLLECTIONS.CLIENTES,
      COLLECTIONS.EVENTOS,
      COLLECTIONS.PAGAMENTOS,
      COLLECTIONS.TIPO_CUSTOS,
      COLLECTIONS.CUSTOS,
      COLLECTIONS.ANEXOS_EVENTOS
    ];

    for (const collectionName of collections) {
      console.log(`📁 Verificando collection: ${collectionName}`);
      // As collections são criadas automaticamente quando o primeiro documento é adicionado
    }

    console.log('✅ Inicialização das collections concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar collections:', error);
    return false;
  }
}

export async function seedInitialData() {
  console.log('🌱 Iniciando seed dos dados iniciais...');
  
  try {
    // Importar os repositories
    const { repositoryFactory } = await import('../repositories/repository-factory');
    
    const clienteRepo = repositoryFactory.getClienteRepository();
    const eventoRepo = repositoryFactory.getEventoRepository();
    const pagamentoRepo = repositoryFactory.getPagamentoRepository();
    const tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
    const custoEventoRepo = repositoryFactory.getCustoEventoRepository();

    // Verificar se já existem dados
    const existingClientes = await clienteRepo.findAll();
    if (existingClientes.length > 0) {
      console.log('📊 Dados já existem no Firestore. Pulando seed...');
      return true;
    }

    console.log('📝 Inserindo clientes...');
    for (const cliente of clientes) {
      await clienteRepo.create(cliente);
    }

    console.log('📝 Inserindo tipos de custo...');
    for (const tipoCusto of tiposCusto) {
      await tipoCustoRepo.create(tipoCusto);
    }

    console.log('📝 Inserindo eventos...');
    for (const evento of eventos) {
      await eventoRepo.create(evento);
    }

    console.log('📝 Inserindo pagamentos...');
    for (const pagamento of pagamentos) {
      await pagamentoRepo.create(pagamento);
    }

    console.log('📝 Inserindo custos de eventos...');
    for (const custo of custosEvento) {
      await custoEventoRepo.create(custo);
    }

    console.log('✅ Seed dos dados iniciais concluído!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao fazer seed dos dados:', error);
    return false;
  }
}

export async function resetCollections() {
  console.log('🔄 Resetando collections...');
  
  try {
    const { repositoryFactory } = await import('../repositories/repository-factory');
    
    const clienteRepo = repositoryFactory.getClienteRepository();
    const eventoRepo = repositoryFactory.getEventoRepository();
    const pagamentoRepo = repositoryFactory.getPagamentoRepository();
    const tipoCustoRepo = repositoryFactory.getTipoCustoRepository();
    const custoEventoRepo = repositoryFactory.getCustoEventoRepository();

    // Deletar todos os documentos (em ordem reversa das dependências)
    const custos = await custoEventoRepo.findAll();
    for (const custo of custos) {
      await custoEventoRepo.delete(custo.id);
    }

    const pagamentos = await pagamentoRepo.findAll();
    for (const pagamento of pagamentos) {
      await pagamentoRepo.delete(pagamento.id);
    }

    const eventos = await eventoRepo.findAll();
    for (const evento of eventos) {
      await eventoRepo.delete(evento.id);
    }

    const tiposCusto = await tipoCustoRepo.findAll();
    for (const tipo of tiposCusto) {
      await tipoCustoRepo.delete(tipo.id);
    }

    const clientes = await clienteRepo.findAll();
    for (const cliente of clientes) {
      await clienteRepo.delete(cliente.id);
    }

    console.log('✅ Collections resetadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao resetar collections:', error);
    return false;
  }
}
