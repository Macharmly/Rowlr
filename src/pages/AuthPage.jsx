import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  Wallet,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react'

const VIEWS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot',
}

const s = {
  page: {
    backgroundColor: 'var(--bg)',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },

  backgroundGlow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: '50%',
    backgroundColor: 'var(--text)',
    opacity: 0.025,
    filter: 'blur(100px)',
    pointerEvents: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },

  content: {
    width: '100%',
    maxWidth: 360,
    position: 'relative',
    zIndex: 1,
  },

  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 0',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },

  themeButton: {
    padding: '6px 10px',
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
  },

  logoWrapper: {
    textAlign: 'center',
    marginBottom: 28,
  },

  logoMark: {
    width: 48,
    height: 48,
    backgroundColor: 'var(--text)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },

  logoTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--text)',
    margin: 0,
    letterSpacing: '-0.5px',
  },

  logoSubtitle: {
    fontSize: 13,
    color: 'var(--text-subtle)',
    marginTop: 4,
  },

  card: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  },

  cardTitle: {
    fontFamily: "'Cabinet Grotesk', sans-serif",
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 4px',
  },

  cardSubtitle: {
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 20,
    marginTop: 0,
  },

  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'var(--input-bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
    transition:
      'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
  },

  btn: {
    width: '100%',
    padding: '10px 0',
    backgroundColor: 'var(--accent)',
    color: 'var(--bg)',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition:
      'transform 180ms ease, opacity 180ms ease, box-shadow 180ms ease',
  },

  error: {
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    fontSize: 12,
    color: '#ef4444',
  },

  success: {
    padding: '10px 14px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    fontSize: 12,
    color: '#16a34a',
  },

  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--text-subtle)',
    marginTop: 24,
  },
}

