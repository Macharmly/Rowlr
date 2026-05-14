import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Check } from 'lucide-react'
import { getExchangeRates } from '../lib/exchangeRate'

const SCORE_COLORS = {
  excellent: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Excellent' },
  good:      { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Good' },
  fair:      { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Fair' },
  poor:      { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Poor' },
}

function getScoreStyle(score) {
  if (score >= 80) return SCORE_COLORS.excellent
  if (score >= 60) return SCORE_COLORS.good
  if (score >= 40) return SCORE_COLORS.fair
  return SCORE_COLORS.poor
}

export default function FinancialScore({ expenses, income, wallets, bills, loans, savings, currency = 'PHP', rate = 1 }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const symbol = currency === 'PHP' ? '₱' : currency
  const fmt = (amt) => `${symbol}${(parseFloat(amt || 0) * rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  async function generateScore() {
    setLoading(true)
    try {
      const now = new Date()
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const monthExpenses = expenses.filter(e => e.date.startsWith(monthStr))
      const totalExpenses = monthExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
      const totalIncome = income.reduce((s, i) => s + parseFloat(i.amount), 0)
      const totalWallets = wallets.reduce((s, w) => s + parseFloat(w.balance), 0)
      const totalUnpaidBills = bills.filter(b => !b.is_paid).reduce((s, b) => s + parseFloat(b.amount), 0)
      const totalLentOut = loans.filter(l => l.status !== 'returned').reduce((s, l) => s + parseFloat(l.principal_amount), 0)
      const totalSaved = savings.reduce((s, g) => s + parseFloat(g.current_amount), 0)

      const catBreakdown = monthExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount)
        return acc
      }, {})

      const summary = `
Monthly Expenses: ₱${totalExpenses.toFixed(2)}
Monthly Income: ₱${totalIncome.toFixed(2)}
Total Wallet Balance: ₱${totalWallets.toFixed(2)}
Unpaid Bills: ₱${totalUnpaidBills.toFixed(2)}
Money Lent Out: ₱${totalLentOut.toFixed(2)}
Total Savings: ₱${totalSaved.toFixed(2)}
Expense Breakdown: ${Object.entries(catBreakdown).map(([k, v]) => `${k}: ₱${v.toFixed(2)}`).join(', ')}
      `.trim()

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `You are a personal finance advisor. Analyze this financial data and give a score.

${summary}

Return ONLY a valid JSON object, no markdown, no backticks:
{
  "score": 72,
  "label": "Good",
  "summary": "One sentence overall assessment.",
  "positives": ["thing 1", "thing 2"],
  "improvements": ["thing 1", "thing 2"],
  "tips": ["actionable tip 1", "actionable tip 2"]
}

Rules:
- score: 0-100 integer
- positives: 2-3 things they're doing well
- improvements: 2-3 areas to improve
- tips: 2-3 specific actionable tips
- Keep all text short and friendly`
          }]
        })
      })

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content?.trim() || ''
      const clean = text.replace(/```json|```/g, '').trim()
      setResult(JSON.parse(clean))
    } catch (err) {
      console.error('Score generation failed:', err)
      setResult({ score: 0, label: 'Error', summary: 'Failed to generate score. Please try again.', positives: [], improvements: [], tips: [] })
    }
    setLoading(false)
  }

  const scoreStyle = result ? getScoreStyle(result.score) : null

  return (
    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={14} color="var(--text)" />
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Financial Score</h3>
        </div>
        <button onClick={generateScore} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
          {loading ? <><Loader2 size={12} className="animate-spin" /> Analyzing...</> : result ? <><RefreshCw size={12} /> Refresh</> : <><Sparkles size={12} /> Generate Score</>}
        </button>
      </div>

      {!result && !loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Sparkles size={28} color="var(--border)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Get an AI-powered analysis of your finances</p>
          <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>Based on your expenses, income, bills, loans & savings</p>
          <button onClick={generateScore} style={{ marginTop: 14, padding: '8px 20px', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✨ Generate My Score
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Loader2 size={24} color="var(--text-subtle)" className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>AI is analyzing your finances...</p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Score display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', backgroundColor: scoreStyle.bg, border: `1px solid ${scoreStyle.border}`, borderRadius: 16 }}>
            {/* Score circle */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'white', border: `3px solid ${scoreStyle.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: scoreStyle.color, lineHeight: 1 }}>{result.score}</span>
              <span style={{ fontSize: 9, color: scoreStyle.color, opacity: 0.8 }}>/100</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: scoreStyle.color, margin: '0 0 4px' }}>{scoreStyle.label}</p>
              <p style={{ fontSize: 12, color: '#4a4a4a', margin: 0, lineHeight: 1.5 }}>{result.summary}</p>
            </div>
          </div>

          {/* Score bar */}
          <div>
            <div style={{ height: 8, backgroundColor: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${result.score}%`, backgroundColor: scoreStyle.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: '#ef4444' }}>Poor</span>
              <span style={{ fontSize: 9, color: '#d97706' }}>Fair</span>
              <span style={{ fontSize: 9, color: '#2563eb' }}>Good</span>
              <span style={{ fontSize: 9, color: '#16a34a' }}>Excellent</span>
            </div>
          </div>

          {/* Positives */}
          {result.positives?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ What you're doing well</p>
              {result.positives.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                  <Check size={12} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#d97706', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Areas to improve</p>
              {result.improvements.map((imp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                  <AlertTriangle size={12} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{imp}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💡 Actionable Tips</p>
              {result.tips.map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                  <TrendingUp size={12} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}