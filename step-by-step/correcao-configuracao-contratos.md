# Correção: Erro getSubcollection e Configuração de Dados Fixos

## Problemas Identificados

1. **Erro `getSubcollection is not a function`**: Os repositórios `ContratoRepository` e `ConfiguracaoContratoRepository` estavam usando um método `getSubcollection()` que não existe na classe base `SubcollectionRepository`.

2. **Dados fixos não configurados**: O usuário não tinha os dados fixos da empresa configurados, o que impedia o preenchimento automático dos contratos.

## Soluções Implementadas

### 1. Correção dos Repositórios

#### `src/lib/repositories/contrato-repository.ts`

**Problema**: Usava `this.getSubcollection(userId)` que não existe.

**Solução**: Substituído por `this.getSubcollectionRef(userId)` e uso correto da API do Firestore v9:

```typescript
// ANTES (errado)
const snapshot = await this.getSubcollection(userId)
  .where('eventoId', '==', eventoId)
  .orderBy('dataCadastro', 'desc')
  .get();

// DEPOIS (correto)
const collectionRef = this.getSubcollectionRef(userId);
const q = query(
  collectionRef,
  where('eventoId', '==', eventoId),
  orderBy('dataCadastro', 'desc')
);
const querySnapshot = await getDocs(q);
```

**Mudanças**:
- `findByEventoId()`: Corrigido para usar `getSubcollectionRef()` e `query()` com `getDocs()`
- `gerarNumeroContrato()`: Corrigido com tratamento de erro para índice ausente
- `contarPorStatus()`: Corrigido para usar `getSubcollectionRef()` e `getDocs()`

#### `src/lib/repositories/configuracao-contrato-repository.ts`

**Problema**: Usava `this.getSubcollection(userId)` que não existe.

**Solução**: Substituído por `this.getSubcollectionRef(userId)`:

```typescript
// ANTES (errado)
const snapshot = await this.getSubcollection(userId)
  .limit(1)
  .get();

// DEPOIS (correto)
const collectionRef = this.getSubcollectionRef(userId);
const q = query(collectionRef, limit(1));
const querySnapshot = await getDocs(q);
```

### 2. Criação de API para Campos Fixos

#### `src/app/api/configuracao-contrato/campos-fixos/route.ts`

Criada nova rota API para retornar os campos fixos formatados para uso nos contratos:

```typescript
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const configRepo = repositoryFactory.getConfiguracaoContratoRepository();
  const camposFixos = await configRepo.getCamposFixos(session.user.id);
  return NextResponse.json(camposFixos);
}
```

### 3. Página de Configuração de Contratos

#### `src/app/contratos/configuracao/page.tsx`

Criada página completa para configurar os dados fixos da empresa:

**Funcionalidades**:
- Formulário completo com todos os campos da configuração
- Seções organizadas:
  - Dados da Empresa (razão social, CNPJ, etc.)
  - Endereço completo
  - Contato (telefone, email, site)
  - Dados Bancários (opcional)
- Carregamento automático da configuração existente
- Validação de campos obrigatórios
- Feedback visual com toasts

### 4. Melhorias na Página de Criação de Contratos

#### `src/app/contratos/novo/page.tsx`

**Melhorias**:
- Adicionado estado `configExistente` para controlar se há configuração
- Melhorado carregamento dos campos fixos via API
- Adicionado aviso visual quando não há configuração
- Botão para ir à página de configuração quando necessário

```typescript
{configExistente === false && !evento && (
  <Card className="mb-4 border-yellow-500 bg-yellow-50">
    <CardHeader>
      <CardTitle>Configuração Necessária</CardTitle>
      <CardDescription>
        Você precisa configurar os dados fixos da empresa antes de criar contratos.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={() => router.push('/contratos/configuracao')}>
        Configurar Dados da Empresa
      </Button>
    </CardContent>
  </Card>
)}
```

## Arquivos Modificados/Criados

1. ✅ `src/lib/repositories/contrato-repository.ts` - Corrigido uso de métodos
2. ✅ `src/lib/repositories/configuracao-contrato-repository.ts` - Corrigido uso de métodos
3. ✅ `src/app/api/configuracao-contrato/campos-fixos/route.ts` - Nova API criada
4. ✅ `src/app/contratos/configuracao/page.tsx` - Nova página criada
5. ✅ `src/app/contratos/novo/page.tsx` - Melhorias no carregamento e aviso

## Como Usar

### 1. Configurar Dados da Empresa

1. Acesse `/contratos/configuracao` ou clique no botão de aviso na página de criação de contratos
2. Preencha todos os campos obrigatórios:
   - Dados da Empresa
   - Endereço completo
   - Contato
   - Dados Bancários (opcional)
3. Clique em "Salvar Configuração"

### 2. Criar Contrato

1. Acesse `/contratos/novo`
2. Selecione o modelo de contrato
3. Os campos fixos serão preenchidos automaticamente com os dados configurados
4. Preencha os campos dinâmicos específicos do contrato
5. Visualize o preview
6. Salve o contrato

## Próximos Passos (Opcional)

1. Adicionar link no menu de navegação para a página de configuração
2. Permitir edição parcial da configuração
3. Validar formato de CNPJ e CEP
4. Adicionar máscaras nos campos (CNPJ, telefone, CEP)

---

**Data da correção:** 2025-01-XX  
**Autor:** Auto (Cursor AI)

