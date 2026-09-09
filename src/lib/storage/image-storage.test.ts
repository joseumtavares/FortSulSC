import { beforeEach, describe, expect, it, vi } from 'vitest'

const clientFetchMock = vi.hoisted(() => vi.fn())
const getImageStorageConfigMock = vi.hoisted(() => vi.fn())

vi.mock('aws4fetch', () => ({
  AwsClient: vi.fn().mockImplementation(function AwsClientMock() {
    return { fetch: clientFetchMock }
  }),
}))

vi.mock('./image-storage-config', () => ({
  getImageStorageConfig: getImageStorageConfigMock,
}))

import { getImageStorage } from './image-storage'

describe('LocalImageStorage', () => {
  beforeEach(() => {
    getImageStorageConfigMock.mockReturnValue({ provider: 'local' })
  })

  it('upload não faz chamada externa e devolve uma URL local', async () => {
    const storage = getImageStorage()
    const result = await storage.upload({ key: 'articles/a1/capa.jpg', body: Buffer.from('x'), contentType: 'image/jpeg' })

    expect(result).toEqual({ url: 'local://articles/a1/capa.jpg' })
    expect(clientFetchMock).not.toHaveBeenCalled()
  })

  it('delete não faz chamada externa', async () => {
    const storage = getImageStorage()
    await expect(storage.delete('articles/a1/capa.jpg')).resolves.toBeUndefined()
    expect(clientFetchMock).not.toHaveBeenCalled()
  })
})

describe('R2ImageStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getImageStorageConfigMock.mockReturnValue({
      provider: 'r2',
      accountId: 'account-id',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      bucket: 'fortsul-images',
      publicBaseUrl: 'https://images.fortsulsc.test',
    })
  })

  it('upload envia um PUT assinado e devolve a URL pública', async () => {
    clientFetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }))
    const storage = getImageStorage()

    const result = await storage.upload({
      key: 'articles/a1/capa.jpg',
      body: Buffer.from('conteudo'),
      contentType: 'image/jpeg',
    })

    expect(result).toEqual({ url: 'https://images.fortsulsc.test/articles/a1/capa.jpg' })
    expect(clientFetchMock).toHaveBeenCalledWith(
      'https://account-id.r2.cloudflarestorage.com/fortsul-images/articles/a1/capa.jpg',
      expect.objectContaining({ method: 'PUT', headers: { 'content-type': 'image/jpeg' } }),
    )
  })

  it('propaga erro quando o R2 responde com falha no upload', async () => {
    clientFetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    const storage = getImageStorage()

    await expect(
      storage.upload({ key: 'articles/a1/capa.jpg', body: Buffer.from('x'), contentType: 'image/jpeg' }),
    ).rejects.toThrow('Falha ao enviar imagem ao R2')
  })

  it('delete envia um DELETE assinado', async () => {
    clientFetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const storage = getImageStorage()

    await storage.delete('articles/a1/capa-antiga.jpg')

    expect(clientFetchMock).toHaveBeenCalledWith(
      'https://account-id.r2.cloudflarestorage.com/fortsul-images/articles/a1/capa-antiga.jpg',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('não trata 404 como falha ao excluir (objeto já ausente)', async () => {
    clientFetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }))
    const storage = getImageStorage()

    await expect(storage.delete('articles/a1/capa-antiga.jpg')).resolves.toBeUndefined()
  })
})
