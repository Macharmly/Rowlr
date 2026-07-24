import {
  useEffect,
  useState,
} from 'react'

import {
  Plus,
  CalendarDays,
  Loader2,
  X,
  Trash2,
  Check,
  ReceiptText,
  ChevronDown,
  ChevronUp,
  Wallet,
  Utensils,
  CircleDollarSign,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

import {
  fmt as fmtCurrency,
} from '../lib/currency'

import ConfirmDialog from './ConfirmDialog'

const PLAN_CATEGORIES = [
  'Food',
  'Transport',
  'Accommodation',
  'Shopping',
  'Entertainment',
  'Health',
  'Education',
  'Bills',
  'Activities',
  'Emergency',
  'Other',
]

const inputStyle = {
  width: '100%',
  minHeight: 41,
  padding: '10px 13px',
  boxSizing: 'border-box',
  backgroundColor: 'var(--input-bg)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontFamily: 'inherit',
  fontSize: 12.5,
  color: 'var(--text)',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  fontSize: 10.5,
  fontWeight: 650,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.055em',
}

function getToday() {
  return new Date()
    .toISOString()
    .split('T')[0]
}

function ModalShell({
  title,
  onClose,
  children,
  maxWidth = 440,
}) {
  return (
    <div
      className="animate-overlay-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor:
          'rgba(0, 0, 0, 0.52)',
      }}
    >
      <div
        className="animate-modal-in"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--card)',
          border:
            '1px solid var(--border)',
          borderRadius: 20,
          boxShadow:
            '0 18px 55px rgba(0, 0, 0, 0.22)',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--card)',
            borderBottom:
              '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily:
                "'Cabinet Grotesk', sans-serif",
              fontSize: 16,
              fontWeight: 750,
              color: 'var(--text)',
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              display: 'flex',
              padding: 4,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function FormError({ error }) {
  if (!error) return null

  return (
    <p
      style={{
        margin: 0,
        padding: '9px 11px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: 10,
        fontSize: 11.5,
        color: '#dc2626',
      }}
    >
      {error}
    </p>
  )
}

function FormActions({
  onClose,
  saving,
  submitLabel,
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        marginTop: 4,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          flex: 1,
          minHeight: 40,
          backgroundColor: 'transparent',
          border:
            '1px solid var(--border)',
          borderRadius: 12,
          color: 'var(--text-muted)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        style={{
          flex: 1,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          backgroundColor: 'var(--accent)',
          border: 'none',
          borderRadius: 12,
          color: 'var(--bg)',
          fontSize: 12,
          fontWeight: 700,
          cursor: saving
            ? 'default'
            : 'pointer',
          opacity: saving ? 0.6 : 1,
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
          submitLabel
        )}
      </button>
    </div>
  )
}

function PlanModal({
  userId,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: '',
    start_date: getToday(),
    end_date: '',
    notes: '',
  })

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError(
        'Plan name is required.'
      )
      return
    }

    if (!form.start_date) {
      setError(
        'Start date is required.'
      )
      return
    }

    if (
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError(
        'End date cannot be earlier than the start date.'
      )
      return
    }

    setSaving(true)
    setError(null)

    const {
      data,
      error: insertError,
    } = await supabase
      .from('expense_plans')
      .insert([
        {
          user_id: userId,
          name: form.name.trim(),
          start_date: form.start_date,
          end_date:
            form.end_date || null,
          notes:
            form.notes.trim() || null,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error(
        'Failed to create expense plan:',
        insertError
      )

      setError(
        'Failed to create the expense plan.'
      )

      setSaving(false)
      return
    }

    onSaved({
      ...data,
      items: [],
    })

    onClose()
    setSaving(false)
  }

  return (
    <ModalShell
      title="Create Expense Plan"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 20,
        }}
      >
        <div>
          <label style={labelStyle}>
            Plan Name *
          </label>

          <input
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            placeholder="e.g. Staycation"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>
              Start Date *
            </label>

            <input
              type="date"
              value={form.start_date}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  start_date:
                    event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>
              End Date
            </label>

            <input
              type="date"
              min={
                form.start_date ||
                undefined
              }
              value={form.end_date}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  end_date:
                    event.target.value,
                }))
              }
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Notes
          </label>

          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                notes:
                  event.target.value,
              }))
            }
            placeholder="Optional details about this plan"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
        </div>

        <FormError error={error} />

        <FormActions
          onClose={onClose}
          saving={saving}
          submitLabel="Create Plan"
        />
      </form>
    </ModalShell>
  )
}

