import { useState, useEffect } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Plus, Trash2, Loader2, X, Check, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'

const STATUS_STYLES = {
  active:   { label: 'Active',   bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  returned: { label: 'Returned', bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  overdue:  { label: 'Overdue',  bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
}

function getStatus(loan) {
  if (loan.status === 'returned') return STATUS_STYLES.returned
  if (loan.due_date) {
    const today = new Date(); today.setHours(0,0,0,0)
    const due = new Date(loan.due_date + 'T00:00:00')
    if (due < today) return STATUS_STYLES.overdue
  }
  return STATUS_STYLES.active
}


// Add Payment Modal
function AddPaymentModal({ loan, userId, totalPaid, onClose, onPaymentAdded }) {
  const [wallets, setWallets] = useState([])
  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState('')
  const [addToWallet, setAddToWallet] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fmt = (amt) => fmtCurrency(amt, 'PHP', 1)
  const remaining = parseFloat(loan.return_amount) - totalPaid
  const selectedWallet = wallets.find(w => w.id === walletId)

  useEffect(() => {
    async function fetchWallets() {
      const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      setWallets(data || [])
      if (data && data.length > 0) setWalletId(data[0].id)
    }
    fetchWallets()
  }, [userId])

  async function handleSubmit(e) {
    e.preventDefault()
    const payAmt = parseFloat(amount)
    if (!amount || isNaN(payAmt) || payAmt <= 0) { setError('Please enter a valid amount.'); return }
    if (payAmt > remaining) { setError(`Amount exceeds remaining balance of ${fmt(remaining)}`); return }

    setSaving(true); setError(null)
    try {
      // Save payment
      const { data: payment, error: payError } = await supabase.from('loan_payments').insert([{
        loan_id: loan.id,
        user_id: userId,
        amount: payAmt,
        wallet_id: addToWallet && walletId ? walletId : null,
        date,
        notes: notes.trim() || null,
      }]).select().single()

      if (payError) throw payError

      // Add to wallet if selected
      if (addToWallet && walletId && selectedWallet) {
        const newBalance = parseFloat(selectedWallet.balance) + payAmt
        await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId)
      }

      // Auto-mark as returned if fully paid
      const newTotalPaid = totalPaid + payAmt
      if (newTotalPaid >= parseFloat(loan.return_amount)) {
        await supabase.from('loans').update({ status: 'returned' }).eq('id', loan.id)
      }

      onPaymentAdded(payment, newTotalPaid >= parseFloat(loan.return_amount))
      onClose()
    } catch (err) {
      setError('Failed to record payment.')
    }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Record Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Loan summary */}
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px' }}>Payment from <strong style={{ color: 'var(--text)' }}>{loan.borrower_name}</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Remaining balance:</span>
              <strong style={{ fontSize: 12, color: 'var(--text)' }}>{fmt(remaining)}</strong>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={s.label}>Payment Amount (₱) *</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Up to ${fmt(remaining)}`} style={s.input} />
          </div>

          {/* Date */}
          <div>
            <label style={s.label}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={s.input} />
          </div>

          {/* Add to wallet */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={addToWallet} onChange={e => setAddToWallet(e.target.checked)} style={{ width: 14, height: 14, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add payment to a wallet</span>
          </label>

          {addToWallet && wallets.length > 0 && (
            <div>
              <label style={s.label}>Add to Wallet</label>
              <select value={walletId} onChange={e => setWalletId(e.target.value)} style={s.input}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name} — {fmt(w.balance)}</option>)}
              </select>
              {selectedWallet && amount && !isNaN(parseFloat(amount)) && (
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>
                  After receiving: <strong style={{ color: '#16a34a' }}>{fmt(parseFloat(selectedWallet.balance) + parseFloat(amount))}</strong>
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={s.label}>Notes <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Day 1 payment" style={s.input} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> Record Payment</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Add Loan Modal
function AddLoanModal({ userId, onClose, onSaved }) {
  const [wallets, setWallets] = useState([])
  const [form, setForm] = useState({
    borrower_name: '', principal_amount: '', return_amount: '',
    wallet_id: '', date_lent: new Date().toISOString().split('T')[0],
    due_date: '', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWallets() {
      const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      setWallets(data || [])
      if (data && data.length > 0) setForm(p => ({ ...p, wallet_id: data[0].id }))
    }
    fetchWallets()
  }, [userId])

  function handleChange(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })) }

  const fmt = (amt) => fmtCurrency(amt, 'PHP', 1)
  const principal = parseFloat(form.principal_amount) || 0
  const returnAmt = parseFloat(form.return_amount) || 0
  const revenue = returnAmt - principal
  const selectedWallet = wallets.find(w => w.id === form.wallet_id)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.borrower_name.trim()) { setError('Borrower name is required.'); return }
    if (!form.principal_amount || principal <= 0) { setError('Please enter a valid amount.'); return }
    if (!form.return_amount || returnAmt <= 0) { setError('Please enter the return amount.'); return }
    if (returnAmt < principal) { setError('Return amount cannot be less than the borrowed amount.'); return }
    if (form.wallet_id && selectedWallet && parseFloat(selectedWallet.balance) < principal) {
      setError(`Insufficient balance in ${selectedWallet.name}. Available: ${fmt(selectedWallet.balance)}`); return
    }
    setSaving(true); setError(null)
    try {
      const { data, error: loanError } = await supabase.from('loans').insert([{
        user_id: userId, borrower_name: form.borrower_name.trim(),
        principal_amount: principal, return_amount: returnAmt,
        wallet_id: form.wallet_id || null, date_lent: form.date_lent,
        due_date: form.due_date || null, notes: form.notes.trim() || null, status: 'active',
      }]).select().single()
      if (loanError) throw loanError

      if (form.wallet_id && selectedWallet) {
        await supabase.from('wallets').update({ balance: parseFloat(selectedWallet.balance) - principal }).eq('id', form.wallet_id)
      }

      onSaved(data)
      onClose()
    } catch (err) { setError('Failed to save loan.') }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card)', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>New Loan</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Borrower Name *</label>
            <input name="borrower_name" value={form.borrower_name} onChange={handleChange} placeholder="e.g. Juan Dela Cruz" style={s.input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Amount Lent (₱) *</label>
              <input name="principal_amount" type="number" step="0.01" min="0" value={form.principal_amount} onChange={handleChange} placeholder="0.00" style={s.input} />
            </div>
            <div>
              <label style={s.label}>Return Amount (₱) *</label>
              <input name="return_amount" type="number" step="0.01" min="0" value={form.return_amount} onChange={handleChange} placeholder="0.00" style={s.input} />
            </div>
          </div>

          {principal > 0 && returnAmt > 0 && (
            <div style={{ padding: '10px 14px', backgroundColor: revenue > 0 ? '#f0fdf4' : 'var(--input-bg)', border: `1px solid ${revenue > 0 ? '#bbf7d0' : 'var(--border)'}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: revenue > 0 ? '#16a34a' : 'var(--text-muted)' }}>
                  {revenue > 0 ? '📈 Estimated Revenue' : '— No interest'}
                </span>
                <strong style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, color: revenue > 0 ? '#16a34a' : 'var(--text)' }}>
                  {revenue > 0 ? '+' : ''}{fmt(revenue)}
                </strong>
              </div>
            </div>
          )}

          <div>
            <label style={s.label}>Deduct from Wallet</label>
            {wallets.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, margin: 0 }}>No wallets found.</p>
            ) : (
              <>
                <select name="wallet_id" value={form.wallet_id} onChange={handleChange} style={s.input}>
                  <option value="">— Don't deduct from wallet —</option>
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type}) — {fmt(w.balance)}</option>)}
                </select>
                {selectedWallet && form.wallet_id && principal > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>
                    Balance after lending: <strong style={{ color: parseFloat(selectedWallet.balance) >= principal ? 'var(--text)' : '#ef4444' }}>
                      {fmt(parseFloat(selectedWallet.balance) - principal)}
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Date Lent *</label>
              <input name="date_lent" type="date" value={form.date_lent} onChange={handleChange} style={s.input} />
            </div>
            <div>
              <label style={s.label}>Due Date <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
              <input name="due_date" type="date" value={form.due_date} onChange={handleChange} style={s.input} />
            </div>
          </div>

          <div>
            <label style={s.label}>Notes <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. ₱100/day installment" style={s.input} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Record Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Loan Card with payment history
function LoanCard({ loan, userId, onDelete, onUpdated }) {
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)

  const fmt = (amt) => fmtCurrency(amt, 'PHP', 1)
  const status = getStatus(loan)
  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = parseFloat(loan.return_amount) - totalPaid
  const progress = Math.min((totalPaid / parseFloat(loan.return_amount)) * 100, 100)
  const revenue = parseFloat(loan.return_amount) - parseFloat(loan.principal_amount)
  const dateLent = new Date(loan.date_lent + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  const dueDate = loan.due_date ? new Date(loan.due_date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  useEffect(() => {
    async function fetchPayments() {
      setLoadingPayments(true)
      const { data } = await supabase.from('loan_payments').select('*').eq('loan_id', loan.id).order('date', { ascending: false })
      setPayments(data || [])
      setLoadingPayments(false)
    }
    fetchPayments()
  }, [loan.id])

  function handlePaymentAdded(payment, isFullyPaid) {
    setPayments(prev => [payment, ...prev])
    if (isFullyPaid) onUpdated({ ...loan, status: 'returned' })
  }

  const [confirmDeletePayment, setConfirmDeletePayment] = useState(null)

  async function handleDeletePayment(payment) {
    // Restore wallet balance if payment was linked to a wallet
    if (payment.wallet_id) {
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', payment.wallet_id).single()
      if (wallet) {
        await supabase.from('wallets').update({ balance: parseFloat(wallet.balance) - parseFloat(payment.amount) }).eq('id', payment.wallet_id)
      }
    }
    await supabase.from('loan_payments').delete().eq('id', payment.id)
    setPayments(prev => prev.filter(p => p.id !== payment.id))

    // If loan was returned, revert to active
    if (loan.status === "returned") {
      await supabase.from('loans').update({ status: "active" }).eq('id', loan.id)
      onUpdated({ ...loan, status: "active" })
    }
  }

  return (
    <>
      <div style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', opacity: loan.status === 'returned' ? 0.75 : 1 }}>
        {/* Main info */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{loan.borrower_name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}` }}>
                  {status.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 1px', textTransform: 'uppercase' }}>Lent</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{fmt(loan.principal_amount)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-subtle)', margin: '0 0 1px', textTransform: 'uppercase' }}>To Return</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{fmt(loan.return_amount)}</p>
                </div>
                {revenue > 0 && (
                  <div>
                    <p style={{ fontSize: 10, color: '#16a34a', margin: '0 0 1px', textTransform: 'uppercase' }}>Revenue</p>
                    <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: '#16a34a', margin: 0 }}>+{fmt(revenue)}</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Calendar size={9} /> {dateLent}
                </span>
                {dueDate && <span style={{ fontSize: 11, color: status.label === 'Overdue' ? '#dc2626' : 'var(--text-subtle)' }}>· Due {dueDate}</span>}
                {loan.notes && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {loan.notes}</span>}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              {loan.status !== 'returned' && (
                <button onClick={() => setShowPayModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '5px 10px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Plus size={11} /> Payment
                </button>
              )}
              <button onClick={() => onDelete(loan.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#fca5a5'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                {fmt(totalPaid)} paid · {fmt(remaining)} remaining
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: progress >= 100 ? '#16a34a' : 'var(--text-muted)' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ height: 6, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress >= 100 ? '#16a34a' : '#2563eb', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* Payment history toggle */}
        {payments.length > 0 && (
          <>
            <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '8px 14px', borderTop: '1px solid var(--border)', backgroundColor: 'transparent', border: 'none', borderTop: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
              <span>{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</span>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {expanded && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loadingPayments ? (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <Loader2 size={14} color="var(--text-subtle)" className="animate-spin" />
                  </div>
                ) : (
                  payments.map(payment => {
                    const payDate = new Date(payment.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                    return (
                      <div key={payment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>+{fmt(payment.amount)}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>{payDate}</span>
                          {payment.notes && <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 6 }}>· {payment.notes}</span>}
                        </div>
                        <button onClick={() => setConfirmDeletePayment(payment)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 2 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {confirmDeletePayment && (
        <ConfirmDialog
          title="Delete Payment?"
          message={`Are you sure you want to delete this payment of ${confirmDeletePayment ? '₱' + parseFloat(confirmDeletePayment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : ''}? The wallet balance will be restored.`}
          onConfirm={() => handleDeletePayment(confirmDeletePayment)}
          onClose={() => setConfirmDeletePayment(null)}
        />
      )}

      {showPayModal && (
        <AddPaymentModal
          loan={loan}
          userId={userId}
          totalPaid={totalPaid}
          onClose={() => setShowPayModal(false)}
          onPaymentAdded={handlePaymentAdded}
        />
      )}
    </>
  )
}

export default function LoansSection({ userId, currency = 'PHP', rate = 1 }) {
  const fmt = (amt) => fmtCurrency(amt, currency, rate)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('Active')

  useEffect(() => { fetchLoans() }, [])

  async function fetchLoans() {
    setLoading(true)
    const { data } = await supabase.from('loans').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    setLoans(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('loans').delete().eq('id', id)
    setLoans(prev => prev.filter(l => l.id !== id))
  }

  function handleUpdated(updatedLoan) {
    setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l))
  }

  const filtered = loans.filter(l => {
    if (filter === 'Active') return l.status !== 'returned'
    if (filter === 'Returned') return l.status === 'returned'
    return true
  })

  const totalLent = loans.filter(l => l.status !== 'returned').reduce((sum, l) => sum + parseFloat(l.principal_amount), 0)
  const totalRevenue = loans.filter(l => l.status === 'returned').reduce((sum, l) => sum + (parseFloat(l.return_amount) - parseFloat(l.principal_amount)), 0)
  const overdueCount = loans.filter(l => {
    if (l.status === 'returned' || !l.due_date) return false
    const today = new Date(); today.setHours(0,0,0,0)
    return new Date(l.due_date + 'T00:00:00') < today
  }).length

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Users size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Loans</h3>
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

        {loans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ padding: '10px 12px', backgroundColor: '#fef9c3', border: '1px solid #fde68a', borderRadius: 12 }}>
              <p style={{ fontSize: 10, color: '#92400e', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Lent Out</p>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: '#92400e', margin: 0 }}>{fmt(totalLent)}</p>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12 }}>
              <p style={{ fontSize: 10, color: '#16a34a', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Earned</p>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: '#16a34a', margin: 0 }}>+{fmt(totalRevenue)}</p>
            </div>
          </div>
        )}

        {loans.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['All', 'Active', 'Returned'].map(f => (
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
            <Users size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
              {filter === 'Returned' ? 'No returned loans yet.' : filter === 'Active' ? 'No active loans! 🎉' : 'No loans recorded yet.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(loan => (
              <LoanCard key={loan.id} loan={loan} userId={userId} onDelete={handleDelete} onUpdated={handleUpdated} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddLoanModal userId={userId} onClose={() => setShowAddModal(false)} onSaved={loan => setLoans(prev => [loan, ...prev])} />
      )}
    </>
  )
}