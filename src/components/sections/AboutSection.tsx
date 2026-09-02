import { AboutTabs } from '@/components/about/AboutTabs'
import { aboutTabs } from '@/components/about/about-tabs-data'

export function AboutSection() {
  return (
    <section className="section about" id="empresa" aria-labelledby="about-title">
      <div className="container about-fichario">
        <div className="about-fichario-header">
          <span className="eyebrow">A FortSul</span>
          <h2 id="about-title">Quem somos, de onde viemos e para onde vamos.</h2>
        </div>
        <AboutTabs tabs={aboutTabs} />
      </div>
    </section>
  )
}
