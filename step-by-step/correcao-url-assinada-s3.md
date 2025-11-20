# Correção: Erro de URL Pré-assinada S3 - Limite de Expiração

## Problema Identificado

O sistema estava tentando gerar uma URL pré-assinada do S3 com validade de 1 ano (365 dias), mas o AWS S3 tem um limite máximo de **7 dias** para URLs pré-assinadas usando Signature Version 4.

**Erro:**
```
Error: Signature version 4 presigned URLs must have an expiration date less than one week in the future
```

## Causa

No arquivo `src/lib/s3-service.ts`, o método `uploadBuffer()` estava configurado para gerar URLs pré-assinadas com expiração de 1 ano:

```typescript
// ❌ ANTES (errado)
const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 365 });
```

## Solução Implementada

### 1. Correção Imediata

Corrigido o `expiresIn` para o máximo permitido (7 dias):

```typescript
// ✅ DEPOIS (correto)
// URLs pré-assinadas do S3 têm limite máximo de 7 dias (604800 segundos)
const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }); // 7 dias
```

### Arquivo Modificado

- ✅ `src/lib/s3-service.ts` - Método `uploadBuffer()` corrigido

## Limitação e Considerações Futuras

### Limitação Atual

A URL pré-assinada expira em **7 dias**, então:
- PDFs gerados agora terão URLs válidas por apenas 7 dias
- Após 7 dias, a URL não funcionará mais
- O arquivo ainda existe no S3, mas a URL expirada não permite acesso

### Soluções Futuras Recomendadas

Para resolver o problema de acesso a longo prazo aos PDFs de contratos, há algumas opções:

#### Opção 1: Regenerar URL Quando Necessário (Recomendado)

Salvar apenas o `s3Key` no banco de dados e regenerar a URL quando necessário:

**Vantagens:**
- URLs sempre válidas quando acessadas
- Não precisa tornar arquivos públicos
- Mais seguro

**Implementação:**
```typescript
// No repositório, salvar apenas o path
contrato.pdfPath = fileName; // Salva no banco

// Ao buscar o contrato, regenerar URL se necessário
if (contrato.pdfPath) {
  contrato.pdfUrl = await s3Service.getSignedUrl(contrato.pdfPath, 3600); // 1 hora
}
```

#### Opção 2: Tornar Arquivos Públicos (Mais Simples)

Configurar o bucket para permitir acesso público aos PDFs de contratos (ou usar CloudFront):

**Vantagens:**
- URLs nunca expiram
- Mais simples de implementar

**Desvantagens:**
- Menos seguro (qualquer um com a URL pode acessar)
- Precisa configurar políticas de bucket ou CloudFront

#### Opção 3: Endpoint para Gerar URL Dinâmica

Criar um endpoint `/api/contratos/[id]/pdf-url` que gere uma nova URL quando necessário:

```typescript
// GET /api/contratos/[id]/pdf-url
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const contrato = await contratoRepo.findById(params.id, userId);
  if (!contrato?.pdfPath) {
    return NextResponse.json({ error: 'PDF não encontrado' }, { status: 404 });
  }
  
  const url = await s3Service.getSignedUrl(contrato.pdfPath, 3600); // 1 hora
  return NextResponse.json({ url });
}
```

## Recomendações

1. **Curto Prazo**: A correção atual resolve o erro imediato
2. **Médio Prazo**: Implementar Opção 1 (salvar apenas path e regenerar URL)
3. **Longo Prazo**: Considerar CloudFront para melhor performance e segurança

## Teste

Após a correção, testar:
1. Gerar um novo PDF de contrato
2. Verificar se a URL é gerada sem erros
3. Confirmar que a URL funciona por 7 dias
4. Testar acesso após 7 dias (deve falhar, confirmando a limitação)

---

**Data da correção:** 2025-01-XX  
**Autor:** Auto (Cursor AI)

