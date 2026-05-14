import { useMemo, useState } from 'react'
import { BarChart2, Download } from 'lucide-react'
import { exportAnalyticsPDF } from '../lib/exportPDF'

const CATEGORY_COLORS_LIST = ['#f97316','#3b82f6','#ec4899','#ef4444','#22c55e','#a855f7','#6366f1','#14b8a6','#6b7280']
const CATEGORIES = ['Food','Transport','Shopping','Bills','Health','Entertainment','Education','Savings','Other']
const RANGES = ['7 Days', '4 Weeks', '12 Months']

function getBarData(expenses, range) {
  const now = new Date()
  if (range === '7 Days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(now.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const total = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + parseFloat(e.amount), 0)
      return { label: d.toLocaleDateString('en-PH', { weekday: 'short' }), sublabel: d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }), total, isNow: i === 6 }
    })
  }
  if (range === '4 Weeks') {
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date()
      weekStart.setDate(now.getDate() - (3 - i) * 7 - now.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const startStr = weekStart.toISOString().split('T')[0]
      const endStr = weekEnd.toISOString().split('T')[0]
      const total = expenses.filter(e => e.date >= startStr && e.date <= endStr).reduce((s, e) => s + parseFloat(e.amount), 0)
      return { label: `W${i + 1}`, sublabel: `${weekStart.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`, total, isNow: i === 3 }
    })
  }
  if (range === '12 Months') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const monthStr = String(month).padStart(2, '0')
      const total = expenses.filter(e => e.date.startsWith(`${year}-${monthStr}`)).reduce((s, e) => s + parseFloat(e.amount), 0)
      return { label: d.toLocaleDateString('en-PH', { month: 'short' }), sublabel: d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }), total, isNow: i === 11 }
    })
  }
  return []
}

export default function Analytics({ expenses, currency = 'PHP', rate = 1, displayName = 'User', budgets = [] }) {
  const [range, setRange] = useState('7 Days')

  const CURR_SYMBOLS = {'PHP':'₱','USD':'$','EUR':'€','GBP':'£','JPY':'¥','SGD':'S$','AUD':'A$','CAD':'C$','KRW':'₩','CNY':'¥','MYR':'RM','IDR':'Rp','THB':'฿','VND':'₫','INR':'₹','BRL':'R$','MXN':'$','ARS':'$','ZAR':'R','NGN':'₦'}
  const symbol = CURR_SYMBOLS[currency] || currency
  const fmt = (amt) => `${symbol}${(parseFloat(amt || 0) * rate).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`
  const fmtFull = (amt) => `${symbol}${(parseFloat(amt || 0) * rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const barData = useMemo(() => getBarData(expenses, range), [expenses, range])
  const maxBar = Math.max(...barData.map(d => d.total), 1)
  const totalInRange = barData.reduce((s, d) => s + d.total, 0)

  const rangeExpenses = useMemo(() => {
    const now = new Date()
    if (range === '7 Days') {
      const cutoff = new Date(); cutoff.setDate(now.getDate() - 6)
      return expenses.filter(e => e.date >= cutoff.toISOString().split('T')[0])
    }
    if (range === '4 Weeks') {
      const cutoff = new Date(); cutoff.setDate(now.getDate() - 27)
      return expenses.filter(e => e.date >= cutoff.toISOString().split('T')[0])
    }
    if (range === '12 Months') {
      const cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      return expenses.filter(e => e.date >= cutoff.toISOString().split('T')[0])
    }
    return expenses
  }, [expenses, range])

  const categoryData = useMemo(() => {
    const totals = rangeExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount)
      return acc
    }, {})
    const total = Object.values(totals).reduce((s, v) => s + v, 0)
    return CATEGORIES
      .filter(c => totals[c])
      .map((c, i) => ({ category: c, amount: totals[c], pct: total ? (totals[c] / total) * 100 : 0, color: CATEGORY_COLORS_LIST[i % CATEGORY_COLORS_LIST.length] }))
      .sort((a, b) => b.amount - a.amount)
  }, [rangeExpenses])

  const totalCat = rangeExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)

  if (expenses.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, textAlign: 'center' }}>
        <BarChart2 size={32} color="var(--border)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>No data to display yet.</p>
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>Add some expenses to see your analytics!</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header: Range selector + Export button ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: range === r ? 'var(--accent)' : 'var(--card)', color: range === r ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => exportAnalyticsPDF(expenses, currency, rate, displayName, budgets)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', backgroundColor: 'var(--card)', color: 'var(--text-muted)', borderRadius: 10, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <Download size={13} /> Export PDF
        </button>
      </div>

      {/* ── Bar chart ── */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Spending — {range}
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Total: {fmtFull(totalInRange)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: range === '12 Months' ? 4 : 6, height: 120 }}>
          {barData.map((bar, i) => {
            const barH = bar.total > 0 ? Math.max((bar.total / maxBar) * 90, 4) : 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${bar.sublabel}: ${fmtFull(bar.total)}`}>
                {bar.total > 0 && (
                  <span style={{ fontSize: range === '12 Months' ? 8 : 9, color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textAlign: 'center' }}>
                    {fmt(bar.total)}
                  </span>
                )}
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 90 }}>
                  <div style={{ width: '80%', height: barH, backgroundColor: bar.isNow ? 'var(--accent)' : '#3b82f6', borderRadius: '4px 4px 0 0', opacity: bar.isNow ? 1 : 0.55, transition: 'height 0.4s ease' }} />
                </div>
                <span style={{ fontSize: range === '12 Months' ? 8 : 10, color: bar.isNow ? 'var(--text)' : 'var(--text-subtle)', fontWeight: bar.isNow ? 700 : 400, textAlign: 'center' }}>
                  {bar.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Category breakdown ── */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>By Category</h3>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Total: {fmtFull(totalCat)}</span>
        </div>
        {categoryData.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '12px 0', margin: 0 }}>No expenses in this range.</p>
        ) : (
          <>
            <div style={{ height: 10, borderRadius: 99, overflow: 'hidden', display: 'flex', marginBottom: 14 }}>
              {categoryData.map((c, i) => (
                <div key={i} style={{ width: `${c.pct}%`, backgroundColor: c.color, transition: 'width 0.4s ease' }} title={`${c.category}: ${fmtFull(c.amount)}`} />
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categoryData.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 4, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${c.pct}%`, height: '100%', backgroundColor: c.color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', minWidth: 64, textAlign: 'right' }}>{fmtFull(c.amount)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)', minWidth: 32, textAlign: 'right' }}>{Math.round(c.pct)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}