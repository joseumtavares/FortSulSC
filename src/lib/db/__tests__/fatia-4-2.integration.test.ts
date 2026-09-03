import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Fase 3 — Fatia 4.2: hierarquia geográfica + parceiros unificados', () => {
  let stateSequence = 0
  beforeAll(() => prisma.$connect())
  afterAll(async () => {
    await prisma.partnerCommercialArea.deleteMany({ where: { partner: { name: { startsWith: 'Teste ' } } } })
    await prisma.partnerPrivate.deleteMany({ where: { partner: { name: { startsWith: 'Teste ' } } } })
    await prisma.partner.deleteMany({ where: { name: { startsWith: 'Teste ' } } })
    await prisma.commercialAreaMunicipality.deleteMany({ where: { commercialArea: { slug: { startsWith: 'test-' } } } })
    await prisma.commercialArea.deleteMany({ where: { slug: { startsWith: 'test-' } } })
    await prisma.municipality.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.state.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.region.deleteMany({ where: { ibgeCode: { startsWith: 'test-' } } })
    await prisma.$disconnect()
  })

  async function hierarchy(suffix: string) {
    const region = await prisma.region.create({ data: { name: `Teste Região ${suffix}`, slug: `test-regiao-${suffix}`, ibgeCode: `test-region-${suffix}` } })
    stateSequence += 1
    const state = await prisma.state.create({ data: { name: `Teste Estado ${suffix}`, uf: `T${stateSequence}`, slug: `test-estado-${suffix}`, ibgeCode: `test-state-${suffix}`, regionId: region.id } })
    const municipality = await prisma.municipality.create({ data: { name: `Teste Município ${suffix}`, slug: `test-municipio-${suffix}`, ibgeCode: `test-municipality-${suffix}`, stateId: state.id } })
    return { region, state, municipality }
  }

  it('ibgeCode de região é único', async () => { await hierarchy('uniq-region'); await expect(prisma.region.create({ data: { name: 'Duplicada', slug: 'test-regiao-dup', ibgeCode: 'test-region-uniq-region' } })).rejects.toThrow() })
  it('uf e ibgeCode de estado são únicos', async () => { const { region, state } = await hierarchy('uniq-state'); await expect(prisma.state.create({ data: { name: 'Dup', uf: state.uf, slug: 'test-estado-dup', ibgeCode: 'test-state-dup', regionId: region.id } })).rejects.toThrow() })
  it('ibgeCode de município é único', async () => { const { state } = await hierarchy('uniq-mun'); await expect(prisma.municipality.create({ data: { name: 'Dup', slug: 'test-municipio-dup', ibgeCode: 'test-municipality-uniq-mun', stateId: state.id } })).rejects.toThrow() })
  it('área comercial cobre vários municípios', async () => { const a = await hierarchy('area-a'); const b = await hierarchy('area-b'); const area = await prisma.commercialArea.create({ data: { name: 'Teste Área', slug: 'test-area-multi', municipalities: { create: [{ municipalityId: a.municipality.id }, { municipalityId: b.municipality.id }] } }, include: { municipalities: true } }); expect(area.municipalities).toHaveLength(2) })
  it('representative usa o type correto', async () => { const p = await prisma.partner.create({ data: { type: 'REPRESENTATIVE', name: 'Teste Representante', whatsapp: '5511999999999' } }); expect(p.type).toBe('REPRESENTATIVE') })
  it('reseller usa o type correto', async () => { const p = await prisma.partner.create({ data: { type: 'RESELLER', name: 'Teste Revenda', whatsapp: '5511999999998' } }); expect(p.type).toBe('RESELLER') })
  it('parceiro nasce inativo', async () => { const p = await prisma.partner.create({ data: { type: 'REPRESENTATIVE', name: 'Teste Parceiro Rascunho', whatsapp: '5511999999997' } }); expect(p.active).toBe(false) })
  it('dados privados exigem consentGivenAt', async () => { const p = await prisma.partner.create({ data: { type: 'RESELLER', name: 'Teste Parceiro Consentimento', whatsapp: '5511999999996' } }); await expect(prisma.partnerPrivate.create({ data: { partnerId: p.id } as never })).rejects.toThrow() })
  it('partner_private é 1:1', async () => { const p = await prisma.partner.create({ data: { type: 'REPRESENTATIVE', name: 'Teste Parceiro Único', whatsapp: '5511999999995' } }); await prisma.partnerPrivate.create({ data: { partnerId: p.id, consentGivenAt: new Date() } }); await expect(prisma.partnerPrivate.create({ data: { partnerId: p.id, consentGivenAt: new Date() } })).rejects.toThrow() })
  it('parceiro cobre várias áreas', async () => { const a = await prisma.commercialArea.create({ data: { name: 'A1', slug: 'test-area-cov-1' } }); const b = await prisma.commercialArea.create({ data: { name: 'A2', slug: 'test-area-cov-2' } }); const p = await prisma.partner.create({ data: { type: 'RESELLER', name: 'Teste Parceiro Multi Área', whatsapp: '5511999999994', commercialAreas: { create: [{ commercialAreaId: a.id }, { commercialAreaId: b.id }] } }, include: { commercialAreas: true } }); expect(p.commercialAreas).toHaveLength(2) })
  it('excluir parceiro faz cascade', async () => { const area = await prisma.commercialArea.create({ data: { name: 'Cascade', slug: 'test-area-cascade' } }); const p = await prisma.partner.create({ data: { type: 'REPRESENTATIVE', name: 'Teste Parceiro Cascade', whatsapp: '5511999999993', commercialAreas: { create: [{ commercialAreaId: area.id }] }, private: { create: { consentGivenAt: new Date() } } } }); await prisma.partner.delete({ where: { id: p.id } }); expect(await prisma.partnerPrivate.count({ where: { partnerId: p.id } })).toBe(0); expect(await prisma.partnerCommercialArea.count({ where: { partnerId: p.id } })).toBe(0) })
  it('restringe apagar área referenciada por parceiro', async () => { const area = await prisma.commercialArea.create({ data: { name: 'Restrict', slug: 'test-area-restrict' } }); await prisma.partner.create({ data: { type: 'RESELLER', name: 'Teste Parceiro Restrict Área', whatsapp: '5511999999992', commercialAreas: { create: [{ commercialAreaId: area.id }] } } }); await expect(prisma.commercialArea.delete({ where: { id: area.id } })).rejects.toThrow() })
  it('restringe apagar município referenciado', async () => { const { municipality } = await hierarchy('restrict-mun'); await prisma.commercialArea.create({ data: { name: 'Restrict Mun', slug: 'test-area-restrict-mun', municipalities: { create: [{ municipalityId: municipality.id }] } } }); await expect(prisma.municipality.delete({ where: { id: municipality.id } })).rejects.toThrow() })
  it('restringe apagar estado referenciado', async () => { const { state } = await hierarchy('restrict-state'); await expect(prisma.state.delete({ where: { id: state.id } })).rejects.toThrow() })
  it('restringe apagar região referenciada', async () => { const { region } = await hierarchy('restrict-region'); await expect(prisma.region.delete({ where: { id: region.id } })).rejects.toThrow() })
})
