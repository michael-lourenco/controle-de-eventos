# Setup Rápido - Sistema Click-se

## 🚀 Execução Imediata (Sem Firebase)

Para executar o sistema imediatamente sem configurar o Firebase:

### 1. Instalar Dependências
```bash
npm install
```

### 2. Criar Arquivo de Configuração
Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=desenvolvimento_secret_key_123
```

### 3. Executar o Projeto
```bash
npm run dev
```

### 4. Acessar o Sistema
Abra seu navegador em: http://localhost:3000

## 🔐 Usuários de Teste

- **Administrador**: admin@clickse.com / qualquer senha (mínimo 3 caracteres)
- **Usuário**: user@clickse.com / qualquer senha (mínimo 3 caracteres)

## 📊 Funcionalidades Disponíveis

- ✅ Dashboard com estatísticas
- ✅ Gestão de eventos
- ✅ Controle de pagamentos
- ✅ Relatórios financeiros
- ✅ Sistema de custos
- ✅ Autenticação funcional

## 🔥 Para Usar com Firebase (Opcional)

Se quiser usar o Firestore para persistência de dados:

1. Configure o Firebase seguindo `CONFIGURACAO.md`
2. Adicione as variáveis do Firebase ao `.env.local`
3. Acesse http://localhost:3000/admin/collections
4. Clique em "Migração Completa"

## ⚡ Status

- ✅ Sistema funcionando com dados mockados
- ✅ Autenticação implementada
- ✅ Interface completa
- ✅ Pronto para produção com Firebase
