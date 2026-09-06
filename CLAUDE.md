# Instruções para Claude — FortSulSC

Este repositório contém a reformulação do site da FortSulSC.

## 1. Objetivo do projeto

Reformular o site institucional da FortSulSC, atualmente baseado em WordPress/Elementor, preservando o padrão visual aprovado pelo cliente e evoluindo para uma experiência moderna, responsiva e preparada para crescimento futuro.

A primeira etapa é design/frontend. Backend, banco de dados, autenticação, CRUD administrativo e regras de negócio só podem ser implementados depois de aprovação explícita do Jose.

## 2. Regra principal

Não implementar backend, banco de dados, CRUD administrativo, autenticação ou regras de negócio sem aprovação explícita do Jose.

Se uma solicitação exigir regra de negócio, parar e pedir validação.

## 3. Documentos principais

Leia primeiro `docs/PLANO_MESTRE_FORTSULSC.md`. Ele é a fonte de verdade sobre a fase vigente, os limites de escopo e os portões de aprovação.

- `docs/CODEBASE_MAP.md` — mapa gerado do código: estrutura de diretórios, módulos, fluxos de dados e gotchas (não substitui os documentos de governança acima quanto a fase/escopo).
- `docs/PLANEJAMENTO_PROJETO.md` — planejamento reformulado do projeto.
- `docs/ARCHITECTURE.md` — arquitetura atual e futura.
- `docs/ABSTRACTION_POLICY.md` — critérios preventivos para abstrações e integrações externas; exemplos não autorizam implementação.
- `docs/API.md` — padrão para documentação de APIs futuras.
- `docs/COMPONENTS.md` — componentes atuais e mapeamento futuro.
- `docs/DESIGN-SYSTEM.md` — tokens e regras visuais.
- `docs/RULES.md` — regras obrigatórias de desenvolvimento.
- `docs/FortSulSC_instrucoes_Hermes_Codex.md` — contrato operacional para agentes principais e subagentes.
- `docs/PROMPT_COMUNICACAO_AGENTES.md` — prompt reutilizável de handoff do estado, decisões e regras atuais.
- `docs/CHECKLIST.md` — checklist de qualidade, SEO, UX e segurança.
- `docs/PROMPT_CLAUDE_REVIEW.md` — prompt para revisão crítica.
- `README.md` — instruções rápidas do projeto.

## 3.1. Workflow obrigatório de agentes e fontes

Antes de qualquer nova tarefa:

1. consultar o SecondBrain pelo protocolo global;
2. usar os skills aplicáveis de `addyosmani/agent-skills`, começando por `using-agent-skills` para identificar o fluxo necessário;
3. usar Context7 para documentação atual de qualquer biblioteca, framework, SDK, API, CLI ou serviço de nuvem envolvido;
4. ler os documentos listados na seção 3, incluindo o contrato operacional de agentes, e verificar o estado real do Git;
5. não abrir arquivos de recovery codes, `.env`, tokens, credenciais, chaves, senhas ou connection strings;
6. para mudança estrutural (ver seção 7), delegar ao subagente `scope-gate-reviewer` antes de implementar ou propor commit/push;
7. depois de criar ou alterar componente visual, delegar ao subagente `ui-reviewer` antes de entregar para revisão do Claude.
8. em toda worktree nova, seguir `docs/WORKTREE_PREVIEW.md` antes de testes visuais, autenticação ou desenvolvimento: instalar dependências com o lockfile, vincular a Vercel CLI e usar o Preview otimizado; nunca copiar `.env`, `.env.local` ou `.vercel` de outra worktree.

Os subagentes do projeto estão definidos em `.claude/agents/` (configuração local; ver `docs/FortSulSC_instrucoes_Hermes_Codex.md` seção 7.1) e não substituem a revisão do Claude nem a aprovação de Jose.

O agente deve declarar os skills usados e manter as alterações pequenas, testáveis e dentro da fase autorizada.

## 4. Stack planejada

Fase atual:

- HTML;
- CSS;
- JavaScript;
- frontend estático.

Fase futura planejada:

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui;
- PostgreSQL;
- Prisma;
- Auth.js;
- Leaflet;
- OpenStreetMap.

## 5. Estrutura atual

```text
FortSulSC/
├── index.html
├── styles.css
├── script.js
├── image/
├── docs/
├── README.md
└── CLAUDE.md
```

## 6. Convenções de código

