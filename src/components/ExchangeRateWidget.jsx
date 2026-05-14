import { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, Loader2 } from 'lucide-react'
import { getExchangeRates, forceRefreshRates } from '../lib/exchangeRate'
import { getCurrency } from '../lib/currency'

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'AUD', 'CAD', 'HKD', 'CNY', 'KRW', 'MYR', 'IDR', 'THB', 'PHP']
const TABS_LIST = ['Popular', 'All']

export default function ExchangeRateWidget({ userCurrency = 'PHP' }) {
  const [rates, setRates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  async function fetchRates(force = false) {
    if (force) {
      setRefreshing(true)
      forceRefreshRates()
    } else {
      setLoading(true)
    }

    const data = await getExchangeRates()
    if (data) {
      setRates(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const baseCurrency = getCurrency(userCurrency)

  // Filter currencies based on search or popular/all toggle
  const allCurrencyCodes = rates ? Object.keys(rates).filter(c => c !== userCurrency) : []
  const popularCodes = POPULAR.filter(c => c !== userCurrency)
  
  const displayCurrencies = search.trim()
    ? allCurrencyCodes.filter(c => {
        const curr = getCurrency(c)
        return c.toLowerCase().includes(search.toLowerCase()) || 
               curr.name.toLowerCase().includes(search.toLowerCase())
      })
    : showAll ? allCurrencyCodes : popularCodes

  return (
    <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <TrendingUp size={14} color="var(--text)" />
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Exchange Rates
          </h3>
          <span style={{ fontSize: 10, color: 'var(--text-subtle)', padding: '1px 6px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 20 }}>
            Base: {baseCurrency.symbol} {userCurrency}
          </span>
        </div>
        <button onClick={() => fetchRates(true)} disabled={refreshing || loading} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: refreshing || loading ? 0.5 : 1 }}>
          {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>Fetching live rates for {userCurrency}...</p>
        </div>
      ) : !rates ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>Failed to load rates. Check your API key.</p>
        </div>
      ) : (
        <>
          {/* Search + Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search currency..."
              style={{ flex: 1, padding: '7px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text)', outline: 'none' }}
            />
            <button onClick={() => { setShowAll(!showAll); setSearch('') }} style={{ padding: '7px 12px', backgroundColor: showAll ? 'var(--accent)' : 'var(--input-bg)', color: showAll ? 'var(--bg)' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {showAll ? 'Popular' : `All (${allCurrencyCodes.length})`}
            </button>
          </div>

          {/* Base currency card */}
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--accent)', borderRadius: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--bg)', margin: '0 0 2px', opacity: 0.8 }}>Your Currency</p>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--bg)', margin: 0 }}>
                  {baseCurrency.symbol} 1.00 {userCurrency}
                </p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--bg)', margin: 0, opacity: 0.7 }}>{baseCurrency.name}</p>
            </div>
          </div>

          {/* Other currencies grid */}
          <div style={{ maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            {displayCurrencies.map(code => {
              const currency = getCurrency(code)
              // rates[code] = 1 PHP in that currency
              // rates[userCurrency] = 1 PHP in userCurrency
              // So 1 userCurrency = rates[code] / rates[userCurrency]
              const userRate = userCurrency === 'PHP' ? 1 : (rates[userCurrency] || 1)
              const rate = userCurrency === 'PHP' ? rates[code] : (rates[code] / userRate)
              if (!rate) return null
              if (displayCurrencies.length === 0) return null
              return (
                <div key={code} style={{ padding: '8px 10px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{code}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{currency.symbol}</span>
                  </div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                    {rate < 0.01 ? rate.toFixed(6) : rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}
                  </p>
                  <p style={{ fontSize: 9, color: 'var(--text-subtle)', margin: '1px 0 0' }}>
                    per 1 {userCurrency}
                  </p>
                </div>
              )
            })}
          </div>

          </div>

          {search && displayCurrencies.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '12px 0', margin: 0 }}>
              No currencies found for "{search}"
            </p>
          )}

          {lastUpdated && (
            <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 10, textAlign: 'right', marginBottom: 0 }}>
              Updated: {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </>
      )}
    </div>
  )
}