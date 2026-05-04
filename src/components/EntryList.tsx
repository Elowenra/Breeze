import { Plus, Star, KeyRound } from 'lucide-react'
import { Entry, Category } from '../../electron/types'

interface EntryListProps {
  entries: Entry[]
  categories: Category[]
  selectedEntry: Entry | null
  onSelectEntry: (entry: Entry) => void
  onAddEntry: () => void
  onToggleFavorite: (entry: Entry) => void
}

export default function EntryList({
  entries,
  categories,
  selectedEntry,
  onSelectEntry,
  onAddEntry,
  onToggleFavorite
}: EntryListProps) {
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#636E72'
  }

  const getInitials = (title: string) => {
    return title.charAt(0).toUpperCase()
  }

  return (
    <div className="entry-list">
      <div className="entry-list-header">
        <div>
          <div className="entry-list-title">密码条目</div>
          <div className="entry-list-count">{entries.length} 个条目</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAddEntry}>
          <Plus size={16} />
          新建
        </button>
      </div>

      <div className="entry-list-content">
        {entries.length === 0 ? (
          <div className="entry-list-empty">
            <KeyRound size={48} />
            <p>暂无密码条目</p>
            <p style={{ fontSize: '13px' }}>点击"新建"添加第一个密码</p>
          </div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className={`entry-card ${selectedEntry?.id === entry.id ? 'active' : ''}`}
              onClick={() => onSelectEntry(entry)}
            >
              <div
                className="entry-card-icon"
                style={{ background: getCategoryColor(entry.categoryId) }}
              >
                {getInitials(entry.title)}
              </div>
              <div className="entry-card-info">
                <div className="entry-card-title">{entry.title}</div>
                <div className="entry-card-username">{entry.username}</div>
              </div>
              <button
                className={`entry-card-fav btn btn-ghost btn-icon ${entry.favorite ? 'is-fav' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(entry)
                }}
              >
                <Star size={16} fill={entry.favorite ? '#FDCB6E' : 'none'} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
