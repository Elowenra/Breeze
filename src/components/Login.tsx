import { useState } from 'react'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import ResetModal from './ResetModal'

interface LoginProps {
  hasVault: boolean
  onLogin: (password: string, isCreate: boolean) => Promise<void>
  onReset: () => void
}

export default function Login({ hasVault, onLogin, onReset }: LoginProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const isCreate = !hasVault

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('请输入主密码')
      return
    }

    if (isCreate && password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      await onLogin(password, isCreate)
    } catch (err: any) {
      setError(err.message || '密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-icon">
          <Shield size={32} />
        </div>
        <h1 className="login-title">Breeze</h1>
        <p className="login-subtitle">
          {isCreate ? '创建您的本地密码保险库' : '输入主密码解锁保险库'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="主密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isCreate && (
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="确认主密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <div className="login-error">{error}</div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : isCreate ? (
              '创建保险库'
            ) : (
              '解锁'
            )}
          </button>
        </form>

        <p className="login-hint">
          {isCreate
            ? '请牢记主密码，丢失后无法恢复数据'
            : '数据仅存储在本地，使用 AES-256 加密'}
        </p>

        {!isCreate && (
          <button
            className="btn btn-ghost btn-sm login-reset-btn"
            onClick={() => setShowResetModal(true)}
          >
            忘记密码？重置保险库
          </button>
        )}
      </div>

      {showResetModal && (
        <ResetModal
          onReset={() => {
            setShowResetModal(false)
            onReset()
          }}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  )
}
