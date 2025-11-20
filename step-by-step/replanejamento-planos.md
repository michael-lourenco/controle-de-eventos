## Replanejamento dos Planos - 2025-11-20

### Contexto
- Solicitação: reformular planos Básico, Profissional e Enterprise com novos limites e funcionalidades, garantindo consistência nas seeds, regras de negócio e camadas de UI/UX.
- Objetivo imediato: operar em modo planejador, entendendo estado atual das funcionalidades (limites, anexos, botão de copiar, contratos) antes de propor o plano de ação.

### Arquivos revisados nesta etapa
- `src/types/funcionalidades.ts`: estrutura de planos, limites e tipos de funcionalidades.
- `src/lib/services/funcionalidade-service.ts`: regras atuais de permissão, cálculo de limites e verificações de criação de eventos/clientes.
- `src/lib/hooks/usePlano.ts`: fluxo client-side para expor status do plano, limites e verificações de permissão.
- `src/components/PlanoBloqueio.tsx`: componente reutilizado para bloquear telas e mostrar motivos/limites atingidos.
- `src/app/api/seed/funcionalidades-planos/route.ts`: seed responsável por criar/atualizar funcionalidades e planos no Firestore.
- Busca geral por palavras‐chave (`limiteEventos`, `Copiar`, `anexo`) para mapear onde os recursos são consumidos.

### Observações iniciais
- Limites atuais só contemplam eventos mensais e clientes totais; usuários e armazenamento estão placeholders.
- Eventos já possuem verificação robusta via `FuncionalidadeService.verificarPodeCriar`, mas clientes e UI ainda não exibem novos limites solicitados.
- Seeds atuais diferem do novo pacote (limites, descrição, funcionalidades e destaque), exigindo revisão completa.
- Upload de anexos já está implementado (componentes `AnexosEvento`, `PagamentoForm`, `PagamentoHistorico` e APIs relacionadas), porém ainda sem restrição por plano.
- Botão "Copiar" aparece em `src/app/eventos/[id]/page.tsx` e `src/app/eventos/page.tsx` sem checagem de permissão.
- Modelos em `src/lib/seed/modelos-contrato.ts` já existem; integração com novos planos/automatização precisa de análise adicional.

### Proximos passos planejados
- Levantar requisitos detalhados de diferenciação “padrão” vs “personalizado”.
- Mapear onde aplicar limites de clientes e anexos por plano (backend + frontend).
- Avaliar impacto nos hooks, componentes e APIs que consomem permissões/limites.
- Preparar plano detalhado com etapas, dependências e critérios de sucesso.



