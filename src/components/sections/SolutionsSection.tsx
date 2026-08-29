import { solutions, solutionFilters } from '@/components/solutions/solutions-data'
import { SolutionsGrid } from '@/components/solutions/SolutionsGrid'
import { Reveal } from '@/components/ui/Reveal'
export function SolutionsSection() { return <section className="section solutions" id="solucoes" aria-labelledby="solutions-title"><div className="container"><Reveal className="section-heading"><div><span className="eyebrow eyebrow-light">Nossas soluções</span><h2 id="solutions-title">Equipamentos pensados<br /> para o seu processo.</h2></div><p>Escolha uma área para explorar as possibilidades da linha FortSul.</p></Reveal><SolutionsGrid filters={solutionFilters} solutions={solutions} /></div></section> }