function PlanItemModal({
  plan,
  userId,
  onClose,
  onSaved,
}) {
  const [wallets, setWallets] =
    useState([])

  const [loadingWallets, setLoadingWallets] =
    useState(true)

  const [form, setForm] = useState({
    name: '',
    category: 'Other',
    estimated_amount: '',
    scheduled_date:
      plan.start_date || getToday(),
    wallet_id: '',
  })

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState(null)

  useEffect(() => {
    async function fetchWallets() {
      setLoadingWallets(true)

      const {
        data,
        error: walletError,
      } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
          ascending: true,
        })

      if (walletError) {
        console.error(
          'Failed to fetch wallets:',
          walletError
        )
      }

      const walletData =
        data || []

      setWallets(walletData)

      if (walletData.length > 0) {
        setForm((previous) => ({
          ...previous,
          wallet_id: String(
            walletData[0].id
          ),
        }))
      }

      setLoadingWallets(false)
    }

    fetchWallets()
  }, [userId])

  const selectedWallet =
    wallets.find(
      (wallet) =>
        String(wallet.id) ===
        String(form.wallet_id)
    )

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError(
        'Expense name is required.'
      )
      return
    }

    const amount = Number(
      form.estimated_amount
    )

    if (!amount || amount <= 0) {
      setError(
        'Enter a valid estimated amount.'
      )
      return
    }

    if (!form.scheduled_date) {
      setError(
        'Scheduled date is required.'
      )
      return
    }

    if (!form.wallet_id) {
      setError(
        'Please select a wallet.'
      )
      return
    }

    setSaving(true)
    setError(null)

    const {
      data,
      error: insertError,
    } = await supabase
      .from('expense_plan_items')
      .insert([
        {
          plan_id: plan.id,
          user_id: userId,
          name: form.name.trim(),
          category: form.category,
          estimated_amount: amount,
          scheduled_date:
            form.scheduled_date,
          wallet_id:
            form.wallet_id,
          status: 'pending',
          is_spent: false,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error(
        'Failed to create planned expense:',
        insertError
      )

      setError(
        'Failed to add the planned expense.'
      )

      setSaving(false)
      return
    }

    onSaved({
      ...data,
      plannedWallet:
        selectedWallet || null,
      extraExpenses: [],
    })

    onClose()
    setSaving(false)
  }

  return (
    <ModalShell
      title={`Add to ${plan.name}`}
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 20,
        }}
      >
        <div>
          <label style={labelStyle}>
            Expense Name *
          </label>

          <input
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            placeholder="e.g. Hotel"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  category:
                    event.target.value,
                }))
              }
              style={inputStyle}
            >
              {PLAN_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Estimated Amount *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.estimated_amount
              }
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  estimated_amount:
                    event.target.value,
                }))
              }
              placeholder="0.00"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Scheduled Date *
          </label>

          <input
            type="date"
            min={
              plan.start_date ||
              undefined
            }
            max={
              plan.end_date ||
              undefined
            }
            value={
              form.scheduled_date
            }
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                scheduled_date:
                  event.target.value,
              }))
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Deduct From Wallet *
          </label>

          {loadingWallets ? (
            <div
              style={{
                minHeight: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              <Loader2
                size={13}
                className="animate-spin"
              />

              Loading wallets...
            </div>
          ) : wallets.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: '10px 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              No wallets found. Add a
              wallet first.
            </p>
          ) : (
            <select
              value={form.wallet_id}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  wallet_id:
                    event.target.value,
                }))
              }
              style={inputStyle}
            >
              {wallets.map((wallet) => (
                <option
                  key={wallet.id}
                  value={wallet.id}
                >
                  {wallet.name} ({wallet.type})
                  {' — '}
                  {fmtCurrency(
                    wallet.balance,
                    wallet.currency_code ||
                      'PHP',
                    wallet.exchange_rate ||
                      1
                  )}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedWallet &&
          form.estimated_amount && (
            <p
              style={{
                margin: '-5px 0 0',
                fontSize: 11,
                color:
                  Number(
                    selectedWallet.balance
                  ) >=
                  Number(
                    form.estimated_amount
                  )
                    ? 'var(--text-subtle)'
                    : '#dc2626',
              }}
            >
              Estimated balance after
              confirmation:{' '}
              <strong>
                {fmtCurrency(
                  Number(
                    selectedWallet.balance
                  ) -
                    Number(
                      form.estimated_amount ||
                        0
                    ),
                  selectedWallet.currency_code ||
                    'PHP',
                  selectedWallet.exchange_rate ||
                    1
                )}
              </strong>
            </p>
          )}

        <FormError error={error} />

        <FormActions
          onClose={onClose}
          saving={saving}
          submitLabel="Add Expense"
        />
      </form>
    </ModalShell>
  )
}

