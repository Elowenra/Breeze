import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '../utils/ipc'

interface ResetModalProps {
  onReset: () => void
  onClose: () => void
}

export default function ResetModal({ onReset, onClose }: ResetModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const CONFIRM_WORD = '重置保险库'

  const handleReset = async () => {
    if (confirmText !== CONFIRM_WORD) {
      setError('请输入正确的确认文字')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await api.vault.reset()
      if (result.success) {
        onReset()
      } else {
        setError(result.error || '重置失败')
      }
    } catch (err: any) {
      setError(err.message || '重置失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: 'var(--danger)' }}>
            <AlertTriangle size={20} style={{ marginRight: 8 }} />
            重置保险库
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="reset-warning">
            <p><strong>警告：此操作不可撤销！</strong></p>
            <ul>
              <li>所有保存的密码将被永久删除</li>
              <li>所有分类将被清除</li>
              <li>此操作无法恢复</li>
            </ul>
          </div>

          <div className="form-group">
            <label className="form-label">
              请输入 <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{CONFIRM_WORD}</span> 以确认操作
            </label>
            <input
              type="text"
              className="input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              placeholder="输入确认文字"
              autoFocus
            />
          </div>

          {error && <div className="login-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button
            className="btn btn-danger"
            onClick={handleReset}
            disabled={loading || confirmText !== CONFIRM_WORD}
          >
            {loading ? <Loader2 size={16} className="spin" /> : '确认重置'}
          </button>
        </div>
      </div>
    </div>
  )
}
