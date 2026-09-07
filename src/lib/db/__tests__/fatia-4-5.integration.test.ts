import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Fase 3 — Fatia 4.5: Banner + InstitutionalSettings', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.banner.deleteMany({ where: { title: { startsWith: 'Teste ' } } })
    await prisma.$disconnect()
  })

  it('banner nasce inativo por padrão', async () => {
    const banner = await prisma.banner.create({
      data: {
        title: 'Teste banner draft',
        imageUrl: 'https://example.test/x.jpg',
        imageKey: 'banners/x.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        altText: 'Banner de teste',
      },
    })

    expect(banner.active).toBe(false)
    await prisma.banner.delete({ where: { id: banner.id } })
  })

  it('aceita janela de agendamento com início e fim', async () => {
    const start = new Date('2026-10-01T00:00:00Z')
    const end = new Date('2026-10-31T23:59:59Z')
    const banner = await prisma.banner.create({
      data: {
        title: 'Teste banner agendado',
        imageUrl: 'https://example.test/y.jpg',
        imageKey: 'banners/y.jpg',
        mimeType: 'image/jpeg',
        size: 2048,
        altText: 'Banner de teste agendado',
        startAt: start,
        endAt: end,
      },
    })

    expect(banner.startAt).toEqual(start)
    expect(banner.endAt).toEqual(end)
    await prisma.banner.delete({ where: { id: banner.id } })
  })

  it('institutional settings aceita apenas uma linha (singleton_key = 1)', async () => {
    await prisma.institutionalSettings.upsert({
      where: { singletonKey: 1 },
      update: { whatsapp: '48999990000', email: 'contato@fortsulsc.com.br' },
      create: { whatsapp: '48999990000', email: 'contato@fortsulsc.com.br' },
    })

    await expect(
      prisma.$executeRawUnsafe(
        `INSERT INTO institutional_settings (id, singleton_key, whatsapp, email) VALUES (gen_random_uuid(), 2, '48999990000', 'outro@fortsulsc.com.br')`,
      ),
    ).rejects.toThrow()
  })

  it('upsert de institutional settings é idempotente', async () => {
    const first = await prisma.institutionalSettings.upsert({
      where: { singletonKey: 1 },
      update: { phone: '4836600818' },
      create: { whatsapp: '48999990000', email: 'contato@fortsulsc.com.br', phone: '4836600818' },
    })
    const second = await prisma.institutionalSettings.upsert({
      where: { singletonKey: 1 },
      update: { phone: '4836600819' },
      create: { whatsapp: '48999990000', email: 'contato@fortsulsc.com.br', phone: '4836600819' },
    })

    expect(first.id).toBe(second.id)
    expect(second.phone).toBe('4836600819')
  })

  it('audit log aceita entityType BANNER', async () => {
    const log = await prisma.auditLog.create({
      data: { adminUserId: null, action: 'CREATE', entityType: 'BANNER', entityId: null, result: 'SUCCESS' },
    })

    expect(log.entityType).toBe('BANNER')
    await prisma.auditLog.delete({ where: { id: log.id } })
  })
})
