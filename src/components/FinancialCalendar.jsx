import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { fmt as fmtCurrency } from '../lib/currency'

const CATEGORY_COLORS = {
  Food: '#f97316', Transport: '#3b82f6', Shopping: '#ec4899',
  Bills: '#ef4444', Health: '#22c55e', Entertainment: '#a855f7',
  Education: '#6366f1', Savings: '#14b8a6', Other: '#6b7280',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function FinancialCalendar({ expenses, currency = 'PHP', rate = 1 }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedDay, setSelectedDay] = useState(null)

  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return map
  }, [expenses])

  // Build calendar grid
  const { year, month } = viewDate
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false, dateStr: null })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, current: true, dateStr })
  }
  // Next month padding
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, dateStr: null })
  }

  function prevMonth() {
    setViewDate(v => {
      if (v.month === 0) return { year: v.year - 1, month: 11 }
      return { year: v.year, month: v.month - 1 }
    })
    setSelectedDay(null)
  }

  function nextMonth() {
    setViewDate(v => {
      if (v.month === 11) return { year: v.year + 1, month: 0 }
      return { year: v.year, month: v.month + 1 }
    })
    setSelectedDay(null)
  }

  const selectedExpenses = selectedDay ? (expensesByDate[selectedDay] || []) : []
  const selectedTotal = selectedExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)

  // Monthly total
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const monthTotal = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + parseFloat(e.amount), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Calendar card */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          ><ChevronLeft size={18} /></button>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {MONTHS[month]} {year}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '2px 0 0' }}>
              Total: {fmt(monthTotal)}
            </p>
          </div>

          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          ><ChevronRight size={18} /></button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((cell, i) => {
            const hasExpenses = cell.current && cell.dateStr && expensesByDate[cell.dateStr]
            const dayExpenses = hasExpenses ? expensesByDate[cell.dateStr] : []
            const dayTotal = dayExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
            const isToday = cell.current && cell.dateStr === today.toISOString().split('T')[0]
            const isSelected = cell.current && cell.dateStr === selectedDay

            // Get top category color for dot
            const topCat = dayExpenses.length > 0
              ? Object.entries(dayExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1])[0][0]
              : null

            return (
              <div
                key={i}
                onClick={() => cell.current && cell.dateStr && setSelectedDay(isSelected ? null : cell.dateStr)}
                style={{
                  minHeight: 52,
                  padding: '4px 6px',
                  borderRadius: 10,
                  cursor: cell.current ? 'pointer' : 'default',
                  backgroundColor: isSelected ? 'var(--accent)' : isToday ? 'var(--input-bg)' : 'transparent',
                  border: isToday && !isSelected ? '1px solid var(--border)' : '1px solid transparent',
                  opacity: cell.current ? 1 : 0.3,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (cell.current && !isSelected) e.currentTarget.style.backgroundColor = 'var(--input-bg)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = isToday ? 'var(--input-bg)' : 'transparent' }}
              >
                <span style={{ fontSize: 12, fontWeight: isToday || isSelected ? 700 : 400, color: isSelected ? 'var(--bg)' : isToday ? 'var(--text)' : 'var(--text-muted)', display: 'block', marginBottom: 3 }}>
                  {cell.day}
                </span>

                {hasExpenses && dayExpenses.length > 0 && (
                  <>
                    <span style={{ fontSize: 9, fontWeight: 600, color: isSelected ? 'var(--bg)' : 'var(--text-subtle)', display: 'block', lineHeight: 1.2 }}>
                      {fmt(dayTotal)}
                    </span>
                    <div style={{ display: 'flex', gap: 2, marginTop: 3, flexWrap: 'wrap' }}>
                      {dayExpenses.slice(0, 3).map((_, idx) => (
                        <div key={idx} style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: isSelected ? 'var(--bg)' : (CATEGORY_COLORS[dayExpenses[idx].category] || '#6b7280') }} />
                      ))}
                      {dayExpenses.length > 3 && (
                        <span style={{ fontSize: 8, color: isSelected ? 'var(--bg)' : 'var(--text-subtle)' }}>+{dayExpenses.length - 3}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color }} />
              <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day breakdown */}
      {selectedDay && (
        <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {selectedExpenses.length} expense{selectedExpenses.length !== 1 ? 's' : ''} · Total: <strong>{fmt(selectedTotal)}</strong>
              </p>
            </div>
            <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {selectedExpenses.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '12px 0', margin: 0 }}>No expenses on this day.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedExpenses.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CATEGORY_COLORS[e.category] || '#6b7280', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{e.notes || e.category}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: 0 }}>{e.category} · {e.payment_method}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>{fmt(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}