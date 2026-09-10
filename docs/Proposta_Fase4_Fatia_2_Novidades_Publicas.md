# Proposta técnica — "Novidades e dicas" pública consumindo artigos reais

## Contexto

A seção pública "Novidades e dicas" (`src/components/sections/ContentSection.tsx`,
aprovada na Fatia 3.7 da Fase 3) hoje mostra 3 cards de conteúdo fixo/teste
(`src/components/content/content-data.ts`, marcado no código como "TESTE —
substituir antes do lançamento"). O Plano Mestre já registrava essa
substituição como pendência aberta, não bloqueante.

Durante o teste manual da Fatia 2 (CRUD de artigos), Jose pediu que essa
substituição aconteça agora: a seção passa a mostrar os artigos reais
publicados no painel administrativo, com o mesmo padrão visual e rolagem
automática já construídos nesta sessão (`ContentCarousel`,
`ContentArticleDialog`), usando a capa do artigo no card e abrindo um popup
com o texto completo e a galeria de imagens ao clicar.

**Isto é a primeira vez que o site público consulta o Prisma/Postgres
diretamente** — até agora só o painel administrativo (`/admin/**`) acessava o
banco. Por isso, além da aprovação de produto já dada por Jose, esta proposta
cobre a decisão de arquitetura (renderização/atualização) que faltava.

## Decisões confirmadas por Jose

- Substituir os 3 cards fixos pelos artigos reais com `status: PUBLISHED`.
- Manter o padrão visual e a rolagem automática já implementados.
- Capa do artigo aparece no card; clique abre popup com texto completo e
  galeria de imagens adicionais rotacionando no rodapé.
- Atualização da home ao publicar/despublicar: **revalidação sob demanda**
  (`revalidatePath`) — a home continua estática/rápida, e passa a atualizar
  em segundos após publicar ou despublicar um artigo, sem consultar o banco
  a cada visita.
- Implementação na mesma worktree/branch (`claude-articles-crud`) do CRUD de
  artigos, junto com o restante do trabalho desta sessão.

## Escopo técnico

### Consulta pública (seleção explícita de campos, `CLAUDE.md` §14)

Nova função em `src/lib/content/article-repository.ts`:

```ts
export function listPublishedArticlesPublic() {
  return prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      coverImageAlt: true,
      images: {
        orderBy: { order: 'asc' },
        select: { imageUrl: true, altText: true },
      },
    },
  })
}
```

Nunca seleciona `authorId`, `imageKey`, `mimeType`, `size` ou qualquer campo
interno — mesmo padrão já usado em `findArticleBySlugPublic` (existente desde
a Fatia 4.6).

### Renderização e atualização

- `ContentSection` passa a ser assíncrona (`async function`), chamando
  `listPublishedArticlesPublic()` e mapeando o resultado para o formato hoje
  usado por `ContentCardData` (título, resumo, corpo, capa, galeria).
- Nenhuma configuração especial de `revalidate`/`dynamic` na home: o
  comportamento padrão do Next.js (cache estático) é mantido, e a atualização
  acontece via `revalidatePath('/')` chamado dentro das rotas já existentes
  `POST /api/admin/articles/[id]/publish` e `.../unpublish`, logo após o
  sucesso da mutação.
- **Estado vazio**: se não houver nenhum artigo publicado, a seção continua
  visível com um texto simples ("Em breve, novidades e dicas por aqui.") no
  lugar do carrossel, em vez de esconder a seção inteira ou quebrar — decisão
  conservadora minha, documentada aqui; ajusto se Jose preferir outro texto
  ou comportamento.

### Fora de escopo

- Página pública de artigo individual (`/novidades-e-dicas/[slug]`, rota de
  detalhe própria) — o popup já cobre a necessidade de mostrar o artigo
  completo por enquanto; uma URL própria por artigo fica para uma fatia
  futura, se for pedida.
- Paginação/limite de artigos no carrossel (todos os publicados entram).

## Testes previstos

- Repositório: seleção de campos, filtro por status, ordenação.
- `ContentSection`: renderização com artigos reais (mock do repositório),
  estado vazio.
- Rotas `publish`/`unpublish`: `revalidatePath('/')` chamado após sucesso.
