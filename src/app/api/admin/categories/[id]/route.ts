import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { deleteCategory, findCategoryForAdmin, updateCategory } from '@/lib/content/category-repository'
import { parseCategoryInput } from '@/lib/content/category-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const category = await findCategoryForAdmin(id)
    if (!category) return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
    let parsed
    try {
      parsed = parseCategoryInput(await readJsonObject(request))
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
    }
    await updateCategory(id, parsed)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'CATEGORY', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch {
    logger.error('content.category_update_failed')
    return NextResponse.json({ error: 'Não foi possível salvar a categoria. Verifique se o slug já está em uso.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    const { id } = await context.params
    const category = await findCategoryForAdmin(id)
    if (!category) return NextResponse.json({ error: 'Categoria não encontrada.' }, { status: 404 })
    await deleteCategory(id)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'DELETE', entityType: 'CATEGORY', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')
    return NextResponse.json({ id })
  } catch (error) {
    const code = (error as { code?: string } | null)?.code
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Categoria tem produtos vinculados. Remova o vínculo antes de excluir.' }, { status: 409 })
    }
    logger.error('content.category_delete_failed')
    return NextResponse.json({ error: 'Não foi possível excluir a categoria.' }, { status: 500 })
  }
}
