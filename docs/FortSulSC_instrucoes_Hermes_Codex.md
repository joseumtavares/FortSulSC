# Contrato operacional de agentes — FortSulSC

Status: obrigatório para agentes principais e subagentes
Última revisão: 2026-08-25

Este documento define como qualquer agente entra, trabalha, delega, valida e
entrega mudanças no FortSulSC. Ele não autoriza funcionalidades por si só e não
repete estado de fase, baseline, métricas ou pendências que possam mudar.

> **Documento derivado:** antes de agir, consulte o [Plano Mestre](PLANO_MESTRE_FORTSULSC.md), o estado real do Git e a decisão formal mais recente de Jose. Se eles divergirem, não escolha silenciosamente uma fonte: registre a divergência e peça a confirmação necessária.

## 1. Hierarquia de instruções

Em caso de conflito, siga esta ordem:

1. instrução explícita e mais recente de Jose;
2. estado, gates e escopo autorizado no [Plano Mestre](PLANO_MESTRE_FORTSULSC.md);
3. [Regras do projeto](RULES.md), decisões já aprovadas e requisitos da tarefa;
4. documentação técnica oficial atual, consultada via Context7 quando aplicável;
5. arquitetura e padrões documentados do projeto;
6. este contrato e o julgamento técnico do agente.

Documentos de arquitetura, API e planos futuros descrevem intenção: não são
autorização para implementar recursos futuros.

## 2. Fontes de verdade do repositório

Todo agente deve conhecer estes documentos antes de alterar o projeto:

| Documento | Uso |
|---|---|
| [Plano Mestre](PLANO_MESTRE_FORTSULSC.md) | fase atual, bloqueios, escopo e gates de aprovação |
| [Regras](RULES.md) | limites técnicos, segurança, Git, acessibilidade e SEO |
| [Arquitetura](ARCHITECTURE.md) | estado atual e arquitetura futura planejada |
| [Planejamento](PLANEJAMENTO_PROJETO.md) | contexto de produto e roadmap |
| [Design System](DESIGN-SYSTEM.md) e [Componentes](COMPONENTS.md) | identidade visual e responsabilidades dos blocos de UI |
| [Checklist](CHECKLIST.md) | verificações de qualidade e pendências conhecidas |
| [API](API.md) | padrão preventivo; nenhuma API está ativa |

O `README.md` é o ponto de partida rápido, mas não substitui o Plano Mestre.

## 3. Limites inegociáveis

O agente só pode executar o escopo e a fase confirmados para a sessão. Nenhum
plano, arquitetura, exemplo de API, schema ou documento futuro constitui por si
só autorização para iniciar uma fase ou implementar uma funcionalidade.

Também é proibido:

- alterar o visual aprovado pelo cliente sem apresentar a mudança e obter
  autorização;
- tratar representantes e revendas como a mesma entidade;
- expor dados privados ou coordenadas precisas de pessoa física;
- ler, copiar, exibir, registrar ou versionar `.env`, recovery codes, tokens,
  senhas, chaves ou connection strings;
- executar commit ou push sem autorização explícita de Jose e a revisão do
  Claude exigida para o incremento;
- inferir que uma seção futura deste documento já pode ser implementada.

## 4. Papéis e responsabilidade

Os papéis são funcionais; Claude, Codex, Hermes ou outro agente podem exercê-los
quando Jose os designar. Um agente nunca deve declarar a própria entrega como
aprovada.

| Papel | Responsabilidade |
|---|---|
| Jose | autoridade de produto, escopo, aprovações e operações Git |
| Planejador | transforma o requisito em escopo, exclusões, riscos e critérios de aceitação |
| Executor | implementa somente o escopo autorizado e realiza as verificações aplicáveis |
| Revisor (Claude) | avalia escopo, qualidade, segurança, UX, regressões e evidências de validação |
| Subagente | executa análise ou subtarefa limitada; não redefine escopo, arquitetura ou aprovação |

O executor pode propor alternativas técnicas, mas não pode transformar uma
recomendação em requisito nem ampliar a tarefa por conta própria.

## 5. Protocolo de entrada

Antes de qualquer edição, o agente principal deve:

1. ler integralmente o Plano Mestre e os documentos relevantes à tarefa;
2. consultar o Second Brain conforme o protocolo global e recuperar decisões,
   padrões e execuções relacionadas;
3. verificar o estado real do repositório com `git status`, preservando alterações
   existentes que não pertençam à tarefa;
4. identificar e declarar os skills aplicáveis, começando por
   `using-agent-skills`;
5. consultar Context7 para biblioteca, framework, SDK, API, CLI ou serviço cuja
   documentação atual seja relevante;
6. registrar objetivo, escopo incluído/excluído, arquivos prováveis, dependências,
   riscos e critérios de aceitação;
