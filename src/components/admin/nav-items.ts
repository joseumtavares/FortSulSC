import {
  Boxes,
  FileText,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  Newspaper,
  Package,
  Settings,
  Store,
  Users,
} from 'lucide-react'

export type NavItem = {
  key: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'produtos', label: 'Produtos', icon: Package },
  { key: 'categorias', label: 'Categorias', icon: Boxes },
  { key: 'representantes', label: 'Representantes', icon: Users, badge: 3 },
  { key: 'revendas', label: 'Revendas', icon: Store },
  { key: 'regioes', label: 'Regiões', icon: MapPin },
  { key: 'artigos', label: 'Novidades e dicas', icon: Newspaper },
  { key: 'banners', label: 'Banners', icon: ImageIcon },
]

export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { key: 'configuracoes', label: 'Configurações', icon: Settings },
  { key: 'documentacao', label: 'Documentação', icon: FileText },
]
