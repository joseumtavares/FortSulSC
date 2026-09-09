import { describe, expect, it } from 'vitest'
import { getImageStorageConfig } from './image-storage-config'

describe('getImageStorageConfig', () => {
  it('usa "local" por padrão quando STORAGE_PROVIDER não está definido', () => {
    expect(getImageStorageConfig({})).toEqual({ provider: 'local' })
  })

  it('usa "local" quando STORAGE_PROVIDER=local', () => {
    expect(getImageStorageConfig({ STORAGE_PROVIDER: 'local' })).toEqual({ provider: 'local' })
  })

  it('não aceita provedor diferente de local/r2', () => {
    expect(() => getImageStorageConfig({ STORAGE_PROVIDER: 'aws-s3' })).toThrow(
      'STORAGE_PROVIDER deve ser "local" ou "r2"',
    )
  })

  it('exige as variáveis do R2 quando STORAGE_PROVIDER=r2', () => {
    expect(() => getImageStorageConfig({ STORAGE_PROVIDER: 'r2' })).toThrow('R2_ACCOUNT_ID')
  })

  it('monta a configuração do R2 quando todas as variáveis estão presentes', () => {
    const config = getImageStorageConfig({
      STORAGE_PROVIDER: 'r2',
      R2_ACCOUNT_ID: 'account-id',
      R2_ACCESS_KEY_ID: 'access-key',
      R2_SECRET_ACCESS_KEY: 'secret-key',
      R2_BUCKET: 'fortsul-images',
      R2_PUBLIC_BASE_URL: 'https://images.fortsulsc.test',
    })

    expect(config).toEqual({
      provider: 'r2',
      accountId: 'account-id',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      bucket: 'fortsul-images',
      publicBaseUrl: 'https://images.fortsulsc.test',
    })
  })
})
