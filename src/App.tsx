import { useState, useEffect, useCallback } from 'react'
import { api } from './utils/ipc'
import Titlebar from './components/Titlebar'
import Onboarding from './components/Onboarding'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import EntryList from './components/EntryList'
import EntryDetail from './components/EntryDetail'
import EntryFormModal from './components/EntryFormModal'
import { Entry, Category } from '../electron/types'

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [hasVault, setHasVault] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [masterPassword, setMasterPassword] = useState('')

  useEffect(() => {
    checkVaultStatus()
  }, [])

  const checkVaultStatus = async () => {
    try {
      const exists = await api.vault.exists()
      setHasVault(exists)
      if (!exists) {
        setShowOnboarding(true)
      }
    } catch (err) {
      console.error('Failed to check vault status:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleLogin = async (password: string, isCreate: boolean) => {
    try {
      const result = isCreate
        ? await api.vault.create(password)
        : await api.vault.verify(password)

      if (result.success && result.categories && result.entries) {
        setCategories(result.categories)
        setEntries(result.entries)
        setMasterPassword(password)
        setIsUnlocked(true)
        setHasVault(true)
      } else {
        throw new Error(result.error || '操作失败')
      }
    } catch (err: any) {
      throw new Error(err.message || '操作失败')
    }
  }

  const handleLock = async () => {
    await api.vault.lock()
    setIsUnlocked(false)
    setEntries([])
    setCategories([])
    setSelectedEntry(null)
    setMasterPassword('')
  }

  const handleSave = async () => {
    if (!masterPassword) return
    const result = await api.vault.save(masterPassword)
    if (!result.success) {
      showToast('保存失败', 'error')
    }
  }

  const handleAddEntry = async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await api.vault.addEntry(entry)
    if (result.success && result.entry) {
      setEntries([...entries, result.entry])
      setSelectedEntry(result.entry)
      setShowForm(false)
      await handleSave()
      showToast('条目已添加')
    } else {
      showToast(result.error || '添加失败', 'error')
    }
  }

  const handleUpdateEntry = async (id: string, updates: Partial<Entry>) => {
    const result = await api.vault.updateEntry(id, updates)
    if (result.success && result.entry) {
      setEntries(entries.map(e => e.id === id ? result.entry! : e))
      if (selectedEntry?.id === id) {
        setSelectedEntry(result.entry)
      }
      setEditingEntry(null)
      setShowForm(false)
      await handleSave()
      showToast('条目已更新')
    } else {
      showToast(result.error || '更新失败', 'error')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    const result = await api.vault.deleteEntry(id)
    if (result.success) {
      setEntries(entries.filter(e => e.id !== id))
      if (selectedEntry?.id === id) {
        setSelectedEntry(null)
      }
      await handleSave()
      showToast('条目已删除')
    } else {
      showToast(result.error || '删除失败', 'error')
    }
  }

  const handleToggleFavorite = async (entry: Entry) => {
    await handleUpdateEntry(entry.id, { favorite: !entry.favorite })
  }

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'favorites' && entry.favorite) ||
      entry.categoryId === selectedCategory

    const matchesSearch = !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="login-screen">
        <div className="login-bg" />
        <div style={{ color: 'var(--text-muted)' }}>加载中...</div>
      </div>
    )
  }

  if (!isUnlocked) {
    if (showOnboarding) {
      return (
        <>
          <Titlebar />
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        </>
      )
    }
    return (
      <>
        <Titlebar />
        <Login
          hasVault={hasVault}
          onLogin={handleLogin}
          onReset={() => {
            setHasVault(false)
            setShowOnboarding(true)
          }}
        />
      </>
    )
  }

  return (
    <>
      <Titlebar />
      <div className="vault-layout">
        <Sidebar
          categories={categories}
          entries={entries}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLock={handleLock}
          onCategoriesChange={setCategories}
          onEntriesChange={setEntries}
          showToast={showToast}
        />
        <EntryList
          entries={filteredEntries}
          categories={categories}
          selectedEntry={selectedEntry}
          onSelectEntry={setSelectedEntry}
          onAddEntry={() => {
            setEditingEntry(null)
            setShowForm(true)
          }}
          onToggleFavorite={handleToggleFavorite}
        />
        <EntryDetail
          entry={selectedEntry}
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDeleteEntry}
          showToast={showToast}
        />
      </div>
      {showForm && (
        <EntryFormModal
          entry={editingEntry}
          categories={categories}
          onSave={(entryData) => {
            if (editingEntry) {
              handleUpdateEntry(editingEntry.id, entryData)
            } else {
              handleAddEntry(entryData as Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>)
            }
          }}
          onClose={() => {
            setShowForm(false)
            setEditingEntry(null)
          }}
        />
      )}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </>
  )
}
