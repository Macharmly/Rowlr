// All amounts in Rowlr are stored in PHP.
// We always fetch rates with PHP as base.
// rate = how much 1 PHP is worth in the user's selected currency.

const CACHE_KEY = 'rowlr_exchange_rates'
const CACHE_TIME_KEY = 'rowlr_exchange_rates_time'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function getExchangeRates() {
  try {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)

    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime)
      if (age < CACHE_DURATION) return JSON.parse(cached)
    }

    // Always fetch with PHP as base
    const apiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/PHP`)
    const data = await response.json()

    if (data.result !== 'success') throw new Error('Failed to fetch rates')

    const rates = data.conversion_rates
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())

    return rates
  } catch (err) {
    console.error('Exchange rate fetch failed:', err)
    return null
  }
}

export function forceRefreshRates() {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_TIME_KEY)
}

// Returns: how much 1 PHP = X in targetCurrency
// e.g. if targetCurrency = USD, returns ~0.0175
export function getRate(rates, targetCurrency) {
  if (!rates || targetCurrency === 'PHP') return 1
  return rates[targetCurrency] || 1
}