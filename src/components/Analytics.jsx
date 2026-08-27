import { useEffect, useMemo, useState } from 'react'
import { BarChart2, Download, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { exportAnalyticsPDF } from '../lib/exportPDF'

const CATEGORIES = ['Food','Transport','Shopping','Bills','Health','Entertainment','Education','Savings','Other']
const COLORS = ['#f97316','#3b82f6','#ec4899','#ef4444','#22c55e','#a855f7','#6366f1','#14b8a8','#6b7280']
const RANGES = ['7 Days','4 Weeks','12 Months']
const SYMBOLS = { PHP:'₱',USD:'$',EUR:'€',GBP:'£',JPY:'¥',SGD:'S$',AUD:'A$',CAD:'C$',KRW:'₩',CNY:'¥',MYR:'RM',IDR:'Rp',THB:'฿',VND:'₫',INR:'₹',BRL:'R$',MXN:'$',ARS:'$',ZAR:'R',NGN:'₦' }

const date = d => d.toISOString().split('T')[0]
const money = (n, currency, rate, full = false) =>
  `${SYMBOLS[currency] || currency}${(Number(n || 0) * rate).toLocaleString('en-PH',{minimumFractionDigits:full ? 2 : 0})}`

function getRange(expenses, range) {
  const now = new Date()
  let start

  if (range === '7 Days') {
    start = new Date(now)
    start.setDate(now.getDate() - 6)
  } else if (range === '4 Weeks') {
    start = new Date(now)
    start.setDate(now.getDate() - 27)
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  }

  return expenses.filter(e => e.date >= date(start))
}

function getBars(expenses, range) {
  const now = new Date()

  if (range === '7 Days')
    return Array.from({length:7},(_,i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - 6 + i)
      const total = expenses.filter(e => e.date === date(d)).reduce((s,e) => s + Number(e.amount),0)
      return { label:d.toLocaleDateString('en-PH',{weekday:'short'}), sub:d.toLocaleDateString('en-PH',{month:'short',day:'numeric'}), total, now:i === 6 }
    })

  if (range === '4 Weeks')
    return Array.from({length:4},(_,i) => {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay() - 21 + i * 7)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      const total = expenses.filter(e => e.date >= date(start) && e.date <= date(end)).reduce((s,e) => s + Number(e.amount),0)
      return { label:`W${i+1}`, sub:`${date(start)} – ${date(end)}`, total, now:i === 3 }
    })

  return Array.from({length:12},(_,i) => {
    const d = new Date(now.getFullYear(),now.getMonth() - 11 + i,1)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const total = expenses.filter(e => e.date.startsWith(key)).reduce((s,e) => s + Number(e.amount),0)
    return { label:d.toLocaleDateString('en-PH',{month:'short'}), sub:d.toLocaleDateString('en-PH',{month:'long',year:'numeric'}), total, now:i === 11 }
  })
}

