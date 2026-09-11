import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdminRequest } from '@/lib/auth/admin-route-guard'
import { deleteProductTestimonial, findProductTestimonial } from '@/lib/content/product-testimonial-repository'
import { recordAuditEvent } from '@/lib/audit/audit-log-repository'
import { logger } from '@/lib/logger'

function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; testimonialId: string }> }) {
  const guard = await requireAdminRequest(request)
  if (!guard.ok) return guard.response

  try {
    const { id, testimonialId } = await context.params
    const testimonial = await findProductTestimonial(testimonialId)
    if (!testimonial || testimonial.productId !== id) return errorResponse('Depoimento não encontrado.', 404)

    await deleteProductTestimonial(testimonialId)

    await recordAuditEvent({ adminUserId: guard.session.user.id, action: 'UPDATE', entityType: 'PRODUCT', entityId: id, result: 'SUCCESS' })
    revalidatePath('/')

    return NextResponse.json({ id: testimonialId }, { status: 200 })
  } catch {
    logger.error('content.product_testimonial_delete_failed')
    return errorResponse('Não foi possível remover o depoimento. Tente novamente em instantes.', 500)
  }
}
