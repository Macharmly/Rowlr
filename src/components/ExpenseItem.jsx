import { useState } from 'react'
import {
  Trash2,Pencil,X,Check,Loader2,CalendarDays,CreditCard,
  Tag,Wallet,FileText,Info
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt } from '../lib/currency'
import ConfirmDialog from './ConfirmDialog'

const CATEGORY_COLORS={
  Food:{bg:'#fff7ed',text:'#ea580c',border:'#fed7aa',dot:'#f97316'},
  Transport:{bg:'#eff6ff',text:'#2563eb',border:'#bfdbfe',dot:'#3b82f6'},
  Shopping:{bg:'#fdf2f8',text:'#db2777',border:'#fbcfe8',dot:'#ec4899'},
  Bills:{bg:'#fef2f2',text:'#dc2626',border:'#fecaca',dot:'#ef4444'},
  Health:{bg:'#f0fdf4',text:'#16a34a',border:'#bbf7d0',dot:'#22c55e'},
  Entertainment:{bg:'#faf5ff',text:'#9333ea',border:'#e9d5ff',dot:'#a855f7'},
  Education:{bg:'#eef2ff',text:'#4f46e5',border:'#c7d2fe',dot:'#6366f1'},
  Savings:{bg:'#f0fdfa',text:'#0f766e',border:'#99f6e4',dot:'#14b8a6'},
  Other:{bg:'#f9fafb',text:'#4b5563',border:'#e5e7eb',dot:'#9ca3af'}
}

const CATEGORIES=[
  'Food','Transport','Shopping','Bills','Health',
  'Entertainment','Education','Savings','Other'
]

const PAYMENT_METHODS=[
  'Cash','GCash','Maya','Credit Card',
  'Debit Card','Bank Transfer','Other'
]

