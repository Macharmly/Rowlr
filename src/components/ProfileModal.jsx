import { useState, useEffect } from 'react'
import { X, Loader2, Check, User, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CURRENCIES } from '../lib/currency'

export default function ProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ display_name: '', currency: 'PHP' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({ display_name: data.display_name || '', currency: data.currency || 'PHP' })
        if (data.avatar_url) setAvatarPreview(data.avatar_url)
      }
    }
    fetchProfile()
  }, [user.id])

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true); setError(null)

    try {
      let avatar_url = avatarPreview

      // Upload avatar if new file selected
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const filename = `avatars/${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('recipe-images') // reuse existing bucket
          .upload(filename, avatarFile, { cacheControl: '3600', upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('recipe-images').getPublicUrl(filename)
        avatar_url = urlData.publicUrl
      }

      const { data, error } = await supabase.from('profiles').upsert([{
        id: user.id,
        display_name: form.display_name.trim() || null,
        currency: form.currency,
        avatar_url: avatar_url || null,
      }], { onConflict: 'id' }).select().single()

      if (error) throw error
      onSaved(data)
      onClose()
    } catch (err) {
      setError('Failed to save profile.')
    }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--input-bg)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={28} color="var(--text-subtle)" />
                )}
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                  <Upload size={16} color="white" />
                </div>
              </div>
            </label>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Click to upload avatar</span>
          </div>

          {/* Display Name */}
          <div>
            <label style={s.label}>Display Name</label>
            <input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder={user.email} style={s.input} />
          </div>

          {/* Currency */}
          <div>
            <label style={s.label}>Currency</label>
            <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} style={s.input}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}