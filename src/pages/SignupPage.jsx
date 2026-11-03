import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UserPlus, AlertCircle, CheckCircle2, Upload } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName]               = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile]           = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (!fullName.trim())            { setError('Full name is required.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6)          { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    const { data, error: signupErr } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName.trim() } },
    })
    if (signupErr) { setError(signupErr.message); setLoading(false); return }

    const userId = data.user?.id
    if (userId) {
      let avatarUrl = null
      if (avatarFile) {
        const ext  = avatarFile.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert:true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      }
      await supabase.from('profiles').upsert({ id:userId, full_name:fullName.trim(), avatar_url:avatarUrl, updated_at:new Date().toISOString() })
    }
    setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="vl-card p-8">
          <div className="w-14 h-14 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <CheckCircle2 size={28}/>
          </div>
          <h2 className="text-xl font-bold text-vl-text mb-2">Check your inbox</h2>
          <p className="text-sm text-vl-muted mb-1.5">We sent a confirmation link to</p>
          <p className="text-sm font-semibold text-vl-green font-mono mb-6 break-all">{email}</p>
          <p className="text-xs text-vl-muted mb-7 leading-relaxed">Click the link in that email to activate your account, then return here to sign in.</p>
          <Link to="/login" className="vl-btn-primary w-full py-2.5 justify-center">Go to Sign In</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <UserPlus size={22} strokeWidth={2}/>
          </div>
          <h1 className="text-2xl font-bold text-vl-text tracking-tight">Create account</h1>
          <p className="text-sm text-vl-muted mt-1.5">Join Video Ledger and start tracking your work</p>
        </div>

        <div className="vl-card p-6 sm:p-7">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5"/>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="vl-label">Full name *</label>
              <input className="vl-input" type="text" required value={fullName}
                onChange={e => setFullName(e.target.value)} placeholder="Alex Morgan"/>
            </div>

            <div>
              <label className="vl-label">Email address *</label>
              <input className="vl-input" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@company.com"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="vl-label">Password *</label>
                <input className="vl-input" type="password" required autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars"/>
              </div>
              <div>
                <label className="vl-label">Confirm *</label>
                <input className="vl-input" type="password" required autoComplete="new-password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat"/>
              </div>
            </div>

            <div>
              <label className="vl-label">Profile photo <span className="normal-case font-medium text-vl-subtle">(optional)</span></label>
              <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-vl-border bg-vl-elevated hover:border-vl-border2 cursor-pointer transition-colors group">
                <Upload size={15} className="text-vl-subtle group-hover:text-vl-green transition-colors shrink-0"/>
                <span className="text-xs text-vl-muted group-hover:text-vl-text2 truncate">
                  {avatarFile ? avatarFile.name : 'Click to upload photo'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={e => setAvatarFile(e.target.files[0])}/>
              </label>
            </div>

            <button type="submit" disabled={loading} className="vl-btn-primary w-full py-2.5 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="vl-divider !mt-5 !mb-4"/>
          <p className="text-center text-xs text-vl-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-vl-green font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
