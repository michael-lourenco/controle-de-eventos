# Correção: Erro 500 ao Listar Modelos de Contrato

## Problema Identificado

O sistema estava retornando erro 500 (Internal Server Error) ao tentar listar os modelos de contrato, mesmo após a inicialização bem-sucedida dos modelos.

### Possíveis Causas

1. **Índice Composto Ausente**: A query `where('ativo', '==', true)` combinada com `orderBy('nome')` requer um índice composto no Firestore. Se o índice não existir, a query falha.

2. **Problema de Serialização JSON**: Objetos Date podem não ser serializados corretamente no JSON de resposta, causando erros.

3. **Conversão de Dados**: Arrays ou objetos aninhados podem não estar sendo convertidos corretamente do Firestore.

## Solução Implementada

### 1. Tratamento de Índice Ausente

Modificado o método `findAtivos()` no `ModeloContratoRepository` para:
- Tentar primeiro a query completa com `orderBy`
- Se falhar por índice ausente, buscar sem `orderBy` e ordenar manualmente
- Manter logs detalhados para depuração

### 2. Melhoria na Serialização JSON

Modificada a API `/api/modelos-contrato` para:
- Serializar manualmente as datas (Date → ISO string) antes de retornar
- Adicionar logs detalhados de erros para facilitar depuração
- Retornar mais informações sobre o erro quando ocorrer

## Arquivos Modificados

### `src/lib/repositories/modelo-contrato-repository.ts`

```typescript
async findAtivos(): Promise<ModeloContrato[]> {
  try {
    // Tentar com orderBy primeiro (requer índice composto)
    try {
      const q = query(
        collection(db, this.collectionName),
        where('ativo', '==', true),
        orderBy('nome')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreData(doc.data(), doc.id));
    } catch (indexError: any) {
      // Se falhar por índice, buscar sem orderBy e ordenar manualmente
      if (indexError?.code === 'failed-precondition' || 
          indexError?.message?.includes('index') || 
          indexError?.message?.includes('requires an index')) {
        console.warn(`Índice não encontrado para query com orderBy em ${this.collectionName}, buscando sem orderBy e ordenando manualmente`);
        const q = query(
          collection(db, this.collectionName),
          where('ativo', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const modelos = querySnapshot.docs.map(doc => this.convertFirestoreData(doc.data(), doc.id));
        // Ordenar manualmente
        return modelos.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      // Se for outro erro, relançar
      throw indexError;
    }
  } catch (error: any) {
    console.error(`Error finding active modelos in ${this.collectionName}:`, error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    throw error;
  }
}
```

### `src/app/api/modelos-contrato/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const modeloRepo = repositoryFactory.getModeloContratoRepository();
    const modelos = await modeloRepo.findAtivos();

    // Serializar datas manualmente para evitar problemas de JSON
    const modelosSerializados = modelos.map(modelo => ({
      ...modelo,
      dataCadastro: modelo.dataCadastro instanceof Date 
        ? modelo.dataCadastro.toISOString() 
        : modelo.dataCadastro,
      dataAtualizacao: modelo.dataAtualizacao instanceof Date 
        ? modelo.dataAtualizacao.toISOString() 
        : modelo.dataAtualizacao
    }));

    return NextResponse.json(modelosSerializados);
  } catch (error: any) {
    console.error('Erro ao listar modelos:', error);
    console.error('Detalhes do erro:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json({ 
      error: error.message || 'Erro ao listar modelos',
      details: error?.code || 'unknown'
    }, { status: 500 });
  }
}
```

## Benefícios

1. **Robustez**: O sistema agora funciona mesmo sem o índice composto, ordenando manualmente os resultados
2. **Transparência**: Logs detalhados facilitam a depuração de problemas futuros
3. **Compatibilidade**: Serialização manual de datas garante que o JSON seja válido
4. **Performance**: Se o índice existir, a query é otimizada pelo Firestore

## Próximos Passos (Opcional)

Se quiser criar o índice composto no Firestore para melhorar a performance:

1. Execute a query que falha no console do Firebase
2. O Firebase mostrará um link para criar o índice automaticamente
3. Clique no link e confirme a criação do índice
4. Após a criação, a query usará o índice automaticamente

## Como Testar

1. Acesse a página de criação de contratos (`/contratos/novo`)
2. A lista de modelos deve carregar sem erros
3. Verifique o console do navegador e do servidor para logs
4. Se ainda houver erro, os logs detalhados ajudarão a identificar a causa

---

**Data da correção:** 2025-01-XX  
**Autor:** Auto (Cursor AI)

