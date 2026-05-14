import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Receipt, Users, PiggyBank, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'

export default function NetWorth({ userId, expenses, currency = 'PHP', rate = 1 }) {
  const [wallets, setWallets] = useState([])
  const [income, setIncome] = useState([])
  const [bills, setBills] = useState([])
  const [loans, setLoans] = useState([])
  const [savings, setSavings] = useState([])
  const [loading, setLoading] = useState(true)

  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  useEffect(() => { fetchAll() }, [userId])

  async function fetchAll() {
    setLoading(true)
    const [walletsRes, incomeRes, billsRes, loansRes, savingsRes] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', userId),
      supabase.from('income').select('*').eq('user_id', userId),
      supabase.from('bills').select('*').eq('user_id', userId).eq('is_paid', false),
      supabase.from('loans').select('*').eq('user_id', userId).neq('status', 'returned'),
      supabase.from('savings_goals').select('*').eq('user_id', userId),
    ])
    setWallets(walletsRes.data || [])
    setIncome(incomeRes.data || [])
    setBills(billsRes.data || [])
    setLoans(loansRes.data || [])
    setSavings(savingsRes.data || [])
    setLoading(false)
  }

  // Calculations (all in PHP, converted for display)
  const totalWallets = wallets.reduce((s, w) => s + parseFloat(w.balance), 0)
  const totalIncome = income.reduce((s, i) => s + parseFloat(i.amount), 0)
  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const totalUnpaidBills = bills.reduce((s, b) => s + parseFloat(b.amount), 0)
  const totalLentOut = loans.reduce((s, l) => s + parseFloat(l.principal_amount), 0)
  const totalSaved = savings.reduce((s, g) => s + parseFloat(g.current_amount), 0)

  const netWorth = totalWallets + totalIncome + totalLentOut - totalExpenses - totalUnpaidBills

  const rows = [
    { label: 'Wallet Balances', icon: Wallet, amount: totalWallets, color: '#16a34a', positive: true, desc: `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}` },
    { label: 'Total Income', icon: TrendingUp, amount: totalIncome, color: '#2563eb', positive: true, desc: `${income.length} record${income.length !== 1 ? 's' : ''}` },
    { label: 'Money Lent Out', icon: Users, amount: totalLentOut, color: '#d97706', positive: true, desc: `${loans.length} active loan${loans.length !== 1 ? 's' : ''}` },
    { label: 'Total Expenses', icon: TrendingDown, amount: totalExpenses, color: '#ef4444', positive: false, desc: `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}` },
    { label: 'Unpaid Bills', icon: Receipt, amount: totalUnpaidBills, color: '#dc2626', positive: false, desc: `${bills.length} unpaid bill${bills.length !== 1 ? 's' : ''}` },
  ]

  const netWorthColor = netWorth >= 0 ? '#16a34a' : '#ef4444'
  const netWorthBg = netWorth >= 0 ? '#f0fdf4' : '#fef2f2'
  const netWorthBorder = netWorth >= 0 ? '#bbf7d0' : '#fecaca'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Net Worth Hero */}
      <div style={{ backgroundColor: netWorthBg, border: `1px solid ${netWorthBorder}`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: netWorthColor, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, opacity: 0.8 }}>Your Net Worth</p>
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 800, color: netWorthColor, margin: '0 0 8px', letterSpacing: '-1px' }}>
          {netWorth < 0 ? '-' : ''}{fmt(Math.abs(netWorth))}
        </p>
        <p style={{ fontSize: 12, color: netWorthColor, margin: 0, opacity: 0.7 }}>
          {netWorth >= 0 ? '📈 Positive net worth — keep it up!' : '📉 Negative net worth — review your expenses'}
        </p>
      </div>

      {/* Breakdown */}
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Breakdown</h3>
          <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${row.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <row.icon size={15} color={row.color} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{row.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: 0 }}>{row.desc}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: row.color, margin: 0 }}>
                    {row.positive ? '+' : '-'}{fmt(row.amount)}
                  </p>
                </div>
              </div>
            ))}

            {/* Divider + Net Worth */}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Net Worth</span>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: netWorthColor }}>
                {netWorth < 0 ? '-' : '+'}{fmt(Math.abs(netWorth))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Savings Goals summary */}
      {savings.length > 0 && (
        <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <PiggyBank size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Savings Progress</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {savings.map(goal => {
              const pct = Math.min((parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100, 100)
              return (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{goal.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(goal.current_amount)} / {fmt(goal.target_amount)}</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: goal.completed ? '#16a34a' : '#3b82f6', borderRadius: 99, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}