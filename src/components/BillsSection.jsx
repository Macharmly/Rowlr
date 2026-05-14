import { useState, useEffect } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Plus, Trash2, Receipt, Loader2, X, Check, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'

const BILL_CATEGORIES = ['Rent', 'Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Subscription', 'Loan', 'Credit Card', 'Other']

function BillModal({ userId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', amount: '', due_date: '', category: 'Other', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Bill name is required.'); return }
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }
    if (!form.due_date) { setError('Due date is required.'); return }
    setSaving(true); setError(null)
    const { data, error } = await supabase.from('bills').insert([{
      user_id: userId, name: form.name.trim(), amount: parseFloat(form.amount),
      due_date: form.due_date, category: form.category,
      notes: form.notes.trim() || null, is_paid: false,
    }]).select().single()
    if (error) setError('Failed to save bill.')
    else { onSaved(data); onClose() }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Add Bill</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Bill Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Meralco Bill" style={s.input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Amount (₱) *</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" style={s.input} />
            </div>
            <div>
              <label style={s.label}>Due Date *</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} style={s.input} />
            </div>
          </div>
          <div>
            <label style={s.label}>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
              {BILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. March electricity" style={s.input} />
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Add Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Pay Bill Modal — asks which wallet to deduct from
function PayBillModal({ bill, userId, onClose, onPaid }) {
  const [wallets, setWallets] = useState([])
  const [walletId, setWalletId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWallets() {
      const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      setWallets(data || [])
      if (data && data.length > 0) setWalletId(data[0].id)
    }
    fetchWallets()
  }, [userId])

  const selectedWallet = wallets.find(w => String(w.id) === String(walletId))
  const fmt = (amt) => {
    const code = selectedWallet?.currency_code || 'PHP'
    const rate = selectedWallet?.exchange_rate || 1
    return fmtCurrency(amt, code, rate)
  }

  async function handlePay() {
    if (!walletId) { setError('Please select a wallet.'); return }
    if (selectedWallet && parseFloat(selectedWallet.balance) < parseFloat(bill.amount)) {
      setError(`Insufficient balance in ${selectedWallet.name}. Available: ${fmt(selectedWallet.balance)}`)
      return
    }
    setSaving(true); setError(null)
    try {
      // Mark bill as paid
      const { data: updatedBill, error: billError } = await supabase.from('bills').update({ is_paid: true }).eq('id', bill.id).select().single()
      if (billError) throw billError

      // Deduct from wallet
      const newBalance = parseFloat(selectedWallet.balance) - parseFloat(bill.amount)
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId)

      // Auto-add to expenses
      await supabase.from('expenses').insert([{
        user_id: userId,
        amount: parseFloat(bill.amount),
        category: 'Bills',
        date: new Date().toISOString().split('T')[0],
        notes: bill.name,
        payment_method: selectedWallet.type,
        wallet_id: walletId,
      }])

      onPaid(updatedBill)
      onClose()
    } catch (err) {
      setError('Failed to process payment.')
    }
    setSaving(false)
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Pay Bill</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Bill summary */}
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '0 0 2px' }}>{bill.name}</p>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{fmt(bill.amount)}</p>
          </div>

          {/* Wallet selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pay from Wallet</label>
            {wallets.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, margin: 0 }}>No wallets found. Add one first!</p>
            ) : (
              <>
                <select value={walletId} onChange={e => setWalletId(e.target.value)} style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' }}>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.type}) — {fmt(w.balance)}
                    </option>
                  ))}
                </select>
                {selectedWallet && (
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>
                    After payment: <strong style={{ color: parseFloat(selectedWallet.balance) >= parseFloat(bill.amount) ? 'var(--text)' : '#ef4444' }}>
                      {fmt(parseFloat(selectedWallet.balance) - parseFloat(bill.amount))}
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handlePay} disabled={saving || wallets.length === 0} style={{ flex: 1, padding: '10px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Processing...</> : <><Check size={13} /> Confirm Payment</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getBillStatus(dueDate, isPaid) {
  if (isPaid) return { label: 'Paid', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00')
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: 'Overdue', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
  if (diffDays <= 3) return { label: `Due in ${diffDays}d`, bg: '#fffbeb', text: '#d97706', border: '#fde68a' }
  if (diffDays <= 7) return { label: `Due in ${diffDays}d`, bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' }
  return { label: `Due in ${diffDays}d`, bg: 'var(--input-bg)', text: 'var(--text-muted)', border: 'var(--border)' }
}

export default function BillsSection({ userId, currency = 'PHP', rate = 1 }) {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [payingBill, setPayingBill] = useState(null)
  const [filter, setFilter] = useState('Unpaid')
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { fetchBills() }, [])

  async function fetchBills() {
    setLoading(true)
    const { data } = await supabase.from('bills').select('*').eq('user_id', userId).order('due_date', { ascending: true })
    setBills(data || [])
    setLoading(false)
  }

  async function handleUnpay(bill) {
    const { data } = await supabase.from('bills').update({ is_paid: false }).eq('id', bill.id).select().single()
    if (data) setBills(prev => prev.map(b => b.id === bill.id ? data : b))
  }

  async function handleDelete(id) {
    await supabase.from('bills').delete().eq('id', id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  function handlePaid(updatedBill) {
    setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b))
  }

  const filtered = bills.filter(b => {
    if (filter === 'Unpaid') return !b.is_paid
    if (filter === 'Paid') return b.is_paid
    return true
  })

  const unpaidTotal = bills.filter(b => !b.is_paid).reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const overdueCount = bills.filter(b => {
    if (b.is_paid) return false
    const today = new Date(); today.setHours(0,0,0,0)
    return new Date(b.due_date + 'T00:00:00') < today
  }).length
  // This uses the props passed into BillsSection
  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Receipt size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Bills</h3>
            {overdueCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                {overdueCount} overdue
              </span>
            )}
          </div>
          <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Unpaid total */}
        {bills.length > 0 && (
          <div style={{ padding: '10px 14px', backgroundColor: unpaidTotal > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${unpaidTotal > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: unpaidTotal > 0 ? '#dc2626' : '#16a34a', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
              {unpaidTotal > 0 ? 'Unpaid Bills Total' : 'All Bills Paid! 🎉'}
            </p>
            {unpaidTotal > 0 && <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#dc2626', margin: 0 }}>{fmt(unpaidTotal)}</p>}
          </div>
        )}

        {/* Filter tabs */}
        {bills.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['All', 'Unpaid', 'Paid'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: filter === f ? 'var(--accent)' : 'var(--card)', color: filter === f ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Bills list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Receipt size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
              {filter === 'Paid' ? 'No paid bills yet.' : filter === 'Unpaid' ? 'No unpaid bills! 🎉' : 'No bills yet. Add one!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(bill => {
              const status = getBillStatus(bill.due_date, bill.is_paid)
              const dueDate = new Date(bill.due_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, opacity: bill.is_paid ? 0.7 : 1 }}>
                  {/* Pay button */}
                  <button
                    onClick={() => bill.is_paid ? handleUnpay(bill) : setPayingBill(bill)}
                    title={bill.is_paid ? 'Mark as unpaid' : 'Pay this bill'}
                    style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', border: `2px solid ${bill.is_paid ? '#16a34a' : 'var(--border)'}`, backgroundColor: bill.is_paid ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {bill.is_paid && <Check size={11} color="white" />}
                  </button>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, textDecoration: bill.is_paid ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bill.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <Clock size={9} color="var(--text-subtle)" />
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{dueDate}</span>
                      <span style={{ fontSize: 11, color: 'var(--border)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{bill.category}</span>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmt(bill.amount)}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Delete */}
                  <button onClick={() => setConfirmDelete(bill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 3, flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <BillModal userId={userId} onClose={() => setShowAddModal(false)} onSaved={bill => setBills(prev => [...prev, bill].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)))} />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Bill?"
          message={`Are you sure you want to delete "${confirmDelete.name}"?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {payingBill && (
        <PayBillModal bill={payingBill} userId={userId} onClose={() => setPayingBill(null)} onPaid={handlePaid} />
      )}
    </>
  )
}