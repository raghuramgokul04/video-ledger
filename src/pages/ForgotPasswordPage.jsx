import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="vl-card p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <CheckCircle2 size={28}/>
          </div>
          <h2 className="text-xl font-bold text-vl-text mb-2">Reset link sent</h2>
          <p className="text-sm text-vl-muted mb-1">Check your inbox at</p>
          <p className="text-sm font-semibold text-vl-green font-mono mb-6 break-all">{email}</p>
          <p className="text-xs text-vl-muted mb-7 leading-relaxed">Click the link in the email to reset your password. Remember to check your spam folder.</p>
          <Link to="/login" className="vl-btn-primary w-full py-2.5 justify-center">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <Mail size={22} strokeWidth={2}/>
          </div>
          <h1 className="text-2xl font-bold text-vl-text tracking-tight">Forgot password?</h1>
          <p className="text-sm text-vl-muted mt-1.5">Enter your email to receive a reset link</p>
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
              <label className="vl-label">Email address</label>
              <input type="email" className="vl-input" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/>
            </div>
            <button type="submit" disabled={loading} className="vl-btn-primary w-full py-2.5">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className="vl-divider !mt-5 !mb-4"/>
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-vl-muted hover:text-vl-green transition-colors">
              <ArrowLeft size={13}/> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
