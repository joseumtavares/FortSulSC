import { AboutSection } from '@/components/sections/AboutSection'
import { CategoryStrip } from '@/components/sections/CategoryStrip'
import { ContentSection } from '@/components/sections/ContentSection'
import { CtaSection } from '@/components/sections/CtaSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { PresenceSection } from '@/components/sections/PresenceSection'
import { SolutionsSection } from '@/components/sections/SolutionsSection'
import { SupportSection } from '@/components/sections/SupportSection'

export default function Home() {
  return (
    <main id="conteudo">
      <HeroSection />
      <CategoryStrip />
      <AboutSection />
      <SolutionsSection />
      <SupportSection />
      <PresenceSection />
      <ContentSection />
      <CtaSection />
    </main>
  )
}
