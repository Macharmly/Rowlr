import { useState, useEffect } from 'react'
import { Target, Plus, X, Loader2, Pencil, Check, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ConfirmDialog from './ConfirmDialog'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Savings', 'Other']

function BudgetModal({ userId, existing, onClose, onSaved }) {
  const now = new Date()
  const [form, setForm] = useState({
    category: existing?.category || 'Food',
    amount: existing?.amount || '',
    month: existing?.month || now.getMonth() + 1,
    year: existing?.year || now.getFullYear(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    setSaving(true); setError(null)

    if (existing) {
      const { data, error } = await supabase.from('budgets').update({ amount: parseFloat(form.amount) }).eq('id', existing.id).select().single()
      if (error) setError('Failed to update budget.')
      else { onSaved(data); onClose() }
    } else {
      const { data, error } = await supabase.from('budgets').upsert([{
        user_id: userId, category: form.category,
        amount: parseFloat(form.amount), month: parseInt(form.month), year: parseInt(form.year),
      }], { onConflict: 'user_id,category,month,year' }).select().single()
      if (error) setError('Failed to save budget.')
      else { onSaved(data); onClose() }
    }
    setSaving(false)
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{existing ? 'Edit Budget' : 'Set Budget Goal'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!existing && (
            <div>
              <label style={s.label}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={s.label}>Monthly Budget Limit (₱) *</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 3000" style={s.input} />
          </div>
          {!existing && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={s.label}>Month</label>
                <select value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} style={s.input}>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Year</label>
                <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} style={s.input} />
              </div>
            </div>
          )}
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> {existing ? 'Update' : 'Set Budget'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BudgetGoals({ userId, expenses, currency = 'PHP' }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const now = new Date()

  useEffect(() => {
    async function fetchBudgets() {
      setLoading(true)
      const { data } = await supabase.from('budgets').select('*')
        .eq('user_id', userId)
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear())
        .order('category', { ascending: true })
      setBudgets(data || [])
      setLoading(false)
    }
    fetchBudgets()
  }, [userId])

  async function handleDelete(id) {
    await supabase.from('budgets').delete().eq('id', id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  function handleSaved(budget) {
    if (editingBudget) setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b))
    else setBudgets(prev => {
      const exists = prev.find(b => b.id === budget.id)
      return exists ? prev.map(b => b.id === budget.id ? budget : b) : [...prev, budget]
    })
    setEditingBudget(null)
  }

  // Calculate spending per category this month
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const categorySpending = expenses
    .filter(e => e.date >= monthStart)
    .reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount); return acc }, {})

  const symbol = currency === 'PHP' ? '₱' : currency
  const fmtAmt = (amt) => `${symbol}${parseFloat(amt || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Target size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Budget Goals</h3>
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{now.toLocaleString('default', { month: 'long' })} {now.getFullYear()}</span>
          </div>
          <button onClick={() => { setEditingBudget(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Target size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>No budget goals set yet.</p>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>Set limits to track your spending!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {budgets.map(budget => {
              const spent = categorySpending[budget.category] || 0
              const pct = Math.min((spent / parseFloat(budget.amount)) * 100, 100)
              const isOver = spent > parseFloat(budget.amount)
              const isClose = !isOver && pct >= 80
              const barColor = isOver ? '#ef4444' : isClose ? '#f97316' : '#16a34a'
              const bgColor = isOver ? '#fef2f2' : isClose ? '#fff7ed' : 'var(--input-bg)'
              const borderColor = isOver ? '#fecaca' : isClose ? '#fed7aa' : 'var(--border)'

              return (
                <div key={budget.id} style={{ padding: '10px 12px', backgroundColor: bgColor, border: `1px solid ${borderColor}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{budget.category}</span>
                      {isOver && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>Over!</span>}
                      {isClose && !isOver && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, backgroundColor: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}>80%+</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: isOver ? '#ef4444' : 'var(--text-muted)', fontWeight: isOver ? 700 : 400 }}>
                        {fmtAmt(spent)} / {fmtAmt(budget.amount)}
                      </span>
                      <button onClick={() => { setEditingBudget(budget); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setConfirmDelete(budget)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 2 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4, marginBottom: 0 }}>
                    {isOver ? `${fmtAmt(spent - parseFloat(budget.amount))} over budget` : `${fmtAmt(parseFloat(budget.amount) - spent)} remaining`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal userId={userId} existing={editingBudget} onClose={() => { setShowModal(false); setEditingBudget(null) }} onSaved={handleSaved} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Budget Goal?"
          message={`Are you sure you want to delete the budget for ${confirmDelete.category}?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}