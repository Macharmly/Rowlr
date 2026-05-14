import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, Loader2, X, Pencil, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'
import ConfirmDialog from './ConfirmDialog'

const INCOME_SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Allowance', 'Other']

function IncomeModal({ userId, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    amount: existing?.amount || '',
    source: existing?.source || 'Salary',
    date: existing?.date || new Date().toISOString().split('T')[0],
    notes: existing?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    setSaving(true); setError(null)

    if (existing) {
      const { data, error } = await supabase.from('income').update({
        amount: parseFloat(form.amount), source: form.source,
        date: form.date, notes: form.notes.trim() || null,
      }).eq('id', existing.id).select().single()
      if (error) setError('Failed to update income.')
      else { onSaved(data); onClose() }
    } else {
      const { data, error } = await supabase.from('income').insert([{
        user_id: userId, amount: parseFloat(form.amount), source: form.source,
        date: form.date, notes: form.notes.trim() || null,
      }]).select().single()
      if (error) setError('Failed to save income.')
      else { onSaved(data); onClose() }
    }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{existing ? 'Edit Income' : 'Add Income'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Amount (₱) *</label>
            <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" style={s.input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Source</label>
              <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} style={s.input}>
                {INCOME_SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={s.input} />
            </div>
          </div>
          <div>
            <label style={s.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. March salary" style={s.input} />
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> {existing ? 'Save Changes' : 'Add Income'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function IncomeSection({ userId, currency = 'PHP', rate = 1 }) {
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchIncome() }, [])

  async function fetchIncome() {
    setLoading(true)
    const { data } = await supabase.from('income').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10)
    setIncome(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('income').delete().eq('id', id)
    setIncome(prev => prev.filter(i => i.id !== id))
  }

  function handleSaved(item) {
    if (editingIncome) setIncome(prev => prev.map(i => i.id === item.id ? item : i))
    else setIncome(prev => [item, ...prev])
    setEditingIncome(null)
  }

  const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0)
  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <TrendingUp size={14} color="#16a34a" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Income</h3>
          </div>
          <button onClick={() => { setEditingIncome(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {income.length > 0 && (
          <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#16a34a', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Total Income</p>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#16a34a', margin: 0 }}>{fmt(totalIncome)}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : income.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <TrendingUp size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>No income recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {income.map(item => {
              const date = new Date(item.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
              return (
                <div key={item.id} className="group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notes || item.source}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{item.source}</span>
                      <span style={{ fontSize: 11, color: 'var(--border)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{date}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{fmt(item.amount)}</span>
                    <button onClick={() => { setEditingIncome(item); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 3 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setConfirmDelete(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 3 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <IncomeModal userId={userId} existing={editingIncome} onClose={() => { setShowModal(false); setEditingIncome(null) }} onSaved={handleSaved} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Income?"
          message={`Are you sure you want to delete this income of ₱${parseFloat(confirmDelete.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}