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
        model: 'openai/gpt-oss-120b',
        max_completion_tokens: 500,
        temperature: 0.3,
        response_format: {
          type: 'json_object',
        },
        messages: [{
          role: 'system',
          content: 'You are a personal finance assistant. Always return valid JSON.'
        }, {
          role: 'user',
          content: `Analyze these recent expenses and provide 2-3 short, friendly, actionable insights.

Expenses:
${summary}

Return ONLY a valid JSON object using exactly this structure:
{
  "insights": [
    {
      "type": "warning",
      "message": "Your food spending is high this week."
    },
    {
      "type": "tip",
      "message": "Consider meal prepping to reduce food expenses."
    },
    {
      "type": "positive",
      "message": "Great job keeping transport costs low!"
    }
  ]
}

Rules:
- "insights" must be an array
- Provide 2-3 insights
- "type" must be exactly "warning", "tip", or "positive"
- "message" must be a short, friendly sentence
- Use Philippine Peso (₱) when mentioning money
- Return JSON only
- Do not use markdown or code fences`
        }]
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
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      console.error('Unexpected Groq response:', data)
      throw new Error('Groq returned no content')
    }

    const result = JSON.parse(content)

    if (!Array.isArray(result.insights)) {
      throw new Error('Invalid insights format')
    }

    return result.insights.filter(
      insight =>
        ['warning', 'tip', 'positive'].includes(insight.type) &&
        typeof insight.message === 'string'
    )

  } catch (err) {
    console.error('AI insights failed:', err)
    return []
  }
}