function Field({label,icon:Icon,required=false,hint,children}){
  return (
    <div>
      <label style={{
        display:'flex',alignItems:'center',gap:6,
        marginBottom:7,fontSize:11,fontWeight:650,
        color:'var(--text-muted)'
      }}>
        {Icon&&<Icon size={13}/>}
        <span>
          {label}
          {required&&<span style={{marginLeft:3,color:'#ef4444'}}>*</span>}
        </span>
      </label>

      {children}

      {hint&&(
        <p style={{
          margin:'6px 2px 0',fontSize:10.5,
          lineHeight:1.45,color:'var(--text-subtle)'
        }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function EditExpenseModal({expense,onClose,onSaved}){
  const [form,setForm]=useState({
    amount:expense?.amount??'',
    category:expense?.category||'Other',
    date:expense?.date||'',
    notes:expense?.notes||'',
    payment_method:expense?.payment_method||'Cash'
  })

  const [saving,setSaving]=useState(false)
  const [error,setError]=useState(null)

  const input={
    width:'100%',
    minHeight:42,
    padding:'10px 12px',
    background:'var(--input-bg)',
    border:'1px solid var(--border)',
    borderRadius:11,
    fontFamily:'inherit',
    fontSize:13,
    color:'var(--text)',
    outline:'none',
    boxSizing:'border-box'
  }

  const focus=e=>{
    e.currentTarget.style.borderColor='var(--accent)'
    e.currentTarget.style.boxShadow=
      '0 0 0 3px color-mix(in srgb,var(--accent) 14%,transparent)'
  }

  const blur=e=>{
    e.currentTarget.style.borderColor='var(--border)'
    e.currentTarget.style.boxShadow='none'
  }

  async function handleSubmit(e){
    e.preventDefault()

    const amount=Number(form.amount)

    if(!amount||amount<=0){
      setError('Enter an amount greater than zero.')
      return
    }

    if(!form.date){
      setError('Please select a valid date.')
      return
    }

    setSaving(true)
    setError(null)

    const difference=amount-Number(expense.amount)

    try{
      const {data,error:updateError}=await supabase
        .from('expenses')
        .update({
          amount,
          category:form.category,
          date:form.date,
          notes:form.notes.trim()||null,
          payment_method:form.payment_method
        })
        .eq('id',expense.id)
        .select()
        .single()

      if(updateError)throw updateError

      if(expense.wallet_id&&difference!==0){
        const {data:wallet,error:walletError}=await supabase
          .from('wallets')
          .select('balance')
          .eq('id',expense.wallet_id)
          .single()

        if(walletError)throw walletError

        if(wallet){
          const {error}=await supabase
            .from('wallets')
            .update({
              balance:Number(wallet.balance)-difference
            })
            .eq('id',expense.wallet_id)

          if(error)throw error
        }
      }

      if(typeof onSaved==='function'){
        onSaved(data)
      }

      onClose()
    }catch(err){
      console.error('Failed to update expense:',err)
      setError('We could not update this expense. Please try again.')
    }finally{
      setSaving(false)
    }
  }

  return (
    <div
      className="animate-overlay-in"
      onMouseDown={e=>{
        if(e.target===e.currentTarget&&!saving)onClose()
      }}
      style={{
        position:'fixed',inset:0,zIndex:100,
        display:'flex',alignItems:'center',
        justifyContent:'center',padding:12,
        background:'rgba(15,23,42,.46)',
        backdropFilter:'blur(14px)'
      }}
    >
      <div
        className="animate-modal-in"
        role="dialog"
        aria-modal="true"
        style={{
          width:'100%',
          maxWidth:460,
          maxHeight:'calc(100vh - 24px)',
          overflowY:'auto',
          background:'var(--card)',
          border:'1px solid var(--border)',
          borderRadius:20,
          boxShadow:'0 28px 80px rgba(0,0,0,.22)'
        }}
      >
        <div style={{
          position:'sticky',
          top:0,
          zIndex:2,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          gap:10,
          padding:'15px 16px',
          background:'color-mix(in srgb,var(--card) 92%,transparent)',
          borderBottom:'1px solid var(--border)',
          backdropFilter:'blur(16px)'
        }}>
          <div style={{minWidth:0}}>
            <h2 style={{
              margin:0,
              fontFamily:"'Cabinet Grotesk',sans-serif",
              fontSize:16,
              fontWeight:750,
              color:'var(--text)'
            }}>
              Edit expense
            </h2>

            <p style={{
              margin:'3px 0 0',
              fontSize:10.5,
              color:'var(--text-subtle)'
            }}>
              Update the transaction details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              width:30,height:30,
              flexShrink:0,
              display:'grid',
              placeItems:'center',
              padding:0,
              background:'var(--input-bg)',
              border:'1px solid var(--border)',
              borderRadius:9,
              color:'var(--text-muted)',
              cursor:'pointer'
            }}
          >
            <X size={15}/>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display:'flex',
            flexDirection:'column',
            gap:15,
            padding:16
          }}
        >
          <Field label="Amount" icon={Wallet} required>
            <div style={{position:'relative'}}>
              <span style={{
                position:'absolute',
                top:'50%',
                left:13,
                transform:'translateY(-50%)',
                fontSize:14,
                fontWeight:650,
                color:'var(--text-muted)'
              }}>
                ₱
              </span>

              <input
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={e=>setForm({...form,amount:e.target.value})}
                onFocus={focus}
                onBlur={blur}
                placeholder="0.00"
                style={{
                  ...input,
                  height:46,
                  paddingLeft:32,
                  fontSize:18,
                  fontWeight:700
                }}
              />
            </div>

            {expense.wallet_id&&(
              <div style={{
                display:'flex',
                gap:7,
                marginTop:7,
                padding:'8px 10px',
                background:
                  'color-mix(in srgb,var(--accent) 7%,var(--input-bg))',
                border:
                  '1px solid color-mix(in srgb,var(--accent) 15%,var(--border))',
                borderRadius:10
              }}>
                <Info
                  size={13}
                  style={{
                    flexShrink:0,
                    color:'var(--accent)'
                  }}
                />

                <p style={{
                  margin:0,
                  fontSize:10.5,
                  lineHeight:1.45,
                  color:'var(--text-muted)'
                }}>
                  Changing the amount will adjust the linked wallet balance.
                </p>
              </div>
            )}
          </Field>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
            gap:12
          }}>
            <Field label="Category" icon={Tag}>
              <select
                value={form.category}
                onChange={e=>setForm({...form,category:e.target.value})}
                onFocus={focus}
                onBlur={blur}
                style={input}
              >
                {CATEGORIES.map(c=>(
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Payment method" icon={CreditCard}>
              <select
                value={form.payment_method}
                onChange={e=>setForm({
                  ...form,
                  payment_method:e.target.value
                })}
                onFocus={focus}
                onBlur={blur}
                style={input}
              >
                {PAYMENT_METHODS.map(p=>(
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Date" icon={CalendarDays} required>
            <input
              type="date"
              value={form.date}
              onChange={e=>setForm({...form,date:e.target.value})}
              onFocus={focus}
              onBlur={blur}
              style={input}
            />
          </Field>

          <Field
            label="Notes"
            icon={FileText}
            hint="Optional. Add a brief description to identify this expense later."
          >
            <textarea
              rows={3}
              maxLength={250}
              value={form.notes}
              onChange={e=>setForm({...form,notes:e.target.value})}
              onFocus={focus}
              onBlur={blur}
              placeholder="What was this expense for?"
              style={{
                ...input,
                minHeight:80,
                resize:'vertical',
                lineHeight:1.5
              }}
            />
          </Field>

          {error&&(
            <div style={{
              display:'flex',
              gap:8,
              padding:'9px 11px',
              background:'#fef2f2',
              border:'1px solid #fecaca',
              borderRadius:11,
              color:'#dc2626'
            }}>
              <Info size={14}/>
              <p style={{
                margin:0,
                fontSize:11.5
              }}>
                {error}
              </p>
            </div>
          )}

          <div style={{
            display:'flex',
            justifyContent:'flex-end',
            gap:8,
            paddingTop:2
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                minHeight:40,
                padding:'8px 14px',
                background:'transparent',
                border:'1px solid var(--border)',
                borderRadius:11,
                fontSize:12.5,
                fontWeight:600,
                color:'var(--text-muted)',
                cursor:'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                minHeight:40,
                padding:'8px 15px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                gap:6,
                background:'var(--accent)',
                border:0,
                borderRadius:11,
                fontSize:12.5,
                fontWeight:700,
                color:'var(--bg)',
                cursor:'pointer'
              }}
            >
              {saving
                ?<>
                  <Loader2 size={14} className="animate-spin"/>
                  Saving
                </>
                :<>
                  <Check size={14}/>
                  Save changes
                </>
              }
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
  currency='PHP',
  rate=1,
  compact=false
}){
  const [showEdit,setShowEdit]=useState(false)
  const [showConfirm,setShowConfirm]=useState(false)
  const [hovered,setHovered]=useState(false)
  const [deleting,setDeleting]=useState(false)

  const safeExpense=expense||{}
  const category=safeExpense.category||'Other'
  const color=CATEGORY_COLORS[category]||CATEGORY_COLORS.Other

  const dateValue=safeExpense.date
  const date=dateValue
    ?new Date(`${dateValue}T00:00:00`).toLocaleDateString(
      'en-PH',
      {month:'short',day:'numeric',year:'numeric'}
    )
    :'No date'

  const amount=Number(safeExpense.amount)||0

  async function handleDelete(){
    setDeleting(true)

    try{
      if(safeExpense.wallet_id){
        const {data:wallet,error}=await supabase
          .from('wallets')
          .select('balance')
          .eq('id',safeExpense.wallet_id)
          .single()

        if(error)throw error

        if(wallet){
          const {error}=await supabase
            .from('wallets')
            .update({
              balance:Number(wallet.balance)+amount
            })
            .eq('id',safeExpense.wallet_id)

          if(error)throw error
        }
      }

      const {error}=await supabase
        .from('expenses')
        .delete()
        .eq('id',safeExpense.id)

      if(error)throw error

      if(typeof onDelete==='function'){
        onDelete(safeExpense.id)
      }

      setShowConfirm(false)
    }catch(err){
      console.error('Failed to delete expense:',err)
    }finally{
      setDeleting(false)
    }
  }

  return (
    <>
      <article
        className="animate-fade-in"
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          width:'100%',
          minWidth:0,
          boxSizing:'border-box',
          display:'flex',
          alignItems:'center',
          gap:compact?7:10,
          padding:compact?'9px 9px':'12px 12px',
          background:'var(--card)',
          border:`1px solid ${
            hovered
              ?'color-mix(in srgb,var(--text) 14%,var(--border))'
              :'var(--border)'
          }`,
          borderRadius:compact?13:15,
          boxShadow:hovered
            ?'0 6px 18px rgba(0,0,0,.055)'
            :'0 1px 2px rgba(0,0,0,.02)',
          transform:hovered?'translateY(-1px)':'none',
          transition:'all .18s'
        }}
      >
        <div style={{
          width:compact?30:36,
          height:compact?30:36,
          flexShrink:0,
          display:'grid',
          placeItems:'center',
          background:color.bg,
          border:`1px solid ${color.border}`,
          borderRadius:compact?9:11
        }}>
          <div style={{
            width:compact?7:9,
            height:compact?7:9,
            background:color.dot,
            borderRadius:'50%',
            boxShadow:
              `0 0 0 ${compact?3:4}px `+
              `color-mix(in srgb,${color.dot} 14%,transparent)`
          }}/>
        </div>

        <div style={{
          flex:1,
          minWidth:0,
          overflow:'hidden'
        }}>
          <div style={{
            display:'flex',
            alignItems:'center',
            gap:5,
            minWidth:0
          }}>
            <p
              title={safeExpense.notes||category}
              style={{
                minWidth:0,
                flex:1,
                margin:0,
                overflow:'hidden',
                textOverflow:'ellipsis',
                whiteSpace:'nowrap',
                fontSize:compact?11.5:13,
                fontWeight:650,
                color:'var(--text)'
              }}
            >
              {safeExpense.notes||category}
            </p>

            {!compact&&(
              <span style={{
                flexShrink:0,
                padding:'2px 6px',
                background:color.bg,
                border:`1px solid ${color.border}`,
                borderRadius:99,
                fontSize:9,
                fontWeight:650,
                color:color.text
              }}>
                {category}
              </span>
            )}
          </div>

          <div style={{
            display:'flex',
            alignItems:'center',
            gap:4,
            marginTop:3,
            minWidth:0,
            overflow:'hidden'
          }}>
            <span style={{
              display:'inline-flex',
              alignItems:'center',
              gap:3,
              fontSize:compact?9:10.5,
              color:'var(--text-subtle)',
              whiteSpace:'nowrap'
            }}>
              <CalendarDays size={compact?9:10.5}/>
              {date}
            </span>

            <span style={{
              color:'var(--border)',
              flexShrink:0
            }}>
              ·
            </span>

            <span style={{
              display:'inline-flex',
              alignItems:'center',
              gap:3,
              fontSize:compact?9:10.5,
              color:'var(--text-subtle)',
              whiteSpace:'nowrap',
              overflow:'hidden',
              textOverflow:'ellipsis'
            }}>
              <CreditCard size={compact?9:10.5}/>
              {safeExpense.payment_method||'Not specified'}
            </span>
          </div>
        </div>

        <div style={{
          display:'flex',
          flexDirection:'column',
          alignItems:'flex-end',
          flexShrink:0
        }}>
          <span style={{
            fontSize:compact?12.5:14,
            fontWeight:750,
            color:'var(--text)',
            whiteSpace:'nowrap',
            letterSpacing:'-.02em'
          }}>
            {fmt(amount,currency,rate)}
          </span>

          {currency!=='PHP'&&!compact&&(
            <span style={{
              marginTop:2,
              fontSize:9,
              color:'var(--text-subtle)',
              whiteSpace:'nowrap'
            }}>
              ₱{amount.toLocaleString('en-PH',{
                minimumFractionDigits:2,
                maximumFractionDigits:2
              })}
            </span>
          )}
        </div>

        <div style={{
          display:'flex',
          alignItems:'center',
          gap:2,
          flexShrink:0
        }}>
          <button
            type="button"
            onClick={()=>setShowEdit(true)}
            aria-label="Edit expense"
            style={{
              width:compact?27:30,
              height:compact?27:30,
              display:'grid',
              placeItems:'center',
              padding:0,
              background:hovered?'var(--input-bg)':'transparent',
              border:0,
              borderRadius:8,
              color:'var(--text-muted)',
              cursor:'pointer'
            }}
          >
            <Pencil size={compact?11:13}/>
          </button>

          <button
            type="button"
            onClick={()=>setShowConfirm(true)}
            aria-label="Delete expense"
            style={{
              width:compact?27:30,
              height:compact?27:30,
              display:'grid',
              placeItems:'center',
              padding:0,
              background:hovered?'#fef2f2':'transparent',
              border:0,
              borderRadius:8,
              color:hovered?'#ef4444':'#fca5a5',
              cursor:'pointer'
            }}
          >
            <Trash2 size={compact?11:13}/>
          </button>
        </div>
      </article>

      {showEdit&&(
        <EditExpenseModal
          expense={safeExpense}
          onClose={()=>setShowEdit(false)}
          onSaved={e=>{
            if(typeof onUpdated==='function'){
              onUpdated(e)
            }
            setShowEdit(false)
          }}
        />
      )}

      {showConfirm&&(
        <ConfirmDialog
          title="Delete expense?"
          message={
            `Delete this expense of ₱${amount.toLocaleString('en-PH',{
              minimumFractionDigits:2,
              maximumFractionDigits:2
            })}?${
              safeExpense.wallet_id
                ?' The amount will be restored to the linked wallet.'
                :''
            }`
          }
          confirmText={deleting?'Deleting...':'Delete'}
          onConfirm={handleDelete}
          onClose={()=>!deleting&&setShowConfirm(false)}
        />
      )}
    </>
  )
}