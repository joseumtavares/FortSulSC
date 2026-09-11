export type SolutionFilter = { id: string; label: string }

export type SolutionGalleryImage = { src: string; alt: string }

export type SolutionTestimonial = {
  platform: 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM'
  url: string
  authorName: string | null
}

export type SolutionSpecification = { label: string; value: string }

export type SolutionCardData = {
  id: string
  code: string
  name: string
  eyebrow: string | null
  shortDescription: string | null
  description: string | null
  catalogUrl: string | null
  categorySlugs: string[]
  applications: string[]
  specifications: SolutionSpecification[]
  heroImage: SolutionGalleryImage | null
  gallery: SolutionGalleryImage[]
  testimonials: SolutionTestimonial[]
  whatsappLink: string
}
