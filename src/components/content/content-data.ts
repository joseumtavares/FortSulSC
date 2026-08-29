export type ContentCardData = {
  image: { src: string; alt: string; width: number; height: number }
  title: string
  description: string
}

// TESTE — conteúdo de exemplo aprovado para validação de layout, substituir antes do lançamento.
export const contentCards: ContentCardData[] = [
  {
    image: { src: '/image/alimentador-reto-banner1.webp', alt: 'Alimentador de cavaco, briquete e pellets em operação', width: 1942, height: 809 },
    title: 'Como escolher o alimentador ideal',
    description: 'Dicas para dimensionar o alimentador certo para o seu processo.',
  },
  {
    image: { src: '/image/queimador.webp', alt: 'Queimador industrial FortSul', width: 1600, height: 1200 },
    title: 'Cuidados com queimadores industriais',
    description: 'Boas práticas de manutenção para prolongar a vida útil do equipamento.',
  },
  {
    image: { src: '/image/FrtSulSC_Mapa-Representantes-Estados-Ativos.png', alt: 'Mapa de representantes da FortSul por estado', width: 1254, height: 1254 },
    title: 'FortSul em todo o Brasil',
    description: 'Conheça a rede de representantes da FortSul nos estados ativos.',
  },
]