- Preservar HTML semântico.
- Manter CSS organizado por seção.
- Usar JavaScript apenas para interação de interface.
- Não misturar regra de negócio com componente visual.
- Evitar dependências desnecessárias.
- Manter acessibilidade básica.
- Preservar responsividade.

Na fase Next.js futura:

- usar TypeScript;
- preferir Server Components;
- usar `"use client"` apenas quando necessário;
- validar entradas no servidor;
- isolar acesso a dados;
- não acessar Prisma em componente visual.

## 7. Como criar novas funcionalidades

Antes de criar qualquer funcionalidade:

1. verificar primeiro `docs/PLANO_MESTRE_FORTSULSC.md` e depois `docs/PLANEJAMENTO_PROJETO.md`;
2. confirmar se está no escopo aprovado;
3. identificar se envolve regra de negócio;
4. se envolver backend, banco, autenticação ou CRUD, pedir aprovação ao Jose;
5. para decisão estrutural, seguir o fluxo: proposta técnica → aprovação do Jose → revisão do Claude → implementação e smoke tests → testes manuais do Jose → aprovação dupla antes de commit ou push;
6. atualizar documentação impactada.

## 8. Como escrever componentes

Seguir `docs/COMPONENTS.md` e `docs/DESIGN-SYSTEM.md`.

Regras:

- componente visual deve receber dados prontos;
- componente não decide regra de negócio;
- CTA deve ser claro;
- imagem relevante precisa de `alt`;
- estados mobile devem ser considerados desde o início.

## 9. Como lidar com bugs

1. reproduzir o problema;
2. identificar arquivo/trecho afetado;
3. corrigir com a menor alteração segura;
4. verificar se impacta documentação;
5. não usar correções que expandem escopo sem necessidade.

## 10. Como criar commits

Jose conduz o fluxo Git. Não fazer commit, merge nem push. Só podem ocorrer após a aprovação do Jose e do Claude.

Cada agente (Claude, Codex ou outro que entrar em produção) trabalha em branch ou worktree próprio, isolado da `main` e dos demais agentes; commits, merges e push são sempre executados por Jose diretamente no terminal, nunca pelo agente — mesmo trabalhando na própria branch. Exceção só com autorização pontual e explícita de Jose para uma tarefa específica, sem valer para tarefas futuras. Ver `docs/FortSulSC_instrucoes_Hermes_Codex.md` seção 6.3 para o fluxo completo, incluindo a exigência de repetir a suíte de testes a partir da `main` após cada merge.

Quando necessário, sugerir mensagem no formato:

```text
tipo: descrição curta
```

Exemplo:

```text
docs: dividir documentação do projeto FortSulSC
```

## 11. Como responder quando faltar contexto

Se faltar contexto e a decisão puder alterar escopo, regra de negócio, visual aprovado, segurança ou banco de dados, pergunte ao Jose antes de agir.

Se a dúvida for pequena e não alterar escopo, faça uma suposição conservadora e documente.

## 12. Boas práticas obrigatórias

- Preservar o padrão visual aprovado pelo cliente.
- Apresentar modernizações visuais relevantes antes de implementar.
- Manter a paleta alinhada ao logotipo.
- Usar solução simples antes de adicionar complexidade.
- Atualizar documentação quando houver decisão durável.
- Não ler, copiar ou registrar segredos desnecessários.
- Confirmar no Plano Mestre e na decisão formal mais recente de Jose qual fase e escopo estão autorizados; não inferir isso deste arquivo.

## 13. O que nunca deve ser feito

- Não criar regra de negócio sem aprovação.
- Não criar banco de dados sem aprovação.
- Não criar CRUD sem aprovação.
- Não criar autenticação/admin sem aprovação.
- Não expor dados privados de representantes ou revendas.
- Não publicar coordenadas privadas de pessoa física.
- Não salvar segredos no repositório.
- Não abrir arquivos de recovery codes, `.env`, tokens, credenciais, chaves, senhas ou connection strings.
- Não alterar radicalmente o design aprovado sem consultar o Jose.

## 14. Segurança

Dados de representantes e revendas exigem cuidado. A arquitetura futura deve separar dados públicos e privados e usar seleção explícita de campos nas consultas públicas.

Direção obrigatória:

- site público consulta apenas dados públicos;
- admin protegido por autenticação e RBAC;
- coordenadas de representantes pessoa física devem ser aproximadas;
- uploads devem ser validados;
- logs não devem conter dados sensíveis.
