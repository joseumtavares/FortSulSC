import { AboutSection } from '@/components/sections/AboutSection'
import { CategoryStrip } from '@/components/sections/CategoryStrip'
import { HeroSection } from '@/components/sections/HeroSection'

export default function Home() {
  return (
    <main id="conteudo">
      <HeroSection />
      <CategoryStrip />
      <AboutSection />
    </main>
  )
}
