import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, Check, PiggyBank, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'
import ConfirmDialog from './ConfirmDialog'

function GoalModal({ userId, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: existing?.name || '',
    target_amount: existing?.target_amount || '',
    target_date: existing?.target_date || '',
    notes: existing?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Goal name is required.'); return }
    if (!form.target_amount || parseFloat(form.target_amount) <= 0) { setError('Please enter a valid target amount.'); return }
    setSaving(true); setError(null)

    if (existing) {
      const { data, error } = await supabase.from('savings_goals').update({
        name: form.name.trim(),
        target_amount: parseFloat(form.target_amount),
        target_date: form.target_date || null,
        notes: form.notes.trim() || null,
      }).eq('id', existing.id).select().single()
      if (error) setError('Failed to update goal.')
      else { onSaved(data, true); onClose() }
    } else {
      const { data, error } = await supabase.from('savings_goals').insert([{
        user_id: userId,
        name: form.name.trim(),
        target_amount: parseFloat(form.target_amount),
        current_amount: 0,
        target_date: form.target_date || null,
        notes: form.notes.trim() || null,
      }]).select().single()
      if (error) setError('Failed to save goal.')
      else { onSaved(data, false); onClose() }
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
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{existing ? 'Edit Goal' : 'New Savings Goal'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Goal Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Buy a Laptop" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Target Amount (₱) *</label>
            <input type="number" step="0.01" min="0" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} placeholder="e.g. 25000" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Target Date <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <input type="date" value={form.target_date} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Notes <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. For my work from home setup" style={s.input} />
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> {existing ? 'Update' : 'Create Goal'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddFundsModal({ goal, onClose, onAdded, currency, rate }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fmt = (amt) => fmtCurrency(amt, currency, rate)
  const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount)
  const toPhp = (amt) => currency === 'PHP' ? parseFloat(amt) : parseFloat(amt) / rate

  async function handleSubmit(e) {
    e.preventDefault()
    const phpAmount = toPhp(amount)
    if (!amount || isNaN(phpAmount) || phpAmount <= 0) { setError('Please enter a valid amount.'); return }
    if (phpAmount > remaining) { setError(`Amount exceeds remaining target of ${fmt(remaining)}`); return }
    setSaving(true); setError(null)

    const newAmount = parseFloat(goal.current_amount) + phpAmount
    const completed = newAmount >= parseFloat(goal.target_amount)

    const { data, error } = await supabase.from('savings_goals')
      .update({ current_amount: newAmount, completed })
      .eq('id', goal.id).select().single()

    if (error) setError('Failed to add funds.')
    else { onAdded(data); onClose() }
    setSaving(false)
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Add Funds</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px' }}>Adding to: <strong style={{ color: 'var(--text)' }}>{goal.name}</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining:</span>
              <strong style={{ fontSize: 12, color: 'var(--text)' }}>{fmt(remaining)}</strong>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Amount ({currency}) *
            </label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Up to ${fmt(remaining)}`} style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
            {currency !== 'PHP' && amount && !isNaN(parseFloat(amount)) && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, marginBottom: 0 }}>
                ≈ ₱{toPhp(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} PHP
              </p>
            )}
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Plus size={13} /> Add Funds</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function WithdrawFundsModal({ goal, onClose, onWithdrawn, currency, rate }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fmt = (amt) => fmtCurrency(amt, currency, rate)
  const toPhp = (amt) => currency === 'PHP' ? parseFloat(amt) : parseFloat(amt) / rate

  async function handleSubmit(e) {
    e.preventDefault()
    const phpAmount = toPhp(amount)
    if (!amount || isNaN(phpAmount) || phpAmount <= 0) { setError('Please enter a valid amount.'); return }
    if (phpAmount > parseFloat(goal.current_amount)) {
      setError(`Cannot withdraw more than current savings of ${fmt(goal.current_amount)}`)
      return
    }
    setSaving(true); setError(null)

    const newAmount = parseFloat(goal.current_amount) - phpAmount
    const { data, error } = await supabase.from('savings_goals')
      .update({ current_amount: newAmount, completed: false })
      .eq('id', goal.id).select().single()

    if (error) setError('Failed to withdraw funds.')
    else { onWithdrawn(data); onClose() }
    setSaving(false)
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Withdraw Funds</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 4px' }}>Withdrawing from: <strong>{goal.name}</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#dc2626' }}>Current savings:</span>
              <strong style={{ fontSize: 12, color: '#dc2626' }}>{fmt(goal.current_amount)}</strong>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Withdraw Amount ({currency}) *
            </label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Up to ${fmt(goal.current_amount)}`} style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
            {currency !== 'PHP' && amount && !isNaN(parseFloat(amount)) && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, marginBottom: 0 }}>
                ≈ ₱{toPhp(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })} PHP
              </p>
            )}
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Withdrawing...</> : '− Withdraw Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SavingsGoals({ userId, currency = 'PHP', rate = 1 }) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [addingFundsGoal, setAddingFundsGoal] = useState(null)
  const [withdrawingGoal, setWithdrawingGoal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [filter, setFilter] = useState('Active')

  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  useEffect(() => { fetchGoals() }, [])

  async function fetchGoals() {
    setLoading(true)
    const { data } = await supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('savings_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  function handleSaved(goal, isEdit) {
    if (isEdit) setGoals(prev => prev.map(g => g.id === goal.id ? goal : g))
    else setGoals(prev => [goal, ...prev])
    setEditingGoal(null)
  }

  function handleFundsAdded(updatedGoal) {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  function handleWithdrawn(updatedGoal) {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g))
  }

  const filtered = goals.filter(g => {
    if (filter === 'Active') return !g.completed
    if (filter === 'Completed') return g.completed
    return true
  })

  const totalSaved = goals.reduce((s, g) => s + parseFloat(g.current_amount), 0)
  const totalTarget = goals.reduce((s, g) => s + parseFloat(g.target_amount), 0)

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <PiggyBank size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Savings Goals</h3>
          </div>
          <button onClick={() => { setEditingGoal(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {goals.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
              <p style={{ fontSize: 10, color: '#16a34a', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Saved</p>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: '#16a34a', margin: 0 }}>{fmt(totalSaved)}</p>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Target</p>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{fmt(totalTarget)}</p>
            </div>
          </div>
        )}

        {goals.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['All', 'Active', 'Completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: filter === f ? 'var(--accent)' : 'var(--card)', color: filter === f ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <PiggyBank size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
              {filter === 'Completed' ? 'No completed goals yet.' : filter === 'Active' ? 'No active goals. Create one!' : 'No savings goals yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(goal => {
              const pct = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100)
              const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount)
              const barColor = goal.completed ? '#16a34a' : pct >= 75 ? '#f97316' : '#3b82f6'

              let estimatedDate = null
              if (!goal.completed && goal.target_date) {
                const today = new Date()
                const target = new Date(goal.target_date + 'T00:00:00')
                const daysLeft = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
                estimatedDate = daysLeft > 0 ? `${daysLeft} days left` : 'Past due date'
              }

              return (
                <div key={goal.id} style={{ padding: '12px 14px', backgroundColor: goal.completed ? '#f0fdf4' : 'var(--input-bg)', border: `1px solid ${goal.completed ? '#bbf7d0' : 'var(--border)'}`, borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{goal.name}</span>
                        {goal.completed && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>🎉 Done!</span>}
                      </div>
                      {goal.notes && <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '0 0 6px' }}>{goal.notes}</p>}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 1px', textTransform: 'uppercase' }}>Saved</p>
                          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: '#16a34a', margin: 0 }}>{fmt(goal.current_amount)}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 1px', textTransform: 'uppercase' }}>Target</p>
                          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{fmt(goal.target_amount)}</p>
                        </div>
                        {!goal.completed && (
                          <div>
                            <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 1px', textTransform: 'uppercase' }}>Remaining</p>
                            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{fmt(remaining)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                      {!goal.completed && (
                        <button onClick={() => setAddingFundsGoal(goal)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '5px 10px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <Plus size={11} /> Add Funds
                        </button>
                      )}
                      {parseFloat(goal.current_amount) > 0 && !goal.completed && (
                        <button onClick={() => setWithdrawingGoal(goal)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '5px 10px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          − Withdraw
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditingGoal(goal); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 3 }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setConfirmDelete(goal)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 3 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{estimatedDate || (goal.completed ? 'Goal reached! 🎉' : 'No due date')}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: goal.completed ? '#16a34a' : 'var(--text-muted)' }}>{Math.round(pct)}%</span>
                    </div>
                    <div style={{ height: 8, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <GoalModal userId={userId} existing={editingGoal} onClose={() => { setShowModal(false); setEditingGoal(null) }} onSaved={handleSaved} />
      )}
      {addingFundsGoal && (
        <AddFundsModal goal={addingFundsGoal} onClose={() => setAddingFundsGoal(null)} onAdded={handleFundsAdded} currency={currency} rate={rate} />
      )}
      {withdrawingGoal && (
        <WithdrawFundsModal goal={withdrawingGoal} onClose={() => setWithdrawingGoal(null)} onWithdrawn={handleWithdrawn} currency={currency} rate={rate} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Goal?"
          message={`Are you sure you want to delete "${confirmDelete.name}"?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}