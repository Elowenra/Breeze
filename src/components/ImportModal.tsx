import { useState } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

interface ImportModalProps {
  onConfirm: (password: string) => Promise<void>
  onClose: () => void
}

export default function ImportModal({ onConfirm, onClose }: ImportModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password) {
      setError('请输入主密码')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(password)
    } catch (err: any) {
      setError(err.message || '导入失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">导入保险库</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
            请输入备份文件的主密码以验证并导入
          </p>
          <div className="form-group">
            <label className="form-label">主密码</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="输入备份时的主密码"
                autoFocus
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="login-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : '导入'}
          </button>
        </div>
      </div>
    </div>
  )
}
