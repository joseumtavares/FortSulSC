import { ImageIcon, type LayoutDashboard, Newspaper, Package, Users } from 'lucide-react'

export type StatCard = {
  key: string
  label: string
  value: string
  trend: string
  icon: typeof LayoutDashboard
}

export const STAT_CARDS: StatCard[] = [
  { key: 'produtos', label: 'Produtos ativos', value: '48', trend: '+3 este mês', icon: Package },
  { key: 'representantes', label: 'Representantes', value: '17', trend: '+1 esta semana', icon: Users },
  { key: 'artigos', label: 'Artigos publicados', value: '12', trend: '+2 este mês', icon: Newspaper },
  { key: 'banners', label: 'Banners ativos', value: '4', trend: 'sem mudança', icon: ImageIcon },
]

export type ActivityItem = {
  key: string
  title: string
  description: string
  time: string
  icon: typeof LayoutDashboard
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { key: '1', title: 'Artigo publicado', description: '"Manutenção preventiva de secadores"', time: 'há 12 min', icon: Newspaper },
  { key: '2', title: 'Representante cadastrado', description: 'Região Sul — novo contato', time: 'há 1 h', icon: Users },
  { key: '3', title: 'Produto atualizado', description: 'Fumigador de cavaco — ficha técnica', time: 'há 3 h', icon: Package },
  { key: '4', title: 'Banner atualizado', description: 'Faixa institucional da Home', time: 'ontem', icon: ImageIcon },
]

export type CategoryUsage = {
  key: string
  label: string
  percentage: number
}

export const CATEGORY_USAGE: CategoryUsage[] = [
  { key: 'fumicultura', label: 'Fumicultura', percentage: 82 },
  { key: 'equipamentos', label: 'Equipamentos', percentage: 64 },
  { key: 'secadores', label: 'Secadores', percentage: 51 },
  { key: 'aviario', label: 'Aviário', percentage: 38 },
  { key: 'piscicultura', label: 'Piscicultura', percentage: 29 },
  { key: 'acessorios', label: 'Acessórios', percentage: 22 },
]
