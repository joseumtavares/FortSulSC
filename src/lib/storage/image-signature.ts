/**
 * Confere os bytes reais do arquivo (assinatura/"magic bytes") contra o
 * `Content-Type` declarado pelo navegador — que é só um metadado enviado
 * pelo cliente e pode ser forjado. Sem isso, um arquivo malicioso disfarçado
 * de imagem (extensão/MIME trocados) passaria pela validação de tipo.
 */
function startsWith(buffer: Buffer, bytes: number[]): boolean {
  return buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte)
}

function isJpeg(buffer: Buffer): boolean {
  return startsWith(buffer, [0xff, 0xd8, 0xff])
}

function isPng(buffer: Buffer): boolean {
  return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
}

function isWebp(buffer: Buffer): boolean {
  return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
}

export function detectImageMimeType(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (isJpeg(buffer)) return 'image/jpeg'
  if (isPng(buffer)) return 'image/png'
  if (isWebp(buffer)) return 'image/webp'
  return null
}

export function matchesDeclaredImageType(buffer: Buffer, declaredMimeType: string): boolean {
  return detectImageMimeType(buffer) === declaredMimeType
}
