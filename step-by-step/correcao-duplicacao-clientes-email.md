# Correção de Duplicação de Clientes por Email

## Data: 2025-01-27

## Problema Identificado
Ao criar um evento e ocorrer erro após criar o cliente, o sistema cadastrava o mesmo cliente duas vezes com o mesmo email. Isso acontecia porque:

1. Não havia validação de email duplicado antes de criar o cliente
2. O email não era normalizado (lowercase, trim) antes de buscar ou salvar
3. Se ocorresse erro após criar o cliente (linha 738 do EventoForm), o cliente já estava salvo
4. Em uma segunda tentativa, o sistema criava novamente o mesmo cliente

## Análise do Problema

### Fluxo Anterior (Com Problema)
1. Usuário preenche formulário de evento com novo cliente
2. Clica em "Salvar"
3. Sistema cria o cliente (`createCliente` linha 738)
4. Sistema tenta criar o evento
5. **Erro ocorre** (ex: erro de permissão, limite, etc.)
6. Cliente já foi criado no banco
7. Usuário tenta novamente
8. Sistema cria o cliente novamente (duplicado)

### Problemas Identificados
1. **Falta de validação de email duplicado:** O método `createCliente` não verificava se já existia cliente com o mesmo email
2. **Email não normalizado:** A busca por email era case-sensitive, permitindo duplicatas com emails em maiúsculas/minúsculas diferentes
3. **Sem tratamento específico:** Não havia tratamento de erro específico para email duplicado no formulário

## Solução Implementada

### 1. Melhoria do Método `findByEmail` no Repositório

**Arquivo:** `src/lib/repositories/cliente-repository.ts`

**Antes:**
```typescript
async findByEmail(email: string, userId: string): Promise<Cliente | null> {
  const clientes = await this.findWhere('email', '==', email, userId);
  return clientes.length > 0 ? clientes[0] : null;
}
```

**Depois:**
```typescript
async findByEmail(email: string, userId: string): Promise<Cliente | null> {
  if (!email || !email.trim()) {
    return null;
  }

  // Normalizar email: lowercase e trim para garantir busca correta
  const normalizedEmail = email.toLowerCase().trim();
  
  // Primeira tentativa: busca exata com email normalizado
  const clientes = await this.findWhere('email', '==', normalizedEmail, userId);
  if (clientes.length > 0) {
    return clientes[0];
  }
  
  // Segunda tentativa: buscar todos e filtrar localmente (case-insensitive)
  // Isso é necessário porque alguns emails podem estar salvos com maiúsculas no banco
  try {
    const allClientes = await this.findAll(userId);
    const foundCliente = allClientes.find(c => 
      c.email && c.email.toLowerCase().trim() === normalizedEmail
    );
    return foundCliente || null;
  } catch (error) {
    console.error('Erro ao buscar cliente por email (fallback):', error);
    return null;
  }
}
```

**Melhorias:**
- ✅ Normalização de email (lowercase, trim) antes de buscar
- ✅ Busca case-insensitive (encontra emails mesmo com maiúsculas/minúsculas diferentes)
- ✅ Fallback para busca local caso a busca exata não encontre (compatibilidade com dados antigos)

### 2. Validação de Email Duplicado no `createCliente`

**Arquivo:** `src/lib/data-service.ts`

**Antes:**
```typescript
async createCliente(
  cliente: Omit<Cliente, 'id' | 'dataCadastro'>,
  userId: string
): Promise<Cliente> {
  // ... validações de permissão ...
  return this.clienteRepo.createCliente(cliente, userId);
}
```

**Depois:**
```typescript
async createCliente(
  cliente: Omit<Cliente, 'id' | 'dataCadastro'>,
  userId: string
): Promise<Cliente> {
  // ... validações de permissão ...
  
  // Normalizar e validar email antes de criar
  if (cliente.email) {
    const emailNormalizado = cliente.email.toLowerCase().trim();
    
    // Verificar se já existe cliente com este email
    const clienteExistente = await this.clienteRepo.findByEmail(emailNormalizado, userId);
    if (clienteExistente) {
      const erro = new Error(`Já existe um cliente cadastrado com o email ${cliente.email}`);
      (erro as any).status = 409; // Conflict
      throw erro;
    }

    // Normalizar email no objeto antes de salvar
    cliente = {
      ...cliente,
      email: emailNormalizado
    };
  }

  return this.clienteRepo.createCliente(cliente, userId);
}
```

**Melhorias:**
- ✅ Validação de email duplicado antes de criar
- ✅ Normalização de email antes de salvar (garante consistência)
- ✅ Retorna erro 409 (Conflict) com mensagem clara quando email duplicado

### 3. Melhoria do Tratamento de Erro no Formulário

