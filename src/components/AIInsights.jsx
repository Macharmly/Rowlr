import { useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, Lightbulb, TrendingUp, RefreshCw } from 'lucide-react'
import { getSpendingInsights } from '../lib/ai'

const TYPES = {
  warning:  { icon: AlertTriangle, bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  tip:      { icon: Lightbulb,     bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  positive: { icon: TrendingUp,    bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
}

export default function AIInsights({ expenses }) {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  async function generate() {
    if (expenses.length === 0) return
    setLoading(true)
    const result = await getSpendingInsights(expenses)
    setInsights(result)
    setGenerated(true)
    setLoading(false)
  }

  return (
    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={14} color="var(--text)" />
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>AI Insights</h3>
        </div>
        <button onClick={generate} disabled={loading || expenses.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: expenses.length === 0 ? 0.4 : 1 }}>
          {loading ? <><Loader2 size={11} className="animate-spin" /> Analyzing...</> : generated ? <><RefreshCw size={11} /> Refresh</> : <><Sparkles size={11} /> Analyze</>}
        </button>
      </div>

      {!generated && !loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Sparkles size={22} color="var(--border)" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Click Analyze to get AI spending insights</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Loader2 size={18} color="var(--text-subtle)" className="animate-spin" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Analyzing your spending...</p>
        </div>
      )}

      {generated && !loading && insights.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '16px 0' }}>No insights available. Add more expenses!</p>
      )}

      {insights.length > 0 && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((insight, i) => {
            const style = TYPES[insight.type] || TYPES.tip
            const Icon = style.icon
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 12, backgroundColor: style.bg, border: `1px solid ${style.border}` }}>
                <Icon size={12} color={style.text} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5 }}>{insight.message}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}