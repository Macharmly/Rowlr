import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wallet, Loader2, Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react'

const VIEWS = { LOGIN: 'login', SIGNUP: 'signup', FORGOT: 'forgot' }

const s = {
  page:    { backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:    { backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },
  label:   { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:   { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--text)', outline: 'none', transition: 'border 0.15s' },
  btn:     { width: '100%', padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', borderRadius: 12, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'opacity 0.15s' },
  btnGhost:{ width: '100%', padding: '10px 0', backgroundColor: 'transparent', color: 'var(--text-muted)', borderRadius: 12, fontSize: 14, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' },
  error:   { padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, fontSize: 12, color: '#ef4444' },
  success: { padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, fontSize: 12, color: '#16a34a' },
}

export default function AuthPage({ dark, setDark }) {
  const [view, setView] = useState(VIEWS.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function reset() { setError(null); setSuccess(null) }

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setSuccess('Account created! Please check your email to confirm.')
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault(); setLoading(true); reset()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setSuccess('Password reset email sent! Check your inbox.')
    setLoading(false)
  }

  const isLogin = view === VIEWS.LOGIN
  const isSignup = view === VIEWS.SIGNUP
  const isForgot = view === VIEWS.FORGOT

  return (
    <div style={s.page}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Theme toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={() => setDark(!dark)} style={{ padding: '6px 10px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, backgroundColor: 'var(--text)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Wallet size={22} color="var(--bg)" />
          </div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.5px' }}>Rowlr</h1>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 4 }}>Personal Finance Dashboard</p>
        </div>

        {/* Card */}
        <div style={s.card}>
          {isForgot && (
            <button onClick={() => { setView(VIEWS.LOGIN); reset() }} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
              <ArrowLeft size={13} /> Back to login
            </button>
          )}

          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
            {isLogin ? 'Welcome back' : isSignup ? 'Create account' : 'Reset password'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, marginTop: 0 }}>
            {isLogin ? 'Sign in to your Rowlr account' : isSignup ? 'Start tracking your expenses' : "We'll send you a reset link"}
          </p>

          <form onSubmit={isLogin ? handleLogin : isSignup ? handleSignup : handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={s.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={s.input} />
            </div>

            {!isForgot && (
              <div>
                <label style={s.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} style={{ ...s.input, paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', display: 'flex' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => { setView(VIEWS.FORGOT); reset() }} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}
            {success && <div style={s.success}>{success}</div>}

            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Please wait...</> : isLogin ? 'Sign In' : isSignup ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        {!isForgot && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setView(isLogin ? VIEWS.SIGNUP : VIEWS.LOGIN); reset() }} style={{ color: 'var(--text)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-subtle)', marginTop: 24 }}>© 2026 RRC Development</p>
      </div>
    </div>
  )
}