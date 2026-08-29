export type SolutionFilterId = 'todos' | 'aviario' | 'equipamentos' | 'fumageiro' | 'piscicultura' | 'secadores'
export type SolutionCategory = Exclude<SolutionFilterId, 'todos'>

type SingleMedia = { kind: 'single'; src: string; alt: string; width: number; height: number; sizes: string }
type SplitMedia = { kind: 'split'; images: { src: string; alt: string; width: number; height: number }[] }

export type Solution = {
  id: string; title: string; displayCategory: string; categories: SolutionCategory[]; featured?: boolean; tag?: string; href: string; ctaLabel: string; media: SingleMedia | SplitMedia
}

export const solutionFilters: { id: SolutionFilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' }, { id: 'aviario', label: 'Aviário' }, { id: 'equipamentos', label: 'Equipamentos' }, { id: 'fumageiro', label: 'Fumageiro' }, { id: 'piscicultura', label: 'Piscicultura' }, { id: 'secadores', label: 'Secadores' },
]

export const solutions: Solution[] = [
  { id: 'alimentador-cavaco-briquete-pellets', title: 'Alimentador de Cavaco, Briquete e Pellets', displayCategory: 'Biomassa', categories: ['equipamentos', 'fumageiro'], featured: true, tag: 'Lançamento', href: 'produto-alimentador.html', ctaLabel: 'Ver detalhes do alimentador de cavaco, briquete e pellets', media: { kind: 'single', src: '/image/alimentador-reto-fundo-plantacao-1200.webp', alt: 'Alimentador de cavaco, briquete e pellets em uma plantação', width: 1200, height: 500, sizes: '(max-width: 720px) 100vw, 66vw' } },
  { id: 'queimador-estufas', title: 'Queimador para Estufas', displayCategory: 'Fumageiro', categories: ['fumageiro', 'equipamentos'], href: '#whatsapp-dialog', ctaLabel: 'Solicitar informações sobre queimadores', media: { kind: 'single', src: '/image/queimador.webp', alt: 'Equipamento FortSul em ambiente de produção', width: 1600, height: 1200, sizes: '(max-width: 560px) 100vw, (max-width: 1050px) 50vw, 33vw' } },
  { id: 'solucoes-biomassa', title: 'Soluções para Biomassa', displayCategory: 'Equipamentos', categories: ['equipamentos'], href: '#whatsapp-dialog', ctaLabel: 'Solicitar informações sobre soluções para biomassa', media: { kind: 'split', images: [{ src: '/image/Pesquisa/cavaco-640.webp', alt: 'Cavaco de madeira', width: 640, height: 429 }, { src: '/image/Pesquisa/pellets-640.webp', alt: 'Pellets de madeira', width: 640, height: 640 }] } },
]
