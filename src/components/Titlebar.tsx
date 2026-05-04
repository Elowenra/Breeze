import { Minus, Square, X } from 'lucide-react'
import { api } from '../utils/ipc'

export default function Titlebar() {
  return (
    <div className="titlebar">
      <div className="titlebar-drag" />
      <div className="titlebar-buttons">
        <button className="titlebar-btn" onClick={() => api.window.minimize()}>
          <Minus size={14} />
        </button>
        <button className="titlebar-btn" onClick={() => api.window.maximize()}>
          <Square size={12} />
        </button>
        <button className="titlebar-btn close" onClick={() => api.window.close()}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
