export async function getSpendingInsights(expenses) {
  try {
    const summary = expenses.slice(0, 20).map(e =>
      `${e.category}: ₱${e.amount} on ${e.date}${e.notes ? ` (${e.notes})` : ''}`
    ).join('\n')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `You are a personal finance assistant. Analyze these recent expenses and give 2-3 short, friendly, actionable insights. Be concise and specific. Use Philippine Peso (₱).

Expenses:
${summary}

Return ONLY a JSON array of insight objects, no markdown, no backticks:
[
  {"type": "warning", "message": "Your food spending is high this week."},
  {"type": "tip", "message": "Consider meal prepping to save money."},
  {"type": "positive", "message": "Great job keeping transport costs low!"}
]

type must be one of: warning, tip, positive`,
          },
        ],
      }),
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim() || '[]'
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error('AI insights failed:', err)
    return []
  }
}