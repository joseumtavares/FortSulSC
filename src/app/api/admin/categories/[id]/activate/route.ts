import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { findCategoryForAdmin, updateCategoryActive } from '@/lib/content/category-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const category = await findCategoryForAdmin(id)
    if (!category) return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
    await updateCategoryActive(id, true)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'ACTIVATE', entityType: 'CATEGORY', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id, active: true })
  } catch {
    logger.error('content.category_activate_failed')
    return NextResponse.json({ error: 'Não foi possível alterar a ativação da categoria.' }, { status: 500 })
  }
}
