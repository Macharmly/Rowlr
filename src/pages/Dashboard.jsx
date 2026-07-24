import {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  LogOut,
  Wallet,
  TrendingDown,
  Calendar,
  Filter,
  Loader2,
  Sun,
  Moon,
  Download,
  User,
  Search,
  ArrowUpDown,
  X,
  ChevronDown,
  ReceiptText,
  Sparkles,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

import {
  fmt as fmtCurrency,
} from '../lib/currency'

import {
  getExchangeRates,
  getRate,
  forceRefreshRates,
} from '../lib/exchangeRate'

import {
  exportExpensesToCSV,
} from '../lib/exportCSV'

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
import ExpensePlansSection from '../components/ExpensePlansSection'

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Savings',
  'Other',
]

const TABS = [
  'Expenses',
  'Analytics',
  'Budgets',
  'Wallets & Income',
  'Bills',
  'Expense Plans',
  'Loans',
  'Savings',
  'Net Worth',
  'Notes',
  'Calendar',
  'Score',
]

const DATE_FILTER_LABELS = {
  this_week: 'This Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  all: 'All Time',
}

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined'
      ? window.innerWidth
      : 1024
  )

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth)
    }

    window.addEventListener(
      'resize',
      handleResize
    )

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      )
  }, [])

  return width
}

function IconButton({
  children,
  label,
  onClick,
  danger = false,
}) {
  const [hovered, setHovered] =
    useState(false)

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34,
        height: 34,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: hovered
          ? danger
            ? '#fef2f2'
            : 'var(--input-bg)'
          : 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 11,
        color: danger
          ? hovered
            ? '#ef4444'
            : '#f87171'
          : 'var(--text-muted)',
        cursor: 'pointer',
        transition:
          'background-color 0.15s ease, color 0.15s ease, transform 0.15s ease',
        transform: hovered
          ? 'translateY(-1px)'
          : 'translateY(0)',
      }}
    >
      {children}
    </button>
  )
}