**Arquivo:** `src/components/forms/EventoForm.tsx`

**Antes:**
```typescript
} catch (error: any) {
  console.error('Erro ao salvar evento:', error);
  
  // Tratar erros de plano
  const erroTratado = handlePlanoError(error, showToast, () => router.push('/planos'));
  
  if (!erroTratado) {
    setErrors({ 
      general: error.message || 'Erro ao salvar evento. Tente novamente.' 
    });
    showToast(error.message || 'Erro ao salvar evento. Tente novamente.', 'error');
  }
  // ...
}
```

**Depois:**
```typescript
} catch (error: any) {
  console.error('Erro ao salvar evento:', error);
  
  // Tratar erros de plano
  const erroTratado = handlePlanoError(error, showToast, () => router.push('/planos'));
  
  if (!erroTratado) {
    // Verificar se é erro de email duplicado (status 409)
    if (error?.status === 409 || error?.message?.includes('Já existe um cliente')) {
      const erroMensagem = error.message || 'Já existe um cliente cadastrado com este email. Por favor, selecione o cliente existente na lista.';
      setErrors({ 
        novoClienteEmail: erroMensagem,
        general: erroMensagem
      });
      showToast(erroMensagem, 'error');
      // Sugerir usar cliente existente
      setIsNovoCliente(false);
    } else {
      // Se não for erro de plano, mostrar erro genérico
      setErrors({ 
        general: error.message || 'Erro ao salvar evento. Tente novamente.' 
      });
      showToast(error.message || 'Erro ao salvar evento. Tente novamente.', 'error');
    }
  }
  // ...
}
```

**Melhorias:**
- ✅ Tratamento específico para erro de email duplicado (status 409)
- ✅ Mensagem clara sugerindo usar cliente existente
- ✅ Automatically muda para modo "cliente existente" quando detecta duplicação
- ✅ Exibe erro específico no campo de email do formulário

## Benefícios da Correção

1. **Prevenção de duplicação:** Validação impede criação de clientes com email duplicado
2. **Normalização consistente:** Emails são sempre salvos em lowercase, evitando duplicatas por diferença de case
3. **UX melhorada:** Mensagem clara quando tenta criar cliente duplicado, sugerindo usar existente
4. **Compatibilidade:** Fallback garante que busca funciona mesmo com emails antigos salvos em maiúsculas

## Fluxo Corrigido

### Como Funciona Agora

1. **Usuário preenche formulário de evento com novo cliente**
2. **Clica em "Salvar"**
3. **Sistema valida permissão e limite** (já existia)
4. **Sistema normaliza email** (lowercase, trim)
5. **Sistema verifica se já existe cliente com este email**
   - ✅ Se existe: Retorna erro 409 (Conflict) com mensagem clara
   - ✅ Se não existe: Continua criação
6. **Sistema cria o cliente com email normalizado**
7. **Sistema cria o evento**
8. **Se ocorrer erro após criar cliente:**
   - Na próxima tentativa, a validação detecta duplicado
   - Usuário recebe mensagem clara
   - Sistema sugere usar cliente existente

## Arquivos Modificados

### Repositórios
- `src/lib/repositories/cliente-repository.ts`
  - **Função:** Melhorado `findByEmail()` para normalizar email e fazer busca case-insensitive
  - **Linhas:** 11-33

### Serviços
- `src/lib/data-service.ts`
  - **Função:** Adicionada validação de email duplicado em `createCliente()`
  - **Linhas:** 158-174

### Componentes
- `src/components/forms/EventoForm.tsx`
  - **Função:** Melhorado tratamento de erro para email duplicado
  - **Linhas:** 797-811

## Testes Realizados

1. ✅ Verificado que `findByEmail` normaliza email corretamente
2. ✅ Verificado que `createCliente` valida email duplicado antes de criar
3. ✅ Verificado que email é normalizado antes de salvar
4. ✅ Verificado que erro 409 é retornado quando email duplicado
5. ✅ Verificado que formulário trata erro de email duplicado corretamente
6. ✅ Verificado que não há erros de lint

## Observações

- A validação acontece no backend, garantindo segurança mesmo se frontend for burlado
- Emails são sempre normalizados antes de salvar, garantindo consistência
- O fallback na busca garante compatibilidade com dados antigos
- A mensagem de erro sugere usar cliente existente, melhorando UX

## Impacto

- **Usuários afetados:** Todos os usuários que criam eventos com novos clientes
- **Comportamento anterior:** Permitia duplicação de clientes com mesmo email
- **Comportamento atual:** Bloqueia duplicação e sugere usar cliente existente
- **Melhoria:** Prevenção de dados duplicados e melhor experiência do usuário

