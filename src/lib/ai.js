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