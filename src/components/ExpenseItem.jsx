import { useState } from 'react'
import {
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  CalendarDays,
  CreditCard,
  Tag,
  Wallet,
  FileText,
  Info,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt } from '../lib/currency'
import ConfirmDialog from './ConfirmDialog'

const CATEGORY_COLORS = {
  Food: {
    bg: '#fff7ed',
    text: '#ea580c',
    border: '#fed7aa',
    dot: '#f97316',
  },
  Transport: {
    bg: '#eff6ff',
    text: '#2563eb',
    border: '#bfdbfe',
    dot: '#3b82f6',
  },
  Shopping: {
    bg: '#fdf2f8',
    text: '#db2777',
    border: '#fbcfe8',
    dot: '#ec4899',
  },
  Bills: {
    bg: '#fef2f2',
    text: '#dc2626',
    border: '#fecaca',
    dot: '#ef4444',
  },
  Health: {
    bg: '#f0fdf4',
    text: '#16a34a',
    border: '#bbf7d0',
    dot: '#22c55e',
  },
  Entertainment: {
    bg: '#faf5ff',
    text: '#9333ea',
    border: '#e9d5ff',
    dot: '#a855f7',
  },
  Education: {
    bg: '#eef2ff',
    text: '#4f46e5',
    border: '#c7d2fe',
    dot: '#6366f1',
  },
  Savings: {
    bg: '#f0fdfa',
    text: '#0f766e',
    border: '#99f6e4',
    dot: '#14b8a6',
  },
  Other: {
    bg: '#f9fafb',
    text: '#4b5563',
    border: '#e5e7eb',
    dot: '#9ca3af',
  },
}

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

const PAYMENT_METHODS = [
  'Cash',
  'GCash',
  'Maya',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Other',
]

