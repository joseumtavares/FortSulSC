import { AboutSection } from '@/components/sections/AboutSection'
import { CategoryStrip } from '@/components/sections/CategoryStrip'
import { HeroSection } from '@/components/sections/HeroSection'
import { SolutionsSection } from '@/components/sections/SolutionsSection'

export default function Home() {
  return (
    <main id="conteudo">
      <HeroSection />
      <CategoryStrip />
      <AboutSection />
      <SolutionsSection />
    </main>
  )
}
