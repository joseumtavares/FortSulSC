# Proposta técnica — Fase 5: limite defensivo em `GET /api/public/partners`

**Documento preparado por:** Claude
**Data:** 14/09/2026
**Status:** proposta técnica (etapa 1 do fluxo de aprovação, `PLANO_MESTRE_FORTSULSC.md` Parte I, seção 4). Nenhum código de produção foi alterado para produzir este documento — apenas leitura do repositório.

---

## 0. Contexto

Segundo item do checklist de fechamento da Fase 5 levantado por Jose (o primeiro, cache, já tem proposta aprovada em `docs/Proposta_Fase5_Cache_Partners_Publicos.md`, implementada numa worktree separada). Esta proposta trata só do limite defensivo/paginação — independente da anterior (worktrees diferentes; quem for mesclado primeiro, a outra rebasa).

## 1. Estado atual (verificado nesta data)

`listPublicPartners()` (`src/lib/content/partner-public-repository.ts`) não recebe nenhum parâmetro e não tem `take`/limite algum — retorna **todos** os parceiros com `active: true`, sem teto. `GET /api/public/partners` (`src/app/api/public/partners/route.ts`) também não lê nenhum parâmetro de query — não existe `?limit=`, `?city=`, `?page=` nem nada parecido. A busca por cidade no `RepresentativeMapPanel` é 100% client-side: carrega essa lista completa uma vez ao abrir o painel e filtra em memória (`useMemo`) — não existe requisição de rede por busca.

Isso muda o que "limite defensivo" significa aqui, comparado ao checklist original de Jose: como não há nenhum parâmetro aceito hoje, não existe `?limit=999999999` para rejeitar nem `city`/parâmetros desconhecidos para validar — esses pontos já estão automaticamente fora de risco, porque a rota simplesmente não lê `request.nextUrl.searchParams` em lugar nenhum. O risco real é outro: **nada impede a consulta de crescer sem limite conforme o catálogo de parceiros aumenta**, o que também infla o payload que o navegador baixa de uma vez (a busca por cidade depende de ter a lista inteira no cliente).

Hoje existe 1 parceiro real em produção — o risco é preventivo, não um problema observado agora.

## 2. Desenho proposto

**Teto rígido no servidor, sem paginação nova.**

```ts
// src/lib/content/partner-public-repository.ts
const MAX_PUBLIC_PARTNERS = 500

async function fetchPublicPartners(): Promise<PublicPartner[]> {
  const partners = await prisma.partner.findMany({
    where: { active: true },
    take: MAX_PUBLIC_PARTNERS,
    orderBy: { name: 'asc' },
    select: { /* inalterado */ },
  })

  if (partners.length === MAX_PUBLIC_PARTNERS) {
    logger.error('public.partners_list_truncated', { limit: MAX_PUBLIC_PARTNERS })
  }
  // ...resto inalterado
}
```

**Por que um teto fixo, sem paginação de verdade (decisão que preciso que você confirme):**

Implementar paginação real (`?page=`/cursor + resposta parcial) exigiria também reescrever a busca por cidade do `RepresentativeMapPanel`, porque ela depende de ter a lista completa no navegador para filtrar instantaneamente enquanto o usuário digita — com paginação, a busca teria que virar uma consulta ao servidor por termo (voltando ao debounce que descartamos na proposta do cache, por não existir hoje). É uma mudança de UX e de arquitetura bem maior do que "limite defensivo", e não se justifica com 1 parceiro real — voltar a isso quando o catálogo real se aproximar de uma centena de parceiros é mais barato do que construir agora, sem uso real para validar o design.

O teto (`take: 500`) é só uma rede de segurança: nunca deveria ser atingido no uso real esperado (uma rede de representantes regionais), mas impede que a resposta cresça sem limite se, por exemplo, um import em lote de dados algum dia inserir volume inesperado. Se o teto for atingido de verdade, o log (`public.partners_list_truncated`) avisa — sinal de que é hora de desenhar paginação/busca server-side de verdade, não de aumentar o número.

**Nada muda na rota** (`route.ts`) — ela não lê parâmetro nenhum hoje e continua não lendo; o teto fica só na consulta ao banco.

## 3. O que preciso que você confirme

1. **Valor do teto**: proponho `500` (bem acima de qualquer cenário realista de representantes regionais, mas baixo o bastante para nunca gerar um payload problemático). Confirma, ou prefere outro número?
2. **Sem paginação/busca server-side agora** (conforme justificativa acima) — de acordo, ou prefere que eu já desenhe isso, mesmo sem necessidade real hoje?

## 4. Testes previstos

`partner-public-repository.test.ts` ganha um caso novo: com mais registros do que o teto retornados pelo mock do Prisma, `findMany` é chamado com `take: 500`, e — separadamente — um teste confirmando que ao bater exatamente no teto o log de aviso é emitido (mock do `logger`, já usado em outros testes do repositório de artigos/produtos). Nenhuma mudança em `route.ts`/seus testes.

## 5. Fluxo depois da aprovação

Implementação na worktree isolada `.claude/worktrees/public-partners-limit` (branch `worktree-public-partners-limit`), smoke tests (`lint`, `typecheck`, `npm run test:unit`), sem commit/merge/push — fica com Jose, depois do teste manual dele.

---

**Aguardando aprovação explícita de Jose** sobre o valor do teto e a decisão de não construir paginação/busca server-side agora.
