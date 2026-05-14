import { Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', confirmColor = '#ef4444', onConfirm, onClose }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    onClose()
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} style={{ flex: 1, padding: '10px 0', backgroundColor: confirmColor, color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {loading ? <><Loader2 size={13} className="animate-spin" /> Deleting...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}