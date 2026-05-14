import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Bell, X } from 'lucide-react'

const DISMISSED_KEY = 'rowlr_dismissed_reminders'

export default function BillReminders({ userId }) {
  const [dueBills, setDueBills] = useState([])
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    async function fetchDueBills() {
      const today = new Date()
      const in3Days = new Date()
      in3Days.setDate(today.getDate() + 3)

      const { data } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', false)
        .lte('due_date', in3Days.toISOString().split('T')[0])
        .order('due_date', { ascending: true })

      setDueBills(data || [])
    }

    fetchDueBills()
  }, [userId])

  function dismissBill(id) {
    const newDismissed = [...dismissed, id]
    setDismissed(newDismissed)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed))
  }

  function dismissAll() {
    const allIds = dueBills.map(b => b.id)
    const newDismissed = [...dismissed, ...allIds]
    setDismissed(newDismissed)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(newDismissed))
  }

  const visibleBills = dueBills.filter(b => !dismissed.includes(b.id))
  if (visibleBills.length === 0) return null

  const today = new Date(); today.setHours(0,0,0,0)

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '12px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Bell size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 6px' }}>
            {visibleBills.length} bill{visibleBills.length > 1 ? 's' : ''} due soon!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {visibleBills.map(bill => {
              const due = new Date(bill.due_date + 'T00:00:00')
              const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
              const label = diffDays < 0 ? '🔴 Overdue!' : diffDays === 0 ? '🟡 Due today!' : `🟠 Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
              return (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#92400e' }}>
                      <strong>{bill.name}</strong> — {label}
                    </span>
                  </div>
                  <button onClick={() => dismissBill(bill.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', display: 'flex', flexShrink: 0 }}>
                    <X size={12} />
                  </button>
                </div>
              )
            })}
          </div>
          {visibleBills.length > 1 && (
            <button onClick={dismissAll} style={{ fontSize: 11, color: '#d97706', background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, padding: 0, textDecoration: 'underline' }}>
              Dismiss all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}