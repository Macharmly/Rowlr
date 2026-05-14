import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, X, Check, StickyNote, Pin, Pencil } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ConfirmDialog from './ConfirmDialog'

function NoteModal({ userId, existing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: existing?.title || '',
    content: existing?.content || '',
    pinned: existing?.pinned || false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError(null)

    if (existing) {
      const { data, error } = await supabase.from('financial_notes').update({
        title: form.title.trim(),
        content: form.content.trim() || null,
        pinned: form.pinned,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id).select().single()
      if (error) setError('Failed to update note.')
      else { onSaved(data, true); onClose() }
    } else {
      const { data, error } = await supabase.from('financial_notes').insert([{
        user_id: userId,
        title: form.title.trim(),
        content: form.content.trim() || null,
        pinned: form.pinned,
      }]).select().single()
      if (error) setError('Failed to save note.')
      else { onSaved(data, false); onClose() }
    }
    setSaving(false)
  }

  const s = {
    input: { width: '100%', padding: '10px 14px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, color: 'var(--text)', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
  }

  return (
    <div className="animate-overlay-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-modal-in" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{existing ? 'Edit Note' : 'New Note'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Call BDO about my loan" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Content <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--text-subtle)' }}>— optional</span></label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Add more details here..." rows={4} style={{ ...s.input, resize: 'none' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} style={{ width: 14, height: 14, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📌 Pin this note to the top</span>
          </label>
          {error && <p style={{ fontSize: 12, color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 0', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '10px 0', backgroundColor: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Check size={13} /> {existing ? 'Update' : 'Save Note'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const NOTE_COLORS = ['#fef9c3', '#fce7f3', '#e0f2fe', '#dcfce7', '#ede9fe', '#fff7ed']

export default function FinancialNotes({ userId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    setLoading(true)
    const { data } = await supabase.from('financial_notes').select('*').eq('user_id', userId).order('pinned', { ascending: false }).order('updated_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('financial_notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  async function togglePin(note) {
    const { data } = await supabase.from('financial_notes').update({ pinned: !note.pinned }).eq('id', note.id).select().single()
    if (data) setNotes(prev => prev.map(n => n.id === note.id ? data : n).sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at) - new Date(a.updated_at)))
  }

  function handleSaved(note, isEdit) {
    if (isEdit) setNotes(prev => prev.map(n => n.id === note.id ? note : n).sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at) - new Date(a.updated_at)))
    else setNotes(prev => [note, ...prev].sort((a, b) => b.pinned - a.pinned || new Date(b.updated_at) - new Date(a.updated_at)))
    setEditingNote(null)
  }

  const filteredNotes = notes.filter(n => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
  })

  return (
    <>
      <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 16 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <StickyNote size={14} color="var(--text)" />
            <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Financial Notes</h3>
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={() => { setEditingNote(null); setShowModal(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Search */}
        {notes.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              style={{ width: '100%', padding: '8px 32px 8px 12px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: 14, lineHeight: 1 }}>✕</button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={16} color="var(--text-subtle)" className="animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <StickyNote size={24} color="var(--border)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>No notes yet. Add your first one!</p>
          </div>
        ) : (
          <>
            {filteredNotes.length === 0 && search && (
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', padding: '12px 0', margin: 0 }}>
                No notes found for "{search}"
              </p>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {filteredNotes.map((note, i) => {
                const isExpanded = expandedNote === note.id
                const bgColor = NOTE_COLORS[i % NOTE_COLORS.length]
                const updatedAt = new Date(note.updated_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })

                return (
                  <div
                    key={note.id}
                    style={{ backgroundColor: bgColor, borderRadius: 14, padding: '12px 14px', position: 'relative', cursor: 'pointer' }}
                    onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                  >
                    {note.pinned && (
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Pin size={12} color="#6b7280" style={{ transform: 'rotate(45deg)' }} />
                      </div>
                    )}

                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', paddingRight: note.pinned ? 20 : 0 }}>{note.title}</p>

                    {note.content && (
                      <p style={{ fontSize: 12, color: '#4a4a4a', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                        {note.content}
                      </p>
                    )}

                    <p style={{ fontSize: 10, color: '#6b7280', margin: '6px 0 0' }}>{updatedAt}</p>

                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => togglePin(note)} title={note.pinned ? 'Unpin' : 'Pin'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? '#6366f1' : '#9ca3af', display: 'flex', padding: 3, borderRadius: 6 }}>
                        <Pin size={11} style={{ transform: 'rotate(45deg)' }} />
                      </button>
                      <button onClick={() => { setEditingNote(note); setShowModal(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 3, borderRadius: 6 }}>
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => setConfirmDelete(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', display: 'flex', padding: 3, borderRadius: 6 }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <NoteModal userId={userId} existing={editingNote} onClose={() => { setShowModal(false); setEditingNote(null) }} onSaved={handleSaved} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Note?"
          message={`Are you sure you want to delete "${confirmDelete.title}"?`}
          onConfirm={() => handleDelete(confirmDelete.id)}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}