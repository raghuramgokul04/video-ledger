import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message) } else { navigate('/my-ledger') }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green mx-auto mb-4">
            <LogIn size={22} strokeWidth={2}/>
          </div>
          <h1 className="text-2xl font-bold text-vl-text tracking-tight">Welcome back</h1>
          <p className="text-sm text-vl-muted mt-1.5">Sign in to access your Video Ledger</p>
        </div>

        <div className="vl-card p-6 sm:p-7 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5"/>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="vl-label">Email address</label>
              <input type="email" className="vl-input" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="vl-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-vl-muted hover:text-vl-green transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input type="password" className="vl-input" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"/>
            </div>

            <button type="submit" disabled={loading} className="vl-btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="vl-divider !mt-4 !mb-3"/>

          <p className="text-center text-xs text-vl-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-vl-green font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
