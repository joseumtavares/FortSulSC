import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Fase 3 — Fatia 4.4: Article + AuditLog', () => {
  let authorId: string

  beforeAll(async () => {
    await prisma.$connect()
    const author = await prisma.adminUser.create({
      data: {
        email: 'teste-4-4@fortsulsc.test',
        name: 'Teste Autor',
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

  it('exige slug único para artigos', async () => {
    await prisma.article.create({
      data: { slug: 'test-artigo-uniq', title: 'A', body: 'B', authorId },
    })

    await expect(
      prisma.article.create({
        data: { slug: 'test-artigo-uniq', title: 'C', body: 'D', authorId },
      }),
    ).rejects.toThrow()
  })

  it('cria artigos como DRAFT sem data de publicação', async () => {
    const article = await prisma.article.create({
      data: { slug: 'test-artigo-draft', title: 'A', body: 'B', authorId },
    })

    expect(article.status).toBe('DRAFT')
    expect(article.publishedAt).toBeNull()
  })

  it('restringe a exclusão do autor de um artigo', async () => {
    const author = await prisma.adminUser.create({
      data: {
        email: 'teste-4-4-restrict@fortsulsc.test',
        name: 'Teste Restrict',
        passwordHash: 'x',
        role: 'EDITOR',
      },
    })
    await prisma.article.create({
      data: { slug: 'test-artigo-restrict', title: 'A', body: 'B', authorId: author.id },
    })

    await expect(prisma.adminUser.delete({ where: { id: author.id } })).rejects.toThrow()

    await prisma.article.deleteMany({ where: { authorId: author.id } })
    await prisma.adminUser.delete({ where: { id: author.id } })
  })

  it('aceita evento de auditoria sem ator identificável', async () => {
    const event = await prisma.auditLog.create({
      data: {
        adminUserId: null,
        action: 'CREATE',
        entityType: 'ARTICLE',
        entityId: null,
        result: 'SUCCESS',
      },
    })

    expect(event.adminUserId).toBeNull()
    await prisma.auditLog.delete({ where: { id: event.id } })
  })

  it('preserva o evento de auditoria ao excluir seu ator', async () => {
    const author = await prisma.adminUser.create({
      data: {
        email: 'teste-4-4-set-null@fortsulsc.test',
        name: 'Teste SetNull',
        passwordHash: 'x',
        role: 'EDITOR',
      },
    })
    const event = await prisma.auditLog.create({
      data: {
        adminUserId: author.id,
        action: 'CREATE',
        entityType: 'ADMIN_USER',
        entityId: author.id,
        result: 'SUCCESS',
      },
    })

    await prisma.adminUser.delete({ where: { id: author.id } })

    const reloaded = await prisma.auditLog.findUniqueOrThrow({ where: { id: event.id } })
    expect(reloaded.adminUserId).toBeNull()
    await prisma.auditLog.delete({ where: { id: event.id } })
  })

  it('rejeita ações que não pertencem ao enum fechado', async () => {
    await expect(
      prisma.auditLog.create({
        data: { action: 'INVALID' as never, entityType: 'ARTICLE', result: 'SUCCESS' },
      }),
    ).rejects.toThrow()
  })

  it('consulta eventos pelo par entityType e entityId', async () => {
    const article = await prisma.article.create({
      data: { slug: 'test-artigo-audit', title: 'A', body: 'B', authorId },
    })
    await prisma.auditLog.createMany({
      data: [
        {
          adminUserId: authorId,
          action: 'CREATE',
          entityType: 'ARTICLE',
          entityId: article.id,
          result: 'SUCCESS',
        },
        {
          adminUserId: authorId,
          action: 'PUBLISH',
          entityType: 'ARTICLE',
          entityId: article.id,
          result: 'SUCCESS',
        },
      ],
    })

    const events = await prisma.auditLog.findMany({
      where: { entityType: 'ARTICLE', entityId: article.id },
    })
    expect(events).toHaveLength(2)
  })
})
