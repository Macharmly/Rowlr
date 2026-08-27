import { useEffect,useState } from 'react'
import { Plus,LogOut,Wallet,TrendingDown,Calendar,Filter,Loader2,Sun,Moon,Download,User,Search,ArrowUpDown,X,ChevronDown,ReceiptText,Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt as fmtCurrency } from '../lib/currency'
import { getExchangeRates,getRate,forceRefreshRates } from '../lib/exchangeRate'
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
import ExpensePlansSection from '../components/ExpensePlansSection'
import AIChatbot from '../components/AIChatbot'

const CATEGORIES=['All','Food','Transport','Shopping','Bills','Health','Entertainment','Education','Savings','Other']
const TABS=['Expenses','Analytics','Budgets','Wallets & Income','Bills','Expense Plans','Loans','Savings','Net Worth','Notes','Calendar','Score']
const DATE_FILTER_LABELS={this_week:'This Week',this_month:'This Month',last_month:'Last Month',all:'All Time'}

function useWindowWidth(){
  const [width,setWidth]=useState(()=>typeof window!=='undefined'?window.innerWidth:1024)
  useEffect(()=>{const resize=()=>setWidth(window.innerWidth);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[])
  return width
}

function IconButton({children,label,onClick,danger=false}){
  const [hovered,setHovered]=useState(false)
  return <button type="button" aria-label={label} title={label} onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{width:34,height:34,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',padding:0,backgroundColor:hovered?(danger?'#fef2f2':'var(--input-bg)'):'transparent',border:'1px solid var(--border)',borderRadius:11,color:danger?(hovered?'#ef4444':'#f87171'):'var(--text-muted)',cursor:'pointer',transition:'all .15s',transform:hovered?'translateY(-1px)':'none'}}>{children}</button>
}

function SummaryCard({label,value,sub,icon:Icon,delay=1}){
  const [hovered,setHovered]=useState(false)
  return <div className={`animate-slide-up stagger-${delay}`} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{position:'relative',minWidth:0,padding:16,overflow:'hidden',backgroundColor:'var(--card)',border:`1px solid ${hovered?'color-mix(in srgb,var(--text) 15%,var(--border))':'var(--border)'}`,borderRadius:18,boxShadow:hovered?'0 12px 32px rgba(0,0,0,.07)':'0 1px 3px rgba(0,0,0,.025)',transform:hovered?'translateY(-2px)':'none',transition:'all .18s'}}>
    <div style={{position:'absolute',top:-28,right:-28,width:90,height:90,background:'color-mix(in srgb,var(--accent) 6%,transparent)',borderRadius:'50%'}}/>
    <div style={{position:'relative',display:'flex',justifyContent:'space-between',gap:12}}>
      <div style={{minWidth:0}}>
        <p style={{margin:0,fontSize:10,fontWeight:650,color:'var(--text-subtle)',textTransform:'uppercase',letterSpacing:'.07em'}}>{label}</p>
        <p title={String(value)} style={{margin:'8px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'clamp(18px,3vw,23px)',fontWeight:800,color:'var(--text)',letterSpacing:'-.035em'}}>{value}</p>
        <p style={{margin:'4px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:10.5,color:'var(--text-subtle)',textTransform:'capitalize'}}>{sub}</p>
      </div>
      <div style={{width:34,height:34,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:11,color:'var(--text-muted)'}}><Icon size={15} strokeWidth={1.8}/></div>
    </div>
  </div>
}

function ActionButton({children,onClick,primary=false}){
  const [hovered,setHovered]=useState(false)
  return <button type="button" onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{minHeight:38,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'9px 14px',backgroundColor:primary?'var(--accent)':hovered?'var(--input-bg)':'var(--card)',border:primary?'none':'1px solid var(--border)',borderRadius:12,boxShadow:primary?(hovered?'0 8px 20px color-mix(in srgb,var(--accent) 28%,transparent)':'0 4px 12px color-mix(in srgb,var(--accent) 18%,transparent)'):'none',color:primary?'var(--bg)':'var(--text-muted)',fontSize:12,fontWeight:primary?700:600,cursor:'pointer',whiteSpace:'nowrap',transform:hovered?'translateY(-1px)':'none',transition:'all .15s'}}>{children}</button>
}

export default function Dashboard({user,dark,setDark}){
  const [expenses,setExpenses]=useState([])
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [highlightedTab, setHighlightedTab] = useState(null)
  const [showProfile,setShowProfile]=useState(false)
  const [categoryFilter,setCategoryFilter]=useState('All')
  const [dateFilter,setDateFilter]=useState('this_month')
  const [activeTab,setActiveTab]=useState(()=>localStorage.getItem('rowlr_active_tab')||'Expenses')
  const [search,setSearch]=useState('')
  const [sortBy,setSortBy]=useState('date')
  const [sortDir,setSortDir]=useState('desc')
  const [profile,setProfile]=useState(null)
  const [rates,setRates]=useState(null)
  const [budgets,setBudgets]=useState([])
  const [walletsList,setWalletsList]=useState([])
  const [incomeList,setIncomeList]=useState([])
  const [billsList,setBillsList]=useState([])
  const [loansList,setLoansList]=useState([])
  const [savingsList,setSavingsList]=useState([])
  const windowWidth=useWindowWidth()
  const isMobile=windowWidth<640

  useEffect(()=>{fetchExpenses()},[dateFilter,user.id])
  useEffect(()=>{fetchProfile();fetchBudgets()},[user.id])
  useEffect(()=>{getExchangeRates().then(setRates)},[])
  useEffect(()=>localStorage.setItem('rowlr_active_tab',activeTab),[activeTab])
  useEffect(()=>{if(activeTab==='Score')fetchScoreData()},[activeTab,user.id])

  async function fetchScoreData(){
    const tables=['wallets','income','bills','loans','savings_goals']
    const result=await Promise.all(tables.map(t=>supabase.from(t).select('*').eq('user_id',user.id)))
    setWalletsList(result[0].data||[])
    setIncomeList(result[1].data||[])
    setBillsList(result[2].data||[])
    setLoansList(result[3].data||[])
    setSavingsList(result[4].data||[])
  }

  async function fetchBudgets(){
    const now=new Date()
    const {data,error}=await supabase.from('budgets').select('*').eq('user_id',user.id).eq('month',now.getMonth()+1).eq('year',now.getFullYear())
    if(error){console.error('Error fetching budgets:',error);setBudgets([]);return}
    setBudgets(data||[])
  }

  async function fetchProfile(){
    const {data,error}=await supabase.from('profiles').select('*').eq('id',user.id).single()
    if(error){console.error('Error fetching profile:',error);setProfile(null);return}
    setProfile(data)
  }

  async function fetchExpenses(){
    setLoading(true)
    let query=supabase.from('expenses').select('*').eq('user_id',user.id).order('date',{ascending:false}).order('created_at',{ascending:false})
    const now=new Date()
    if(dateFilter==='this_week'){
      const start=new Date(now);start.setDate(now.getDate()-now.getDay())
      query=query.gte('date',start.toISOString().split('T')[0])
    }else if(dateFilter==='this_month'){
      query=query.gte('date',`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`)
    }else if(dateFilter==='last_month'){
      const start=new Date(now.getFullYear(),now.getMonth()-1,1)
      const end=new Date(now.getFullYear(),now.getMonth(),0)
      query=query.gte('date',start.toISOString().split('T')[0]).lte('date',end.toISOString().split('T')[0])
    }
    const {data,error}=await query
    if(error){console.error('Error fetching expenses:',error);setExpenses([])}else setExpenses(data||[])
    setLoading(false)
  }

  const handleDelete=id=>setExpenses(p=>p.filter(e=>e.id!==id))
  const handleUpdated=e=>setExpenses(p=>p.map(x=>x.id===e.id?e:x))
  const handleTabChange = tab => {
    setActiveTab(tab)

    setHighlightedTab(tab)

    setTimeout(() => {
      setHighlightedTab(null)
    }, 2200)
  }
  const clearFilters=()=>{setSearch('');setCategoryFilter('All')}

  const currency=profile?.currency||'PHP'
  const rate=getRate(rates,currency)
  const fmt=amount=>fmtCurrency(amount,currency,rate)

  const filtered=expenses
    .filter(e=>categoryFilter==='All'||e.category===categoryFilter)
    .filter(e=>{
      if(!search.trim())return true
      const q=search.toLowerCase()
      return (e.notes||'').toLowerCase().includes(q)||(e.category||'').toLowerCase().includes(q)||(e.payment_method||'').toLowerCase().includes(q)
    })
    .sort((a,b)=>{
      let x,y
      if(sortBy==='date'){x=a.date;y=b.date}else if(sortBy==='amount'){x=Number(a.amount);y=Number(b.amount)}else{x=a.category||'';y=b.category||''}
      return x<y?(sortDir==='asc'?-1:1):x>y?(sortDir==='asc'?1:-1):0
    })

  const total=filtered.reduce((s,e)=>s+Number(e.amount),0)
  const today=new Date().toISOString().split('T')[0]
  const todayTotal=expenses.filter(e=>e.date===today).reduce((s,e)=>s+Number(e.amount),0)
  const categoryTotals=expenses.reduce((a,e)=>{const c=e.category||'Other';a[c]=(a[c]||0)+Number(e.amount);return a},{})
  const topCategory=Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1])[0]
  const displayName=profile?.display_name||user.email?.split('@')[0]||'User'
  const hasActiveFilters=search.trim()||categoryFilter!=='All'

  return <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',backgroundColor:'var(--bg)'}}>

    <header style={{position:'sticky',top:0,zIndex:40,backgroundColor:'color-mix(in srgb,var(--bg) 82%,transparent)',borderBottom:'1px solid var(--border)',backdropFilter:'blur(22px)'}}>
      <div style={{maxWidth:1480,minHeight:58,margin:'auto',padding:'10px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,boxSizing:'border-box'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'var(--text)',borderRadius:11}}><Wallet size={16} color="var(--bg)"/></div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <span style={{fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:17,fontWeight:850,color:'var(--text)'}}>Rowlr</span>
              {currency!=='PHP'&&rates&&<span style={{padding:'2px 7px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:99,fontSize:9,color:'#15803d'}}>{currency}</span>}
            </div>
            {windowWidth>720&&<p style={{margin:'1px 0 0',fontSize:9.5,color:'var(--text-subtle)'}}>Personal finance workspace</p>}
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <button type="button" onClick={()=>setShowProfile(true)} style={{height:36,display:'flex',alignItems:'center',gap:8,padding:'4px 9px 4px 5px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,cursor:'pointer'}}>
            {profile?.avatar_url?<img src={profile.avatar_url} alt="" style={{width:26,height:26,borderRadius:9,objectFit:'cover'}}/>:<div style={{width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:9}}><User size={12}/></div>}
            {windowWidth>520&&<><span style={{maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11.5,fontWeight:600,color:'var(--text-muted)'}}>{displayName}</span><ChevronDown size={12}/></>}
          </button>
          <IconButton label={dark?'Use light mode':'Use dark mode'} onClick={()=>setDark(!dark)}>{dark?<Sun size={14}/>:<Moon size={14}/>}</IconButton>
          <IconButton label="Sign out" danger onClick={()=>supabase.auth.signOut()}><LogOut size={14}/></IconButton>
        </div>
      </div>
    </header>

    <main style={{width:'100%',maxWidth:1480,flex:1,margin:'auto',padding:isMobile?'14px 12px 28px':'22px 22px 36px',boxSizing:'border-box'}}>
      <BillReminders userId={user.id}/>

      <section className="animate-fade-in" style={{display:'flex',alignItems:isMobile?'flex-start':'center',justifyContent:'space-between',gap:14,marginBottom:20}}>
        <div>
          <p style={{margin:'0 0 4px',fontSize:10,fontWeight:650,color:'var(--text-subtle)',textTransform:'uppercase'}}>Financial overview</p>
          <h1 style={{margin:0,fontFamily:"'Cabinet Grotesk',sans-serif",fontSize:'clamp(22px,4vw,30px)',fontWeight:850,color:'var(--text)'}}>My Finances</h1>
          <p style={{margin:'5px 0 0',fontSize:11.5,color:'var(--text-subtle)'}}>Track what you earn, spend, save, and owe in one place.</p>
        </div>

        {activeTab==='Expenses'&&<div style={{display:'flex',gap:8}}>
          {expenses.length>0&&!isMobile&&<ActionButton onClick={()=>exportExpensesToCSV(expenses,currency)}><Download size={13}/>Export CSV</ActionButton>}
          <ActionButton primary onClick={()=>setShowModal(true)}><Plus size={14}/>{isMobile?'Add':'Add Expense'}</ActionButton>
        </div>}
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:12,marginBottom:18}}>
        <SummaryCard label="Total Spent" value={fmt(total)} icon={TrendingDown} sub={DATE_FILTER_LABELS[dateFilter]} delay={1}/>
        <SummaryCard label="Today's Spend" value={fmt(todayTotal)} icon={Calendar} sub="Today" delay={2}/>
        <SummaryCard label="Top Category" value={topCategory?topCategory[0]:'—'} icon={Filter} sub={topCategory?fmt(topCategory[1]):'No spending data'} delay={3}/>
      </section>

      <section style={{marginBottom:16}}>
        {isMobile?<div style={{position:'relative'}}>
          <select value={activeTab} onChange={e=>handleTabChange(e.target.value)} style={{width:'100%',minHeight:44,padding:'10px 40px 10px 14px',appearance:'none',background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,fontSize:12.5,fontWeight:700,color:'var(--text)'}}>
            {TABS.map(t=><option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={15} style={{position:'absolute',top:'50%',right:14,transform:'translateY(-50%)',pointerEvents:'none'}}/>
        </div>:<div style={{display:'flex',gap:3,padding:4,overflowX:'auto',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:15}}>
          {TABS.map(tab=>{
            const active=activeTab===tab
            const highlighted=highlightedTab===tab

            return <button
              type="button"
              key={tab}
              onClick={()=>handleTabChange(tab)}
              style={{
                minHeight:34,
                flexShrink:0,
                padding:'7px 13px',
                background:active?'var(--card)':'transparent',
                border:active?'1px solid var(--border)':'1px solid transparent',
                borderRadius:11,
                color:active?'var(--text)':'var(--text-muted)',
                fontSize:11.5,
                fontWeight:active?700:550,
                cursor:'pointer',

                boxShadow: highlighted
                  ? '0 0 0 3px color-mix(in srgb,var(--accent) 22%,transparent), 0 0 22px color-mix(in srgb,var(--accent) 35%,transparent)'
                  : 'none',

                transform: highlighted
                  ? 'translateY(-2px) scale(1.03)'
                  : 'none',

                transition:'all .25s'
              }}
            >
              {tab}
            </button>
          })}
        </div>}
      </section>

      {activeTab==='Expenses'?<section style={{display:'grid',gridTemplateColumns:windowWidth<900?'1fr':'minmax(0,1.8fr) minmax(290px,.8fr)',gap:16}}>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{padding:isMobile?12:14,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <div><h2 style={{margin:0,fontSize:14,fontWeight:750,color:'var(--text)'}}>Expense history</h2><p style={{margin:'3px 0 0',fontSize:10.5,color:'var(--text-subtle)'}}>{filtered.length} {filtered.length===1?'result':'results'}</p></div>
              {isMobile&&expenses.length>0&&<button onClick={()=>exportExpensesToCSV(expenses,currency)} style={{width:32,height:32,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10}}><Download size={13}/></button>}
            </div>

            <div style={{display:'grid',gridTemplateColumns:windowWidth<700?'1fr':'minmax(180px,1fr) auto auto',gap:8}}>
              <div style={{position:'relative'}}>
                <Search size={14} style={{position:'absolute',top:'50%',left:12,transform:'translateY(-50%)'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search notes, category, or payment method" style={{width:'100%',minHeight:40,padding:'9px 36px 9px 34px',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:12,boxSizing:'border-box',color:'var(--text)'}}/>
                {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',background:'none',border:0}}><X size={12}/></button>}
              </div>

              <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} style={{minHeight:40,padding:'8px 11px',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:12,color:'var(--text)'}}>
                <option value="this_week">This Week</option><option value="this_month">This Month</option><option value="last_month">Last Month</option><option value="all">All Time</option>
              </select>

              <div style={{display:'flex',gap:6}}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{minHeight:40,flex:1,padding:'8px 11px',background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:12,color:'var(--text)'}}>
                  <option value="date">Date</option><option value="amount">Amount</option><option value="category">Category</option>
                </select>
                <button onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} style={{width:40,height:40,background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:12}}><ArrowUpDown size={14}/></button>
              </div>
            </div>

            <div style={{display:'flex',gap:6,marginTop:10,overflowX:'auto'}}>
              {CATEGORIES.map(c=>{const active=categoryFilter===c;return <button key={c} onClick={()=>setCategoryFilter(c)} style={{minHeight:29,flexShrink:0,padding:'5px 10px',background:active?'var(--accent)':'transparent',border:`1px solid ${active?'var(--accent)':'var(--border)'}`,borderRadius:99,color:active?'var(--bg)':'var(--text-muted)',fontSize:10.5}}>{c}</button>})}
              {hasActiveFilters&&<button onClick={clearFilters} style={{border:0,background:'none',color:'var(--text-subtle)'}}><X size={10}/> Reset</button>}
            </div>
          </div>

          {loading?<div style={{minHeight:220,display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18}}><Loader2 className="animate-spin" size={21}/><span>Loading expenses</span></div>:filtered.length===0?<div style={{minHeight:250,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',background:'var(--card)',border:'1px solid var(--border)',borderRadius:18}}>
            <ReceiptText size={28}/>
            <h3 style={{margin:'14px 0 0'}}>No expenses found</h3>
            <p style={{maxWidth:300,fontSize:11,color:'var(--text-subtle)'}}>{hasActiveFilters?'Try changing or resetting your current filters.':'Your recorded expenses will appear here.'}</p>
            <button onClick={hasActiveFilters?clearFilters:()=>setShowModal(true)} style={{padding:'8px 12px',background:'var(--accent)',border:0,borderRadius:11,color:'var(--bg)',fontWeight:700}}>{hasActiveFilters?'Reset filters':'+ Add expense'}</button>
          </div>:<div style={{display:'flex',flexDirection:'column',gap:8}}>
            {filtered.map(e=><ExpenseItem key={e.id} expense={e} onDelete={handleDelete} onUpdated={handleUpdated} currency={currency} rate={rate}/>)}
          </div>}
        </div>

        <aside style={{position:windowWidth>=900?'sticky':'static',top:76}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}><Sparkles size={12}/><span style={{fontSize:10,color:'var(--text-subtle)',textTransform:'uppercase'}}>Smart insights</span></div>
          <AIInsights expenses={expenses}/>
        </aside>
      </section>

      :activeTab==='Analytics'?<div style={{display:'flex',flexDirection:'column',gap:16}}>
        <Analytics userId={user.id} currency={currency} rate={rate} displayName={displayName} budgets={budgets}/>
        <ExchangeRateWidget userCurrency={currency}/>
      </div>

      :activeTab==='Budgets'?<BudgetGoals userId={user.id} expenses={expenses} currency={currency} rate={rate}/>

      :activeTab==='Wallets & Income'?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>
        <WalletSection userId={user.id} currency={currency} rate={rate}/>
        <IncomeSection userId={user.id} currency={currency} rate={rate}/>
      </div>

      :activeTab==='Bills'?<BillsSection userId={user.id} currency={currency} rate={rate}/>

      :activeTab==='Expense Plans'?<ExpensePlansSection userId={user.id} currency={currency} rate={rate} onExpenseCreated={e=>setExpenses(p=>[e,...p])}/>

      :activeTab==='Loans'?<LoansSection userId={user.id} currency={currency} rate={rate}/>

      :activeTab==='Savings'?<SavingsGoals userId={user.id} currency={currency} rate={rate}/>

      :activeTab==='Net Worth'?<NetWorth userId={user.id} expenses={expenses} currency={currency} rate={rate}/>

      :activeTab==='Notes'?<FinancialNotes userId={user.id}/>

      :activeTab==='Calendar'?<FinancialCalendar expenses={expenses} currency={currency} rate={rate}/>

      :<FinancialScore expenses={expenses} income={incomeList} wallets={walletsList} bills={billsList} loans={loansList} savings={savingsList} currency={currency} rate={rate}/>}
    </main>

    <footer style={{padding:'18px 16px',textAlign:'center',borderTop:'1px solid var(--border)'}}><p style={{margin:0,fontSize:10.5,color:'var(--text-subtle)'}}>© 2026 RRC Development</p></footer>

    {showModal&&<AddExpenseModal onClose={()=>setShowModal(false)} onSaved={e=>setExpenses(p=>[e,...p])} userId={user.id} currency={currency} rate={rate}/>}

    {showProfile&&<ProfileModal user={user} onClose={()=>setShowProfile(false)} onSaved={data=>{setProfile(data);forceRefreshRates();getExchangeRates().then(setRates)}}/>}
    
    <AIChatbot
      userId={user.id}
      expenses={expenses}
      currency={currency}
      profile={profile}
      onNavigate={handleTabChange}
      onAddExpense={() => setShowModal(true)}
    />
  </div>
}