# Proposta técnica — Galeria de imagens do artigo (extensão da Fatia 2, Fase 4)

## Contexto e decisão revertida

A Fatia 4.6 (`docs/Proposta_Tarefa_4_Fatia_4_6.md`) registrou: "Confirmado: só
imagem de capa agora, sem galeria". Durante o teste manual da Fatia 2 do
painel administrativo (CRUD de artigos), Jose pediu a reversão desse "por
enquanto": artigos de "Novidades e dicas" precisam de uma galeria de imagens
adicionais, além da capa, para ilustrar conteúdos com múltiplas fotos (ex.:
tutoriais). Jose escolheu explicitamente a opção "galeria ao final do
artigo" (alternativa a inserção de imagem via marcador no meio do texto, que
ele rejeitou por exigir parsing de marcador no corpo — regra de negócio
adicional desnecessária).

## Decisões confirmadas por Jose

- Exclusão de uma imagem individual da galeria: **sempre permitida**, mesmo
  com o artigo publicado. Não se confunde com a regra "sem exclusão" de
  artigo (aquela é sobre o ciclo de vida do artigo inteiro — publicar/
  despublicar para reuso; esta é edição pontual de conteúdo).
- Limite: **até 4 imagens por artigo** (ajustado por Jose na aprovação; a
  proposta original sugeria 10).
- Ordem de exibição: **ordem de envio** (sem reordenação manual/drag-and-drop
  nesta fatia).

## Escopo técnico

### Schema (Prisma) — nova migration

```prisma
model ArticleImage {
  id        String   @id @default(uuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  url       String
  alt       String
  order     Int
  createdAt DateTime @default(now())

  @@index([articleId, order])
}
```

`Article` ganha `images ArticleImage[]`.

### Rotas (reaproveitando padrões já aprovados)

- `POST /api/admin/articles/[id]/images` — multipart (`file` + `alt`),
  mesmas validações já usadas na capa (JPEG/PNG/WEBP, até 5 MB, `alt`
  obrigatório e não vazio), mesma abstração `ImageStorage` (local/r2) da
  Fatia 4.7, guard `requireAdminRequest`. Rejeita com 400 se o artigo já tem
  4 imagens. `order` = posição seguinte (contagem atual).
- `DELETE /api/admin/articles/[id]/images/[imageId]` — remove a imagem (e o
  objeto armazenado, mesmo padrão de exclusão do arquivo antigo já usado na
  troca de capa da Fatia 4.7), mesmo guard.
- Ambas as mutações registram `AuditLog` como `UPDATE` do artigo (mesma
  categoria já usada para edição de texto), sem novo `AuditAction`.

### UI (painel)

Novo componente cliente `ArticleGallery`, na tela `/admin/articles/[id]`,
abaixo do grid atual (`ArticleTextForm` + `ArticleCoverUploadForm`): lista de
miniaturas com alt e botão remover, mais um formulário para adicionar nova
imagem (arquivo + alt), desabilitado ao atingir 4 imagens.

### Fora de escopo (não incluído nesta extensão)

- Página pública do artigo (a galeria não tem consumidor público ainda —
  quando essa página for construída, a consulta pública deve selecionar
  explicitamente os campos de `ArticleImage`, por `CLAUDE.md` §14, e nunca
  expor imagens de artigo não publicado).
- Reordenação manual (drag-and-drop).
- Edição do `alt` de uma imagem já enviada (remover e reenviar cobre o caso).

## Testes previstos

Testes unitários de repositório (criação/limite/remoção) e de rota (guard,
validação de arquivo, limite de 10, 404 de artigo/imagem inexistente,
auditoria), seguindo o mesmo padrão de cobertura já usado no restante da
Fatia 2.
