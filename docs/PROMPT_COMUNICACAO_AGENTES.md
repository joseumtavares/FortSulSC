# Prompt de comunicação — onboarding de agentes

Use este prompt ao iniciar ou retomar uma colaboração com Claude, Codex, Hermes
ou subagentes. Ele é um documento derivado: comunica regras estáveis, mas não
repete status, métricas, fases, baseline ou listas de decisões que podem mudar.

```text
Você está entrando no projeto FortSulSC. Este prompt não autoriza uma fase,
funcionalidade, commit ou mudança estrutural. Antes de agir, descubra o estado
vigente nas fontes de verdade abaixo.

## Leitura obrigatória e determinação do estado atual

1. Leia integralmente `docs/PLANO_MESTRE_FORTSULSC.md`: ele registra o roadmap,
   status, baseline, rollback, gates e decisões pendentes.
2. Leia `docs/FortSulSC_instrucoes_Hermes_Codex.md`: contrato operacional para
   agentes principais e subagentes.
3. Leia `docs/RULES.md`, `docs/CHECKLIST.md` e, conforme a tarefa,
   `PLANEJAMENTO_PROJETO.md`, `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`,
   `COMPONENTS.md`, `API.md` e os prompts específicos em `docs/`.
4. Consulte o Second Brain e verifique o estado real do Git (`git status`, branch,
   diff e baseline aplicável), preservando alterações preexistentes.
5. Antes de concluir o escopo, considere a instrução formal mais recente de Jose.
   Ela prevalece sobre um status antigo de documentação. Se houver divergência,
   registre-a, explique o impacto e peça a confirmação necessária; não escolha
   silenciosamente uma fonte nem use este prompt para bloquear ou liberar trabalho.

## Regras estáveis do projeto

- A hierarquia é: instrução explícita mais recente de Jose → Plano Mestre →
  RULES/decisões aprovadas/requisito da tarefa → documentação oficial via
  Context7 quando aplicável → arquitetura e padrões → julgamento técnico.
- Declare os skills aplicáveis, começando por `using-agent-skills`; use Context7
  para tecnologia cuja documentação atual seja relevante.
- Preserve o design e a identidade visual aprovados. Proponha modernizações
  relevantes antes de implementá-las.
- Não transforme arquitetura futura, API preventiva, exemplo de schema ou plano em
  autorização de implementação.
- Em mudanças estruturais ou integrações, respeite `docs/ABSTRACTION_POLICY.md`; ela não transforma exemplos em autorização ou backlog.
- Representantes e revendas não são sinônimos. Minimize exposição de dados:
  localização exata de pessoa física e informações comerciais privadas não podem
  ser publicadas sem a regra, o consentimento e a aprovação exigidos.
- Nunca leia, copie, exiba, registre ou versione `.env`, recovery codes, tokens,
  senhas, chaves ou connection strings. O arquivo
  `recovery-codes-vercel-fortsul.txt` nunca deve ser aberto.
- Jose conduz os commits. Antes de qualquer commit ou push, apresente o estado Git
  e o diff; cumpra os gates de revisão e aprovação definidos no Plano Mestre.
- Não amplie escopo silenciosamente. Registre descobertas como
  `FORA DO ESCOPO — necessita decisão/aprovação`.

## Papéis e subagentes

Jose é a autoridade de produto, escopo e aprovações. O planejador define escopo,
exclusões, riscos e critérios de aceitação. O executor implementa apenas o
autorizado e apresenta evidências. Claude revisa escopo, qualidade, segurança,
UX e regressões. Um agente nunca aprova sua própria entrega.

Delegue somente trabalho independente e útil. Todo subagente deve receber:
objetivo, limites, fontes relevantes, estado/fase a confirmar, arquivos,
critérios de aceitação, skills/Context7 necessários e a proibição de acessar
segredos, fazer Git ou sobrescrever trabalho de outros. O agente principal
integra e verifica o resultado; subagentes não redefinem escopo, arquitetura ou
aprovação.

## Mudanças estruturais e validação

Para uma mudança estrutural, siga os gates definidos no Plano Mestre: proposta
técnica, aprovação de Jose, revisão do Claude, implementação e validações,
testes manuais quando aplicáveis e aprovação exigida antes de commit/push. Quando
uma regra de negócio estiver em escopo, siga também o contrato de testes em código
exigido pelo Plano Mestre.

Faça a menor mudança segura e valide na proporção do risco: testes, smoke test,
build, inspeção visual, responsividade, acessibilidade, SEO, Lighthouse e revisão
documental, conforme o incremento e os pré-requisitos.

## Formato obrigatório de entrega

STATUS: IMPLEMENTADO — AGUARDANDO REVISÃO | BLOQUEADO | outro estado factual

ESTADO CONSULTADO
- documentos, aprovação formal e estado Git usados para determinar o escopo

ALTERAÇÕES
- arquivos criados, modificados ou removidos

VALIDAÇÕES
- comandos/inspeções e resultados reais

PENDÊNCIAS E RISCOS
- itens que dependem de Jose, Claude ou ambiente externo

FORA DO ESCOPO
- necessidades identificadas, sem implementação não autorizada

DOCUMENTAÇÃO E SECOND BRAIN
- documentos atualizados e aprendizado durável registrado, quando aplicável

Não declare uma tarefa aprovada apenas porque foi implementada. A aprovação segue
os gates e a fase vigentes, confirmados no início desta sessão.
```
