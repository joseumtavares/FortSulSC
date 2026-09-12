import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const PREFIX = 'testfase4parceiros'

describe('Fase 4 — CRUD administrativo de representantes/revendas e regiões', () => {
  beforeAll(() => prisma.$connect())
  afterAll(async () => {
    await prisma.partnerCommercialArea.deleteMany({ where: { partner: { name: { startsWith: PREFIX } } } })
    await prisma.partnerPrivate.deleteMany({ where: { partner: { name: { startsWith: PREFIX } } } })
    await prisma.partner.deleteMany({ where: { name: { startsWith: PREFIX } } })
    await prisma.commercialAreaMunicipality.deleteMany({ where: { commercialArea: { slug: { startsWith: PREFIX } } } })
    await prisma.commercialArea.deleteMany({ where: { slug: { startsWith: PREFIX } } })
    await prisma.$disconnect()
  })

  it('semeou a geografia oficial da Região Sul (3 estados, ~1.191 municípios)', async () => {
    const region = await prisma.region.findUnique({ where: { ibgeCode: '4' } })
    expect(region?.name).toBe('Sul')

    const states = await prisma.state.findMany({ where: { uf: { in: ['PR', 'SC', 'RS'] } } })
    expect(states).toHaveLength(3)
    expect(states.every((state) => state.regionId === region?.id)).toBe(true)

    const municipalityCount = await prisma.municipality.count({ where: { stateId: { in: states.map((state) => state.id) } } })
    expect(municipalityCount).toBeGreaterThan(1000)
  })

  it('cria área comercial, vincula municípios reais e depois desvincula sem apagar o município', async () => {
    const municipalities = await prisma.municipality.findMany({ where: { state: { uf: 'SC' } }, take: 2 })
    expect(municipalities.length).toBe(2)

    const area = await prisma.commercialArea.create({
      data: { name: `${PREFIX} Grande Área`, slug: `${PREFIX}-area`, municipalities: { create: municipalities.map((m) => ({ municipalityId: m.id })) } },
      include: { municipalities: true },
    })
    expect(area.municipalities).toHaveLength(2)

    await prisma.commercialAreaMunicipality.deleteMany({ where: { commercialAreaId: area.id } })
    const stillExists = await prisma.municipality.findUnique({ where: { id: municipalities[0].id } })
    expect(stillExists).not.toBeNull()
  })

  it('cria parceiro com dados privados e área comercial, e apaga tudo em cascata', async () => {
    const area = await prisma.commercialArea.create({ data: { name: `${PREFIX} Área Cascade`, slug: `${PREFIX}-area-cascade` } })
    const partner = await prisma.partner.create({
      data: {
        type: 'REPRESENTATIVE',
        name: `${PREFIX} Representante`,
        whatsapp: '5548999990000',
        commercialAreas: { create: [{ commercialAreaId: area.id }] },
        private: { create: { consentGivenAt: new Date(), document: '123' } },
      },
    })

    await prisma.partner.delete({ where: { id: partner.id } })

    expect(await prisma.partnerPrivate.count({ where: { partnerId: partner.id } })).toBe(0)
    expect(await prisma.partnerCommercialArea.count({ where: { partnerId: partner.id } })).toBe(0)
    expect(await prisma.commercialArea.findUnique({ where: { id: area.id } })).not.toBeNull()

    await prisma.commercialArea.delete({ where: { id: area.id } })
  })

  it('restringe apagar área comercial ainda vinculada a um parceiro', async () => {
    const area = await prisma.commercialArea.create({ data: { name: `${PREFIX} Área Restrita`, slug: `${PREFIX}-area-restrita` } })
    await prisma.partner.create({
      data: { type: 'RESELLER', name: `${PREFIX} Revenda Restrita`, whatsapp: '5548999990001', commercialAreas: { create: [{ commercialAreaId: area.id }] } },
    })

    await expect(prisma.commercialArea.delete({ where: { id: area.id } })).rejects.toThrow()
  })
})
