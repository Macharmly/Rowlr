import { useState, useEffect } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Plus, Pencil, Trash2, Wallet, Loader2, X, Check, ArrowRightLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'

const WALLET_TYPES = ['Cash', 'GCash', 'Maya', 'Bank', 'Credit Card', 'Other']

const WALLET_COLORS = {
  Cash:          { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  GCash:         { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  Maya:          { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
  Bank:          { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  'Credit Card': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  Other:         { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
}

function WalletModal({ wallet, userId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: wallet?.name || '', balance: wallet?.balance || '', type: wallet?.type || 'Cash' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Wallet name is required.'); return }
    if (form.balance === '' || isNaN(form.balance)) { setError('Please enter a valid balance.'); return }
    setSaving(true); setError(null)

    if (wallet) {
      const { data, error } = await supabase.from('wallets').update({ name: form.name.trim(), balance: parseFloat(form.balance), type: form.type }).eq('id', wallet.id).select().single()
      if (error) setError('Failed to update wallet.')
      else { onSaved(data, true); onClose() }
    } else {
      const { data, error } = await supabase.from('wallets').insert([{ user_id: userId, name: form.name.trim(), balance: parseFloat(form.balance), type: form.type }]).select().single()
      if (error) setError('Failed to add wallet.')
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
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{wallet ? 'Edit Wallet' : 'Add Wallet'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Wallet Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. BDO Savings" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={s.input}>
              {WALLET_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Current Balance (₱) *</label>
            <input type="number" step="0.01" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="0.00" style={s.input} />
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> {wallet ? 'Update' : 'Add Wallet'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TransferModal({ wallets, onClose, onTransferred }) {
  const [fromId, setFromId] = useState(wallets[0]?.id || '')
  const [toId, setToId] = useState(wallets[1]?.id || '')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Fix 1: Ensure String comparison for IDs
  const fromWallet = wallets.find(w => String(w.id) === String(fromId))
  const toWallet = wallets.find(w => String(w.id) === String(toId))

  // Fix 2: Context-aware formatting
  // If we specify a wallet, use its currency. Otherwise, default to PHP.
  const fmt = (amt, wallet = null) => {
    const target = wallet || fromWallet
    const code = target?.currency_code || 'PHP'
    const rate = target?.exchange_rate || 1
    return fmtCurrency(amt, code, rate)
  }

  async function handleTransfer() {
    if (!fromId || !toId) { setError('Please select both wallets.'); return }
    if (fromId === toId) { setError('Cannot transfer to the same wallet.'); return }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return }
    const totalDeduction = parseFloat(amount) + parseFloat(fee || 0)
    if (fromWallet && parseFloat(fromWallet.balance) < totalDeduction) {
      setError(`Insufficient balance in ${fromWallet.name}. Available: ${fmt(fromWallet.balance)}`)
      return
    }

    setSaving(true); setError(null)
    try {
      const newFromBalance = parseFloat(fromWallet.balance) - parseFloat(amount) - parseFloat(fee || 0)
      const newToBalance = parseFloat(toWallet.balance) + parseFloat(amount)

      const [{ data: updatedFrom }, { data: updatedTo }] = await Promise.all([
        supabase.from('wallets').update({ balance: newFromBalance }).eq('id', fromId).select().single(),
        supabase.from('wallets').update({ balance: newToBalance }).eq('id', toId).select().single(),
      ])

      onTransferred(updatedFrom, updatedTo)
      onClose()
    } catch (err) {
      setError('Transfer failed. Please try again.')
    }
    setSaving(false)
  }

  const s = {
    select: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Transfer Funds</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* From */}
          <div>
            <label style={s.label}>From Wallet</label>
            <select value={fromId} onChange={e => setFromId(e.target.value)} style={s.select}>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name} — {fmt(w.balance, w)}</option>)}
            </select>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <ArrowRightLeft size={14} /> Transfer to
            </div>
          </div>

          {/* To */}
          <div>
            <label style={s.label}>To Wallet</label>
            <select value={toId} onChange={e => setToId(e.target.value)} style={s.select}>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name} — {fmt(w.balance)}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label style={s.label}>Amount (₱) *</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ ...s.select }} />
          </div>

          {/* Processing Fee */}
          <div>
            <label style={s.label}>Processing Fee (₱) <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <input type="number" step="0.01" min="0" value={fee} onChange={e => setFee(e.target.value)} placeholder="0.00" style={{ ...s.select }} />
            {fee && !isNaN(fee) && parseFloat(fee) > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>
                Total deducted: <strong style={{ color: 'var(--text)' }}>{fmt(parseFloat(amount || 0) + parseFloat(fee))}</strong> (amount + fee)
              </p>
            )}
          </div>

          {/* Balance preview */}
          {fromWallet && amount && !isNaN(amount) && (
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{fromWallet.name} after:</span>
                <strong style={{ color: parseFloat(fromWallet.balance) >= (parseFloat(amount) + parseFloat(fee || 0)) ? 'var(--text)' : '#ef4444' }}>
                  {fmt(parseFloat(fromWallet.balance) - parseFloat(amount) - parseFloat(fee || 0))}
                </strong>
              </div>
              {toWallet && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{toWallet.name} after:</span>
                  <strong style={{ color: '#16a34a' }}>{fmt(parseFloat(toWallet.balance) + parseFloat(amount), toWallet)}</strong>
                </div>
              )}
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleTransfer} disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Transferring...</> : <><ArrowRightLeft size={13} /> Transfer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WalletSection({ userId, currency = 'PHP', rate = 1 }) {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingWallet, setEditingWallet] = useState(null)

  useEffect(() => { fetchWallets() }, [])

  async function fetchWallets() {
    setLoading(true)
    const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    setWallets(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('wallets').delete().eq('id', id)
    setWallets(prev => prev.filter(w => w.id !== id))
  }

  function handleSaved(wallet, isEdit) {
    if (isEdit) setWallets(prev => prev.map(w => w.id === wallet.id ? wallet : w))
    else setWallets(prev => [...prev, wallet])
  }

  function handleTransferred(from, to) {
    setWallets(prev => prev.map(w => w.id === from.id ? from : w.id === to.id ? to : w))
  }

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0)
  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Wallet size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Wallets</h3>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {wallets.length >= 2 && (
              <button onClick={() => setShowTransfer(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowRightLeft size={12} /> Transfer
              </button>
            )}
            <button onClick={() => { setEditingWallet(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Plus size={12} /> Add
            </button>
          </div>
        </div>

        {/* Total */}
        {wallets.length > 0 && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--input-bg)', borderRadius: 12, marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Balance</p>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{fmt(totalBalance)}</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : wallets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Wallet size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>No wallets yet. Add one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wallets.map(wallet => {
              const color = WALLET_COLORS[wallet.type] || WALLET_COLORS.Other
              return (
                <div key={wallet.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: color.bg, border: `1px solid ${color.border}`, borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: color.text, margin: 0 }}>{wallet.name}</p>
                    <p style={{ fontSize: 11, color: color.text, opacity: 0.7, margin: '1px 0 0' }}>{wallet.type}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => { setEditingWallet(wallet); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: color.text, padding: 0, textDecoration: 'underline dotted' }} title="Click to edit balance">
                      {fmt(wallet.balance)}
                    </button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { setEditingWallet(wallet); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.text, opacity: 0.6, display: 'flex', padding: 3 }}>
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setConfirmDelete(wallet)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, display: 'flex', padding: 3 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Wallet?"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {showModal && (
        <WalletModal wallet={editingWallet} userId={userId} onClose={() => setShowModal(false)} onSaved={handleSaved} />
      )}

      {showTransfer && (
        <TransferModal wallets={wallets} onClose={() => setShowTransfer(false)} onTransferred={handleTransferred} />
      )}
    </>
  )
}