function Field({
  label,
  icon: Icon,
  required = false,
  hint,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 7,
          fontSize: 11,
          fontWeight: 650,
          color: 'var(--text-muted)',
          letterSpacing: '0.02em',
        }}
      >
        {Icon && <Icon size={13} strokeWidth={1.8} />}

        <span>
          {label}
          {required && (
            <span
              style={{
                marginLeft: 3,
                color: '#ef4444',
              }}
            >
              *
            </span>
          )}
        </span>
      </label>

      {children}

      {hint && (
        <p
          style={{
            margin: '6px 2px 0',
            fontSize: 10.5,
            lineHeight: 1.45,
            color: 'var(--text-subtle)',
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

function EditExpenseModal({
  expense,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    notes: expense.notes || '',
    payment_method: expense.payment_method || 'Cash',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const inputStyle = {
    width: '100%',
    minHeight: 42,
    padding: '10px 12px',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 11,
    fontFamily: 'inherit',
    fontSize: 13,
    color: 'var(--text)',
    outline: 'none',
    transition:
      'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
    boxSizing: 'border-box',
  }

  function handleFocus(event) {
    event.currentTarget.style.borderColor =
      'var(--accent)'

    event.currentTarget.style.boxShadow =
      '0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent)'
  }

  function handleBlur(event) {
    event.currentTarget.style.borderColor =
      'var(--border)'

    event.currentTarget.style.boxShadow = 'none'
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const parsedAmount = Number(form.amount)

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }

    if (!form.date) {
      setError('Please select a valid date.')
      return
    }

    setSaving(true)
    setError(null)

    const oldAmount = Number(expense.amount)
    const amountDifference =
      parsedAmount - oldAmount

    try {
      const {
        data,
        error: updateError,
      } = await supabase
        .from('expenses')
        .update({
          amount: parsedAmount,
          category: form.category,
          date: form.date,
          notes: form.notes.trim() || null,
          payment_method: form.payment_method,
        })
        .eq('id', expense.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      if (
        expense.wallet_id &&
        amountDifference !== 0
      ) {
        const {
          data: wallet,
          error: walletFetchError,
        } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', expense.wallet_id)
          .single()

        if (walletFetchError) {
          throw walletFetchError
        }

        if (wallet) {
          const adjustedBalance =
            Number(wallet.balance) -
            amountDifference

          const { error: walletUpdateError } =
            await supabase
              .from('wallets')
              .update({
                balance: adjustedBalance,
              })
              .eq('id', expense.wallet_id)

          if (walletUpdateError) {
            throw walletUpdateError
          }
        }
      }

      onSaved(data)
      onClose()
    } catch (submitError) {
      console.error(
        'Failed to update expense:',
        submitError
      )

      setError(
        'We could not update this expense. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="animate-overlay-in"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose()
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.46)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      <div
        className="animate-modal-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-expense-title"
        style={{
          width: '100%',
          maxWidth: 460,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 22,
          boxShadow:
            '0 28px 80px rgba(0, 0, 0, 0.22), 0 3px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '17px 18px',
            backgroundColor:
              'color-mix(in srgb, var(--card) 92%, transparent)',
            borderBottom:
              '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '22px 22px 0 0',
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <h2
              id="edit-expense-title"
              style={{
                margin: 0,
                fontFamily:
                  "'Cabinet Grotesk', sans-serif",
                fontSize: 16,
                fontWeight: 750,
                color: 'var(--text)',
                letterSpacing: '-0.015em',
              }}
            >
              Edit expense
            </h2>

            <p
              style={{
                margin: '3px 0 0',
                fontSize: 11,
                color: 'var(--text-subtle)',
              }}
            >
              Update the transaction details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close edit expense"
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: 9,
              color: 'var(--text-muted)',
              cursor: saving
                ? 'not-allowed'
                : 'pointer',
              opacity: saving ? 0.55 : 1,
            }}
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
            padding: 20,
          }}
        >
          <Field
            label="Amount"
            icon={Wallet}
            required
          >
            <div
              style={{
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 13,
                  transform: 'translateY(-50%)',
                  fontSize: 14,
                  fontWeight: 650,
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              >
                ₱
              </span>

              <input
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    amount: event.target.value,
                  }))
                }
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="0.00"
                style={{
                  ...inputStyle,
                  height: 48,
                  paddingLeft: 32,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              />
            </div>

            {expense.wallet_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 7,
                  marginTop: 8,
                  padding: '8px 10px',
                  backgroundColor:
                    'color-mix(in srgb, var(--accent) 7%, var(--input-bg))',
                  border:
                    '1px solid color-mix(in srgb, var(--accent) 15%, var(--border))',
                  borderRadius: 10,
                }}
              >
                <Info
                  size={13}
                  style={{
                    flexShrink: 0,
                    marginTop: 1,
                    color: 'var(--accent)',
                  }}
                />

                <p
                  style={{
                    margin: 0,
                    fontSize: 10.5,
                    lineHeight: 1.45,
                    color: 'var(--text-muted)',
                  }}
                >
                  Changing the amount will
                  automatically adjust the linked
                  wallet balance.
                </p>
              </div>
            )}
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 14,
            }}
          >
            <Field
              label="Category"
              icon={Tag}
            >
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category: event.target.value,
                  }))
                }
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
              >
                {CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Payment method"
              icon={CreditCard}
            >
              <select
                value={form.payment_method}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    payment_method:
                      event.target.value,
                  }))
                }
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={inputStyle}
              >
                {PAYMENT_METHODS.map(
                  (paymentMethod) => (
                    <option
                      key={paymentMethod}
                      value={paymentMethod}
                    >
                      {paymentMethod}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>

          <Field
            label="Date"
            icon={CalendarDays}
            required
          >
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  date: event.target.value,
                }))
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle}
            />
          </Field>

          <Field
            label="Notes"
            icon={FileText}
            hint="Optional. Add a brief description to identify this expense later."
          >
            <textarea
              rows={3}
              value={form.notes}
              maxLength={250}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="What was this expense for?"
              style={{
                ...inputStyle,
                minHeight: 84,
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </Field>

          {error && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 11,
                color: '#dc2626',
              }}
            >
              <Info
                size={14}
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  lineHeight: 1.45,
                }}
              >
                {error}
              </p>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 9,
              paddingTop: 3,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                minWidth: 92,
                minHeight: 40,
                padding: '9px 15px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 11,
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                minWidth: 132,
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '9px 16px',
                backgroundColor: 'var(--accent)',
                border: 'none',
                borderRadius: 11,
                boxShadow:
                  '0 5px 14px color-mix(in srgb, var(--accent) 24%, transparent)',
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--bg)',
                cursor: saving
                  ? 'not-allowed'
                  : 'pointer',
                opacity: saving ? 0.65 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Saving
                </>
              ) : (
                <>
                  <Check size={14} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ExpenseItem({
  expense,
  onDelete,
  onUpdated,
  currency = 'PHP',
  rate = 1,
}) {
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirm, setShowConfirm] =
    useState(false)
  const [isHovered, setIsHovered] =
    useState(false)
  const [deleting, setDeleting] =
    useState(false)

  const color =
    CATEGORY_COLORS[expense.category] ||
    CATEGORY_COLORS.Other

  const formattedDate = new Date(
    `${expense.date}T00:00:00`
  ).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleDelete() {
    setDeleting(true)

    try {
      if (expense.wallet_id) {
        const {
          data: wallet,
          error: walletFetchError,
        } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', expense.wallet_id)
          .single()

        if (walletFetchError) {
          throw walletFetchError
        }

        if (wallet) {
          const restoredBalance =
            Number(wallet.balance) +
            Number(expense.amount)

          const {
            error: walletUpdateError,
          } = await supabase
            .from('wallets')
            .update({
              balance: restoredBalance,
            })
            .eq('id', expense.wallet_id)

          if (walletUpdateError) {
            throw walletUpdateError
          }
        }
      }

      const { error: deleteError } =
        await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id)

      if (deleteError) {
        throw deleteError
      }

      onDelete(expense.id)
      setShowConfirm(false)
    } catch (deleteError) {
      console.error(
        'Failed to delete expense:',
        deleteError
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <article
        className="animate-fade-in"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '13px 14px',
          backgroundColor: 'var(--card)',
          border: `1px solid ${
            isHovered
              ? 'color-mix(in srgb, var(--text) 16%, var(--border))'
              : 'var(--border)'
          }`,
          borderRadius: 16,
          boxShadow: isHovered
            ? '0 8px 24px rgba(0, 0, 0, 0.065)'
            : '0 1px 2px rgba(0, 0, 0, 0.02)',
          transform: isHovered
            ? 'translateY(-1px)'
            : 'translateY(0)',
          transition:
            'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              backgroundColor: color.dot,
              borderRadius: '50%',
              boxShadow: `0 0 0 4px color-mix(in srgb, ${color.dot} 14%, transparent)`,
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              minWidth: 0,
            }}
          >
            <p
              title={
                expense.notes ||
                expense.category
              }
              style={{
                minWidth: 0,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 13,
                fontWeight: 650,
                color: 'var(--text)',
                letterSpacing: '-0.005em',
              }}
            >
              {expense.notes ||
                expense.category}
            </p>

            <span
              style={{
                flexShrink: 0,
                padding: '2px 7px',
                backgroundColor: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: 99,
                fontSize: 9.5,
                fontWeight: 650,
                color: color.text,
              }}
            >
              {expense.category}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 5,
              marginTop: 4,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10.5,
                color: 'var(--text-subtle)',
              }}
            >
              <CalendarDays size={10.5} />
              {formattedDate}
            </span>

            <span
              aria-hidden="true"
              style={{
                color: 'var(--border)',
              }}
            >
              ·
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10.5,
                color: 'var(--text-subtle)',
              }}
            >
              <CreditCard size={10.5} />
              {expense.payment_method ||
                'Not specified'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 750,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {fmt(
              expense.amount,
              currency,
              rate
            )}
          </span>

          {currency !== 'PHP' && (
            <span
              style={{
                marginTop: 2,
                fontSize: 9.5,
                color: 'var(--text-subtle)',
                whiteSpace: 'nowrap',
              }}
            >
              ₱
              {Number(
                expense.amount
              ).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            aria-label="Edit expense"
            title="Edit expense"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              backgroundColor: isHovered
                ? 'var(--input-bg)'
                : 'transparent',
              border: '1px solid transparent',
              borderRadius: 9,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition:
                'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            <Pencil size={13} />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowConfirm(true)
            }
            aria-label="Delete expense"
            title="Delete expense"
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              backgroundColor: isHovered
                ? '#fef2f2'
                : 'transparent',
              border: '1px solid transparent',
              borderRadius: 9,
              color: isHovered
                ? '#ef4444'
                : '#fca5a5',
              cursor: 'pointer',
              transition:
                'background-color 0.15s ease, color 0.15s ease',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </article>

      {showEdit && (
        <EditExpenseModal
          expense={expense}
          onClose={() => setShowEdit(false)}
          onSaved={(updatedExpense) => {
            onUpdated(updatedExpense)
            setShowEdit(false)
          }}
        />
      )}

      {showConfirm && (
        <ConfirmDialog
          title="Delete expense?"
          message={`Delete this expense of ₱${Number(
            expense.amount
          ).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}?${
            expense.wallet_id
              ? ' The amount will be restored to the linked wallet.'
              : ''
          }`}
          confirmText={
            deleting
              ? 'Deleting...'
              : 'Delete'
          }
          onConfirm={handleDelete}
          onClose={() => {
            if (!deleting) {
              setShowConfirm(false)
            }
          }}
        />
      )}
    </>
  )
}