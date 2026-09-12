/**
 * Documento e observações deixaram de ser texto livre — viraram caixas de
 * seleção com uma frase fixa cada, decisão do Jose (11/09/2026): mais simples
 * de preencher e sem ambiguidade sobre o que está sendo declarado.
 */
export const PARTNER_DOCUMENT_SIGNED_TEXT = 'Documento físico assinado, arquivado na empresa.'
export const PARTNER_LGPD_AUTHORIZATION_TEXT =
  'Representante autoriza a divulgação de seus dados de contato, em conformidade com a LGPD.'

export type PartnerPrivateInput = { document: string | null; consentNotes: string | null }

export function parsePartnerPrivateInput(value: unknown): PartnerPrivateInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Dados inválidos.')
  const body = value as Record<string, unknown>

  return {
    document: body.documentSigned === true ? PARTNER_DOCUMENT_SIGNED_TEXT : null,
    consentNotes: body.lgpdAuthorized === true ? PARTNER_LGPD_AUTHORIZATION_TEXT : null,
  }
}