function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  delay = 1,
}) {
  const [hovered, setHovered] =
    useState(false)

  return (
    <div
      className={`animate-slide-up stagger-${delay}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        minWidth: 0,
        padding: 16,
        overflow: 'hidden',
        backgroundColor: 'var(--card)',
        border: `1px solid ${
          hovered
            ? 'color-mix(in srgb, var(--text) 15%, var(--border))'
            : 'var(--border)'
        }`,
        borderRadius: 18,
        boxShadow: hovered
          ? '0 12px 32px rgba(0, 0, 0, 0.07)'
          : '0 1px 3px rgba(0, 0, 0, 0.025)',
        transform: hovered
          ? 'translateY(-2px)'
          : 'translateY(0)',
        transition:
          'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -28,
          right: -28,
          width: 90,
          height: 90,
          background:
            'color-mix(in srgb, var(--accent) 6%, transparent)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 650,
              color: 'var(--text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {label}
          </p>

          <p
            title={String(value)}
            style={{
              margin: '8px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily:
                "'Cabinet Grotesk', sans-serif",
              fontSize:
                'clamp(18px, 3vw, 23px)',
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.035em',
            }}
          >
            {value}
          </p>

          <p
            style={{
              margin: '4px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 10.5,
              color: 'var(--text-subtle)',
              textTransform: 'capitalize',
            }}
          >
            {sub}
          </p>
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 11,
            color: 'var(--text-muted)',
          }}
        >
          <Icon
            size={15}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
}) {
  const [hovered, setHovered] =
    useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '9px 14px',
        backgroundColor: 'var(--accent)',
        border: 'none',
        borderRadius: 12,
        boxShadow: hovered
          ? '0 8px 20px color-mix(in srgb, var(--accent) 28%, transparent)'
          : '0 4px 12px color-mix(in srgb, var(--accent) 18%, transparent)',
        color: 'var(--bg)',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transform: hovered
          ? 'translateY(-1px)'
          : 'translateY(0)',
        transition:
          'box-shadow 0.15s ease, transform 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({
  children,
  onClick,
}) {
  const [hovered, setHovered] =
    useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '9px 13px',
        backgroundColor: hovered
          ? 'var(--input-bg)'
          : 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        color: 'var(--text-muted)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition:
          'background-color 0.15s ease, transform 0.15s ease',
        transform: hovered
          ? 'translateY(-1px)'
          : 'translateY(0)',
      }}
    >
      {children}
    </button>
  )
}

export default function Dashboard({
  user,
  dark,
  setDark,
}) {
  const [expenses, setExpenses] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showModal, setShowModal] =
    useState(false)

  const [showProfile, setShowProfile] =
    useState(false)

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('All')

  const [dateFilter, setDateFilter] =
    useState('this_month')

  const [activeTab, setActiveTab] =
    useState('Expenses')

  const [search, setSearch] =
    useState('')

  const [sortBy, setSortBy] =
    useState('date')

  const [sortDir, setSortDir] =
    useState('desc')

  const [profile, setProfile] =
    useState(null)

  const [rates, setRates] =
    useState(null)

  const [budgets, setBudgets] =
    useState([])

  const [walletsList, setWalletsList] =
    useState([])

  const [incomeList, setIncomeList] =
    useState([])

  const [billsList, setBillsList] =
    useState([])

  const [loansList, setLoansList] =
    useState([])

  const [savingsList, setSavingsList] =
    useState([])

  const windowWidth = useWindowWidth()

  useEffect(() => {
    fetchExpenses()
  }, [dateFilter, user.id])

  useEffect(() => {
    fetchProfile()
    fetchBudgets()
  }, [user.id])

  useEffect(() => {
    getExchangeRates().then((data) =>
      setRates(data)
    )
  }, [])

  async function fetchScoreData() {
    const [wallets, income, bills, loans, savings] =
      await Promise.all([
        supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('income')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('bills')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('loans')
          .select('*')
          .eq('user_id', user.id),

        supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id),
      ])

    if (wallets.error) {
      console.error(
        'Error fetching wallets:',
        wallets.error
      )
    }

    if (income.error) {
      console.error(
        'Error fetching income:',
        income.error
      )
    }

    if (bills.error) {
      console.error(
        'Error fetching bills:',
        bills.error
      )
    }

    if (loans.error) {
      console.error(
        'Error fetching loans:',
        loans.error
      )
    }

    if (savings.error) {
      console.error(
        'Error fetching savings:',
        savings.error
      )
    }

    setWalletsList(wallets.data || [])
    setIncomeList(income.data || [])
    setBillsList(bills.data || [])
    setLoansList(loans.data || [])
    setSavingsList(savings.data || [])
  }

  async function fetchBudgets() {
    const now = new Date()

    const { data, error } =
      await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq(
          'month',
          now.getMonth() + 1
        )
        .eq(
          'year',
          now.getFullYear()
        )

    if (error) {
      console.error(
        'Error fetching budgets:',
        error
      )

      setBudgets([])
      return
    }

    setBudgets(data || [])
  }

  async function fetchProfile() {
    const { data, error } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
      console.error(
        'Error fetching profile:',
        error
      )

      setProfile(null)
      return
    }

    setProfile(data || null)
  }

  async function fetchExpenses() {
    setLoading(true)

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })

    const now = new Date()

    if (dateFilter === 'this_week') {
      const start = new Date(now)

      start.setDate(
        now.getDate() - now.getDay()
      )

      query = query.gte(
        'date',
        start
          .toISOString()
          .split('T')[0]
      )
    } else if (
      dateFilter === 'this_month'
    ) {
      query = query.gte(
        'date',
        `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, '0')}-01`
      )
    } else if (
      dateFilter === 'last_month'
    ) {
      const start = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      )

      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      )

      query = query
        .gte(
          'date',
          start
            .toISOString()
            .split('T')[0]
        )
        .lte(
          'date',
          end
            .toISOString()
            .split('T')[0]
        )
    }

    const { data, error } =
      await query

    if (error) {
      console.error(
        'Error fetching expenses:',
        error
      )

      setExpenses([])
    } else {
      setExpenses(data || [])
    }

    setLoading(false)
  }

  function handleDelete(id) {
    setExpenses((previous) =>
      previous.filter(
        (expense) =>
          expense.id !== id
      )
    )
  }

  function handleUpdated(updatedExpense) {
    setExpenses((previous) =>
      previous.map((expense) =>
        expense.id ===
        updatedExpense.id
          ? updatedExpense
          : expense
      )
    )
  }

  function handleTabChange(tab) {
    setActiveTab(tab)

    if (tab === 'Score') {
      fetchScoreData()
    }
  }

  function clearFilters() {
    setSearch('')
    setCategoryFilter('All')
  }

  const currency =
    profile?.currency || 'PHP'

  const rate = getRate(
    rates,
    currency
  )

  const fmt = (amount) =>
    fmtCurrency(
      amount,
      currency,
      rate
    )

  const filtered = expenses
    .filter(
      (expense) =>
        categoryFilter === 'All' ||
        expense.category ===
          categoryFilter
    )
    .filter((expense) => {
      if (!search.trim()) {
        return true
      }

      const query =
        search.toLowerCase()

      return (
        (expense.notes || '')
          .toLowerCase()
          .includes(query) ||
        (expense.category || '')
          .toLowerCase()
          .includes(query) ||
        (expense.payment_method || '')
          .toLowerCase()
          .includes(query)
      )
    })
    .sort((first, second) => {
      let firstValue
      let secondValue

      if (sortBy === 'date') {
        firstValue = first.date
        secondValue = second.date
      } else if (
        sortBy === 'amount'
      ) {
        firstValue = Number(
          first.amount
        )

        secondValue = Number(
          second.amount
        )
      } else {
        firstValue =
          first.category || ''

        secondValue =
          second.category || ''
      }

      if (
        firstValue < secondValue
      ) {
        return sortDir === 'asc'
          ? -1
          : 1
      }

      if (
        firstValue > secondValue
      ) {
        return sortDir === 'asc'
          ? 1
          : -1
      }

      return 0
    })

  const total = filtered.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  )

  const today = new Date()
    .toISOString()
    .split('T')[0]

  const todayTotal = expenses
    .filter(
      (expense) =>
        expense.date === today
    )
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    )

  const categoryTotals =
    expenses.reduce(
      (totals, expense) => {
        const category =
          expense.category || 'Other'

        totals[category] =
          (totals[category] || 0) +
          Number(expense.amount)

        return totals
      },
      {}
    )

  const topCategory =
    Object.entries(categoryTotals)
      .sort(
        (first, second) =>
          second[1] - first[1]
      )[0]

  const displayName =
    profile?.display_name ||
    user.email?.split('@')[0] ||
    'User'

  const hasActiveFilters =
    search.trim() ||
    categoryFilter !== 'All'

  const isMobile =
    windowWidth < 640

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor:
            'color-mix(in srgb, var(--bg) 82%, transparent)',
          borderBottom:
            '1px solid var(--border)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter:
            'blur(22px)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1480,
            minHeight: 58,
            margin: '0 auto',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 12,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  'var(--text)',
                borderRadius: 11,
                boxShadow:
                  '0 6px 14px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Wallet
                size={16}
                color="var(--bg)"
                strokeWidth={2}
              />
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Cabinet Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 850,
                    color: 'var(--text)',
                    letterSpacing:
                      '-0.04em',
                  }}
                >
                  Rowlr
                </span>

                {currency !== 'PHP' &&
                  rates && (
                    <span
                      style={{
                        padding: '2px 7px',
                        backgroundColor:
                          '#f0fdf4',
                        border:
                          '1px solid #bbf7d0',
                        borderRadius: 99,
                        fontSize: 9,
                        fontWeight: 650,
                        color: '#15803d',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currency}
                    </span>
                  )}
              </div>

              {windowWidth > 720 && (
                <p
                  style={{
                    margin: '1px 0 0',
                    fontSize: 9.5,
                    color:
                      'var(--text-subtle)',
                  }}
                >
                  Personal finance workspace
                </p>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <button
              type="button"
              onClick={() =>
                setShowProfile(true)
              }
              style={{
                minWidth: 0,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 9px 4px 5px',
                backgroundColor:
                  'var(--card)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={
                    profile.avatar_url
                  }
                  alt=""
                  style={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    borderRadius: 9,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    backgroundColor:
                      'var(--input-bg)',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 9,
                  }}
                >
                  <User
                    size={12}
                    color="var(--text-muted)"
                  />
                </div>
              )}

              {windowWidth > 520 && (
                <>
                  <span
                    style={{
                      maxWidth: 130,
                      overflow: 'hidden',
                      textOverflow:
                        'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 11.5,
                      fontWeight: 600,
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    {displayName}
                  </span>

                  <ChevronDown
                    size={12}
                    color="var(--text-subtle)"
                  />
                </>
              )}
            </button>

            <IconButton
              label={
                dark
                  ? 'Use light mode'
                  : 'Use dark mode'
              }
              onClick={() =>
                setDark(!dark)
              }
            >
              {dark ? (
                <Sun size={14} />
              ) : (
                <Moon size={14} />
              )}
            </IconButton>

            <IconButton
              label="Sign out"
              danger
              onClick={() =>
                supabase.auth.signOut()
              }
            >
              <LogOut size={14} />
            </IconButton>
          </div>
        </div>
      </header>

      <main
        style={{
          width: '100%',
          maxWidth: 1480,
          flex: 1,
          margin: '0 auto',
          padding: isMobile
            ? '14px 12px 28px'
            : '22px 22px 36px',
          boxSizing: 'border-box',
        }}
      >
        <BillReminders
          userId={user.id}
        />

        <section
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: isMobile
              ? 'flex-start'
              : 'center',
            justifyContent:
              'space-between',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: '0 0 4px',
                fontSize: 10,
                fontWeight: 650,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Financial overview
            </p>

            <h1
              style={{
                margin: 0,
                fontFamily:
                  "'Cabinet Grotesk', sans-serif",
                fontSize:
                  'clamp(22px, 4vw, 30px)',
                fontWeight: 850,
                color: 'var(--text)',
                letterSpacing: '-0.045em',
              }}
            >
              My Finances
            </h1>

            <p
              style={{
                margin: '5px 0 0',
                fontSize: 11.5,
                lineHeight: 1.45,
                color: 'var(--text-subtle)',
              }}
            >
              Track what you earn, spend,
              save, and owe in one place.
            </p>
          </div>

          {activeTab === 'Expenses' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'flex-end',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {expenses.length > 0 &&
                !isMobile && (
                  <SecondaryButton
                    onClick={() =>
                      exportExpensesToCSV(
                        expenses,
                        currency
                      )
                    }
                  >
                    <Download size={13} />
                    Export CSV
                  </SecondaryButton>
                )}

              <PrimaryButton
                onClick={() =>
                  setShowModal(true)
                }
              >
                <Plus size={14} />
                {isMobile
                  ? 'Add'
                  : 'Add Expense'}
              </PrimaryButton>
            </div>
          )}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(175px, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <SummaryCard
            label="Total Spent"
            value={fmt(total)}
            icon={TrendingDown}
            sub={
              DATE_FILTER_LABELS[
                dateFilter
              ]
            }
            delay={1}
          />

          <SummaryCard
            label="Today's Spend"
            value={fmt(todayTotal)}
            icon={Calendar}
            sub="Today"
            delay={2}
          />

          <SummaryCard
            label="Top Category"
            value={
              topCategory
                ? topCategory[0]
                : '—'
            }
            icon={Filter}
            sub={
              topCategory
                ? fmt(topCategory[1])
                : 'No spending data'
            }
            delay={3}
          />
        </section>

        <section
          style={{
            marginBottom: 16,
          }}
        >
          {isMobile ? (
            <div
              style={{
                position: 'relative',
              }}
            >
              <select
                value={activeTab}
                onChange={(event) =>
                  handleTabChange(
                    event.target.value
                  )
                }
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding:
                    '10px 40px 10px 14px',
                  appearance: 'none',
                  WebkitAppearance:
                    'none',
                  backgroundColor:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 14,
                  boxShadow:
                    '0 2px 8px rgba(0, 0, 0, 0.025)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: 'var(--text)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {TABS.map((tab) => (
                  <option
                    key={tab}
                    value={tab}
                  >
                    {tab}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: 14,
                  transform:
                    'translateY(-50%)',
                  color:
                    'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: 3,
                padding: 4,
                overflowX: 'auto',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 15,
              }}
            >
              {TABS.map((tab) => {
                const active =
                  activeTab === tab

                return (
                  <button
                    type="button"
                    key={tab}
                    onClick={() =>
                      handleTabChange(tab)
                    }
                    style={{
                      minHeight: 34,
                      flexShrink: 0,
                      padding: '7px 13px',
                      backgroundColor:
                        active
                          ? 'var(--card)'
                          : 'transparent',
                      border: active
                        ? '1px solid var(--border)'
                        : '1px solid transparent',
                      borderRadius: 11,
                      boxShadow: active
                        ? '0 2px 8px rgba(0, 0, 0, 0.05)'
                        : 'none',
                      color: active
                        ? 'var(--text)'
                        : 'var(--text-muted)',
                      fontSize: 11.5,
                      fontWeight: active
                        ? 700
                        : 550,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition:
                        'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {activeTab === 'Expenses' ? (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                windowWidth < 900
                  ? '1fr'
                  : 'minmax(0, 1.8fr) minmax(290px, 0.8fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: isMobile
                    ? 12
                    : 14,
                  backgroundColor:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 18,
                  boxShadow:
                    '0 2px 10px rgba(0, 0, 0, 0.025)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      'space-between',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily:
                          "'Cabinet Grotesk', sans-serif",
                        fontSize: 14,
                        fontWeight: 750,
                        color: 'var(--text)',
                      }}
                    >
                      Expense history
                    </h2>

                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: 10.5,
                        color:
                          'var(--text-subtle)',
                      }}
                    >
                      {filtered.length}{' '}
                      {filtered.length === 1
                        ? 'result'
                        : 'results'}
                    </p>
                  </div>

                  {isMobile &&
                    expenses.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          exportExpensesToCSV(
                            expenses,
                            currency
                          )
                        }
                        aria-label="Export CSV"
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          backgroundColor:
                            'var(--input-bg)',
                          border:
                            '1px solid var(--border)',
                          borderRadius: 10,
                          color:
                            'var(--text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        <Download
                          size={13}
                        />
                      </button>
                    )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      windowWidth < 700
                        ? '1fr'
                        : 'minmax(180px, 1fr) auto auto',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                    }}
                  >
                    <Search
                      size={14}
                      style={{
                        position:
                          'absolute',
                        top: '50%',
                        left: 12,
                        transform:
                          'translateY(-50%)',
                        color:
                          'var(--text-subtle)',
                        pointerEvents:
                          'none',
                      }}
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search notes, category, or payment method"
                      style={{
                        width: '100%',
                        minHeight: 40,
                        padding:
                          '9px 36px 9px 34px',
                        backgroundColor:
                          'var(--input-bg)',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 12,
                        boxSizing:
                          'border-box',
                        fontFamily:
                          'inherit',
                        fontSize: 11.5,
                        color:
                          'var(--text)',
                        outline: 'none',
                      }}
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch('')
                        }
                        aria-label="Clear search"
                        style={{
                          position:
                            'absolute',
                          top: '50%',
                          right: 9,
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          transform:
                            'translateY(-50%)',
                          background:
                            'none',
                          border: 'none',
                          color:
                            'var(--text-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <select
                    value={dateFilter}
                    onChange={(event) =>
                      setDateFilter(
                        event.target.value
                      )
                    }
                    style={{
                      minHeight: 40,
                      padding: '8px 11px',
                      backgroundColor:
                        'var(--input-bg)',
                      border:
                        '1px solid var(--border)',
                      borderRadius: 12,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--text)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="this_week">
                      This Week
                    </option>

                    <option value="this_month">
                      This Month
                    </option>

                    <option value="last_month">
                      Last Month
                    </option>

                    <option value="all">
                      All Time
                    </option>
                  </select>

                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                    }}
                  >
                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                      style={{
                        minHeight: 40,
                        flex: 1,
                        padding:
                          '8px 11px',
                        backgroundColor:
                          'var(--input-bg)',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 12,
                        fontSize: 11.5,
                        fontWeight: 600,
                        color:
                          'var(--text)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="date">
                        Date
                      </option>

                      <option value="amount">
                        Amount
                      </option>

                      <option value="category">
                        Category
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        setSortDir(
                          (direction) =>
                            direction ===
                            'asc'
                              ? 'desc'
                              : 'asc'
                        )
                      }
                      aria-label="Change sort direction"
                      title={
                        sortDir === 'asc'
                          ? 'Ascending'
                          : 'Descending'
                      }
                      style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        backgroundColor:
                          'var(--input-bg)',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 12,
                        color:
                          'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <ArrowUpDown
                        size={14}
                      />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 10,
                    paddingBottom: 2,
                    overflowX: 'auto',
                  }}
                >
                  {CATEGORIES.map(
                    (category) => {
                      const active =
                        categoryFilter ===
                        category

                      return (
                        <button
                          type="button"
                          key={category}
                          onClick={() =>
                            setCategoryFilter(
                              category
                            )
                          }
                          style={{
                            minHeight: 29,
                            flexShrink: 0,
                            padding:
                              '5px 10px',
                            backgroundColor:
                              active
                                ? 'var(--accent)'
                                : 'transparent',
                            border:
                              active
                                ? '1px solid var(--accent)'
                                : '1px solid var(--border)',
                            borderRadius: 99,
                            color: active
                              ? 'var(--bg)'
                              : 'var(--text-muted)',
                            fontSize: 10.5,
                            fontWeight:
                              active
                                ? 700
                                : 550,
                            cursor:
                              'pointer',
                            transition:
                              'background-color 0.15s ease, color 0.15s ease',
                          }}
                        >
                          {category}
                        </button>
                      )
                    }
                  )}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      style={{
                        minHeight: 29,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: 4,
                        padding:
                          '5px 9px',
                        backgroundColor:
                          'transparent',
                        border:
                          '1px solid transparent',
                        borderRadius: 99,
                        color:
                          'var(--text-subtle)',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      <X size={10} />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    minHeight: 220,
                    display: 'flex',
                    flexDirection:
                      'column',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    gap: 10,
                    backgroundColor:
                      'var(--card)',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 18,
                  }}
                >
                  <Loader2
                    size={21}
                    color="var(--text-subtle)"
                    className="animate-spin"
                  />

                  <span
                    style={{
                      fontSize: 11,
                      color:
                        'var(--text-subtle)',
                    }}
                  >
                    Loading expenses
                  </span>
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    minHeight: 250,
                    display: 'flex',
                    flexDirection:
                      'column',
                    alignItems: 'center',
                    justifyContent:
                      'center',
                    padding: 30,
                    textAlign: 'center',
                    backgroundColor:
                      'var(--card)',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 18,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      backgroundColor:
                        'var(--input-bg)',
                      border:
                        '1px solid var(--border)',
                      borderRadius: 15,
                    }}
                  >
                    <ReceiptText
                      size={21}
                      color="var(--text-subtle)"
                    />
                  </div>

                  <h3
                    style={{
                      margin:
                        '14px 0 0',
                      fontFamily:
                        "'Cabinet Grotesk', sans-serif",
                      fontSize: 14,
                      fontWeight: 750,
                      color:
                        'var(--text)',
                    }}
                  >
                    No expenses found
                  </h3>

                  <p
                    style={{
                      maxWidth: 300,
                      margin:
                        '5px 0 0',
                      fontSize: 11,
                      lineHeight: 1.5,
                      color:
                        'var(--text-subtle)',
                    }}
                  >
                    {hasActiveFilters
                      ? 'Try changing or resetting your current filters.'
                      : 'Your recorded expenses will appear here.'}
                  </p>

                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      style={{
                        marginTop: 14,
                        padding:
                          '8px 12px',
                        backgroundColor:
                          'var(--input-bg)',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 11,
                        color:
                          'var(--text-muted)',
                        fontSize: 11,
                        fontWeight: 650,
                        cursor: 'pointer',
                      }}
                    >
                      Reset filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setShowModal(true)
                      }
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: 6,
                        padding:
                          '8px 12px',
                        backgroundColor:
                          'var(--accent)',
                        border: 'none',
                        borderRadius: 11,
                        color:
                          'var(--bg)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={12} />
                      Add expense
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection:
                      'column',
                    gap: 8,
                  }}
                >
                  {filtered.map(
                    (expense) => (
                      <ExpenseItem
                        key={expense.id}
                        expense={expense}
                        onDelete={
                          handleDelete
                        }
                        onUpdated={
                          handleUpdated
                        }
                        currency={currency}
                        rate={rate}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            <aside
              style={{
                minWidth: 0,
                position:
                  windowWidth >= 900
                    ? 'sticky'
                    : 'static',
                top:
                  windowWidth >= 900
                    ? 76
                    : 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                  paddingLeft: 2,
                }}
              >
                <Sparkles
                  size={12}
                  color="var(--text-subtle)"
                />

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 650,
                    color:
                      'var(--text-subtle)',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '0.07em',
                  }}
                >
                  Smart insights
                </span>
              </div>

              <AIInsights
                expenses={expenses}
              />
            </aside>
          </section>
        ) : activeTab === 'Analytics' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <Analytics
              expenses={expenses}
              currency={currency}
              rate={rate}
              displayName={displayName}
              budgets={budgets}
            />

            <ExchangeRateWidget
              userCurrency={currency}
            />
          </div>
        ) : activeTab === 'Budgets' ? (
          <BudgetGoals
            userId={user.id}
            expenses={expenses}
            currency={currency}
            rate={rate}
          />
        ) : activeTab ===
          'Wallets & Income' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            <WalletSection
              userId={user.id}
              currency={currency}
              rate={rate}
            />

            <IncomeSection
              userId={user.id}
              currency={currency}
              rate={rate}
            />
          </div>
        ) : activeTab === 'Bills' ? (
          <BillsSection
            userId={user.id}
            currency={currency}
            rate={rate}
          />
        ) : activeTab === 'Expense Plans' ? (
          <ExpensePlansSection
            userId={user.id}
            currency={currency}
            rate={rate}
            onExpenseCreated={(expense) =>
              setExpenses((previous) => [
                expense,
                ...previous,
              ])
            }
          />
        ) : activeTab === 'Loans' ? (
          <LoansSection
            userId={user.id}
            currency={currency}
            rate={rate}
          />
        ) : activeTab === 'Savings' ? (
          <SavingsGoals
            userId={user.id}
            currency={currency}
            rate={rate}
          />
        ) : activeTab === 'Net Worth' ? (
          <NetWorth
            userId={user.id}
            expenses={expenses}
            currency={currency}
            rate={rate}
          />
        ) : activeTab === 'Notes' ? (
          <FinancialNotes
            userId={user.id}
          />
        ) : activeTab === 'Calendar' ? (
          <FinancialCalendar
            expenses={expenses}
            currency={currency}
            rate={rate}
          />
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

      <footer
        style={{
          padding: '18px 16px',
          textAlign: 'center',
          borderTop:
            '1px solid var(--border)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10.5,
            color: 'var(--text-subtle)',
          }}
        >
          © 2026 RRC Development
        </p>
      </footer>

      {showModal && (
        <AddExpenseModal
          onClose={() =>
            setShowModal(false)
          }
          onSaved={(expense) =>
            setExpenses((previous) => [
              expense,
              ...previous,
            ])
          }
          userId={user.id}
          currency={currency}
          rate={rate}
        />
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() =>
            setShowProfile(false)
          }
          onSaved={(data) => {
            setProfile(data)

            forceRefreshRates()

            getExchangeRates().then(
              (newRates) =>
                setRates(newRates)
            )
          }}
        />
      )}
    </div>
  )
}