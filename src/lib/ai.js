import { getExchangeRates } from './exchangeRate'

export async function getSpendingInsights(expenses = []) {
  if (!expenses.length) {
    return []
  }

  // Get the 30 most recent expenses.
  const recentExpenses = expenses
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    )
    .slice(0, 30)

  const summary = recentExpenses
    .map((e) => {
      return [
        `Amount: ₱${Number(e.amount || 0).toFixed(2)}`,
        `Category: ${e.category || 'Other'}`,
        `Date: ${e.date || 'Unknown'}`,
        `Payment Method: ${e.payment_method || 'Not specified'}`,
        `Notes: ${e.notes || 'None'}`,
      ].join(' | ')
    })
    .join('\n')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            max_completion_tokens: 600,
            temperature: 0.3,
            reasoning_effort: 'low',
            include_reasoning: false,

            messages: [
              {
                role: 'user',
                content: `You are a personal finance assistant.

Analyze the user's recent expenses below.

Look for:
- High spending categories
- Large individual purchases
- Repeated spending patterns
- Unnecessary or discretionary spending
- Payment method patterns
- Opportunities to save
- Positive spending habits
- Useful information from expense notes

Only make observations supported by the provided expenses.
Do not invent information.

Recent expenses:

${summary}

Give 2-3 short, friendly, actionable insights.

Use EXACTLY this format, one per line:

warning|Your food spending is high this week.
tip|Consider reducing frequent food purchases to save money.
positive|Great job keeping your transport spending low.

Rules:
- Use ONLY warning, tip, or positive.
- One insight per line.
- No JSON.
- No markdown.
- No numbering.
- No bullet points.
- No extra explanation.
- Keep each message under 18 words.
- Use ₱ when mentioning Philippine Peso amounts.`,
              },
            ],
          }),
        }
      )

      const raw = await response.text()

      if (!response.ok) {
        console.error(
          `Groq API error (attempt ${attempt}):`,
          response.status,
          raw
        )

        continue
      }

      let data

      try {
        data = JSON.parse(raw)
      } catch (parseError) {
        console.error(
          `Failed to parse Groq response (attempt ${attempt}):`,
          raw
        )

        continue
      }

      const message = data.choices?.[0]?.message

      const content =
        message?.content?.trim()

      if (!content) {
        console.warn(
          `Groq returned empty content (attempt ${attempt}):`,
          message
        )

        continue
      }

      const insights = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separatorIndex =
            line.indexOf('|')

          if (separatorIndex === -1) {
            return null
          }

          const type = line
            .slice(0, separatorIndex)
            .trim()
            .toLowerCase()

          const message = line
            .slice(separatorIndex + 1)
            .trim()

          return {
            type,
            message,
          }
        })
        .filter(
          (insight) =>
            insight &&
            ['warning', 'tip', 'positive'].includes(
              insight.type
            ) &&
            insight.message
        )
        .slice(0, 3)

      if (insights.length > 0) {
        return insights
      }

      console.warn(
        `Groq returned unusable insights (attempt ${attempt}):`,
        content
      )
    } catch (err) {
      console.error(
        `AI insights failed (attempt ${attempt}):`,
        err
      )
    }

    // Small delay before retrying.
    if (attempt < 3) {
      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      )
    }
  }

  console.error(
    'AI insights failed after 3 attempts'
  )

  return []
}