export default function AuthPage({
  dark,
  setDark,
  initialView = VIEWS.LOGIN,
  onBack,
}) {
  const [view, setView] = useState(initialView)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function reset() {
    setError(null)
    setSuccess(null)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    reset()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }

    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    reset()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Account created! Please check your email to confirm.')
    }

    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault()
    setLoading(true)
    reset()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset email sent! Check your inbox.')
    }

    setLoading(false)
  }

  const isLogin = view === VIEWS.LOGIN
  const isSignup = view === VIEWS.SIGNUP
  const isForgot = view === VIEWS.FORGOT

  return (
    <>
      <style>{`
        @keyframes authPageIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes authContentIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes authLogoIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes authLogoFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes authCardIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes authMessageIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes authSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .auth-page {
          animation: authPageIn 500ms ease both;
        }

        .auth-content {
          animation: authContentIn 650ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
        }

        .auth-logo {
          animation:
            authLogoIn 650ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both,
            authLogoFloat 5s ease-in-out 900ms infinite;
        }

        .auth-card {
          animation: authCardIn 650ms cubic-bezier(0.22, 1, 0.36, 1) 220ms both;
        }

        .auth-back {
          transition:
            color 180ms ease,
            transform 180ms ease;
        }

        .auth-back:hover {
          color: var(--text);
          transform: translateX(-3px);
        }

        .auth-theme {
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background-color 180ms ease;
        }

        .auth-theme:hover {
          transform: translateY(-2px);
        }

        .auth-input:focus {
          border-color: var(--text);
          box-shadow: 0 0 0 3px rgba(128, 128, 128, 0.08);
        }

        .auth-password-toggle {
          transition:
            color 180ms ease,
            transform 180ms ease;
        }

        .auth-password-toggle:hover {
          color: var(--text);
          transform: translateY(-50%) scale(1.08);
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }

        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .auth-submit:disabled {
          cursor: not-allowed;
        }

        .auth-forgot {
          transition:
            color 180ms ease,
            opacity 180ms ease;
        }

        .auth-forgot:hover {
          color: var(--text) !important;
        }

        .auth-switch {
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .auth-switch:hover {
          opacity: 0.7;
        }

        .auth-message {
          animation: authMessageIn 300ms ease both;
        }

        .auth-loader {
          animation: authSpin 900ms linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-page,
          .auth-content,
          .auth-logo,
          .auth-card,
          .auth-message {
            animation: none !important;
          }

          .auth-back,
          .auth-theme,
          .auth-input,
          .auth-password-toggle,
          .auth-submit,
          .auth-forgot,
          .auth-switch {
            transition: none !important;
          }
        }
      `}</style>

      <div style={s.page} className="auth-page">

        {/* Background glow */}
        <div style={s.backgroundGlow} />

        <div style={s.content} className="auth-content">

          {/* Top controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >

            {/* Back to landing page */}
            <button
              type="button"
              onClick={onBack}
              className="auth-back"
              style={s.backButton}
            >
              <ArrowLeft size={14} />
              Back to Rowlr
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="auth-theme"
              style={s.themeButton}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              {dark ? 'Light' : 'Dark'}
            </button>

          </div>

          {/* Logo */}
          <div style={s.logoWrapper}>

            <div
              style={s.logoMark}
              className="auth-logo"
            >
              <Wallet
                size={22}
                color="var(--bg)"
              />
            </div>

            <h1 style={s.logoTitle}>
              Rowlr
            </h1>

            <p style={s.logoSubtitle}>
              Personal Finance Dashboard
            </p>

          </div>

          {/* Card */}
          <div
            style={s.card}
            className="auth-card"
          >

            {/* Forgot password back button */}
            {isForgot && (
              <button
                type="button"
                onClick={() => {
                  setView(VIEWS.LOGIN)
                  reset()
                }}
                className="auth-back"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 16,
                  padding: 0,
                }}
              >
                <ArrowLeft size={13} />
                Back to login
              </button>
            )}

            {/* Title */}
            <h2 style={s.cardTitle}>
              {isLogin
                ? 'Welcome back'
                : isSignup
                  ? 'Create account'
                  : 'Reset password'}
            </h2>

            <p style={s.cardSubtitle}>
              {isLogin
                ? 'Sign in to your Rowlr account'
                : isSignup
                  ? 'Start tracking your expenses'
                  : "We'll send you a reset link"}
            </p>

            {/* Form */}
            <form
              onSubmit={
                isLogin
                  ? handleLogin
                  : isSignup
                    ? handleSignup
                    : handleForgot
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >

              {/* Email */}
              <div>
                <label style={s.label}>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={s.input}
                  className="auth-input"
                />
              </div>

              {/* Password */}
              {!isForgot && (
                <div>
                  <label style={s.label}>
                    Password
                  </label>

                  <div style={{ position: 'relative' }}>

                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={e =>
                        setPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                      style={{
                        ...s.input,
                        paddingRight: 40,
                      }}
                      className="auth-input"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="auth-password-toggle"
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-subtle)',
                        display: 'flex',
                        padding: 2,
                      }}
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>

                  </div>
                </div>
              )}

              {/* Forgot password */}
              {isLogin && (
                <div
                  style={{
                    textAlign: 'right',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setView(VIEWS.FORGOT)
                      reset()
                    }}
                    className="auth-forgot"
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  style={s.error}
                  className="auth-message"
                >
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div
                  style={s.success}
                  className="auth-message"
                >
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...s.btn,
                  opacity: loading ? 0.6 : 1,
                }}
                className="auth-submit"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={14}
                      className="auth-loader"
                    />
                    Please wait...
                  </>
                ) : isLogin ? (
                  'Sign In'
                ) : isSignup ? (
                  'Create Account'
                ) : (
                  'Send Reset Link'
                )}
              </button>

            </form>

          </div>

          {/* Switch Login / Signup */}
          {!isForgot && (
            <p
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--text-muted)',
                marginTop: 16,
              }}
            >
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}

              <button
                onClick={() => {
                  setView(
                    isLogin
                      ? VIEWS.SIGNUP
                      : VIEWS.LOGIN
                  )
                  reset()
                }}
                className="auth-switch"
                style={{
                  color: 'var(--text)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {isLogin
                  ? 'Sign up'
                  : 'Sign in'}
              </button>
            </p>
          )}

          {/* Footer */}
          <p style={s.footer}>
            © 2026 RRC Development
          </p>

        </div>
      </div>
    </>
  )
}