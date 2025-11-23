# Alteração do Card "Próximos Eventos (7 dias)" no Dashboard

## Data: 2025-01-27

## Objetivo
Remover a funcionalidade de clique do card "Próximos Eventos (7 dias)" na página `/dashboard`, mantendo apenas a ação de clicar no ícone de olho de cada evento para visualizar o evento específico. Isso resolve uma confusão dos clientes sobre o comportamento esperado ao clicar no card.

## Problema Identificado
Os clientes relataram confusão ao clicar no card "Próximos Eventos (7 dias)":
- **Comportamento anterior:** Ao clicar no card, era redirecionado para a lista de eventos (`/eventos`)
- **Comportamento anterior:** Ao clicar no ícone de olho, era redirecionado para o evento específico (`/eventos/[id]`)
- **Problema:** Os clientes esperavam que ao clicar em qualquer parte do card, fossem direcionados para o evento, não para a lista

## Solução Implementada

### 1. Remoção do onClick do Card

**Arquivo alterado:** `src/app/dashboard/page.tsx`

**Antes:**
```tsx
<Card 
  onClick={() => router.push('/eventos')}
  className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
>
```

**Depois:**
```tsx
<Card>
```

**Alterações realizadas:**
- Removido o `onClick={() => router.push('/eventos')}` do Card
- Removidas as classes CSS relacionadas ao comportamento clicável:
  - `cursor-pointer` - cursor de ponteiro
  - `transition-all` - transições de animação
  - `hover:shadow-lg` - sombra ao passar o mouse
  - `hover:scale-[1.01]` - aumento de escala ao passar o mouse
  - `active:scale-[0.99]` - redução de escala ao clicar

### 2. Funcionalidades Mantidas

**Ícone de Olho:**
- Continua funcionando normalmente
- Ao clicar no ícone de olho de qualquer evento na lista, o usuário é direcionado para `/eventos/[id]`
- Usa `e.stopPropagation()` para evitar que o clique propague para o Card (mesmo sem onClick agora, é uma boa prática)

**Botão "Ver todos":**
- Continua disponível no cabeçalho do card
- Ao clicar, direciona para `/eventos` (lista completa de eventos)
- Usa `e.stopPropagation()` para evitar propagação do evento

## Estrutura do Card

### Localização
- **Página:** `/dashboard`
- **Componente:** `src/app/dashboard/page.tsx`
- **Linhas:** 242-337

### Estrutura do Código
```tsx
{/* Eventos Próximos */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-success" />
        Próximos Eventos (7 dias)
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          router.push('/eventos');
        }}
        className="text-text-secondary hover:text-primary"
      >
        Ver todos
      </Button>
    </CardTitle>
    <CardDescription>
      Eventos agendados para os próximos 7 dias
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Tabela com eventos e botão de visualizar */}
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/eventos/${evento.id}`);
      }}
      title="Visualizar"
      className="hover:bg-primary/10 hover:text-primary"
    >
      <EyeIcon className="h-4 w-4" />
    </Button>
  </CardContent>
</Card>
```

## Comportamento Final

### Interações do Usuário

1. **Clicar no Card:**
   - ❌ **Antes:** Redirecionava para `/eventos`
   - ✅ **Agora:** Não faz nada (sem ação)

2. **Clicar no ícone de olho:**
   - ✅ **Mantido:** Redireciona para `/eventos/[id]` (evento específico)

3. **Clicar no botão "Ver todos":**
   - ✅ **Mantido:** Redireciona para `/eventos` (lista completa)

## Benefícios da Alteração

1. **UX mais clara:** Remove a ambiguidade sobre o que acontece ao clicar no card
2. **Comportamento intuitivo:** Apenas ações explícitas (botões e ícones) têm comportamento de navegação
3. **Consistência:** Mantém o padrão onde apenas elementos interativos explícitos são clicáveis

## Arquivos Modificados

### `src/app/dashboard/page.tsx`
- **Função:** Componente da página do dashboard
- **Alteração:** Removido onClick e classes de interação do Card "Próximos Eventos (7 dias)"
- **Linhas alteradas:** 242-243

## Testes Realizados

1. ✅ Verificado que o card não redireciona mais ao ser clicado
2. ✅ Verificado que o ícone de olho continua funcionando corretamente
3. ✅ Verificado que o botão "Ver todos" continua funcionando corretamente
4. ✅ Verificado que não há erros de lint

## Observações

- A alteração foi mínima e focada apenas no card "Próximos Eventos (7 dias)"
- Outros cards do dashboard mantêm suas funcionalidades originais
- O `e.stopPropagation()` nos botões permanece como boa prática, mesmo que o Card não tenha mais onClick

