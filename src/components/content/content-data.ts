export type ContentGalleryImage = { src: string; alt: string }

export type ContentCardData = {
  id: string
  image: { src: string; alt: string }
  title: string
  description: string
  body: string
  gallery: ContentGalleryImage[]
}
