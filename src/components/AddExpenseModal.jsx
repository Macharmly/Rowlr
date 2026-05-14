import { useState, useEffect } from 'react'
import { X, Loader2, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getCurrency } from '../lib/currency'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Savings', 'Other']
const PAYMENT_METHODS = ['Cash', 'GCash', 'Maya', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other']

const s = {
  input:  { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
  label:  { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
}

export default function AddExpenseModal({ onClose, onSaved, userId, currency = 'PHP', rate = 1 }) {
  const [form, setForm] = useState({
    amount: '', category: 'Food', date: new Date().toISOString().split('T')[0],
    notes: '', payment_method: 'Cash', wallet_id: '',
  })
  const [wallets, setWallets] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const currencyInfo = getCurrency(currency)
  // Convert user input (in their currency) back to PHP for storage
  const toPhp = (amount) => currency === 'PHP' ? parseFloat(amount) : parseFloat(amount) / rate

  useEffect(() => {
    async function fetchWallets() {
      const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true })
      setWallets(data || [])
      if (data && data.length > 0) setForm(prev => ({ ...prev, wallet_id: data[0].id }))
    }
    fetchWallets()
  }, [userId])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      setError(`Please enter a valid amount.`); return
    }

    // Convert input to PHP for storage
    const phpAmount = toPhp(form.amount)

    // Check wallet balance (wallets store PHP)
    if (form.wallet_id) {
      const selectedWallet = wallets.find(w => w.id === form.wallet_id)
      if (selectedWallet && parseFloat(selectedWallet.balance) < phpAmount) {
        const walletBalance = currency === 'PHP'
          ? `₱${parseFloat(selectedWallet.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
          : `${currencyInfo.symbol}${(parseFloat(selectedWallet.balance) * rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        setError(`Insufficient balance. Available: ${walletBalance}`)
        return
      }
    }

    setSaving(true); setError(null)

    try {
      // Save in PHP
      const { data, error: insertError } = await supabase.from('expenses').insert([{
        user_id: userId,
        amount: phpAmount, // always stored in PHP
        category: form.category,
        date: form.date,
        notes: form.notes.trim() || null,
        payment_method: form.payment_method,
        wallet_id: form.wallet_id || null,
      }]).select().single()

      if (insertError) throw insertError

      // Deduct from wallet (wallet balances are in PHP)
      if (form.wallet_id) {
        const selectedWallet = wallets.find(w => w.id === form.wallet_id)
        if (selectedWallet) {
          const newBalance = parseFloat(selectedWallet.balance) - phpAmount
          await supabase.from('wallets').update({ balance: newBalance }).eq('id', form.wallet_id)
        }
      }

      onSaved(data)
      onClose()
    } catch (err) {
      setError('Failed to save expense. Please try again.')
    }

    setSaving(false)
  }

  const selectedWallet = wallets.find(w => w.id === form.wallet_id)
  const inputAmount = parseFloat(form.amount) || 0
  const phpEquivalent = currency !== 'PHP' && inputAmount > 0 ? toPhp(form.amount) : null

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: 'var(--card)', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Add Expense</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Amount */}
          <div>
            <label style={s.label}>Amount ({currencyInfo.symbol} {currency}) *</label>
            <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} placeholder="0.00" style={s.input} />
            {/* Show PHP equivalent if not PHP */}
            {phpEquivalent !== null && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, marginBottom: 0 }}>
                ≈ ₱{phpEquivalent.toLocaleString('en-PH', { minimumFractionDigits: 2 })} PHP (stored value)
              </p>
            )}
          </div>

          {/* Wallet selector */}
          <div>
            <label style={s.label}>Deduct from Wallet</label>
            {wallets.length === 0 ? (
              <div style={{ padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={13} /> No wallets yet — add one in the Wallets tab!
              </div>
            ) : (
              <>
                <select name="wallet_id" value={form.wallet_id} onChange={handleChange} style={s.select}>
                  <option value="">— Don't deduct from wallet —</option>
                  {wallets.map(w => {
                    const displayBalance = currency === 'PHP'
                      ? `₱${parseFloat(w.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                      : `${currencyInfo.symbol}${(parseFloat(w.balance) * rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                    return (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.type}) — {displayBalance}
                      </option>
                    )
                  })}
                </select>
                {selectedWallet && (
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5, marginBottom: 0 }}>
                    Available: <strong style={{ color: 'var(--text)' }}>
                      {currency === 'PHP'
                        ? `₱${parseFloat(selectedWallet.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : `${currencyInfo.symbol}${(parseFloat(selectedWallet.balance) * rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                      }
                    </strong>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Category + Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={s.label}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} style={s.select}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Payment Method</label>
              <select name="payment_method" value={form.payment_method} onChange={handleChange} style={s.select}>
                {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={s.label}>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} style={s.input} />
          </div>

          {/* Notes */}
          <div>
            <label style={s.label}>Notes</label>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Lunch with friends" style={s.input} />
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}