export async function getAIChatResponse(
  question,
  expenses = [],
  currency = 'PHP',
  profile = null
) {
  const recent = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 50)

  const summary = recent
    .map(e => [
      `Amount: ${currency} ${Number(e.amount || 0).toFixed(2)}`,
      `Category: ${e.category || 'Other'}`,
      `Date: ${e.date || 'Unknown'}`,
      `Payment: ${e.payment_method || 'Not specified'}`,
      `Notes: ${e.notes || 'None'}`
    ].join(' | '))
    .join('\n')

  let exchangeRates = null

  try {
    exchangeRates = await getExchangeRates()
  } catch (error) {
    console.warn('Could not load exchange rates for AI:', error)
  }

  let exchangeSummary = 'Exchange rate data unavailable.'

  if (exchangeRates) {
    const phpRate = exchangeRates.PHP || 1

    exchangeSummary = Object.entries(exchangeRates)
      .map(([code, rate]) => {
        const value = Number(rate)

        if (!value || !Number.isFinite(value)) return null

        return `1 ${code} = ${(phpRate / value).toFixed(6)} PHP`
      })
      .filter(Boolean)
      .join('\n')
  }

  const prompt = `You are Rowlr AI, a personal finance assistant inside the Rowlr web application.

Your job is to answer the user's financial questions, provide useful financial information, and help them navigate Rowlr.

IMPORTANT:
You have access to current exchange-rate data supplied by Rowlr.

EXCHANGE RATE RULES:

If the user asks about currencies, exchange rates, USD/PHP, Dollar/Peso, EUR/PHP, or similar:

- Use the provided exchange-rate data.
- Do not say you cannot access current exchange rates if exchange-rate data is provided.
- Calculate conversions when possible.
- Clearly state that rates are approximate and may change.
- If the user asks "now", "today", "current rate", or similar, use the provided exchange-rate data.
- Do not invent exchange rates.
- Do not use an exchange rate that is not present in the provided data.

Example:

User:
How much is Dollar to Philippine Peso now?

Good response:
1 USD is approximately ₱57.XX PHP based on the latest rate available to Rowlr.

You may also calculate conversions such as:
100 USD ≈ ₱5,7XX PHP

Do not claim the rate is an exact real-time market rate.

ROWLR SECTIONS:

Expenses
Analytics
Budgets
Wallets & Income
Bills
Expense Plans
Loans
Savings
Net Worth
Notes
Calendar
Score

You can also help the user open the Add Expense form.

NAVIGATION RULES:

If the user asks where to find something, how to access something, or asks you to show them something available in Rowlr, provide a navigation action.

Examples:

"How do I check my financial score?"
→ Score

"Where can I see my wallets?"
→ Wallets & Income

"Show me my savings"
→ Savings

"Where are my bills?"
→ Bills

"How do I see my spending analytics?"
→ Analytics

"Where are my expense plans?"
→ Expense Plans

"Where can I see my loans?"
→ Loans

"Show my net worth"
→ Net Worth

"Where are my notes?"
→ Notes

"Where is my financial calendar?"
→ Calendar

"How do I add an expense?"
→ Add Expense

Only navigate when the requested destination actually exists.

NAVIGATION TARGETS:

Expenses
Analytics
Budgets
Wallets & Income
Bills
Expense Plans
Loans
Savings
Net Worth
Notes
Calendar
Score

For adding an expense, use:

{
  "type": "add_expense"
}

Do NOT use:

{
  "type": "navigate",
  "target": "Add Expense"
}

If no navigation is needed, action must be null.

FINANCIAL DATA RULES:

Use ONLY the provided financial data when answering questions about the user's personal finances.

Never invent:
- Transactions
- Balances
- Income
- Budgets
- Bills
- Loans
- Savings
- Financial scores
- Net worth

You may calculate totals, averages, percentages, comparisons, and other values from the provided data.

Keep responses concise, friendly, and useful.

Return EXACTLY valid JSON.

For a normal response:

{
  "reply": "Your response to the user",
  "action": null
}

For navigation:

{
  "reply": "Your response to the user",
  "action": {
    "type": "navigate",
    "target": "Score"
  }
}

For adding an expense:

{
  "reply": "I'll open the expense form for you.",
  "action": {
    "type": "add_expense"
  }
}

The navigation target must be EXACTLY one of:

Expenses
Analytics
Budgets
Wallets & Income
Bills
Expense Plans
Loans
Savings
Net Worth
Notes
Calendar
Score

Do not use markdown.
Do not add anything outside the JSON.

USER:
${profile?.display_name || 'User'}

USER'S CURRENCY:
${currency}

RECENT EXPENSES:
${summary || 'No expenses recorded.'}

CURRENT EXCHANGE-RATE DATA:
${exchangeSummary}

QUESTION:
${question}`

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':
          `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        max_completion_tokens: 600,
        temperature: 0.2,
        reasoning_effort: 'low',
        include_reasoning: false,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('Groq chatbot error:', data)
    throw new Error(
      data?.error?.message || 'Groq request failed'
    )
  }

  const content =
    data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    return {
      reply: 'I could not generate a response.',
      action: null
    }
  }

  try {
    const parsed = JSON.parse(content)

    return {
      reply: parsed.reply || 'I could not generate a response.',
      action: parsed.action || null
    }
  } catch (error) {
    console.error('Failed to parse AI response:', content)

    return {
      reply: content,
      action: null
    }
  }
}