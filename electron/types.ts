export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export interface Entry {
  id: string
  title: string
  username: string
  password: string
  url: string
  categoryId: string
  notes: string
  favorite: boolean
  createdAt: number
  updatedAt: number
}

export interface VaultData {
  version: number
  salt: string
  iv: string
  iterations: number
  categories: Category[]
  entries: Entry[]
}

export interface EncryptedVault {
  version: number
  salt: string
  iv: string
  iterations: number
  data: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'social', name: '社交媒体', icon: 'Users', color: '#6C5CE7' },
  { id: 'email', name: '邮箱', icon: 'Mail', color: '#00B894' },
  { id: 'finance', name: '金融', icon: 'CreditCard', color: '#FDCB6E' },
  { id: 'work', name: '工作', icon: 'Briefcase', color: '#E17055' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#0984E3' },
  { id: 'other', name: '其他', icon: 'Folder', color: '#636E72' }
]
