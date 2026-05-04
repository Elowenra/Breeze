import { useState } from 'react'
import {
  Search, Star, Folder, Users, Mail, CreditCard,
  Briefcase, ShoppingBag, Shield, LogOut, Plus,
  Edit3, Trash2, Check, X, Download, Upload
} from 'lucide-react'
import { Category, Entry } from '../../electron/types'
import { api } from '../utils/ipc'
import ImportModal from './ImportModal'

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users size={16} />,
  Mail: <Mail size={16} />,
  CreditCard: <CreditCard size={16} />,
  Briefcase: <Briefcase size={16} />,
  ShoppingBag: <ShoppingBag size={16} />,
  Folder: <Folder size={16} />
}

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#636E72', '#E84393', '#00CEC9']

interface SidebarProps {
  categories: Category[]
  entries: Entry[]
  selectedCategory: string
  onSelectCategory: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onLock: () => void
  onCategoriesChange: (categories: Category[]) => void
  onEntriesChange: (entries: Entry[]) => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function Sidebar({
  categories,
  entries,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onLock,
  onCategoriesChange,
  onEntriesChange,
  showToast
}: SidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; categoryId: string } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const favoriteCount = entries.filter(e => e.favorite).length

  const handleAddCategory = async () => {
    if (!newName.trim()) return

    const result = await api.vault.addCategory({
      name: newName.trim(),
      icon: 'Folder',
      color: newColor
    })

    if (result.success && result.category) {
      onCategoriesChange([...categories, result.category])
      setNewName('')
      setShowAddForm(false)
      showToast('分类已添加')
    } else {
      showToast(result.error || '添加失败', 'error')
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setContextMenu(null)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return

    const result = await api.vault.updateCategory(id, { name: editName.trim() })
    if (result.success && result.category) {
      onCategoriesChange(categories.map(c => c.id === id ? result.category! : c))
      setEditingId(null)
      showToast('分类已更新')
    } else {
      showToast(result.error || '更新失败', 'error')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const result = await api.vault.deleteCategory(id)
    if (result.success) {
      onCategoriesChange(categories.filter(c => c.id !== id))
      if (selectedCategory === id) {
        onSelectCategory('all')
      }
      setContextMenu(null)
      showToast('分类已删除')
    } else {
      showToast(result.error || '删除失败', 'error')
    }
  }

  const handleContextMenu = (e: React.MouseEvent, categoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, categoryId })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const handleExport = async () => {
    const result = await api.dialog.exportVault()
    if (result.success) {
      showToast('保险库已导出')
    }
  }

  const handleImport = async (password: string) => {
    const result = await api.dialog.importVault(password)
    if (result.success && result.categories && result.entries) {
      onCategoriesChange(result.categories)
      onEntriesChange(result.entries)
      setShowImportModal(false)
      showToast('保险库已导入')
    } else {
      throw new Error(result.error || '导入失败')
    }
  }

  return (
    <div className="sidebar" onClick={handleCloseContextMenu}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={20} />
        </div>
        <span className="sidebar-title">Breeze</span>
      </div>

      <div className="sidebar-search">
        <div className="input-group">
          <input
            type="text"
            className="input"
            placeholder="搜索密码..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="btn btn-ghost btn-icon" style={{ pointerEvents: 'none' }}>
            <Search size={16} />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">快速访问</div>
          <div
            className={`sidebar-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            <div className="sidebar-item-icon" style={{ background: 'var(--accent-gradient)' }}>
              <Folder size={16} color="white" />
            </div>
            <span>全部密码</span>
            <span className="sidebar-item-count">{entries.length}</span>
          </div>
          <div
            className={`sidebar-item ${selectedCategory === 'favorites' ? 'active' : ''}`}
            onClick={() => onSelectCategory('favorites')}
          >
            <div className="sidebar-item-icon" style={{ background: 'rgba(253, 203, 110, 0.2)' }}>
              <Star size={16} color="#FDCB6E" />
            </div>
            <span>收藏</span>
            <span className="sidebar-item-count">{favoriteCount}</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>分类</span>
            <button
              className="btn btn-ghost btn-icon"
              style={{ width: 20, height: 20, padding: 0 }}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={14} />
            </button>
          </div>

          {showAddForm && (
            <div className="category-add-form">
              <input
                type="text"
                className="input"
                placeholder="分类名称"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
              />
              <div className="category-colors">
                {COLORS.map(color => (
                  <div
                    key={color}
                    className={`category-color ${newColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
              </div>
              <div className="category-add-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>
                  <X size={14} />
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleAddCategory}>
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}

          {categories.map(category => (
            <div
              key={category.id}
              className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
              onContextMenu={(e) => handleContextMenu(e, category.id)}
            >
              <div
                className="sidebar-item-icon"
                style={{ background: `${category.color}20` }}
              >
                {ICON_MAP[category.icon] || <Folder size={16} />}
              </div>
              {editingId === category.id ? (
                <div className="category-edit-form" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(category.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                  />
                  <button className="btn btn-ghost btn-icon" onClick={() => handleSaveEdit(category.id)}>
                    <Check size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon" onClick={() => setEditingId(null)}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <span>{category.name}</span>
              )}
              <span className="sidebar-item-count">
                {entries.filter(e => e.categoryId === category.id).length}
              </span>
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-secondary" onClick={handleExport} title="导出备份">
          <Download size={14} />
        </button>
        <button className="btn btn-secondary" onClick={() => setShowImportModal(true)} title="导入备份">
          <Upload size={14} />
        </button>
        <button className="btn btn-secondary" onClick={onLock}>
          <LogOut size={14} />
          锁定
        </button>
      </div>

      {showImportModal && (
        <ImportModal
          onConfirm={handleImport}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => {
            const cat = categories.find(c => c.id === contextMenu.categoryId)
            if (cat) handleStartEdit(cat)
          }}>
            <Edit3 size={14} />
            重命名
          </button>
          <button onClick={() => handleDeleteCategory(contextMenu.categoryId)}>
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}
    </div>
  )
}