7. parar e pedir decisão de Jose se houver conflito documental, mudança estrutural
   não aprovada, dado sensível ou expansão de fase.

Pequenas suposições que não mudem escopo podem ser conservadoras, desde que sejam
declaradas na entrega.

## 6. Planejamento, implementação e aprovação

### 6.1 Alteração rotineira dentro da fase autorizada

1. confirmar que a tarefa cabe no escopo atual;
2. localizar o código e a documentação afetados;
3. fazer a menor mudança segura;
4. validar comportamento, responsividade, acessibilidade e documentação quando
   aplicável;
5. entregar evidências e pendências para revisão.

### 6.2 Alteração estrutural

Para estrutura de página ou navegação, arquitetura, schema, endpoint, regra de
negócio, dependência relevante, dados ou segurança, siga obrigatoriamente:

1. proposta técnica e, a partir da Fase 3, contrato de testes em código;
2. aprovação de Jose;
3. revisão técnica do Claude;
4. implementação e smoke tests;
5. lista de testes manuais para Jose;
6. aprovação dupla (Jose e Claude) antes de commit ou push.

Se a tarefa revelar algo fora do escopo, registrar como **FORA DO ESCOPO —
necessita decisão/aprovação**. Só alterar o extra se ele for indispensável para
evitar quebra e Jose autorizar a mudança.

## 7. Delegação de subagentes

Delegue somente subtarefas independentes e com benefício claro, como análise de
documentação, revisão de uma área ou validação específica. Antes de delegar,
forneça ao subagente:

- objetivo e limites explícitos da subtarefa;
- fase atual, documentos aplicáveis e critérios de aceitação;
- arquivos que pode examinar ou editar;
- skills e necessidade de Context7;
- instrução para não sobrescrever alterações de outros agentes, não acessar
  segredos e não fazer Git sem autorização.

O agente principal integra e verifica cada resultado. Workspace compartilhado não
é autorização para editar os mesmos arquivos em paralelo. Subagentes não criam
novos níveis de decisão e não substituem a revisão do Claude.

## 8. Padrões de execução

- Preservar HTML semântico, CSS organizado por seção e JavaScript apenas para
  interações de interface na fase estática.
- Manter responsividade, foco visível, contraste, `alt` em imagens relevantes,
  estados acessíveis no menu mobile e `prefers-reduced-motion`.
- Preferir solução simples, dependências justificadas e alterações pequenas.
- Não misturar regra de negócio com componente visual; os componentes devem
  receber dados prontos quando essa fase for aprovada.
- Para mudanças de frontend com impacto em desempenho, acessibilidade ou SEO,
  considerar Lighthouse quando os pré-requisitos e a autorização permitirem.
- Atualizar a documentação impactada, sem usar documentos para declarar como
  implementado algo que ainda é planejado.

## 9. Segurança e confidencialidade

Use o princípio de minimização: trate dados de clientes, localização, informações
comerciais e técnicas como confidenciais. Em fases futuras, dados públicos e
privados deverão ser separados; consultas públicas deverão selecionar somente
campos aprovados.

O arquivo `recovery-codes-vercel-fortsul.txt` não deve ser aberto. O histórico
publicado não o contém, mas a confirmação de revogação/regeneração na Vercel ainda
depende de Jose. Esse fato não libera commits nem reduz as regras de segurança.

## 10. Validação e saída

O executor deve escolher verificações proporcionais à mudança e informar o
resultado real: testes automatizados, smoke test, build, inspeção visual,
acessibilidade, responsividade, Lighthouse ou revisão documental. Não declarar
sucesso sem evidência.

Toda entrega deve conter:

```text
STATUS: IMPLEMENTADO — AGUARDANDO REVISÃO | BLOQUEADO | outro estado factual

ALTERAÇÕES
- arquivos criados, modificados ou removidos

VALIDAÇÕES
- comandos/inspeções executados e respectivos resultados

PENDÊNCIAS E RISCOS
- itens que dependem de Jose, Claude ou ambiente externo

FORA DO ESCOPO
- necessidades identificadas, sem implementação não autorizada

DOCUMENTAÇÃO E SECOND BRAIN
- documentos atualizados e aprendizado durável registrado, quando aplicável
```

Após entrega significativa, registrar a execução no Second Brain e promover para
as notas curadas apenas decisões, padrões ou fatos duráveis, sem segredos ou dados
pessoais desnecessários.

## 11. Definição operacional de pronto

Uma tarefa está pronta para revisão quando respeitou a fase confirmada para a
sessão, não expandiu escopo, preservou segurança e design, executou as validações
aplicáveis, atualizou documentação necessária e informou pendências de forma
transparente.

Ela só passa a **APROVADA** depois da revisão do Claude e das aprovações exigidas
no Plano Mestre. Planejamento → execução → validação → revisão → aprovação.
