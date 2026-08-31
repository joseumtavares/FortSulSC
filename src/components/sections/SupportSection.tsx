import { Reveal } from '@/components/ui/Reveal'
import { supportSteps } from '@/components/support/support-data'
import { SupportStep } from '@/components/support/SupportStep'

export function SupportSection() {
  return (
    <section className="section support" id="atendimento" aria-labelledby="support-title">
      <div className="container">
        <Reveal className="support-heading">
          <span className="eyebrow">Atendimento completo</span>
          <h2 id="support-title">
            A parceria continua{' '}<br />depois da entrega.
          </h2>
          <p>Um processo simples, próximo e transparente para colocar sua solução em funcionamento.</p>
        </Reveal>

        <div className="support-steps">
          {supportSteps.map((step, index) => (
            <SupportStep key={step.number} step={step} delay={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
