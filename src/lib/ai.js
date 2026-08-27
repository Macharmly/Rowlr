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
        max_tokens: 500,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: `You are a personal finance assistant.

Analyze these recent expenses and provide 2-3 short, friendly, actionable insights.

Expenses:
${summary}

Return ONLY valid JSON in this exact format:
{
  "insights": [
    {
      "type": "warning",
      "message": "Your food spending is high this week."
    }
  ]
}

The "type" must be exactly one of:
warning
tip
positive

Do not include markdown or code fences.`
        }],
        response_format: {
          type: 'json_object'
        },
      }),
    })

    const raw = await response.text()

    if (!response.ok) {
      console.error('Groq API error:', response.status, raw)
      throw new Error(`Groq API returned ${response.status}`)
    }

    if (!raw.trim()) {
      throw new Error('Groq returned an empty response')
    }

    const data = JSON.parse(raw)
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('Groq returned no message content')
    }

    const result = JSON.parse(content)

    return Array.isArray(result.insights) ? result.insights : []
  } catch (err) {
    console.error('AI insights failed:', err)
    return []
  }
}