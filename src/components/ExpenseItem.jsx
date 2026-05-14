import { useState } from 'react'
import { Trash2, Pencil, X, Check, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt } from '../lib/currency'
import ConfirmDialog from './ConfirmDialog'

const CATEGORY_COLORS = {
  Food:          { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' },
  Transport:     { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
  Shopping:      { bg: '#fdf2f8', text: '#ec4899', border: '#fbcfe8' },
  Bills:         { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
  Health:        { bg: '#f0fdf4', text: '#22c55e', border: '#bbf7d0' },
  Entertainment: { bg: '#faf5ff', text: '#a855f7', border: '#e9d5ff' },
  Education:     { bg: '#eef2ff', text: '#6366f1', border: '#c7d2fe' },
  Savings:       { bg: '#f0fdfa', text: '#14b8a6', border: '#99f6e4' },
  Other:         { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Savings', 'Other']
const PAYMENT_METHODS = ['Cash', 'GCash', 'Maya', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other']

function EditExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    notes: expense.notes || '',
    payment_method: expense.payment_method,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    setSaving(true); setError(null)

    const oldAmount = parseFloat(expense.amount)
    const newAmount = parseFloat(form.amount)
    const diff = newAmount - oldAmount

    try {
      // Update expense
      const { data, error } = await supabase.from('expenses').update({
        amount: newAmount,
        category: form.category,
        date: form.date,
        notes: form.notes.trim() || null,
        payment_method: form.payment_method,
      }).eq('id', expense.id).select().single()

      if (error) throw error

      // Adjust wallet balance if linked and amount changed
      if (expense.wallet_id && diff !== 0) {
        const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', expense.wallet_id).single()
        if (wallet) {
          const newBalance = parseFloat(wallet.balance) - diff
          await supabase.from('wallets').update({ balance: newBalance }).eq('id', expense.wallet_id)
        }
      }

      onSaved(data)
      onClose()
    } catch (err) {
      setError('Failed to update expense.')
    }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Edit Expense</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Amount (₱ PHP) *</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={s.input} />
            {expense.wallet_id && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, marginBottom: 0 }}>
                ⚡ Wallet balance will be adjusted automatically if amount changes.
              </p>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} style={s.input}>
                {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={s.label}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Lunch with friends" style={s.input} />
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExpenseItem({ expense, onDelete, onUpdated, currency = 'PHP', rate = 1 }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const color = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other
  const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

  async function handleDelete() {
    if (expense.wallet_id) {
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', expense.wallet_id).single()
      if (wallet) await supabase.from('wallets').update({ balance: parseFloat(wallet.balance) + parseFloat(expense.amount) }).eq('id', expense.wallet_id)
    }
    await supabase.from('expenses').delete().eq('id', expense.id)
    onDelete(expense.id)
  }

  return (
    <>
      <div className="group animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, transition: 'border 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}>
          {expense.category}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {expense.notes || expense.category}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{formattedDate}</span>
            <span style={{ fontSize: 11, color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{expense.payment_method}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {fmt(expense.amount, currency, rate)}
          </span>
          {currency !== 'PHP' && (
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>₱{parseFloat(expense.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}
          ref={el => { if (el) { el.closest('.group').addEventListener('mouseenter', () => el.style.opacity = 1); el.closest('.group').addEventListener('mouseleave', () => el.style.opacity = 0) } }}
        >
          <button onClick={() => setShowEdit(true)} style={{ padding: 5, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          ><Pencil size={13} /></button>
          <button onClick={() => setShowConfirm(true)} style={{ padding: 5, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.backgroundColor = 'transparent' }}
          ><Trash2 size={13} /></button>
        </div>
      </div>
      {showEdit && <EditExpenseModal expense={expense} onClose={() => setShowEdit(false)} onSaved={updated => { onUpdated(updated); setShowEdit(false) }} />}
      {showConfirm && (
        <ConfirmDialog
          title="Delete Expense?"
          message={`Are you sure you want to delete this expense of ₱${parseFloat(expense.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}?${expense.wallet_id ? ' The amount will be restored to your wallet.' : ''}`}
          onConfirm={handleDelete}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}