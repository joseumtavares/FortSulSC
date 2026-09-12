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
  /** Quando presente, o item vira link real (`Link`) em vez de seletor local. */
  href?: string
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { key: 'produtos', label: 'Produtos', icon: Package, href: '/admin/products' },
  { key: 'categorias', label: 'Categorias', icon: Boxes, href: '/admin/categories' },
  { key: 'representantes', label: 'Representantes', icon: Users, href: '/admin/partners/representantes' },
  { key: 'revendas', label: 'Revendas', icon: Store, href: '/admin/partners/revendas' },
  { key: 'regioes', label: 'Áreas comerciais', icon: MapPin, href: '/admin/commercial-areas' },
  { key: 'artigos', label: 'Novidades e dicas', icon: Newspaper, href: '/admin/articles' },
  { key: 'banners', label: 'Banners', icon: ImageIcon, href: '/admin/banners' },
]

export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { key: 'configuracoes', label: 'Configurações', icon: Settings, href: '/admin/settings' },
  { key: 'documentacao', label: 'Documentação', icon: FileText },
]
