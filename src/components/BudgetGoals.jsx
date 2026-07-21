import { useState, useEffect } from 'react'
import {
  Target,
  Plus,
  X,
  Loader2,
  Pencil,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import ConfirmDialog from './ConfirmDialog'

const CATEGORIES = [
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

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function BudgetModal({
  userId,
  existing,
  defaultMonth,
  defaultYear,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    category: existing?.category || 'Food',
    amount: existing?.amount || '',
    month: existing?.month || defaultMonth,
    year: existing?.year || defaultYear,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()

    const amount = parseFloat(form.amount)
    const month = parseInt(form.month, 10)
    const year = parseInt(form.year, 10)

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (!month || month < 1 || month > 12) {
      setError('Please select a valid month.')
      return
    }

    if (!year || year < 2000 || year > 2100) {
      setError('Please enter a valid year.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (existing) {
        const { data, error: updateError } = await supabase
          .from('budgets')
          .update({
            amount,
          })
          .eq('id', existing.id)
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          console.error('Budget update error:', updateError)
          setError('Failed to update budget.')
          return
        }

        onSaved(data)
        onClose()
      } else {
        const { data, error: saveError } = await supabase
          .from('budgets')
          .upsert(
            [
              {
                user_id: userId,
                category: form.category,
                amount,
                month,
                year,
              },
            ],
            {
              onConflict: 'user_id,category,month,year',
            }
          )
          .select()
          .single()

        if (saveError) {
          console.error('Budget save error:', saveError)
          setError('Failed to save budget.')
          return
        }

        onSaved(data)
        onClose()
      }
    } catch (submitError) {
      console.error('Unexpected budget error:', submitError)
      setError('Something went wrong while saving the budget.')
    } finally {
      setSaving(false)
    }
  }

  const s = {
    input: {
      width: '100%',
      padding: '10px 14px',
      backgroundColor: 'var(--input-bg)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      fontSize: 13,
      color: 'var(--text)',
      outline: 'none',
    },
    label: {
      display: 'block',
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--text-muted)',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  }

  return (
    <div
      className="animate-overlay-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="animate-modal-in"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text)',
              margin: 0,
            }}
          >
            {existing ? 'Edit Budget' : 'Set Budget Goal'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {!existing && (
            <div>
              <label style={s.label}>Category</label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    category: e.target.value,
                  }))
                }
                style={s.input}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={s.label}>
              Monthly Budget Limit (₱) *
            </label>

            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  amount: e.target.value,
                }))
              }
              placeholder="e.g. 3000"
              style={s.input}
            />
          </div>

          {!existing && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <label style={s.label}>Month</label>

                <select
                  value={form.month}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      month: Number(e.target.value),
                    }))
                  }
                  style={s.input}
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={s.label}>Year</label>

                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.year}
                  onChange={(e) =>
                    setForm((previous) => ({
                      ...previous,
                      year: Number(e.target.value),
                    }))
                  }
                  style={s.input}
                />
              </div>
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: 12,
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '8px 12px',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1,
                padding: '10px 0',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-muted)',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '10px 0',
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={13} />
                  {existing ? 'Update' : 'Set Budget'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BudgetGoals({
  userId,
  expenses = [],
  currency = 'PHP',
}) {
  const currentDate = new Date()

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  )
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  )

  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setBudgets([])
      setLoading(false)
      return
    }

    async function fetchBudgets() {
      setLoading(true)

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('category', {
          ascending: true,
        })

      if (error) {
        console.error('Failed to fetch budgets:', error)
        setBudgets([])
      } else {
        setBudgets(data || [])
      }

      setLoading(false)
    }

    fetchBudgets()
  }, [userId, selectedMonth, selectedYear])

  function goToPreviousMonth() {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear((previous) => previous - 1)
    } else {
      setSelectedMonth((previous) => previous - 1)
    }
  }

  function goToNextMonth() {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear((previous) => previous + 1)
    } else {
      setSelectedMonth((previous) => previous + 1)
    }
  }

  function goToCurrentMonth() {
    const now = new Date()

    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
  }

  async function handleDelete(id) {
    setDeleteLoading(true)

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to delete budget:', error)
      setDeleteLoading(false)
      return
    }

    setBudgets((previous) =>
      previous.filter((budget) => budget.id !== id)
    )

    setConfirmDelete(null)
    setDeleteLoading(false)
  }

  function handleSaved(budget) {
    const savedMonth = Number(budget.month)
    const savedYear = Number(budget.year)

    /*
     * When a budget is created for a different month,
     * automatically show that month after saving.
     */
    if (
      savedMonth !== selectedMonth ||
      savedYear !== selectedYear
    ) {
      setSelectedMonth(savedMonth)
      setSelectedYear(savedYear)
      setEditingBudget(null)
      return
    }

    setBudgets((previous) => {
      const existingBudget = previous.find(
        (item) => item.id === budget.id
      )

      if (existingBudget) {
        return previous.map((item) =>
          item.id === budget.id ? budget : item
        )
      }

      return [...previous, budget].sort((a, b) =>
        a.category.localeCompare(b.category)
      )
    })

    setEditingBudget(null)
  }

  /*
   * Calculate spending only for the exact selected
   * month and selected year.
   */
  const categorySpending = expenses
    .filter((expense) => {
      if (!expense.date) return false

      const datePart = String(expense.date).slice(0, 10)
      const [year, month] = datePart
        .split('-')
        .map(Number)

      return (
        year === selectedYear &&
        month === selectedMonth
      )
    })
    .reduce((accumulator, expense) => {
      const amount = Number(expense.amount) || 0
      const category = expense.category || 'Other'

      accumulator[category] =
        (accumulator[category] || 0) + amount

      return accumulator
    }, {})

  const symbol =
    currency === 'PHP'
      ? '₱'
      : currency === 'USD'
        ? '$'
        : currency

  const fmtAmt = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString(
      'en-PH',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`

  const selectedPeriodLabel =
    `${MONTHS[selectedMonth - 1]} ${selectedYear}`

  const isCurrentMonth =
    selectedMonth === currentDate.getMonth() + 1 &&
    selectedYear === currentDate.getFullYear()

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Target size={14} color="var(--text)" />

            <h3
              style={{
                fontFamily:
                  "'Cabinet Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              Budget Goals
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingBudget(null)
              setShowModal(true)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '8px 10px',
            marginBottom: 14,
            backgroundColor: 'var(--input-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              borderRadius: 8,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={15} />
          </button>

          <button
            type="button"
            onClick={goToCurrentMonth}
            title="Go to current month"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text)',
              }}
            >
              {selectedPeriodLabel}
            </span>

            {!isCurrentMonth && (
              <span
                style={{
                  display: 'block',
                  marginTop: 2,
                  fontSize: 9,
                  color: 'var(--text-subtle)',
                }}
              >
                Click to return to current month
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              borderRadius: 8,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            <Loader2
              size={16}
              color="var(--text-subtle)"
              className="animate-spin"
              style={{
                margin: '0 auto',
              }}
            />
          </div>
        ) : budgets.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
            }}
          >
            <Target
              size={24}
              color="var(--border)"
              style={{
                margin: '0 auto 8px',
              }}
            />

            <p
              style={{
                fontSize: 12,
                color: 'var(--text-subtle)',
                margin: 0,
              }}
            >
              No budget goals for {selectedPeriodLabel}.
            </p>

            <p
              style={{
                fontSize: 11,
                color: 'var(--text-subtle)',
                marginTop: 4,
              }}
            >
              Set limits to track your spending!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {budgets.map((budget) => {
              const budgetAmount =
                Number(budget.amount) || 0

              const spent =
                categorySpending[budget.category] || 0

              const rawPercentage =
                budgetAmount > 0
                  ? (spent / budgetAmount) * 100
                  : 0

              const percentageWidth = Math.min(
                rawPercentage,
                100
              )

              const isOver = spent > budgetAmount
              const isClose =
                !isOver && rawPercentage >= 80

              const barColor = isOver
                ? '#ef4444'
                : isClose
                  ? '#f97316'
                  : '#16a34a'

              const backgroundColor = isOver
                ? '#fef2f2'
                : isClose
                  ? '#fff7ed'
                  : 'var(--input-bg)'

              const borderColor = isOver
                ? '#fecaca'
                : isClose
                  ? '#fed7aa'
                  : 'var(--border)'

              return (
                <div
                  key={budget.id}
                  style={{
                    padding: '10px 12px',
                    backgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text)',
                        }}
                      >
                        {budget.category}
                      </span>

                      {isOver && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 20,
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                          }}
                        >
                          Over!
                        </span>
                      )}

                      {isClose && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 20,
                            backgroundColor: '#fff7ed',
                            color: '#f97316',
                            border: '1px solid #fed7aa',
                          }}
                        >
                          80%+
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: isOver
                            ? '#ef4444'
                            : 'var(--text-muted)',
                          fontWeight: isOver ? 700 : 400,
                        }}
                      >
                        {fmtAmt(spent)} /{' '}
                        {fmtAmt(budgetAmount)}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudget(budget)
                          setShowModal(true)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          padding: 2,
                        }}
                      >
                        <Pencil size={11} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDelete(budget)
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#fca5a5',
                          display: 'flex',
                          padding: 2,
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      height: 6,
                      backgroundColor: 'var(--border)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentageWidth}%`,
                        backgroundColor: barColor,
                        borderRadius: 99,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      color: 'var(--text-subtle)',
                      marginTop: 4,
                      marginBottom: 0,
                    }}
                  >
                    {isOver
                      ? `${fmtAmt(
                          spent - budgetAmount
                        )} over budget`
                      : `${fmtAmt(
                          budgetAmount - spent
                        )} remaining`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal
          userId={userId}
          existing={editingBudget}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
          onClose={() => {
            setShowModal(false)
            setEditingBudget(null)
          }}
          onSaved={handleSaved}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Budget Goal?"
          message={`Are you sure you want to delete the budget for ${confirmDelete.category} in ${MONTHS[Number(confirmDelete.month) - 1]} ${confirmDelete.year}?`}
          confirmText={
            deleteLoading ? 'Deleting...' : 'Delete'
          }
          onConfirm={() =>
            handleDelete(confirmDelete.id)
          }
          onClose={() => {
            if (!deleteLoading) {
              setConfirmDelete(null)
            }
          }}
        />
      )}
    </>
  )
}