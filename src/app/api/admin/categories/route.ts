import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { createCategory, listCategoriesForAdmin } from '@/lib/content/category-repository'
import { parseCategoryInput } from '@/lib/content/category-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  try {
    return NextResponse.json(await listCategoriesForAdmin())
  } catch {
    logger.error('content.category_list_failed')
    return NextResponse.json({ error: 'Não foi possível listar as categorias.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response
  let input
  try {
    input = parseCategoryInput(await readJsonObject(request))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Dados inválidos.' }, { status: 400 })
  }
  try {
    const category = await createCategory(input)
    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'CREATE', entityType: 'CATEGORY', entityId: category.id, result: 'SUCCESS' })
    return NextResponse.json({ id: category.id }, { status: 201 })
  } catch {
    logger.error('content.category_create_failed')
    return NextResponse.json({ error: 'Não foi possível criar a categoria. Verifique se o slug já está em uso.' }, { status: 500 })
  }
}
