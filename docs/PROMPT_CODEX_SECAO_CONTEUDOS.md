# Prompt Codex — Seção “Conteúdos e dicas”

**Status:** especificação pendente de conteúdo aprovado — não autoriza implementação por si só.
**Escopo:** Fase 1 (frontend estático), somente após aprovação de José e revisão técnica do Claude.
**Fonte de verdade de governança:** `docs/PLANO_MESTRE_FORTSULSC.md`.

## Contexto confirmado

O frontend estático atual contém hero, categorias, seção institucional, soluções,
atendimento, presença, CTA e rodapé. Não há uma seção “Conteúdos e dicas” no
`index.html`, estilos específicos em `styles.css`, navegação para blog/conteúdos
nem cards de conteúdo aprovados no repositório.

Por isso, nenhum título, texto, imagem, link, data, autor, produto ou CTA pode ser
inferido a partir de planos futuros, nomes de arquivos ou conteúdo de outras
seções. Este documento só se torna executável quando o bloco “Conteúdo aprovado”
estiver preenchido e aprovado.

## Prompt para execução

```text
Leia integralmente `docs/PLANO_MESTRE_FORTSULSC.md`,
`docs/PLANEJAMENTO_PROJETO.md`, `docs/RULES.md`, `docs/CHECKLIST.md`,
`docs/DESIGN-SYSTEM.md` e `docs/COMPONENTS.md` antes de propor qualquer alteração.

Consulte o SecondBrain, use os skills aplicáveis e confira o estado real do
repositório. Preserve todas as alterações preexistentes. Não faça commit, push,
stash, reset, restore, clean, branch, worktree ou outra operação Git sem
autorização explícita do José.

Você está autorizado somente a propor e, após a aprovação dupla (José + Claude),
implementar no frontend estático uma seção chamada “Conteúdos e dicas”, conforme
o bloco “Conteúdo aprovado” deste arquivo.

Antes de editar, confirme que todos os campos obrigatórios do bloco estão
preenchidos. Se faltar qualquer campo, pare e informe objetivamente o que falta;
não crie conteúdo substituto, links genéricos, imagens de banco, placeholders,
CMS, API, backend, banco de dados, autenticação, formulário ou regra de negócio.

Use apenas os textos, ordem, links e arquivos de imagem expressamente aprovados.
Não reutilize imagens já existentes para outro significado sem aprovação explícita.
Preserve a linguagem visual da FortSul: tokens já definidos, HTML semântico,
acessibilidade, foco visível, `prefers-reduced-motion` e os breakpoints de
1050 px, 820 px e 560 px.

Antes da implementação, apresente: (1) arquivos que serão alterados;
(2) posição da seção na home; (3) estrutura semântica proposta; (4) tratamento
de imagens, incluindo alt e responsividade; e (5) diff proposto. Aguarde a
aprovação do José e a revisão do Claude.

Após a implementação autorizada, execute `npm test`, `node --check preview.mjs`,
`node --check script.js`, `node --check test-preview.mjs` e `git diff --check`.
Abra a home e valide a seção em 1050 px, 820 px e 560 px. Entregue também uma
lista curta de testes manuais para o José. Não declare a Fase 1 concluída.
```

## Conteúdo aprovado — preenchimento obrigatório

Preencha e aprove o bloco abaixo antes de enviar o prompt ao agente executor.

### Posicionamento e título da seção

| Campo | Valor aprovado |
|---|---|
| Posição na home (entre quais seções existentes) | **Pendente** |
| `id`/âncora, se houver | **Pendente** |
| Eyebrow | **Pendente** |
| Título (`h2`) | **Pendente** |
| Texto de apoio | **Pendente** |
| CTA geral (rótulo e destino), se houver | **Pendente** |

### Cards

Defina um item por card. A ordem desta tabela é a ordem visual obrigatória.

| Ordem | Título | Resumo | Imagem (caminho local aprovado) | Alt | Destino do link | Rótulo/CTA | Categoria/data, se exibida |
|---:|---|---|---|---|---|---|---|
| 1 | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** |
| 2 | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** |
| 3 | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** | **Pendente** |

Adicione ou remova linhas somente após definir a quantidade aprovada de cards.

## Critérios de aceitação

- A seção contém exclusivamente o conteúdo preenchido e aprovado acima.
- A ordem, textos, imagens, `alt` e destinos dos links correspondem à tabela.
- Não há CMS, API, fetch, endpoint, banco, formulário ou conteúdo inventado.
- A marcação usa uma seção nomeada, um `h2` e uma estrutura de cards semântica.
- Imagens relevantes possuem `alt`; imagens decorativas usam `alt=""`.
- A seção funciona em desktop, tablet e celular nos breakpoints existentes.
- O frontend estático, links e CTAs existentes continuam funcionais.
- Não há alteração não aprovada de navegação, layout de outras seções ou dados de contato.

## Evidências exigidas na entrega

- Resultado de `npm test`.
- Resultado dos três comandos `node --check` definidos no prompt.
- Resultado de `git diff --check`.
- Lista dos arquivos efetivamente alterados.
- Capturas ou descrição objetiva da verificação em 1050 px, 820 px e 560 px.
- Lista de testes manuais para revisão visual do José.

## Decisões ainda necessárias

1. O conteúdo deste bloco será um blog, conteúdos técnicos ou outra apresentação?
2. Qual a posição exata da seção na home?
3. Quais cards, imagens e destinos são aprovados?
4. A navegação principal deve receber um link para a seção? Se sim, qual rótulo?

Enquanto qualquer uma dessas decisões estiver pendente, este arquivo é apenas uma
proposta de execução e não uma autorização para alterar o frontend.
