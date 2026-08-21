# Checklist — FortSulSC

Status: checklist de planejamento e qualidade
Última revisão: 2026-08-21

> **Governança:** este checklist mede qualidade e cobertura por área. O status de fase (o que está autorizado a avançar agora) está em `PLANO_MESTRE_FORTSULSC.md`.

Legenda:

- `[x]` já contemplado na proposta atual;
- `[ ]` pendente;
- `[~]` parcialmente contemplado ou depende de decisão.

## 1. Checklist essencial do site público

- `[ ]` Página de erro 404.
- `[x]` CTAs claros.
- `[~]` Links personalizados e revisados.
- `[ ]` Página de obrigado, se houver formulário no futuro.
- `[ ]` Breadcrumbs para produtos e conteúdos.
- `[ ]` Seção de cases ou provas reais, se o cliente fornecer material.
- `[ ]` FAQ com pelo menos 5 perguntas.
- `[ ]` Promessa de tempo de resposta para orçamento/atendimento.
- `[x]` CTA fixo no mobile via WhatsApp.
- `[ ]` `robots.txt`.
- `[~]` Títulos únicos por página.
- `[~]` Meta descriptions por página.
- `[ ]` Imagens para compartilhamento social.
- `[~]` Mapas e rotas.
- `[ ]` Avaliações reais de clientes, se fornecidas.
- `[x]` Textos alternativos nas imagens principais da home.
- `[ ]` Marcação de negócio local.
- `[ ]` Página de política de privacidade.
- `[ ]` Google Analytics ou alternativa, se aprovado.
- `[ ]` Foto real da equipe, se aprovada pelo cliente.

## 2. Checklist de design

- `[x]` Paleta alinhada ao logotipo.
- `[x]` Uso de azul e laranja como cores principais.
- `[x]` Layout responsivo para desktop, tablet e mobile.
- `[x]` CTA principal visível.
- `[x]` Produto/equipamento como protagonista visual.
- `[~]` Protótipo aprovado preservado como referência.
- `[ ]` Modernizações visuais validadas com o Jose antes de implementar.
- `[ ]` Revisão visual final com o cliente.

## 3. Checklist de conteúdo

- `[x]` Resumo do site atual documentado.
- `[x]` Lista do que será modificado documentada.
- `[~]` Conteúdo institucional inicial.
- `[ ]` Textos definitivos do cliente.
- `[ ]` Lista final de produtos.
- `[ ]` Categorias definitivas.
- `[ ]` Informações oficiais de representantes.
- `[ ]` Informações oficiais de revendas.
- `[ ]` Política de privacidade.

## 4. Checklist de frontend

- `[x]` HTML semântico na proposta inicial.
- `[x]` CSS responsivo.
- `[x]` Menu mobile.
- `[x]` Filtros visuais de soluções.
- `[x]` Respeito a `prefers-reduced-motion`.
- `[x]` Link de pular para conteúdo.
- `[ ]` Transformar em componentes React, quando a fase Next.js for aprovada.
- `[ ]` Revisar Lighthouse.
- `[ ]` Testar em navegadores principais.

## 5. Checklist de backend futuro

Não iniciar sem aprovação do Jose.

- `[ ]` Definir entidades.
- `[ ]` Aprovar regras de negócio.
- `[ ]` Aprovar modelagem do banco.
- `[ ]` Criar Prisma schema.
- `[ ]` Criar autenticação.
- `[ ]` Criar RBAC.
- `[ ]` Criar APIs ou Server Actions.
- `[ ]` Criar painel administrativo.
- `[ ]` Criar auditoria.
- `[ ]` Definir estratégia de backup.

## 5.1 Checklist de conteinerização (Docker)

- `[ ]` `Dockerfile` da aplicação Next.js.
- `[ ]` `docker-compose.yaml` com aplicação e PostgreSQL local.
- `[ ]` `.env.example` sem valores reais.
- `[ ]` Aplicação sobe e responde dentro do container.
- `[ ]` Documentação de como subir o ambiente localmente.
- `[ ]` Concluído antes de iniciar a modelagem de banco (Fase 3).

## 6. Checklist de segurança futuro

- `[ ]` Separar dados públicos e privados.
- `[ ]` Usar `select` explícito em consultas públicas.
- `[ ]` Não expor variáveis sensíveis com `NEXT_PUBLIC_*`.
- `[ ]` Validar uploads.
- `[ ]` Rate limiting em login e contato.
- `[ ]` Rate limiting/anti-scraping nas rotas públicas de representantes.
- `[ ]` MFA no admin.
- `[ ]` Logs sem dados pessoais sensíveis.
- `[ ]` Auditoria para alterações administrativas.
- `[ ]` Consentimento de representantes/revendas registrado antes de publicar dados.
- `[ ]` Política de retenção/exclusão de dados (LGPD) definida.

## 6.1 Checklist de segurança imediato (bloqueante)

- `[ ]` Remover `recovery-codes-vercel-fortsul.txt` do repositório.
- `[ ]` Purgar o arquivo do histórico do Git, se já commitado.
- `[ ]` Revogar/regenerar os códigos de recuperação na Vercel.
- `[ ]` Adicionar padrão de credenciais ao `.gitignore` (`*recovery*`, `*secret*`, `*.env`, `*token*`).

## 7. Checklist antes de finalizar qualquer tarefa

- `[ ]` A tarefa respeita o escopo aprovado?
- `[ ]` Não criou regra de negócio sem aprovação?
- `[ ]` Não criou backend/banco sem aprovação?
- `[ ]` Não alterou design aprovado sem avisar?
- `[ ]` Documentação impactada foi atualizada?
- `[ ]` Responsividade foi verificada?
- `[ ]` Acessibilidade básica foi preservada?
- `[ ]` Nenhum segredo foi lido, copiado ou salvo?
- `[ ]` Para decisões estruturais: passou pelas 6 etapas do fluxo de aprovação (proposta → Jose → Claude → implementação/testes smoke → testes manuais → aprovação dupla)?
- `[ ]` Commit/push só ocorreu após aprovação do Jose **e** do Claude?
