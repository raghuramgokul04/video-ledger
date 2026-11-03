import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm)   { setError('Passwords do not match.'); return }
    if (password.length < 6)    { setError('Minimum 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message) } else { setSuccess(true); setTimeout(() => navigate('/login'), 2500) }
    setLoading(false)
  }

  if (success) return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="vl-card p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <CheckCircle2 size={28}/>
          </div>
          <h2 className="text-xl font-bold text-vl-text mb-2">Password updated</h2>
          <p className="text-sm text-vl-muted mb-7">Redirecting you to the sign-in page…</p>
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
            <Lock size={22} strokeWidth={2}/>
          </div>
          <h1 className="text-2xl font-bold text-vl-text tracking-tight">Set new password</h1>
          <p className="text-sm text-vl-muted mt-1.5">Choose a strong password with at least 6 characters</p>
        </div>

        <div className="vl-card p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5"/>
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="vl-label">New password</label>
              <input type="password" className="vl-input" required autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"/>
            </div>
            <div>
              <label className="vl-label">Confirm password</label>
              <input type="password" className="vl-input" required autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"/>
            </div>
            <button type="submit" disabled={loading} className="vl-btn-primary w-full py-2.5 mt-2">
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