function WalletExpenseModal({
  title,
  description,
  defaultAmount,
  defaultDate,
  defaultWalletId,
  userId,
  confirmLabel,
  onClose,
  onConfirm,
}) {
  const [wallets, setWallets] =
    useState([])

  const [walletId, setWalletId] =
    useState('')

  const [amount, setAmount] =
    useState(
      String(defaultAmount || '')
    )

  const [expenseDate, setExpenseDate] =
    useState(
      defaultDate || getToday()
    )

  const [loadingWallets, setLoadingWallets] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState(null)

  useEffect(() => {
    async function fetchWallets() {
      setLoadingWallets(true)

      const {
        data,
        error: walletError,
      } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
          ascending: true,
        })

      if (walletError) {
        console.error(
          'Failed to fetch wallets:',
          walletError
        )
      }

      const walletData =
        data || []

        setWallets(walletData)

        if (walletData.length > 0) {
        const plannedWalletExists =
            walletData.some(
            (wallet) =>
                String(wallet.id) ===
                String(defaultWalletId)
            )

        setWalletId(
            plannedWalletExists
            ? String(defaultWalletId)
            : String(walletData[0].id)
        )
        }

        setLoadingWallets(false)
    }

    fetchWallets()
  }, [userId, defaultWalletId])

  const selectedWallet =
    wallets.find(
      (wallet) =>
        String(wallet.id) ===
        String(walletId)
    )

  function walletFmt(value) {
    return fmtCurrency(
      value,
      selectedWallet?.currency_code ||
        'PHP',
      selectedWallet?.exchange_rate ||
        1
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!walletId) {
      setError(
        'Please select a wallet.'
      )
      return
    }

    const finalAmount =
      Number(amount)

    if (
      !finalAmount ||
      finalAmount <= 0
    ) {
      setError(
        'Enter a valid amount.'
      )
      return
    }

    if (!expenseDate) {
      setError(
        'Expense date is required.'
      )
      return
    }

    if (
      Number(
        selectedWallet?.balance || 0
      ) < finalAmount
    ) {
      setError(
        `Insufficient balance. Available: ${walletFmt(
          selectedWallet?.balance || 0
        )}`
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onConfirm({
        amount: finalAmount,
        expenseDate,
        walletId,
        selectedWallet,
      })

      onClose()
    } catch (confirmError) {
      console.error(
        'Failed to process expense:',
        confirmError
      )

      setError(
        confirmError?.message ||
          'Failed to process this expense.'
      )
    }

    setSaving(false)
  }

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      maxWidth={410}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 20,
        }}
      >
        {description && (
          <div
            style={{
              padding: '11px 13px',
              backgroundColor:
                'var(--input-bg)',
              border:
                '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 650,
                color: 'var(--text)',
              }}
            >
              {description}
            </p>
          </div>
        )}

        <div>
          <label style={labelStyle}>
            Final Amount *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value
              )
            }
            style={inputStyle}
          />

          <p
            style={{
              margin: '5px 0 0',
              fontSize: 10,
              color:
                'var(--text-subtle)',
            }}
          >
            You may change the planned
            amount before confirming.
          </p>
        </div>

        <div>
          <label style={labelStyle}>
            Expense Date *
          </label>

          <input
            type="date"
            value={expenseDate}
            onChange={(event) =>
              setExpenseDate(
                event.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Deduct From Wallet *
          </label>

          {loadingWallets ? (
            <div
              style={{
                minHeight: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              <Loader2
                size={13}
                className="animate-spin"
              />
              Loading wallets...
            </div>
          ) : wallets.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: '10px 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              No wallets found. Add a
              wallet first.
            </p>
          ) : (
            <select
              value={walletId}
              onChange={(event) =>
                setWalletId(
                  event.target.value
                )
              }
              style={inputStyle}
            >
              {wallets.map((wallet) => (
                <option
                  key={wallet.id}
                  value={wallet.id}
                >
                  {wallet.name} ({wallet.type})
                  {' — '}
                  {fmtCurrency(
                    wallet.balance,
                    wallet.currency_code ||
                      'PHP',
                    wallet.exchange_rate ||
                      1
                  )}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedWallet &&
          amount && (
            <p
              style={{
                margin: '-5px 0 0',
                fontSize: 11,
                color:
                  Number(
                    selectedWallet.balance
                  ) >= Number(amount)
                    ? 'var(--text-subtle)'
                    : '#dc2626',
              }}
            >
              Balance after expense:{' '}
              <strong>
                {walletFmt(
                  Number(
                    selectedWallet.balance
                  ) -
                    Number(amount || 0)
                )}
              </strong>
            </p>
          )}

        <FormError error={error} />

        <div
          style={{
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: 40,
              backgroundColor:
                'transparent',
              border:
                '1px solid var(--border)',
              borderRadius: 12,
              color:
                'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loadingWallets ||
              wallets.length === 0
            }
            style={{
              flex: 1,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor:
                '#16a34a',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: saving
                ? 'default'
                : 'pointer',
              opacity:
                saving ||
                loadingWallets ||
                wallets.length === 0
                  ? 0.6
                  : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                Processing...
              </>
            ) : (
              <>
                <Check size={13} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ExtraExpenseModal({
  plan,
  item,
  userId,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: '',
    category:
      item.category || 'Other',
    amount: '',
    expense_date:
      item.scheduled_date ||
      plan.start_date ||
      getToday(),
    notes: '',
  })

  const [wallets, setWallets] =
    useState([])

  const [walletId, setWalletId] =
    useState('')

  const [loadingWallets, setLoadingWallets] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState(null)

  useEffect(() => {
    async function fetchWallets() {
      setLoadingWallets(true)

      const {
        data,
        error: walletError,
      } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {
          ascending: true,
        })

      if (walletError) {
        console.error(
          'Failed to fetch wallets:',
          walletError
        )
      }

      const walletData =
        data || []

        setWallets(walletData)

        if (walletData.length > 0) {
            const plannedWalletExists =
                walletData.some(
                (wallet) =>
                    String(wallet.id) ===
                    String(item.wallet_id)
                )

            setWalletId(
                plannedWalletExists
                ? String(item.wallet_id)
                : String(walletData[0].id)
            )
        }

        setLoadingWallets(false)
    }

    fetchWallets()
  }, [userId, item.wallet_id])

  const selectedWallet =
    wallets.find(
      (wallet) =>
        String(wallet.id) ===
        String(walletId)
    )

  function walletFmt(value) {
    return fmtCurrency(
      value,
      selectedWallet?.currency_code ||
        'PHP',
      selectedWallet?.exchange_rate ||
        1
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError(
        'Expense name is required.'
      )
      return
    }

    const amount =
      Number(form.amount)

    if (!amount || amount <= 0) {
      setError(
        'Enter a valid amount.'
      )
      return
    }

    if (!form.expense_date) {
      setError(
        'Expense date is required.'
      )
      return
    }

    if (!walletId) {
      setError(
        'Select a wallet.'
      )
      return
    }

    const walletBalance =
      Number(
        selectedWallet?.balance || 0
      )

    if (walletBalance < amount) {
      setError(
        `Insufficient balance. Available: ${walletFmt(
          walletBalance
        )}`
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      const {
        data: expense,
        error: expenseError,
      } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: userId,
            amount,
            category:
              form.category ||
              'Other',
            date:
              form.expense_date,
            notes: `${plan.name} — ${item.name} — ${form.name.trim()}`,
            payment_method:
              selectedWallet.type,
            wallet_id: walletId,
          },
        ])
        .select()
        .single()

      if (expenseError) {
        throw expenseError
      }

      const {
        error: walletError,
      } = await supabase
        .from('wallets')
        .update({
          balance:
            walletBalance - amount,
        })
        .eq('id', walletId)
        .eq('user_id', userId)

      if (walletError) {
        await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id)

        throw walletError
      }

      const {
        data: extraExpense,
        error: extraError,
      } = await supabase
        .from(
          'expense_plan_extra_expenses'
        )
        .insert([
          {
            user_id: userId,
            plan_id: plan.id,
            plan_item_id: item.id,
            name: form.name.trim(),
            category:
              form.category ||
              'Other',
            amount,
            expense_date:
              form.expense_date,
            wallet_id: walletId,
            expense_id: expense.id,
            notes:
              form.notes.trim() ||
              null,
          },
        ])
        .select()
        .single()

      if (extraError) {
        await supabase
          .from('expenses')
          .delete()
          .eq('id', expense.id)

        await supabase
          .from('wallets')
          .update({
            balance:
              walletBalance,
          })
          .eq('id', walletId)
          .eq('user_id', userId)

        throw extraError
      }

      onSaved(
        extraExpense,
        expense
      )

      onClose()
    } catch (submitError) {
      console.error(
        'Failed to add extra expense:',
        submitError
      )

      setError(
        'Failed to record the extra expense.'
      )
    }

    setSaving(false)
  }

  return (
    <ModalShell
      title="Add Other Expense"
      onClose={onClose}
      maxWidth={440}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: 20,
        }}
      >
        <div
          style={{
            padding: '11px 13px',
            backgroundColor:
              'var(--input-bg)',
            border:
              '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color:
                'var(--text-subtle)',
            }}
          >
            {plan.name}
          </p>

          <p
            style={{
              margin: '3px 0 0',
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {item.name}
          </p>
        </div>

        <div>
          <label style={labelStyle}>
            Expense Name *
          </label>

          <input
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            placeholder="e.g. Pares"
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label style={labelStyle}>
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  category:
                    event.target.value,
                }))
              }
              style={inputStyle}
            >
              {PLAN_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Amount *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  amount:
                    event.target.value,
                }))
              }
              placeholder="0.00"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Expense Date *
          </label>

          <input
            type="date"
            value={
              form.expense_date
            }
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                expense_date:
                  event.target.value,
              }))
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Wallet *
          </label>

          {loadingWallets ? (
            <div
              style={{
                minHeight: 42,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              <Loader2
                size={13}
                className="animate-spin"
              />
              Loading wallets...
            </div>
          ) : wallets.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: '10px 13px',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              No wallets found.
            </p>
          ) : (
            <select
              value={walletId}
              onChange={(event) =>
                setWalletId(
                  event.target.value
                )
              }
              style={inputStyle}
            >
              {wallets.map((wallet) => (
                <option
                  key={wallet.id}
                  value={wallet.id}
                >
                  {wallet.name} ({wallet.type})
                  {' — '}
                  {fmtCurrency(
                    wallet.balance,
                    wallet.currency_code ||
                      'PHP',
                    wallet.exchange_rate ||
                      1
                  )}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedWallet &&
          form.amount && (
            <p
              style={{
                margin: '-5px 0 0',
                fontSize: 11,
                color:
                  Number(
                    selectedWallet.balance
                  ) >=
                  Number(
                    form.amount
                  )
                    ? 'var(--text-subtle)'
                    : '#dc2626',
              }}
            >
              Balance after expense:{' '}
              <strong>
                {walletFmt(
                  Number(
                    selectedWallet.balance
                  ) -
                    Number(
                      form.amount || 0
                    )
                )}
              </strong>
            </p>
          )}

        <div>
          <label style={labelStyle}>
            Notes
          </label>

          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                notes:
                  event.target.value,
              }))
            }
            placeholder="Optional notes"
            rows={2}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
          />
        </div>

        <FormError error={error} />

        <div
          style={{
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: 40,
              backgroundColor:
                'transparent',
              border:
                '1px solid var(--border)',
              borderRadius: 12,
              color:
                'var(--text-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              loadingWallets ||
              wallets.length === 0
            }
            style={{
              flex: 1,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor:
                '#16a34a',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: saving
                ? 'default'
                : 'pointer',
              opacity:
                saving ||
                loadingWallets ||
                wallets.length === 0
                  ? 0.6
                  : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                Recording...
              </>
            ) : (
              <>
                <Wallet size={13} />
                Deduct & Save
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function formatDate(date) {
  if (!date) return 'No date'

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPlanDate(
  startDate,
  endDate
) {
  const startText =
    formatDate(startDate)

  if (
    !endDate ||
    endDate === startDate
  ) {
    return startText
  }

  return `${startText} – ${formatDate(
    endDate
  )}`
}

function getScheduledStatus(date) {
  if (!date) {
    return {
      label: 'No date',
      bg: 'var(--input-bg)',
      text: 'var(--text-muted)',
      border: 'var(--border)',
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const scheduled = new Date(
    `${date}T00:00:00`
  )

  const difference = Math.ceil(
    (scheduled - today) /
      (1000 * 60 * 60 * 24)
  )

  if (difference < 0) {
    return {
      label: 'Past due',
      bg: '#fef2f2',
      text: '#dc2626',
      border: '#fecaca',
    }
  }

  if (difference === 0) {
    return {
      label: 'Today',
      bg: '#f0fdf4',
      text: '#15803d',
      border: '#bbf7d0',
    }
  }

  if (difference === 1) {
    return {
      label: 'Tomorrow',
      bg: '#fffbeb',
      text: '#d97706',
      border: '#fde68a',
    }
  }

  return {
    label: `In ${difference} days`,
    bg: 'var(--input-bg)',
    text: 'var(--text-muted)',
    border: 'var(--border)',
  }
}

export default function ExpensePlansSection({
  userId,
  currency = 'PHP',
  rate = 1,
  onExpenseCreated,
}) {
  const [plans, setPlans] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [showPlanModal, setShowPlanModal] =
    useState(false)

  const [addingToPlan, setAddingToPlan] =
    useState(null)

  const [confirmingItem, setConfirmingItem] =
    useState(null)

  const [addingExtraExpense, setAddingExtraExpense] =
    useState(null)

  const [expandedPlans, setExpandedPlans] =
    useState({})

  const [expandedItems, setExpandedItems] =
    useState({})

  const [
    confirmDeletePlan,
    setConfirmDeletePlan,
  ] = useState(null)

  const [
    confirmDeleteItem,
    setConfirmDeleteItem,
  ] = useState(null)

  useEffect(() => {
    fetchPlans()
  }, [userId])

  async function fetchPlans() {
    setLoading(true)

    const {
        data,
        error,
    } = await supabase
        .from('expense_plans')
        .select(`
            *,
            expense_plan_items (
            *,
            wallets (
                id,
                name,
                type,
                balance
            ),
            expense_plan_extra_expenses (*)
            )
        `)
        .eq('user_id', userId)
        .order('start_date', {
            ascending: true,
        })

    if (error) {
      console.error(
        'Failed to fetch expense plans:',
        error
      )

      setPlans([])
      setLoading(false)
      return
    }

    const formattedPlans = (
      data || []
    ).map((plan) => ({
      ...plan,

      items: (
        plan.expense_plan_items || []
        )
        .map((item) => ({
            ...item,

            plannedWallet:
            item.wallets || null,

            extraExpenses: (
            item.expense_plan_extra_expenses ||
            []
            ).sort(
            (first, second) =>
                new Date(
                first.created_at
                ) -
                new Date(
                second.created_at
                )
            ),
        }))
        .sort((first, second) => {
          if (
            first.scheduled_date &&
            second.scheduled_date
          ) {
            return (
              new Date(
                first.scheduled_date
              ) -
              new Date(
                second.scheduled_date
              )
            )
          }

          return (
            new Date(
              first.created_at
            ) -
            new Date(
              second.created_at
            )
          )
        }),
    }))

    setPlans(formattedPlans)

    const planState = {}
    const itemState = {}

    formattedPlans.forEach((plan) => {
      planState[plan.id] = true

      plan.items.forEach((item) => {
        itemState[item.id] = true
      })
    })

    setExpandedPlans(planState)
    setExpandedItems(itemState)
    setLoading(false)
  }

  async function handleDeletePlan(id) {
    const { error } = await supabase
      .from('expense_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error(
        'Failed to delete plan:',
        error
      )
      return
    }

    setPlans((previous) =>
      previous.filter(
        (plan) => plan.id !== id
      )
    )
  }

  async function handleDeleteItem(
    planId,
    itemId
  ) {
    const { error } = await supabase
      .from('expense_plan_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) {
      console.error(
        'Failed to delete planned expense:',
        error
      )
      return
    }

    setPlans((previous) =>
      previous.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              items:
                plan.items.filter(
                  (item) =>
                    item.id !== itemId
                ),
            }
          : plan
      )
    )
  }

  function handlePlanSaved(plan) {
    setPlans((previous) =>
      [...previous, plan].sort(
        (first, second) =>
          new Date(
            first.start_date
          ) -
          new Date(
            second.start_date
          )
      )
    )

    setExpandedPlans((previous) => ({
      ...previous,
      [plan.id]: true,
    }))
  }

  function handleItemSaved(
    planId,
    item
  ) {
    setPlans((previous) =>
      previous.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              items: [
                ...(plan.items || []),
                item,
              ].sort(
                (first, second) =>
                  new Date(
                    first.scheduled_date
                  ) -
                  new Date(
                    second.scheduled_date
                  )
              ),
            }
          : plan
      )
    )

    setExpandedItems((previous) => ({
      ...previous,
      [item.id]: true,
    }))
  }

  function updatePlanItem(
    planId,
    updatedItem,
    selectedWallet = null
    ) {
    setPlans((previous) =>
        previous.map((plan) =>
        plan.id === planId
            ? {
                ...plan,

                items: plan.items.map(
                (item) =>
                    item.id ===
                    updatedItem.id
                    ? {
                        ...item,
                        ...updatedItem,

                        plannedWallet:
                            selectedWallet ||
                            item.plannedWallet ||
                            null,

                        extraExpenses:
                            item.extraExpenses ||
                            [],
                        }
                    : item
                ),
            }
            : plan
        )
    )
    }

  function addExtraExpenseToItem(
    planId,
    itemId,
    extraExpense
  ) {
    setPlans((previous) =>
      previous.map((plan) =>
        plan.id === planId
          ? {
              ...plan,

              items:
                plan.items.map(
                  (item) =>
                    item.id === itemId
                      ? {
                          ...item,

                          extraExpenses: [
                            ...(item.extraExpenses ||
                              []),
                            extraExpense,
                          ],
                        }
                      : item
                ),
            }
          : plan
      )
    )
  }

  async function confirmMainExpense({
    plan,
    item,
    amount,
    expenseDate,
    walletId,
    selectedWallet,
  }) {
    const originalBalance =
      Number(
        selectedWallet.balance || 0
      )

    const newBalance =
      originalBalance - amount

    const {
      data: expense,
      error: expenseError,
    } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: userId,
          amount,
          category:
            item.category ||
            'Other',
          date: expenseDate,
          notes: `${plan.name} — ${item.name}`,
          payment_method:
            selectedWallet.type,
          wallet_id: walletId,
        },
      ])
      .select()
      .single()

    if (expenseError) {
      throw expenseError
    }

    const {
      error: walletError,
    } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
      })
      .eq('id', walletId)
      .eq('user_id', userId)

    if (walletError) {
      await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      throw walletError
    }

    const {
      data: updatedItem,
      error: itemError,
    } = await supabase
      .from('expense_plan_items')
      .update({
        actual_amount: amount,
        status: 'confirmed',
        is_spent: true,
        wallet_id: walletId,
        expense_id: expense.id,
        confirmed_at:
          new Date().toISOString(),
        spent_at:
          new Date().toISOString(),
      })
      .eq('id', item.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (itemError) {
      await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)

      await supabase
        .from('wallets')
        .update({
          balance:
            originalBalance,
        })
        .eq('id', walletId)
        .eq('user_id', userId)

      throw itemError
    }

    updatePlanItem(
        plan.id,
        updatedItem,
        selectedWallet
    )

    onExpenseCreated?.(expense)
  }

  function togglePlan(planId) {
    setExpandedPlans((previous) => ({
      ...previous,
      [planId]:
        !previous[planId],
    }))
  }

  function toggleItem(itemId) {
    setExpandedItems((previous) => ({
      ...previous,
      [itemId]:
        !previous[itemId],
    }))
  }

  const fmt = (amount) =>
    fmtCurrency(
      Number(amount || 0),
      currency,
      rate
    )

  const totalPlanned =
    plans.reduce(
      (planSum, plan) =>
        planSum +
        (plan.items || []).reduce(
          (itemSum, item) =>
            itemSum +
            Number(
              item.estimated_amount || 0
            ),
          0
        ),
      0
    )

  const totalMainSpent =
    plans.reduce(
      (planSum, plan) =>
        planSum +
        (plan.items || []).reduce(
          (itemSum, item) =>
            itemSum +
            (item.is_spent ||
            item.status ===
              'confirmed'
              ? Number(
                  item.actual_amount || 0
                )
              : 0),
          0
        ),
      0
    )

  const totalExtraSpent =
    plans.reduce(
      (planSum, plan) =>
        planSum +
        (plan.items || []).reduce(
          (itemSum, item) =>
            itemSum +
            (
              item.extraExpenses || []
            ).reduce(
              (
                extraSum,
                extra
              ) =>
                extraSum +
                Number(
                  extra.amount || 0
                ),
              0
            ),
          0
        ),
      0
    )

  const totalSpent =
    totalMainSpent +
    totalExtraSpent

  const remaining =
    totalPlanned -
    totalSpent

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent:
              'space-between',
            gap: 12,
            padding: 16,
            backgroundColor: 'var(--card)',
            border:
              '1px solid var(--border)',
            borderRadius: 20,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <CalendarDays
                size={15}
                color="var(--text)"
              />

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    "'Cabinet Grotesk', sans-serif",
                  fontSize: 15,
                  fontWeight: 750,
                  color: 'var(--text)',
                }}
              >
                Expense Plans
              </h2>
            </div>

            <p
              style={{
                margin: '5px 0 0',
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              Plan future spending and
              record actual expenses as
              they happen.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowPlanModal(true)
            }
            style={{
              minHeight: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor:
                'var(--accent)',
              border: 'none',
              borderRadius: 11,
              color: 'var(--bg)',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={13} />
            New Plan
          </button>
        </div>

        {plans.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {[
              {
                label:
                  'Total Planned',
                value: totalPlanned,
              },
              {
                label:
                  'Actual Spent',
                value: totalSpent,
              },
              {
                label:
                  remaining >= 0
                    ? 'Remaining'
                    : 'Over Budget',
                value:
                  Math.abs(remaining),
              },
            ].map((summary) => (
              <div
                key={summary.label}
                style={{
                  padding:
                    '13px 14px',
                  backgroundColor:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 15,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 650,
                    color:
                      'var(--text-subtle)',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '0.06em',
                  }}
                >
                  {summary.label}
                </p>

                <p
                  style={{
                    margin: '6px 0 0',
                    fontFamily:
                      "'Cabinet Grotesk', sans-serif",
                    fontSize: 20,
                    fontWeight: 800,
                    color:
                      summary.label ===
                      'Over Budget'
                        ? '#dc2626'
                        : 'var(--text)',
                  }}
                >
                  {fmt(summary.value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div
            style={{
              minHeight: 230,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              backgroundColor:
                'var(--card)',
              border:
                '1px solid var(--border)',
              borderRadius: 20,
            }}
          >
            <Loader2
              size={20}
              className="animate-spin"
              color="var(--text-subtle)"
            />

            <span
              style={{
                fontSize: 11,
                color:
                  'var(--text-subtle)',
              }}
            >
              Loading expense plans
            </span>
          </div>
        ) : plans.length === 0 ? (
          <div
            style={{
              minHeight: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 28,
              textAlign: 'center',
              backgroundColor:
                'var(--card)',
              border:
                '1px solid var(--border)',
              borderRadius: 20,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  'var(--input-bg)',
                border:
                  '1px solid var(--border)',
                borderRadius: 15,
              }}
            >
              <CalendarDays
                size={21}
                color="var(--text-subtle)"
              />
            </div>

            <h3
              style={{
                margin: '13px 0 0',
                fontFamily:
                  "'Cabinet Grotesk', sans-serif",
                fontSize: 14,
                fontWeight: 750,
                color: 'var(--text)',
              }}
            >
              No expense plans yet
            </h3>

            <p
              style={{
                maxWidth: 330,
                margin: '5px 0 0',
                fontSize: 11,
                lineHeight: 1.5,
                color:
                  'var(--text-subtle)',
              }}
            >
              Create a plan for a trip,
              staycation, birthday, or
              another future event.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowPlanModal(true)
              }
              style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor:
                  'var(--accent)',
                border: 'none',
                borderRadius: 11,
                color: 'var(--bg)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={12} />
              Create first plan
            </button>
          </div>
        ) : (
          plans.map((plan) => {
            const items =
              plan.items || []

            const planPlanned =
              items.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.estimated_amount ||
                      0
                  ),
                0
              )

            const mainSpent =
              items.reduce(
                (sum, item) =>
                  sum +
                  (item.is_spent ||
                  item.status ===
                    'confirmed'
                    ? Number(
                        item.actual_amount ||
                          0
                      )
                    : 0),
                0
              )

            const extraSpent =
              items.reduce(
                (sum, item) =>
                  sum +
                  (
                    item.extraExpenses ||
                    []
                  ).reduce(
                    (
                      extraSum,
                      extra
                    ) =>
                      extraSum +
                      Number(
                        extra.amount ||
                          0
                      ),
                    0
                  ),
                0
              )

            const planSpent =
              mainSpent + extraSpent

            const planRemaining =
              planPlanned -
              planSpent

            const isExpanded =
              expandedPlans[plan.id]

            return (
              <div
                key={plan.id}
                style={{
                  overflow: 'hidden',
                  backgroundColor:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    borderBottom:
                      isExpanded
                        ? '1px solid var(--border)'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems:
                        'flex-start',
                      justifyContent:
                        'space-between',
                      gap: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        togglePlan(plan.id)
                      }
                      style={{
                        minWidth: 0,
                        flex: 1,
                        display: 'flex',
                        alignItems:
                          'flex-start',
                        gap: 10,
                        padding: 0,
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
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
                          borderRadius: 11,
                        }}
                      >
                        <CalendarDays
                          size={15}
                          color="var(--text-muted)"
                        />
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap',
                            fontFamily:
                              "'Cabinet Grotesk', sans-serif",
                            fontSize: 14,
                            fontWeight: 750,
                            color:
                              'var(--text)',
                          }}
                        >
                          {plan.name}
                        </h3>

                        <p
                          style={{
                            margin:
                              '3px 0 0',
                            fontSize: 10.5,
                            color:
                              'var(--text-subtle)',
                          }}
                        >
                          {formatPlanDate(
                            plan.start_date,
                            plan.end_date
                          )}
                        </p>
                      </div>
                    </button>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setAddingToPlan(
                            plan
                          )
                        }
                        title="Add planned expense"
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
                        <Plus size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeletePlan(
                            plan
                          )
                        }
                        title="Delete plan"
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          backgroundColor:
                            'transparent',
                          border:
                            '1px solid var(--border)',
                          borderRadius: 10,
                          color: '#f87171',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePlan(plan.id)
                        }
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          background: 'none',
                          border: 'none',
                          color:
                            'var(--text-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp
                            size={15}
                          />
                        ) : (
                          <ChevronDown
                            size={15}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      marginTop: 13,
                    }}
                  >
                    {[
                      {
                        label: 'Planned',
                        value:
                          planPlanned,
                      },
                      {
                        label: 'Spent',
                        value:
                          planSpent,
                      },
                      {
                        label:
                          planRemaining >= 0
                            ? 'Remaining'
                            : 'Over',
                        value:
                          Math.abs(
                            planRemaining
                          ),
                      },
                    ].map((summary) => (
                      <div
                        key={
                          summary.label
                        }
                        style={{
                          padding:
                            '8px 10px',
                          backgroundColor:
                            'var(--input-bg)',
                          border:
                            '1px solid var(--border)',
                          borderRadius: 11,
                        }}
                      >
                        <span
                          style={{
                            display:
                              'block',
                            fontSize: 9.5,
                            color:
                              'var(--text-subtle)',
                          }}
                        >
                          {summary.label}
                        </span>

                        <strong
                          style={{
                            display:
                              'block',
                            marginTop: 2,
                            fontSize: 12,
                            color:
                              summary.label ===
                              'Over'
                                ? '#dc2626'
                                : 'var(--text)',
                          }}
                        >
                          {fmt(
                            summary.value
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: 12,
                    }}
                  >
                    {items.length === 0 ? (
                      <div
                        style={{
                          padding: 22,
                          textAlign:
                            'center',
                        }}
                      >
                        <ReceiptText
                          size={21}
                          color="var(--border)"
                          style={{
                            margin:
                              '0 auto 7px',
                          }}
                        />

                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color:
                              'var(--text-subtle)',
                          }}
                        >
                          No planned expenses
                          added yet.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setAddingToPlan(
                              plan
                            )
                          }
                          style={{
                            marginTop: 10,
                            padding:
                              '7px 10px',
                            backgroundColor:
                              'var(--input-bg)',
                            border:
                              '1px solid var(--border)',
                            borderRadius: 9,
                            color:
                              'var(--text-muted)',
                            fontSize: 10.5,
                            fontWeight: 650,
                            cursor:
                              'pointer',
                          }}
                        >
                          Add expense
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection:
                            'column',
                          gap: 9,
                        }}
                      >
                        {items.map(
                          (item) => {
                            const itemExpanded =
                              expandedItems[
                                item.id
                              ]

                            const status =
                              getScheduledStatus(
                                item.scheduled_date
                              )

                            const extras =
                              item.extraExpenses ||
                              []

                            const extraTotal =
                              extras.reduce(
                                (
                                  sum,
                                  extra
                                ) =>
                                  sum +
                                  Number(
                                    extra.amount ||
                                      0
                                  ),
                                0
                              )

                            return (
                              <div
                                key={item.id}
                                style={{
                                  overflow:
                                    'hidden',
                                  backgroundColor:
                                    'var(--input-bg)',
                                  border:
                                    '1px solid var(--border)',
                                  borderRadius:
                                    14,
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap: 10,
                                    padding:
                                      '11px 12px',
                                  }}
                                >
                                  <button
                                    type="button"
                                    disabled={
                                      item.is_spent ||
                                      item.status ===
                                        'confirmed'
                                    }
                                    onClick={() =>
                                      setConfirmingItem(
                                        {
                                          plan,
                                          item,
                                        }
                                      )
                                    }
                                    title={
                                      item.is_spent ||
                                      item.status ===
                                        'confirmed'
                                        ? 'Expense confirmed'
                                        : 'Confirm and deduct'
                                    }
                                    style={{
                                      width: 24,
                                      height: 24,
                                      flexShrink: 0,
                                      display:
                                        'flex',
                                      alignItems:
                                        'center',
                                      justifyContent:
                                        'center',
                                      backgroundColor:
                                        item.is_spent ||
                                        item.status ===
                                          'confirmed'
                                          ? '#16a34a'
                                          : 'transparent',
                                      border: `2px solid ${
                                        item.is_spent ||
                                        item.status ===
                                          'confirmed'
                                          ? '#16a34a'
                                          : 'var(--border)'
                                      }`,
                                      borderRadius:
                                        '50%',
                                      cursor:
                                        item.is_spent ||
                                        item.status ===
                                          'confirmed'
                                          ? 'default'
                                          : 'pointer',
                                    }}
                                  >
                                    {(item.is_spent ||
                                      item.status ===
                                        'confirmed') && (
                                      <Check
                                        size={11}
                                        color="white"
                                      />
                                    )}
                                  </button>

                                  <div
                                    style={{
                                      minWidth: 0,
                                      flex: 1,
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: 0,
                                        overflow:
                                          'hidden',
                                        textOverflow:
                                          'ellipsis',
                                        whiteSpace:
                                          'nowrap',
                                        fontSize: 12.5,
                                        fontWeight: 650,
                                        color:
                                          'var(--text)',
                                      }}
                                    >
                                      {item.name}
                                    </p>

                                    <div
                                      style={{
                                        display:
                                          'flex',
                                        alignItems:
                                          'center',
                                        flexWrap:
                                          'wrap',
                                        gap: 5,
                                        marginTop: 3,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: 9.5,
                                          color:
                                            'var(--text-subtle)',
                                        }}
                                      >
                                        {item.category}
                                      </span>

                                      <span
                                        style={{
                                            fontSize: 9,
                                            color: 'var(--border)',
                                        }}
                                        >
                                        •
                                        </span>

                                        <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 3,
                                            fontSize: 9.5,
                                            color:
                                            'var(--text-subtle)',
                                        }}
                                        >
                                        <Wallet size={9} />

                                        {item.plannedWallet?.name ||
                                            item.wallets?.name ||
                                            'No wallet'}
                                        </span>

                                      <span
                                        style={{
                                          fontSize: 9,
                                          color:
                                            'var(--border)',
                                        }}
                                      >
                                        •
                                      </span>

                                      <span
                                        style={{
                                          fontSize: 9.5,
                                          color:
                                            'var(--text-subtle)',
                                        }}
                                      >
                                        {formatDate(
                                          item.scheduled_date
                                        )}
                                      </span>

                                      {!item.is_spent &&
                                        item.status !==
                                          'confirmed' && (
                                          <span
                                            style={{
                                              padding:
                                                '2px 6px',
                                              backgroundColor:
                                                status.bg,
                                              border: `1px solid ${status.border}`,
                                              borderRadius:
                                                99,
                                              fontSize: 9,
                                              fontWeight: 650,
                                              color:
                                                status.text,
                                            }}
                                          >
                                            {
                                              status.label
                                            }
                                          </span>
                                        )}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      flexShrink: 0,
                                      textAlign:
                                        'right',
                                    }}
                                  >
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color:
                                          'var(--text)',
                                      }}
                                    >
                                      {fmt(
                                        item.is_spent ||
                                        item.status ===
                                          'confirmed'
                                          ? item.actual_amount
                                          : item.estimated_amount
                                      )}
                                    </p>

                                    <p
                                      style={{
                                        margin:
                                          '2px 0 0',
                                        fontSize: 9.5,
                                        color:
                                          item.is_spent ||
                                          item.status ===
                                            'confirmed'
                                            ? '#16a34a'
                                            : 'var(--text-subtle)',
                                      }}
                                    >
                                      {item.is_spent ||
                                      item.status ===
                                        'confirmed'
                                        ? `Actual · Planned ${fmt(
                                            item.estimated_amount
                                          )}`
                                        : 'Planned amount'}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleItem(
                                        item.id
                                      )
                                    }
                                    style={{
                                      width: 28,
                                      height: 28,
                                      flexShrink: 0,
                                      display:
                                        'flex',
                                      alignItems:
                                        'center',
                                      justifyContent:
                                        'center',
                                      background:
                                        'none',
                                      border:
                                        'none',
                                      color:
                                        'var(--text-subtle)',
                                      cursor:
                                        'pointer',
                                    }}
                                  >
                                    {itemExpanded ? (
                                      <ChevronUp
                                        size={14}
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={14}
                                      />
                                    )}
                                  </button>

                                  {!item.is_spent &&
                                    item.status !==
                                      'confirmed' && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setConfirmDeleteItem(
                                            {
                                              ...item,
                                              planId:
                                                plan.id,
                                            }
                                          )
                                        }
                                        title="Delete planned expense"
                                        style={{
                                          flexShrink: 0,
                                          display:
                                            'flex',
                                          padding: 3,
                                          background:
                                            'none',
                                          border:
                                            'none',
                                          color:
                                            '#fca5a5',
                                          cursor:
                                            'pointer',
                                        }}
                                      >
                                        <Trash2
                                          size={12}
                                        />
                                      </button>
                                    )}
                                </div>

                                {itemExpanded && (
                                  <div
                                    style={{
                                      padding:
                                        '0 12px 12px 46px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display:
                                          'flex',
                                        alignItems:
                                          'center',
                                        justifyContent:
                                          'space-between',
                                        gap: 10,
                                        paddingTop:
                                          10,
                                        borderTop:
                                          '1px solid var(--border)',
                                      }}
                                    >
                                      <div>
                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color:
                                              'var(--text-muted)',
                                            textTransform:
                                              'uppercase',
                                            letterSpacing:
                                              '0.05em',
                                          }}
                                        >
                                          Other
                                          Expenses
                                        </p>

                                        <p
                                          style={{
                                            margin:
                                              '2px 0 0',
                                            fontSize: 9.5,
                                            color:
                                              'var(--text-subtle)',
                                          }}
                                        >
                                          {
                                            extras.length
                                          }{' '}
                                          {extras.length ===
                                          1
                                            ? 'expense'
                                            : 'expenses'}{' '}
                                          ·{' '}
                                          {fmt(
                                            extraTotal
                                          )}
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAddingExtraExpense(
                                            {
                                              plan,
                                              item,
                                            }
                                          )
                                        }
                                        style={{
                                          display:
                                            'flex',
                                          alignItems:
                                            'center',
                                          gap: 5,
                                          padding:
                                            '7px 9px',
                                          backgroundColor:
                                            'var(--card)',
                                          border:
                                            '1px solid var(--border)',
                                          borderRadius:
                                            9,
                                          color:
                                            'var(--text-muted)',
                                          fontSize: 10,
                                          fontWeight: 650,
                                          cursor:
                                            'pointer',
                                        }}
                                      >
                                        <Plus
                                          size={11}
                                        />
                                        Add Other
                                      </button>
                                    </div>

                                    {extras.length ===
                                    0 ? (
                                      <div
                                        style={{
                                          marginTop:
                                            8,
                                          padding:
                                            '13px 10px',
                                          textAlign:
                                            'center',
                                          backgroundColor:
                                            'var(--card)',
                                          border:
                                            '1px dashed var(--border)',
                                          borderRadius:
                                            10,
                                        }}
                                      >
                                        <Utensils
                                          size={16}
                                          color="var(--border)"
                                          style={{
                                            margin:
                                              '0 auto 5px',
                                          }}
                                        />

                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: 10,
                                            color:
                                              'var(--text-subtle)',
                                          }}
                                        >
                                          Add meals,
                                          transport, or
                                          unexpected
                                          purchases made
                                          during this
                                          activity.
                                        </p>
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          display:
                                            'flex',
                                          flexDirection:
                                            'column',
                                          gap: 6,
                                          marginTop:
                                            8,
                                        }}
                                      >
                                        {extras.map(
                                          (
                                            extra
                                          ) => (
                                            <div
                                              key={
                                                extra.id
                                              }
                                              style={{
                                                display:
                                                  'flex',
                                                alignItems:
                                                  'center',
                                                justifyContent:
                                                  'space-between',
                                                gap: 10,
                                                padding:
                                                  '8px 10px',
                                                backgroundColor:
                                                  'var(--card)',
                                                border:
                                                  '1px solid var(--border)',
                                                borderRadius:
                                                  10,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  minWidth: 0,
                                                  display:
                                                    'flex',
                                                  alignItems:
                                                    'center',
                                                  gap: 8,
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    width: 26,
                                                    height: 26,
                                                    flexShrink: 0,
                                                    display:
                                                      'flex',
                                                    alignItems:
                                                      'center',
                                                    justifyContent:
                                                      'center',
                                                    backgroundColor:
                                                      'var(--input-bg)',
                                                    border:
                                                      '1px solid var(--border)',
                                                    borderRadius:
                                                      8,
                                                  }}
                                                >
                                                  <CircleDollarSign
                                                    size={
                                                      12
                                                    }
                                                    color="var(--text-muted)"
                                                  />
                                                </div>

                                                <div
                                                  style={{
                                                    minWidth: 0,
                                                  }}
                                                >
                                                  <p
                                                    style={{
                                                      margin: 0,
                                                      overflow:
                                                        'hidden',
                                                      textOverflow:
                                                        'ellipsis',
                                                      whiteSpace:
                                                        'nowrap',
                                                      fontSize: 11,
                                                      fontWeight: 650,
                                                      color:
                                                        'var(--text)',
                                                    }}
                                                  >
                                                    {
                                                      extra.name
                                                    }
                                                  </p>

                                                  <p
                                                    style={{
                                                      margin:
                                                        '2px 0 0',
                                                      fontSize: 9,
                                                      color:
                                                        'var(--text-subtle)',
                                                    }}
                                                  >
                                                    {
                                                      extra.category
                                                    }{' '}
                                                    ·{' '}
                                                    {formatDate(
                                                      extra.expense_date
                                                    )}
                                                  </p>
                                                </div>
                                              </div>

                                              <strong
                                                style={{
                                                  flexShrink: 0,
                                                  fontSize: 11,
                                                  color:
                                                    'var(--text)',
                                                }}
                                              >
                                                {fmt(
                                                  extra.amount
                                                )}
                                              </strong>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {showPlanModal && (
        <PlanModal
          userId={userId}
          onClose={() =>
            setShowPlanModal(false)
          }
          onSaved={handlePlanSaved}
        />
      )}

      {addingToPlan && (
        <PlanItemModal
          plan={addingToPlan}
          userId={userId}
          onClose={() =>
            setAddingToPlan(null)
          }
          onSaved={(item) =>
            handleItemSaved(
              addingToPlan.id,
              item
            )
          }
        />
      )}

      {confirmingItem && (
        <WalletExpenseModal
            title="Confirm Planned Expense"
            description={`${confirmingItem.plan.name} — ${confirmingItem.item.name}`}
            defaultAmount={
                confirmingItem.item
                .estimated_amount
            }
            defaultDate={
                confirmingItem.item
                .scheduled_date ||
                getToday()
            }
            defaultWalletId={
                confirmingItem.item.wallet_id
            }
            userId={userId}
            confirmLabel="Confirm & Deduct"
            onClose={() =>
                setConfirmingItem(null)
            }
            onConfirm={({
                amount,
                expenseDate,
                walletId,
                selectedWallet,
            }) =>
                confirmMainExpense({
                plan:
                    confirmingItem.plan,
                item:
                    confirmingItem.item,
                amount,
                expenseDate,
                walletId,
                selectedWallet,
                })
            }
        />
      )}

      {addingExtraExpense && (
        <ExtraExpenseModal
          plan={
            addingExtraExpense.plan
          }
          item={
            addingExtraExpense.item
          }
          userId={userId}
          onClose={() =>
            setAddingExtraExpense(null)
          }
          onSaved={(
            extraExpense,
            expense
          ) => {
            addExtraExpenseToItem(
              addingExtraExpense.plan.id,
              addingExtraExpense.item.id,
              extraExpense
            )

            onExpenseCreated?.(
              expense
            )
          }}
        />
      )}

      {confirmDeletePlan && (
        <ConfirmDialog
          title="Delete Expense Plan?"
          message={`Delete "${confirmDeletePlan.name}" and all of its planned expenses?`}
          onConfirm={() =>
            handleDeletePlan(
              confirmDeletePlan.id
            )
          }
          onClose={() =>
            setConfirmDeletePlan(null)
          }
        />
      )}

      {confirmDeleteItem && (
        <ConfirmDialog
          title="Delete Planned Expense?"
          message={`Delete "${confirmDeleteItem.name}" from this plan?`}
          onConfirm={() =>
            handleDeleteItem(
              confirmDeleteItem.planId,
              confirmDeleteItem.id
            )
          }
          onClose={() =>
            setConfirmDeleteItem(null)
          }
        />
      )}
    </>
  )
}