export default function Analytics({ userId, currency='PHP', rate=1, displayName='User', budgets=[] }) {
  const [range,setRange] = useState('7 Days')
  const [expenses,setExpenses] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')

  useEffect(() => {
    if (!userId) return setLoading(false)

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('id,amount,category,date')
        .eq('user_id',userId)
        .order('date',{ascending:false})

      if (error) {
        console.error('Analytics:',error)
        setError('Failed to load analytics data.')
      } else setExpenses(data || [])

      setLoading(false)
    }

    load()
  },[userId])

  const filtered = useMemo(() => getRange(expenses,range),[expenses,range])
  const bars = useMemo(() => getBars(expenses,range),[expenses,range])
  const max = Math.max(...bars.map(b => b.total),1)
  const total = filtered.reduce((s,e) => s + Number(e.amount),0)

  const categories = useMemo(() => {
    const totals = {}
    filtered.forEach(e => totals[e.category] = (totals[e.category] || 0) + Number(e.amount))
    const total = Object.values(totals).reduce((a,b) => a+b,0)

    return CATEGORIES.filter(c => totals[c]).map((c,i) => ({
      category:c,
      amount:totals[c],
      pct:total ? totals[c] / total * 100 : 0,
      color:COLORS[i]
    })).sort((a,b) => b.amount-a.amount)
  },[filtered])

  if (loading) return (
    <div style={{padding:32,textAlign:'center',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20}}>
      <Loader2 size={24} className="animate-spin" style={{margin:'0 auto 10px'}}/>
      <p style={{fontSize:13,color:'var(--text-muted)',margin:0}}>Loading analytics...</p>
    </div>
  )

  if (error) return (
    <div style={{padding:24,textAlign:'center',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20}}>
      <p style={{fontSize:13,color:'#ef4444',margin:0}}>{error}</p>
    </div>
  )

  if (!expenses.length) return (
    <div style={{padding:24,textAlign:'center',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20}}>
      <BarChart2 size={32} color="var(--border)" style={{margin:'0 auto 12px'}}/>
      <p style={{fontSize:14,color:'var(--text-muted)',margin:0}}>No data to display yet.</p>
      <p style={{fontSize:12,color:'var(--text-subtle)',marginTop:4}}>Add some expenses to see your analytics!</p>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <div style={{display:'flex',gap:4}}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{padding:'6px 14px',borderRadius:10,fontSize:12,fontWeight:500,border:'1px solid var(--border)',cursor:'pointer',background:range===r?'var(--accent)':'var(--card)',color:range===r?'var(--bg)':'var(--text-muted)'}}>
              {r}
            </button>
          ))}
        </div>

        <button onClick={() => exportAnalyticsPDF(expenses,currency,rate,displayName,budgets)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:'var(--card)',color:'var(--text-muted)',borderRadius:10,fontSize:12,border:'1px solid var(--border)',cursor:'pointer'}}>
          <Download size={13}/> Export PDF
        </button>
      </div>

      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13,fontWeight:700,color:'var(--text)',margin:0}}>Spending — {range}</h3>
          <span style={{fontSize:12,color:'var(--text-subtle)'}}>Total: {money(total,currency,rate,true)}</span>
        </div>

        <div style={{display:'flex',alignItems:'flex-end',gap:range==='12 Months'?4:6,height:120}}>
          {bars.map((b,i) => {
            const height = b.total ? Math.max(b.total/max*90,4) : 0
            return (
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}} title={`${b.sub}: ${money(b.total,currency,rate,true)}`}>
                {b.total > 0 && <span style={{fontSize:range==='12 Months'?8:9,color:'var(--text-subtle)'}}>{money(b.total,currency,rate)}</span>}
                <div style={{width:'100%',height:90,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                  <div style={{width:'80%',height,background:b.now?'var(--accent)':'#3b82f6',borderRadius:'4px 4px 0 0',opacity:b.now?1:.55}}/>
                </div>
                <span style={{fontSize:range==='12 Months'?8:10,color:b.now?'var(--text)':'var(--text-subtle)',fontWeight:b.now?700:400}}>{b.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
          <h3 style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:13,fontWeight:700,color:'var(--text)',margin:0}}>By Category</h3>
          <span style={{fontSize:12,color:'var(--text-subtle)'}}>Total: {money(total,currency,rate,true)}</span>
        </div>

        {!categories.length ? (
          <p style={{fontSize:12,color:'var(--text-subtle)',textAlign:'center',padding:12}}>No expenses in this range.</p>
        ) : <>
          <div style={{height:10,borderRadius:99,overflow:'hidden',display:'flex',marginBottom:14}}>
            {categories.map(c => <div key={c.category} style={{width:`${c.pct}%`,background:c.color}} title={`${c.category}: ${money(c.amount,currency,rate,true)}`}/>)}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {categories.map(c => (
              <div key={c.category} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:10,height:10,borderRadius:3,background:c.color}}/>
                  <span style={{fontSize:12,color:'var(--text)'}}>{c.category}</span>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:60,height:4,background:'var(--border)',borderRadius:99}}>
                    <div style={{width:`${c.pct}%`,height:'100%',background:c.color,borderRadius:99}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,minWidth:64,textAlign:'right'}}>{money(c.amount,currency,rate,true)}</span>
                  <span style={{fontSize:11,color:'var(--text-subtle)',minWidth:32,textAlign:'right'}}>{Math.round(c.pct)}%</span>
                </div>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  )
}