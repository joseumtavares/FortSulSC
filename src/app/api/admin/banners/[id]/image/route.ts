import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findBannerForAdmin, updateBanner } from '@/lib/content/banner-repository'
import { parseBannerFile, uploadBannerImage, deleteBannerImage } from '@/lib/content/banner-upload'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const banner = await findBannerForAdmin(id)
    if (!banner) return NextResponse.json({ error: 'Banner não encontrado.' }, { status: 404 })
    let file
    try { file = await parseBannerFile(await request.formData()) } catch {
      return NextResponse.json({ error: 'Envie uma imagem JPEG, PNG ou WEBP de até 5 MB.' }, { status: 400 })
    }
    const image = await uploadBannerImage(file)
    await updateBanner(id, image).catch(async (error: unknown) => {
      await deleteBannerImage(image.imageKey)
      throw error
    })
    await deleteBannerImage(banner.imageKey)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'BANNER', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id, imageUrl: image.imageUrl })
  } catch {
    logger.error('content.banner_image_failed')
    return NextResponse.json({ error: 'Não foi possível substituir a imagem.' }, { status: 500 })
  }
}
