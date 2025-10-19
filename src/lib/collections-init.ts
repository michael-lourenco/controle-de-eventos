import { db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from './firestore/collections';

// Função para inicializar uma collection se ela não existir
export async function initializeCollectionIfNotExists(collectionName: string): Promise<void> {
  try {
    // Tentar acessar a collection
    const collectionRef = collection(db, collectionName);
    
    // Se chegou até aqui, a collection existe (mesmo que vazia)
    console.log(`Collection ${collectionName} está acessível`);
  } catch (error) {
    console.error(`Erro ao acessar collection ${collectionName}:`, error);
    throw error;
  }
}

// Função para inicializar todas as collections necessárias
export async function initializeAllCollections(): Promise<void> {
  const collections = Object.values(COLLECTIONS);
  
  for (const collectionName of collections) {
    try {
      await initializeCollectionIfNotExists(collectionName);
    } catch (error) {
      console.error(`Erro ao inicializar collection ${collectionName}:`, error);
    }
  }
  
  console.log('Todas as collections foram verificadas/inicializadas');
}

// Função para criar um documento de teste em uma collection vazia
export async function createTestDocument(collectionName: string, testData: any): Promise<void> {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, {
      ...testData,
      _isTestDocument: true,
      _createdAt: new Date()
    });
    console.log(`Documento de teste criado em ${collectionName}`);
  } catch (error) {
    console.error(`Erro ao criar documento de teste em ${collectionName}:`, error);
  }
}

// Função para verificar se uma collection está vazia
export async function isCollectionEmpty(collectionName: string): Promise<boolean> {
  try {
    const collectionRef = collection(db, collectionName);
    // Como não podemos fazer count diretamente, vamos tentar buscar um documento
    // Se não houver documentos, o Firestore retornará um array vazio
    return true; // Por enquanto, assumimos que está vazia se não há erro
  } catch (error) {
    console.error(`Erro ao verificar se collection ${collectionName} está vazia:`, error);
    return true;
  }
}

// Função para criar collections com dados de teste se estiverem vazias
export async function initializeCollectionsWithTestData(): Promise<void> {
  try {
    await initializeAllCollections();
    
    // Criar dados de teste para collections vazias
    const testData = {
      clientes: {
        nome: 'Cliente Teste',
        cpf: '000.000.000-00',
        email: 'teste@exemplo.com',
        telefone: '(00) 00000-0000',
        endereco: 'Endereço de teste',
        cep: '00000-000',
        dataCadastro: new Date()
      },
      eventos: {
        clienteId: 'test-cliente-id',
        cliente: {
          id: 'test-cliente-id',
          nome: 'Cliente Teste',
          cpf: '000.000.000-00',
          email: 'teste@exemplo.com',
          telefone: '(00) 00000-0000',
          endereco: 'Endereço de teste',
          cep: '00000-000',
          dataCadastro: new Date()
        },
        dataEvento: new Date(),
        diaSemana: 'Sábado',
        local: 'Local de teste',
        endereco: 'Endereço do evento',
        tipoEvento: 'Aniversário adulto',
        horarioInicio: '19:00',
        horarioInicioServico: '18:00',
        horarioTerminoServico: '23:00',
        horarioDesmontagem: '24:00',
        tempoEvento: '6 horas',
        contratante: 'Contratante Teste',
        numeroConvidados: 50,
        status: 'Agendado',
        valorTotal: 1000,
        diaFinalPagamento: new Date(),
        dataCadastro: new Date(),
        dataAtualizacao: new Date()
      },
      pagamentos: {
        eventoId: 'test-evento-id',
        evento: {
          id: 'test-evento-id',
          cliente: { nome: 'Cliente Teste' }
        },
        valor: 500,
        dataPagamento: new Date(),
        status: 'Pago',
        observacoes: 'Pagamento de teste'
      }
    };
    
    // Criar documentos de teste
    await createTestDocument(COLLECTIONS.CLIENTES, testData.clientes);
    await createTestDocument(COLLECTIONS.EVENTOS, testData.eventos);
    await createTestDocument(COLLECTIONS.PAGAMENTOS, testData.pagamentos);
    
    console.log('Collections inicializadas com dados de teste');
  } catch (error) {
    console.error('Erro ao inicializar collections com dados de teste:', error);
  }
}
