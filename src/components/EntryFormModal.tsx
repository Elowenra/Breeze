import { useState, useEffect } from 'react'
import { X, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Entry, Category } from '../../electron/types'
import { generatePassword, getPasswordStrength, PasswordOptions, DEFAULT_OPTIONS } from '../utils/password'

interface EntryFormModalProps {
  entry: Entry | null
  categories: Category[]
  onSave: (entry: Partial<Entry>) => void
  onClose: () => void
}

export default function EntryFormModal({
  entry,
  categories,
  onSave,
  onClose
}: EntryFormModalProps) {
  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [categoryId, setCategoryId] = useState('other')
  const [notes, setNotes] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [genOptions, setGenOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS)

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setUsername(entry.username)
      setPassword(entry.password)
      setUrl(entry.url)
      setCategoryId(entry.categoryId)
      setNotes(entry.notes)
    }
  }, [entry])

  const handleSubmit = () => {
    if (!title || !password) return

    onSave({
      title,
      username,
      password,
      url,
      categoryId,
      notes,
      favorite: entry?.favorite || false
    })
  }

  const handleGenerate = () => {
    const newPassword = generatePassword(genOptions)
    setPassword(newPassword)
  }

  const strength = getPasswordStrength(password)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{entry ? '编辑条目' : '新建条目'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" onKeyDown={handleKeyDown}>
          <div className="form-group">
            <label className="form-label">标题 *</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：Google, GitHub"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="邮箱或用户名"
              />
            </div>
            <div className="form-group">
              <label className="form-label">分类</label>
              <select
                className="input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">密码 *</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${(strength.score / 7) * 100}%`,
                      background: strength.color
                    }}
                  />
                </div>
                <span
                  className="password-strength-label"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
            )}

            <div className="password-generator">
              <div className="password-generator-header">
                <span className="password-generator-label">密码生成器</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowGenerator(!showGenerator)}
                >
                  {showGenerator ? '收起' : '展开'}
                </button>
              </div>

              {showGenerator && (
                <>
                  <div className="password-options">
                    <label className="password-option">
                      <input
                        type="checkbox"
                        checked={genOptions.uppercase}
                        onChange={(e) =>
                          setGenOptions({ ...genOptions, uppercase: e.target.checked })
                        }
                      />
                      大写字母
                    </label>
                    <label className="password-option">
                      <input
                        type="checkbox"
                        checked={genOptions.lowercase}
                        onChange={(e) =>
                          setGenOptions({ ...genOptions, lowercase: e.target.checked })
                        }
                      />
                      小写字母
                    </label>
                    <label className="password-option">
                      <input
                        type="checkbox"
                        checked={genOptions.numbers}
                        onChange={(e) =>
                          setGenOptions({ ...genOptions, numbers: e.target.checked })
                        }
                      />
                      数字
                    </label>
                    <label className="password-option">
                      <input
                        type="checkbox"
                        checked={genOptions.symbols}
                        onChange={(e) =>
                          setGenOptions({ ...genOptions, symbols: e.target.checked })
                        }
                      />
                      特殊符号
                    </label>
                  </div>
                  <div className="form-group" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="form-label">
                      长度: {genOptions.length}
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="64"
                      value={genOptions.length}
                      onChange={(e) =>
                        setGenOptions({ ...genOptions, length: parseInt(e.target.value) })
                      }
                      style={{ width: '100%' }}
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGenerate}
                style={{ marginTop: 12, width: '100%' }}
              >
                <RefreshCw size={14} />
                生成随机密码
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">网址</label>
            <input
              type="text"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="可选备注信息..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {entry ? '保存修改' : '创建条目'}
          </button>
        </div>
      </div>
    </div>
  )
}
