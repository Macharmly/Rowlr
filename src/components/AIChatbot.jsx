import { useEffect, useRef, useState } from 'react'
import {
  MessageCircle,
  Send,
  X,
  Loader2,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { getAIChatResponse } from '../lib/ai'

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm Rowlr AI. Ask me anything about your finances.",
}

function playSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.value = type === 'send' ? 520 : 660

    gain.gain.setValueAtTime(0.025, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + 0.12
    )

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.12)
    oscillator.onended = () => ctx.close()
  } catch (error) {
    console.warn('Chat sound unavailable:', error)
  }
}

export default function AIChatbot({
  userId,
  expenses = [],
  currency = 'PHP',
  profile = null,
  onNavigate,
  onAddExpense,
}) {
  const storageKey = userId ? `rowlr_ai_chat_${userId}` : null

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hover, setHover] = useState(false)
  const [confirmNewChat, setConfirmNewChat] = useState(false)

  const [messages, setMessages] = useState(() => {
    if (!storageKey) return [welcomeMessage]

    try {
      const saved = localStorage.getItem(storageKey)
      const parsed = saved ? JSON.parse(saved) : null

      return Array.isArray(parsed) && parsed.length
        ? parsed
        : [welcomeMessage]
    } catch {
      return [welcomeMessage]
    }
  })

  const bottomRef = useRef(null)

  useEffect(() => {
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (error) {
      console.warn('Could not save AI chat:', error)
    }
  }, [messages, storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [messages, loading])

  function startNewChat() {
    setMessages([welcomeMessage])
    setInput('')
    setConfirmNewChat(false)

    if (storageKey) {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Could not clear AI chat:', error)
      }
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')

    setMessages(current => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
      },
    ])

    setLoading(true)
    playSound('send')

    try {
      const result = await getAIChatResponse(
        text,
        expenses,
        currency,
        profile
      )

      setMessages(current => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          action: result.action || null,
        },
      ])

      playSound('reply')
    } catch (error) {
      console.error('Chatbot error:', error)

      setMessages(current => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            right: 82,
            bottom: 31,
            zIndex: 49,
            padding: '9px 13px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 8px 25px rgba(0,0,0,.1)',
            color: 'var(--text)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            animation: 'aiFloat 2.8s ease-in-out infinite',
          }}
        >
          Need a little help?{' '}
          <span style={{ color: 'var(--accent)' }}>
            Ask Rowlr AI ✨
          </span>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? 'Close Rowlr AI' : 'Open Rowlr AI'}
        onClick={() => setOpen(value => !value)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 50,
          width: 52,
          height: 52,
          padding: 0,
          border: 0,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: hover
            ? '0 12px 32px color-mix(in srgb,var(--accent) 40%,transparent)'
            : '0 7px 22px rgba(0,0,0,.16)',
          transform: hover
            ? 'translateY(-4px) scale(1.06)'
            : 'translateY(0) scale(1)',
          transition: 'transform .2s ease, box-shadow .2s ease',
        }}
      >
        {open ? (
          <X size={21} strokeWidth={2} />
        ) : (
          <MessageCircle size={21} strokeWidth={2} />
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 82,
            zIndex: 51,
            width: 'min(380px,calc(100vw - 32px))',
            height: 500,
            maxHeight: 'calc(100vh - 110px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0,0,0,.2)',
            overflow: 'hidden',
            animation: 'aiOpen .22s ease-out',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: 'var(--input-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={14} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 750,
                    color: 'var(--text)',
                  }}
                >
                  Rowlr AI
                </div>

                <div
                  style={{
                    fontSize: 9.5,
                    color: 'var(--text-subtle)',
                  }}
                >
                  Personal finance assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 5 }}>
              <button
                type="button"
                aria-label="Start a new chat"
                title="Start a new chat"
                onClick={() => setConfirmNewChat(true)}
                disabled={loading}
                style={{
                  width: 30,
                  height: 30,
                  padding: 0,
                  border: 0,
                  borderRadius: 9,
                  background: 'var(--input-bg)',
                  color: 'var(--text-muted)',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={13} />
              </button>

              <button
                type="button"
                aria-label="Close chatbot"
                onClick={() => setOpen(false)}
                style={{
                  width: 30,
                  height: 30,
                  padding: 0,
                  border: 0,
                  borderRadius: 9,
                  background: 'var(--input-bg)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                style={{
                  alignSelf:
                    message.role === 'user'
                      ? 'flex-end'
                      : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems:
                    message.role === 'user'
                      ? 'flex-end'
                      : 'flex-start',
                  gap: 6,
                  animation: 'aiMessage .2s ease-out',
                }}
              >
                <div
                  style={{
                    padding: '9px 12px',
                    borderRadius: 14,
                    background:
                      message.role === 'user'
                        ? 'var(--accent)'
                        : 'var(--input-bg)',
                    color:
                      message.role === 'user'
                        ? 'var(--bg)'
                        : 'var(--text)',
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message.content}
                </div>

                {message.role === 'assistant' && message.action && (
                  <button
                    type="button"
                    onClick={() => {
                      if (message.action.type === 'navigate') {
                        onNavigate?.(message.action.target)
                      }

                      if (message.action.type === 'add_expense') {
                        onAddExpense?.()
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      borderRadius: 10,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {message.action.type === 'navigate'
                      ? `Go to ${message.action.target} →`
                      : 'Add an expense →'}
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 13px',
                  borderRadius: 14,
                  background: 'var(--input-bg)',
                  display: 'flex',
                  gap: 4,
                }}
              >
                {[0, 1, 2].map(index => (
                  <span
                    key={index}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--text-muted)',
                      animation: `aiDot 1s ${index * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div
            style={{
              padding: 10,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 7,
            }}
          >
            <input
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask about your finances..."
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: 40,
                padding: '9px 12px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="button"
              aria-label="Send message"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                padding: 0,
                border: 0,
                borderRadius: 12,
                background: 'var(--accent)',
                color: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor:
                  loading || !input.trim()
                    ? 'default'
                    : 'pointer',
                opacity:
                  !input.trim() || loading ? 0.5 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} strokeWidth={2} />
              )}
            </button>
          </div>

          {confirmNewChat && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                background: 'color-mix(in srgb,var(--bg) 70%,transparent)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 290,
                  padding: 18,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  boxShadow: '0 18px 45px rgba(0,0,0,.2)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--input-bg)',
                    borderRadius: 10,
                  }}
                >
                  <RotateCcw size={15} />
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 750,
                    color: 'var(--text)',
                  }}
                >
                  Start a new chat?
                </h3>

                <p
                  style={{
                    margin: '6px 0 16px',
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: 'var(--text-subtle)',
                  }}
                >
                  Your current conversation will be ended and a new
                  conversation will start.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 7,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setConfirmNewChat(false)}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      background: 'var(--input-bg)',
                      color: 'var(--text-muted)',
                      fontSize: 10.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={startNewChat}
                    style={{
                      padding: '8px 12px',
                      border: 0,
                      borderRadius: 10,
                      background: 'var(--accent)',
                      color: 'var(--bg)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes aiFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes aiOpen {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes aiMessage {
          from {
            opacity: 0;
            transform: translateY(6px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes aiDot {
          0%, 60%, 100% {
            opacity: .3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </>
  )
}