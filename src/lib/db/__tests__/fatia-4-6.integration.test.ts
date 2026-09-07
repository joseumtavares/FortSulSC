import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const runId = Date.now().toString()

describe('Fase 3 — Fatia 4.6: imagem de capa de Article + retenção de AuditLog', () => {
  let authorId: string

  beforeAll(async () => {
    await prisma.$connect()

    const author = await prisma.adminUser.create({
      data: {
        email: `teste-4-6-${runId}@fortsulsc.test`,
        name: 'Teste Autor 4.6',
        passwordHash: 'x',
        role: 'EDITOR',
      },
    })

    authorId = author.id
  })

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { adminUserId: authorId } })
    await prisma.article.deleteMany({ where: { authorId } })
    await prisma.adminUser.delete({ where: { id: authorId } })
    await prisma.$disconnect()
  })

  it('artigo nasce sem imagem de capa', async () => {
    const article = await prisma.article.create({
      data: {
        slug: `teste-4-6-sem-capa-${runId}`,
        title: 'Artigo sem capa',
        body: 'Corpo',
        authorId,
      },
    })

    expect(article.coverImageUrl).toBeNull()
    expect(article.coverImageAlt).toBeNull()
  })

  it('aceita os campos de imagem de capa preenchidos', async () => {
    const article = await prisma.article.create({
      data: {
        slug: `teste-4-6-com-capa-${runId}`,
        title: 'Artigo com capa',
        body: 'Corpo',
        authorId,
        coverImageUrl: 'https://example.test/capa.jpg',
        coverImageKey: 'articles/capa.jpg',
        coverImageMime: 'image/jpeg',
        coverImageSize: 4096,
        coverImageAlt: 'Descrição da capa',
      },
    })

    expect(article.coverImageSize).toBe(4096)
    expect(article.coverImageAlt).toBe('Descrição da capa')
  })

  it('bloqueia publicar artigo sem capa no banco', async () => {
    const article = await prisma.article.create({
      data: {
        slug: `teste-4-6-publicar-sem-capa-${runId}`,
        title: 'Artigo para publicar sem capa',
        body: 'Corpo',
        authorId,
      },
    })

    await expect(
      prisma.article.update({
        where: { id: article.id },
        data: { status: 'PUBLISHED' },
      }),
    ).rejects.toThrow()
  })

  it('remove audit log com mais de 1 ano na mesma janela de retenção', async () => {
    const expiredAt = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000)
    const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

    await prisma.auditLog.create({
      data: {
        adminUserId: authorId,
        action: 'CREATE',
        entityType: 'ARTICLE',
        entityId: null,
        result: 'SUCCESS',
        createdAt: expiredAt,
      },
    })

    const removed = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })

    expect(removed.count).toBe(1)
  })
})
