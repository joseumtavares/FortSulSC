export type SupportStepData = {
  number: string
  title: string
  description: string
  icon: string
}

export const supportSteps: SupportStepData[] = [
  {
    number: '01',
    title: 'Entendimento',
    description: 'Conhecemos a necessidade e o contexto da sua produção.',
    icon: 'M4 19h16M7 16l3-3 3 2 5-6',
  },
  {
    number: '02',
    title: 'Instalação',
    description: 'Técnicos especializados preparam o equipamento na propriedade.',
    icon: 'M4 20h16M7 17V8h10v9M9 8V4h6v4',
  },
  {
    number: '03',
    title: 'Suporte',
    description: 'Orientação ágil para as necessidades do dia a dia.',
    icon: 'M5 12a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-2v-6h4M5 13h4v6H7a2 2 0 0 1-2-2v-5Z',
  },
  {
    number: '04',
    title: 'Pós-venda',
    description: 'Acompanhamento para manter o desempenho do equipamento.',
    icon: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  },
]
