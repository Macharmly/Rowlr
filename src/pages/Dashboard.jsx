import { useState, useEffect } from 'react'
import { Plus, LogOut, Wallet, TrendingDown, Calendar, Filter, Loader2, Sun, Moon, Download, User, Search, ArrowUpDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'
import { getExchangeRates, getRate, forceRefreshRates } from '../lib/exchangeRate'
import { exportExpensesToCSV } from '../lib/exportCSV'
import AddExpenseModal from '../components/AddExpenseModal'
import ExpenseItem from '../components/ExpenseItem'
import AIInsights from '../components/AIInsights'
import WalletSection from '../components/WalletSection'
import IncomeSection from '../components/IncomeSection'
import BillsSection from '../components/BillsSection'
import LoansSection from '../components/LoansSection'
import BillReminders from '../components/BillReminders'
import BudgetGoals from '../components/BudgetGoals'
import Analytics from '../components/Analytics'
import ProfileModal from '../components/ProfileModal'
import ExchangeRateWidget from '../components/ExchangeRateWidget'
import FinancialCalendar from '../components/FinancialCalendar'
import FinancialScore from '../components/FinancialScore'
import SavingsGoals from '../components/SavingsGoals'
import FinancialNotes from '../components/FinancialNotes'
import NetWorth from '../components/NetWorth'

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Savings', 'Other']
const TABS = ['Expenses', 'Analytics', 'Budgets', 'Wallets & Income', 'Bills', 'Loans', 'Savings', 'Net Worth', 'Notes', 'Calendar', 'Score']

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

export default function Dashboard({ user, dark, setDark }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('this_month')
  const [activeTab, setActiveTab] = useState('Expenses')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [profile, setProfile] = useState(null)
  const [rates, setRates] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [walletsList, setWalletsList] = useState([])
  const [incomeList, setIncomeList] = useState([])
  const [billsList, setBillsList] = useState([])
  const [loansList, setLoansList] = useState([])
  const [savingsList, setSavingsList] = useState([])
  const windowWidth = useWindowWidth()

  useEffect(() => { fetchExpenses() }, [dateFilter])
  useEffect(() => { fetchProfile() }, [user.id])
  useEffect(() => { fetchBudgets() }, [user.id])
  useEffect(() => {
    getExchangeRates().then(data => setRates(data))
  }, [])

  async function fetchScoreData() {
    const [w, i, b, l, s] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user.id),
      supabase.from('income').select('*').eq('user_id', user.id),
      supabase.from('bills').select('*').eq('user_id', user.id),
      supabase.from('loans').select('*').eq('user_id', user.id),
      supabase.from('savings_goals').select('*').eq('user_id', user.id),
    ])
    setWalletsList(w.data || [])
    setIncomeList(i.data || [])
    setBillsList(b.data || [])
    setLoansList(l.data || [])
    setSavingsList(s.data || [])
  }

  async function fetchBudgets() {
    const now = new Date()
    const { data } = await supabase.from('budgets').select('*')
      .eq('user_id', user.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear())
    setBudgets(data || [])
  }

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
  }

  async function fetchExpenses() {
    setLoading(true)
    let query = supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).order('created_at', { ascending: false })
    const now = new Date()
    if (dateFilter === 'this_week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay())
      query = query.gte('date', start.toISOString().split('T')[0])
    } else if (dateFilter === 'this_month') {
      query = query.gte('date', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
    } else if (dateFilter === 'last_month') {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0)
      query = query.gte('date', s.toISOString().split('T')[0]).lte('date', e.toISOString().split('T')[0])
    }
    const { data } = await query
    setExpenses(data || [])
    setLoading(false)
  }

  function handleDelete(id) { setExpenses(prev => prev.filter(e => e.id !== id)) }
  function handleUpdated(updated) { setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e)) }

  const currency = profile?.currency || 'PHP'
  const rate = getRate(rates, currency)
  const fmt = (amt) => fmtCurrency(amt, currency, rate)

  const filtered = expenses
    .filter(e => categoryFilter === 'All' || e.category === categoryFilter)
    .filter(e => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (e.notes || '').toLowerCase().includes(q) ||
             e.category.toLowerCase().includes(q) ||
             (e.payment_method || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      let valA, valB
      if (sortBy === 'date') { valA = a.date; valB = b.date }
      else if (sortBy === 'amount') { valA = parseFloat(a.amount); valB = parseFloat(b.amount) }
      else if (sortBy === 'category') { valA = a.category; valB = b.category }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  const total = filtered.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const today = new Date().toISOString().split('T')[0]
  const todayTotal = expenses.filter(e => e.date === today).reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const categoryTotals = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount); return acc }, {})
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const displayName = profile?.display_name || user.email?.split('@')[0]

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar */}
      <header style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, backgroundColor: 'var(--text)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={15} color="var(--bg)" />
            </div>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Rowlr</span>
            {currency !== 'PHP' && rates && (
              <span style={{ fontSize: 10, padding: '2px 7px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20 }}>
                1 ₱ = {rate.toFixed(4)} {currency}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowProfile(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={12} color="var(--text-muted)" />
                </div>
              )}
              {windowWidth > 480 && <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>}
            </button>
            <button onClick={() => setDark(!dark)} style={{ padding: '5px 8px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {dark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ width: '100%', padding: '16px', flex: 1 }}>

        <BillReminders userId={user.id} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }} className="animate-fade-in">
          <div>
            <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.4px' }}>My Finances</h1>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>Track every {currency === 'PHP' ? 'peso' : 'cent'} you earn and spend</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {activeTab === 'Expenses' && expenses.length > 0 && (
              <button onClick={() => exportExpensesToCSV(expenses, currency)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'var(--card)', color: 'var(--text-muted)', borderRadius: 12, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer' }}>
                <Download size={13} /> CSV
              </button>
            )}
            {activeTab === 'Expenses' && (
              <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: 'var(--accent)', color: 'var(--bg)', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <Plus size={14} /> Add Expense
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total Spent', value: fmt(total), icon: TrendingDown, sub: dateFilter.replace(/_/g, ' ') },
            { label: "Today's Spend", value: fmt(todayTotal), icon: Calendar, sub: 'today' },
            { label: 'Top Category', value: topCategory ? topCategory[0] : '—', icon: Filter, sub: topCategory ? fmt(topCategory[1]) : 'no data' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 14px' }} className={`animate-slide-up stagger-${i + 1}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                <stat.icon size={12} color="var(--text-subtle)" />
              </div>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 800, color: 'var(--text)', margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2, textTransform: 'capitalize' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs - dropdown on mobile, scrollable on desktop */}
        {windowWidth < 640 ? (
          <div style={{ marginBottom: 14 }}>
            <select
              value={activeTab}
              onChange={e => { setActiveTab(e.target.value); if (e.target.value === 'Score') fetchScoreData() }}
              style={{ width: '100%', padding: '10px 14px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none', cursor: 'pointer' }}
            >
              {TABS.map(tab => <option key={tab} value={tab}>{tab}</option>)}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'Score') fetchScoreData() }} style={{ padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: activeTab === tab ? 'var(--accent)' : 'var(--card)', color: activeTab === tab ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'Expenses' ? (
          <div style={{ display: 'grid', gridTemplateColumns: windowWidth < 768 ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ fontSize: 12, fontWeight: 500, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', backgroundColor: 'var(--card)', outline: 'none', cursor: 'pointer' }}>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="all">All Time</option>
                </select>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategoryFilter(c)} style={{ fontSize: 11, padding: '4px 9px', borderRadius: 8, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: categoryFilter === c ? 'var(--accent)' : 'var(--card)', color: categoryFilter === c ? 'var(--bg)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                      {c}
                    </button>
                  ))}
                </div>

              {/* Search + Sort */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search expenses..."
                    style={{ width: '100%', padding: '6px 10px 6px 28px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text)', outline: 'none' }}
                  />
                </div>

                {/* Sort */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', backgroundColor: 'var(--card)', outline: 'none', cursor: 'pointer' }}>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                  </select>
                  <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
                    <ArrowUpDown size={12} /> {sortDir === 'asc' ? 'Asc' : 'Desc'}
                  </button>
                </div>

                {/* Clear search */}
                {search && (
                  <button onClick={() => setSearch('')} style={{ fontSize: 11, padding: '5px 8px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
                    Clear
                  </button>
                )}
              </div>
              </div>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                  <Loader2 size={20} color="var(--text-subtle)" className="animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, textAlign: 'center', padding: '48px 0' }}>
                  <TrendingDown size={28} color="var(--border)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No expenses found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filtered.map(expense => (
                    <ExpenseItem key={expense.id} expense={expense} onDelete={handleDelete} onUpdated={handleUpdated} currency={currency} rate={rate} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <AIInsights expenses={expenses} />
            </div>
          </div>

        ) : activeTab === 'Analytics' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Analytics expenses={expenses} currency={currency} rate={rate} displayName={displayName} budgets={budgets} />
            <ExchangeRateWidget userCurrency={currency} />
          </div>

        ) : activeTab === 'Budgets' ? (
          <BudgetGoals userId={user.id} expenses={expenses} currency={currency} rate={rate} />

        ) : activeTab === 'Wallets & Income' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            <WalletSection userId={user.id} currency={currency} rate={rate} />
            <IncomeSection userId={user.id} currency={currency} rate={rate} />
          </div>

        ) : activeTab === 'Bills' ? (
          <BillsSection userId={user.id} currency={currency} rate={rate} />

        ) : activeTab === 'Loans' ? (
          <LoansSection userId={user.id} currency={currency} rate={rate} />

        ) : activeTab === 'Savings' ? (
          <SavingsGoals userId={user.id} currency={currency} rate={rate} />

        ) : activeTab === 'Net Worth' ? (
          <NetWorth userId={user.id} expenses={expenses} currency={currency} rate={rate} />

        ) : activeTab === 'Notes' ? (
          <FinancialNotes userId={user.id} />

        ) : activeTab === 'Calendar' ? (
          <FinancialCalendar expenses={expenses} currency={currency} rate={rate} />

        ) : (
          <FinancialScore
            expenses={expenses}
            income={incomeList}
            wallets={walletsList}
            bills={billsList}
            loans={loansList}
            savings={savingsList}
            currency={currency}
            rate={rate}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>© 2026 RRC Development</p>
      </footer>

      {showModal && (
        <AddExpenseModal onClose={() => setShowModal(false)} onSaved={expense => setExpenses(prev => [expense, ...prev])} userId={user.id} currency={currency} rate={rate} />
      )}
      {showProfile && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} onSaved={data => {
          setProfile(data)
          // Force refresh rates
          forceRefreshRates()
          getExchangeRates().then(r => setRates(r))
        }} />
      )}
    </div>
  )
}