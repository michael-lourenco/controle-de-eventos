# Adição de Links para Política de Privacidade e Termos de Uso

## Data: 2025-01-27

## Objetivo
Adicionar links para as páginas de Política de Privacidade e Termos de Uso na landing page (/) e na página de configurações, seguindo os padrões do sistema.

## Alterações Realizadas

### 1. Landing Page (/)
**Arquivo**: `src/app/page.tsx`

**Alterações**:
- Adicionado import do `Link` do Next.js
- Adicionados links no footer da página
- Links posicionados entre os botões de navegação e o copyright
- Separados por um separador visual (•)
- Estilizados seguindo padrão do sistema (hover:text-primary, underline)

**Estrutura Adicionada**:
```tsx
<div className="flex flex-wrap justify-center gap-4 text-sm text-text-secondary">
  <Link 
    href="/politica-privacidade"
    className="hover:text-primary transition-colors underline"
  >
    Política de Privacidade
  </Link>
  <span className="text-text-muted">•</span>
  <Link 
    href="/termos-uso"
    className="hover:text-primary transition-colors underline"
  >
    Termos de Uso
  </Link>
</div>
```

**Localização**: Footer da landing page, logo acima do copyright

### 2. Página de Configurações
**Arquivo**: `src/app/configuracoes/page.tsx`

**Alterações**:
- Adicionados imports dos ícones `ShieldCheckIcon` e `ScaleIcon`
- Criada nova seção "Documentos Legais" após os cards de configuração
- Adicionados 2 cards novos seguindo o mesmo padrão dos cards existentes:
  - **Política de Privacidade**: Card com ícone de escudo (ShieldCheckIcon), cor accent
  - **Termos de Uso**: Card com ícone de balança (ScaleIcon), cor primary

**Estrutura Adicionada**:
- Seção com título "Documentos Legais"
- Grid responsivo (1 coluna em mobile, 2 colunas em desktop)
- Cards clicáveis que redirecionam para as respectivas páginas
- Botões "Ler Política" e "Ler Termos"
- Descrições informativas sobre cada documento

**Características dos Cards**:
- **Política de Privacidade**:
  - Ícone: ShieldCheckIcon (escudo)
  - Cor: accent (azul turquesa)
  - Descrição: "Como tratamos seus dados"
  - Texto: "Conheça como coletamos, utilizamos e protegemos suas informações pessoais de acordo com a LGPD"

- **Termos de Uso**:
  - Ícone: ScaleIcon (balança)
  - Cor: primary (cinza escuro)
  - Descrição: "Condições de uso da plataforma"
  - Texto: "Leia os termos e condições que regem o uso da plataforma Clicksehub"

## Padrões Mantidos

### Design System
- **Cores**: Utiliza cores do sistema (accent, primary, surface, etc.)
- **Cards**: Mesmo padrão visual dos outros cards de configuração
- **Ícones**: Heroicons com tamanho consistente (h-6 w-6)
- **Espaçamento**: Grid responsivo seguindo padrão existente
- **Hover States**: Mesmos efeitos de hover (shadow-lg, transition-shadow)

### Estrutura Visual
- **Landing Page**: Links discretos no footer, não intrusivos
- **Configurações**: Cards destacados em seção própria, fácil acesso
- **Responsividade**: Layout adaptável para diferentes tamanhos de tela
- **Acessibilidade**: Links semânticos com hover states apropriados

## Benefícios

1. **Conformidade Legal**: Links facilmente acessíveis para documentos legais
2. **Transparência**: Usuários podem acessar políticas a qualquer momento
3. **UX Melhorada**: Links em locais lógicos e esperados
4. **Consistência**: Segue padrões visuais do sistema
5. **Acessibilidade**: Links claros e bem posicionados

## Localizações dos Links

### Landing Page (/)
- **Local**: Footer
- **Posição**: Entre botões de navegação e copyright
- **Estilo**: Links discretos com separador

### Página de Configurações
- **Local**: Seção "Documentos Legais"
- **Posição**: Após os cards de configuração principais
- **Estilo**: Cards destacados e clicáveis

## Arquivos Modificados

1. `src/app/page.tsx`
   - Adicionado import do Link
   - Adicionados links no footer

2. `src/app/configuracoes/page.tsx`
   - Adicionados imports de ícones
   - Criada seção "Documentos Legais"
   - Adicionados 2 cards novos

## Integração com Cookie Consent

Os links agora estão disponíveis em locais estratégicos:
- **Landing Page**: Para visitantes e novos usuários
- **Configurações**: Para usuários logados que precisam acessar os documentos
- **Cookie Consent**: Já referencia essas páginas no banner

Isso cria um fluxo completo de acesso aos documentos legais em diferentes pontos da aplicação.

## Notas Técnicas

- Links utilizam Next.js Link para navegação otimizada
- Cards na página de configurações são clicáveis (onClick com router.push)
- Layout responsivo mantido em ambos os casos
- Sem erros de lint após as alterações
- Compatível com tema claro e escuro

