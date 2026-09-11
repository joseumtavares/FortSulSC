import { describe, expect, it } from 'vitest'
import { MAX_PRODUCT_IMAGES, PRODUCT_IMAGE_RECOMMENDED_HEIGHT_PX, PRODUCT_IMAGE_RECOMMENDED_WIDTH_PX } from './product-image-input'

describe('product-image-input constants', () => {
  it('limits products to 6 images', () => {
    expect(MAX_PRODUCT_IMAGES).toBe(6)
  })

  it('recommends a 16:9 resolution matching the popup gallery aspect ratio', () => {
    expect(PRODUCT_IMAGE_RECOMMENDED_WIDTH_PX).toBe(1600)
    expect(PRODUCT_IMAGE_RECOMMENDED_HEIGHT_PX).toBe(900)
  })
})
