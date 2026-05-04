import { useState } from 'react'
import {
  Eye, EyeOff, Copy, ExternalLink, Edit3, Trash2,
  Globe, User, Key, FileText, Clock, KeyRound
} from 'lucide-react'
import { Entry, Category } from '../../electron/types'
import { api } from '../utils/ipc'

interface EntryDetailProps {
  entry: Entry | null
  categories: Category[]
  onEdit: (entry: Entry) => void
  onDelete: (id: string) => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function EntryDetail({
  entry,
  categories,
  onEdit,
  onDelete,
  showToast
}: EntryDetailProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!entry) {
    return (
      <div className="entry-detail">
        <div className="empty-detail">
          <div className="empty-detail-icon">
            <KeyRound size={36} />
          </div>
          <div className="empty-detail-text">选择一个密码条目</div>
          <div className="empty-detail-hint">从左侧列表中选择或创建新条目</div>
        </div>
      </div>
    )
  }

  const category = categories.find(c => c.id === entry.categoryId)

  const copyToClipboard = async (text: string, label: string) => {
    await api.clipboard.copy(text)
    showToast(`${label}已复制到剪贴板`)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(entry.id)
    setConfirmDelete(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="entry-detail">
      <div className="entry-detail-header">
        <div className="entry-detail-header-left">
          <div
            className="entry-detail-icon"
            style={{ background: category?.color || '#636E72' }}
          >
            {entry.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="entry-detail-title">{entry.title}</div>
            <div className="entry-detail-category">
              {category?.name || '未分类'}
            </div>
          </div>
        </div>
        <div className="entry-detail-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(entry)}>
            <Edit3 size={14} />
            编辑
          </button>
          <button
            className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleDelete}
          >
            <Trash2 size={14} />
            {confirmDelete ? '确认删除' : '删除'}
          </button>
        </div>
      </div>

      <div className="entry-detail-body">
        {entry.username && (
          <div className="detail-field">
            <div className="detail-field-label">
              <User size={12} style={{ marginRight: 6 }} />
              用户名
            </div>
            <div className="detail-field-value">
              <span className="detail-field-text">{entry.username}</span>
              <div className="detail-field-actions">
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => copyToClipboard(entry.username, '用户名')}
                  title="复制"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="detail-field">
          <div className="detail-field-label">
            <Key size={12} style={{ marginRight: 6 }} />
            密码
          </div>
          <div className="detail-field-value">
            <span className={`detail-field-text ${showPassword ? '' : 'masked'}`}>
              {showPassword ? entry.password : '••••••••••••'}
            </span>
            <div className="detail-field-actions">
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? '隐藏' : '显示'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => copyToClipboard(entry.password, '密码')}
                title="复制"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        {entry.url && (
          <div className="detail-field">
            <div className="detail-field-label">
              <Globe size={12} style={{ marginRight: 6 }} />
              网站
            </div>
            <div className="detail-field-value">
              <span className="detail-field-text">{entry.url}</span>
              <div className="detail-field-actions">
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => {
                    const url = entry.url.startsWith('http') ? entry.url : `https://${entry.url}`
                    api.shell.openExternal(url)
                  }}
                  title="在浏览器中打开"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => copyToClipboard(entry.url, '网址')}
                  title="复制"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {entry.notes && (
          <div className="detail-field">
            <div className="detail-field-label">
              <FileText size={12} style={{ marginRight: 6 }} />
              备注
            </div>
            <div className="detail-notes">{entry.notes}</div>
          </div>
        )}

        <div className="detail-meta">
          <div className="detail-meta-item">
            <Clock size={12} style={{ marginRight: 4 }} />
            创建时间: <span>{formatDate(entry.createdAt)}</span>
          </div>
          <div className="detail-meta-item">
            <Clock size={12} style={{ marginRight: 4 }} />
            更新时间: <span>{formatDate(entry.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
