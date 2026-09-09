import { useEffect, useState } from 'react'
import { ArrowRightLeft, Inbox, Loader2, Receipt, TrendingDown, TrendingUp } from 'lucide-react'

import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'

export default function WalletActivityLogs({
  userId,
  currency = 'PHP',
  rate = 1,
  refreshKey,
}) {
  const [logs, setLogs] = useState([])
  const [walletNames, setWalletNames] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)

      const [{ data: logData, error }, { data: wallets }] =
        await Promise.all([
          supabase
            .from('wallet_activity_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('wallets')
            .select('id, name')
            .eq('user_id', userId),
        ])

      if (error) {
        console.error('Failed to fetch wallet activity logs:', error)
        setLogs([])
      } else {
        setLogs(logData || [])
      }

      setWalletNames(
        Object.fromEntries(
          (wallets || []).map((wallet) => [
            wallet.id,
            wallet.name,
          ])
        )
      )
      setLoading(false)
    }

    fetchLogs()
  }, [userId, refreshKey])

  const fmt = (amount) =>
    fmtCurrency(amount, currency, rate)

  return (
    <section
      style={{
        gridColumn: '1 / -1',
        padding: 16,
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 12,
        }}
      >
        <Inbox size={14} color="var(--text)" />
        <h3
          style={{
            margin: 0,
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          Money Movement Log
        </h3>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '18px 0' }}>
          <Loader2
            size={16}
            color="var(--text-subtle)"
            className="animate-spin"
          />
        </div>
      ) : logs.length === 0 ? (
        <p
          style={{
            margin: 0,
            padding: '12px 0',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-subtle)',
          }}
        >
          Income, expenses, bill payments, and transfers will appear here.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          {logs.map((log) => {
            const isTransfer = log.activity_type === 'transfer'
            const isIncome = log.activity_type === 'income_received'
            const isExpense = log.activity_type === 'expense_paid'
            const isBillPayment = log.activity_type === 'bill_paid'
            const isOutflow = isExpense || isBillPayment
            const activity = isTransfer
              ? { label: 'Wallet transfer', icon: ArrowRightLeft, color: '#2563eb', background: '#eff6ff' }
              : isIncome
                ? { label: 'Income received', icon: TrendingUp, color: '#16a34a', background: '#f0fdf4' }
                : isBillPayment
                  ? { label: 'Bill paid', icon: Receipt, color: '#dc2626', background: '#fef2f2' }
                  : { label: 'Expense paid', icon: TrendingDown, color: '#dc2626', background: '#fef2f2' }
            const ActivityIcon = activity.icon
            const date = new Date(log.created_at).toLocaleString(
              'en-PH',
              { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
            )
            const fromName = walletNames[log.from_wallet_id] || 'Deleted wallet'
            const toName = walletNames[log.to_wallet_id] || 'Deleted wallet'

            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      padding: 7,
                      backgroundColor: activity.background,
                      borderRadius: 9,
                      color: activity.color,
                    }}
                  >
                    <ActivityIcon size={13} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 650, color: 'var(--text)' }}>
                      {activity.label}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 10.5, color: 'var(--text-subtle)' }}>
                      {isTransfer
                        ? `${fromName} → ${toName}${Number(log.fee || 0) > 0 ? ` · Fee ${fmt(log.fee)}` : ''}`
                        : isOutflow ? `Paid from ${fromName}` : `Added to ${toName}`}
                      {' · '}{date}
                    </p>
                  </div>
                </div>
                <strong style={{ flexShrink: 0, fontSize: 12, color: isTransfer ? 'var(--text)' : activity.color }}>
                  {isTransfer ? '' : isOutflow ? '-' : '+'}{fmt(log.amount)}
                </strong>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
