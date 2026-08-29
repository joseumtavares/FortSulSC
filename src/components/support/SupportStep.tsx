import { Reveal } from '@/components/ui/Reveal'
import type { SupportStepData } from './support-data'

export function SupportStep({ step, delay = false }: { step: SupportStepData; delay?: boolean }) {
  return (
    <Reveal as="article" delay={delay}>
      <span>{step.number}</span>
      <div className="step-icon">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d={step.icon} />
        </svg>
      </div>
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </Reveal>
  )
}
