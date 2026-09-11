import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { readJsonObject } from '@/lib/auth/request-body'
import { findProductForAdmin } from '@/lib/content/product-repository'
import { countProductTestimonials, createProductTestimonial } from '@/lib/content/product-testimonial-repository'
import { MAX_PRODUCT_TESTIMONIALS, parseTestimonialInput } from '@/lib/content/testimonial-input'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id } = await context.params
    const product = await findProductForAdmin(id)
    if (!product) return errorResponse('Produto não encontrado.', 404)

    const existingCount = await countProductTestimonials(id)
    if (existingCount >= MAX_PRODUCT_TESTIMONIALS) {
      return errorResponse(`Limite de ${MAX_PRODUCT_TESTIMONIALS} depoimentos por produto atingido.`, 400)
    }

    let parsed
    try {
      parsed = parseTestimonialInput(await readJsonObject(request))
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Dados inválidos.', 400)
    }

    const testimonial = await createProductTestimonial({ productId: id, ...parsed })

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')

    return NextResponse.json({ id: testimonial.id }, { status: 201 })
  } catch {
    logger.error('content.product_testimonial_create_failed')
    return errorResponse('Não foi possível salvar o depoimento. Tente novamente em instantes.', 500)
  }
}
