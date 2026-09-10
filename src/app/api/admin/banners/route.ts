import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { createBanner, listBannersForAdmin } from '@/lib/content/banner-repository'
import { parseBannerInput } from '@/lib/content/banner-input'
import { parseBannerFile, uploadBannerImage, deleteBannerImage } from '@/lib/content/banner-upload'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try { return NextResponse.json(await listBannersForAdmin()) } catch {
    logger.error('content.banner_list_failed')
    return NextResponse.json({ error: 'Não foi possível listar os banners.' }, { status: 500 })
  }
}

async function readInput(request: NextRequest) {
  try {
    const form = await request.formData()
    return { text: parseBannerInput(Object.fromEntries(form)), file: parseBannerFile(form) }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  const parsed = await readInput(request)
  if (parsed instanceof NextResponse) return parsed
  try {
    const image = await uploadBannerImage(parsed.file)
    const banner = await createBanner({ ...parsed.text, ...image }).catch(async (error: unknown) => {
      await deleteBannerImage(image.imageKey)
      throw error
    })
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'CREATE', entityType: 'BANNER', entityId: banner.id, result: 'SUCCESS' })
    return NextResponse.json({ id: banner.id }, { status: 201 })
  } catch {
    logger.error('content.banner_create_failed')
    return NextResponse.json({ error: 'Não foi possível criar o banner.' }, { status: 500 })
  }
}
