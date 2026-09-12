/**
 * Fonte única dos limites de caracteres dos campos de texto do painel —
 * usada tanto pelos formulários (maxLength + contador) quanto pela
 * validação no servidor, para os dois nunca ficarem fora de sincronia.
 * Nenhuma coluna no banco tem tamanho fixo (todas são `text`); o limite é
 * só de UI/validação, para manter o card e o popup com layout consistente
 * (achado do Jose: sem limite, texto longo estica o card e quebra o ritmo
 * da grade/carrossel, já que nenhum card usa line-clamp/ellipsis).
 */

export const MAX_PRODUCT_CODE_LENGTH = 20
export const MAX_PRODUCT_NAME_LENGTH = 80
export const MAX_PRODUCT_EYEBROW_LENGTH = 40
export const MAX_PRODUCT_SHORT_DESCRIPTION_LENGTH = 160
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 1000
export const MAX_PRODUCT_WHATSAPP_MESSAGE_LENGTH = 300
export const MAX_PRODUCT_APPLICATION_LABEL_LENGTH = 60
export const MAX_PRODUCT_SPECIFICATION_LABEL_LENGTH = 40
export const MAX_PRODUCT_SPECIFICATION_VALUE_LENGTH = 40
export const MAX_TESTIMONIAL_AUTHOR_NAME_LENGTH = 60

export const MAX_ARTICLE_TITLE_LENGTH = 80
export const MAX_ARTICLE_EXCERPT_LENGTH = 160
export const MAX_ARTICLE_BODY_LENGTH = 5000

export const MAX_CATEGORY_NAME_LENGTH = 30

export const MAX_COMMERCIAL_AREA_NAME_LENGTH = 60

export const MAX_PARTNER_NAME_LENGTH = 80
export const MAX_PARTNER_DESCRIPTION_LENGTH = 500
export const MAX_PARTNER_DOCUMENT_LENGTH = 30
export const MAX_PARTNER_CONSENT_NOTES_LENGTH = 300
