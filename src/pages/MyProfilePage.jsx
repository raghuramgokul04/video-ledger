import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Camera, Save, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function MyProfilePage() {
  const { user, profile, refreshProfile, loading } = useAuth()
  const [fullName, setFullName]         = useState('')
  const [avatarFile, setAvatarFile]     = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [deleteStep, setDeleteStep]     = useState(0)  // 0=idle 1=confirm
  const [deleteInput, setDeleteInput]   = useState('')
  const [deleting, setDeleting]         = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { if (profile) setFullName(profile.full_name || '') }, [profile])

  if (loading) return <LoadingSpinner text="Loading profile…"/>
  if (!user)   { navigate('/login'); return null }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!fullName.trim()) { setError('Name cannot be empty.'); return }
    setSaving(true)

    let avatarUrl = profile?.avatar_url
    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert:true })
      if (upErr) { setError('Photo upload failed: ' + upErr.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl + '?t=' + Date.now()
    }

    const { error: updateErr } = await supabase.from('profiles')
      .update({ full_name: fullName.trim(), avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateErr) { setError(updateErr.message) }
    else { await refreshProfile(); setSuccess('Profile updated.'); setAvatarFile(null); setAvatarPreview(null) }
    setSaving(false)
  }

  async function handleDelete() {
    if (deleteInput !== 'DELETE') { setError('Type DELETE exactly to confirm.'); return }
    setDeleting(true)
    await supabase.from('videos').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    navigate('/')
  }

  const avatar = avatarPreview || profile?.avatar_url

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Page header */}
      <div className="mb-6">
        <p className="vl-section-title mb-1">Account</p>
        <h1 className="text-2xl font-bold text-vl-text tracking-tight">Profile Settings</h1>
        <p className="text-sm text-vl-muted mt-1">Manage your name, profile photo, and account</p>
      </div>

      {/* ── Profile Form ── */}
      <form onSubmit={handleSave} className="vl-card p-6 sm:p-7 space-y-6 mb-6">

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative group">
            {avatar ? (
              <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-vl-border shadow-card"/>
            ) : (
              <div className="w-24 h-24 rounded-full bg-vl-green/10 border-2 border-vl-green/25 flex items-center justify-center text-vl-green text-2xl font-bold font-mono">
                {getInitials(profile?.full_name)}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-vl-green text-black flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="Change photo">
              <Camera size={14} strokeWidth={2.5}/>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
          <p className="text-xs text-vl-muted">
            {avatarFile
              ? <span className="text-vl-green font-medium">📎 {avatarFile.name}</span>
              : 'Click the camera icon to change your photo'}
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5"/><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs">
            <CheckCircle2 size={15} className="shrink-0"/>{success}
          </div>
        )}

        <div>
          <label className="vl-label">Full name</label>
          <input type="text" className="vl-input" required value={fullName}
            onChange={e => setFullName(e.target.value)}/>
        </div>

        <div>
          <label className="vl-label">Email address</label>
          <input type="email" className="vl-input opacity-40 cursor-not-allowed" disabled value={user?.email || ''}/>
          <p className="text-[11px] text-vl-subtle mt-1.5">Email address cannot be changed here</p>
        </div>

        <button type="submit" disabled={saving} className="vl-btn-primary py-2.5 px-5">
          <Save size={15}/>{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* ── Danger Zone ── */}
      <div className="vl-card p-6 sm:p-7 border-red-900/40 bg-[#0f0909]">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 size={15} className="text-red-500"/>
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">Danger Zone</h3>
        </div>
        <p className="text-xs text-vl-muted mb-5 leading-relaxed">
          Permanently deletes your account, profile, and all video ledger entries. This action cannot be undone.
        </p>

        {deleteStep === 0 ? (
          <button onClick={() => { setDeleteStep(1); setError('') }} className="vl-btn-danger py-2 px-3.5 text-xs">
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3 pt-4 border-t border-red-900/40">
            <p className="text-xs text-red-300">
              Type <strong className="font-mono text-red-200">DELETE</strong> to confirm:
            </p>
            <input className="vl-input border-red-900/80 text-xs font-mono" placeholder="Type DELETE"
              value={deleteInput} onChange={e => setDeleteInput(e.target.value)}/>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting}
                className="vl-btn bg-red-800 hover:bg-red-700 text-white text-xs py-2 px-3.5 rounded-xl font-semibold cursor-pointer disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
              <button onClick={() => { setDeleteStep(0); setDeleteInput(''); setError('') }}
                className="vl-btn-secondary text-xs py-2 px-3">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
