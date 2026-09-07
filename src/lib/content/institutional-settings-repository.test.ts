import { beforeEach, describe, expect, it, vi } from 'vitest'

const institutionalSettingsMock = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
}))

vi.mock('@/lib/db/client', () => ({
  prisma: { institutionalSettings: institutionalSettingsMock },
}))

import { getInstitutionalSettings, upsertInstitutionalSettings } from './institutional-settings-repository'

describe('institutional-settings-repository', () => {
  beforeEach(() => {
    institutionalSettingsMock.findUnique.mockReset()
    institutionalSettingsMock.upsert.mockReset()

    institutionalSettingsMock.findUnique.mockResolvedValue(null)
    institutionalSettingsMock.upsert.mockResolvedValue(null)
  })

  it('queries the fixed singleton key', async () => {
    await getInstitutionalSettings()

    expect(institutionalSettingsMock.findUnique).toHaveBeenCalledWith({
      where: { singletonKey: 1 },
    })
  })

  it('upserts through the same singleton key', async () => {
    const input = {
      whatsapp: '48999990000',
      email: 'contato@fortsulsc.com.br',
      phone: '4836600818',
      cnpj: '12345678000199',
      address: 'Rodovia SC-000',
      socialLinks: { instagram: 'https://instagram.com/fortsulsc' },
    }

    await upsertInstitutionalSettings(input)

    expect(institutionalSettingsMock.upsert).toHaveBeenCalledWith({
      where: { singletonKey: 1 },
      update: input,
      create: {
        singletonKey: 1,
        ...input,
      },
    })
  })
})
