import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, LogIn, LogOut, User, BookOpen, UserPlus, Menu, X } from 'lucide-react'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
    navigate('/')
  }

  const active = (path) => location.pathname === path

  // Desktop link style
  const dLink = (path) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active(path)
        ? 'text-vl-green bg-vl-green/8 font-semibold'
        : 'text-vl-text2 hover:text-vl-text hover:bg-vl-elevated'
    }`

  // Mobile link style
  const mLink = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active(path)
        ? 'text-vl-green bg-vl-green/8 font-semibold'
        : 'text-vl-text2 hover:text-vl-text hover:bg-vl-elevated'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-vl-border bg-vl-surface/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* ── Brand ── */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green group-hover:bg-vl-green group-hover:text-black transition-all duration-200">
              <BookOpen size={14} strokeWidth={2.5} />
            </div>
            <span className="font-mono font-bold text-[13px] tracking-[0.15em] text-vl-text group-hover:text-vl-green transition-colors">
              VIDEO LEDGER
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={dLink('/')}>
              <Users size={14} />
              Team
            </Link>

            {user ? (
              <>
                <Link to="/my-ledger" className={dLink('/my-ledger')}>
                  <BookOpen size={14} />
                  My Ledger
                </Link>
                <Link to="/my-profile" className={dLink('/my-profile')}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                    : <User size={14} />}
                  {profile?.full_name?.split(' ')[0] || 'Profile'}
                </Link>
                <div className="w-px h-4 bg-vl-border mx-2" />
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-vl-muted hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="w-px h-4 bg-vl-border mx-2" />
                <Link to="/login" className={dLink('/login')}>
                  <LogIn size={14} />
                  Sign In
                </Link>
                <Link to="/signup" className="vl-btn-primary text-xs px-3.5 py-2 ml-1 rounded-lg">
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* ── Mobile right side ── */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link to="/my-profile" onClick={() => setOpen(false)}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-vl-border" />
                  : <div className="w-7 h-7 rounded-full bg-vl-green/12 border border-vl-green/25 flex items-center justify-center text-vl-green text-xs font-bold font-mono">{getInitials(profile?.full_name)}</div>
                }
              </Link>
            )}
            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded-lg text-vl-muted hover:text-vl-text hover:bg-vl-elevated transition-all"
              aria-label="Toggle menu"
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {open && (
        <div className="md:hidden border-t border-vl-border bg-vl-surface px-4 py-3 space-y-1">
          <Link to="/" onClick={() => setOpen(false)} className={mLink('/')}>
            <Users size={16} /> Team
          </Link>
          {user ? (
            <>
              <Link to="/my-ledger" onClick={() => setOpen(false)} className={mLink('/my-ledger')}>
                <BookOpen size={16} /> My Ledger
              </Link>
              <Link to="/my-profile" onClick={() => setOpen(false)} className={mLink('/my-profile')}>
                <User size={16} /> My Profile
              </Link>
              <div className="pt-1 mt-1 border-t border-vl-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all text-left cursor-pointer"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-1 mt-1 border-t border-vl-border space-y-1">
              <Link to="/login" onClick={() => setOpen(false)} className={mLink('/login')}>
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="vl-btn-primary w-full justify-center mt-2 text-sm py-2.5">
                <UserPlus size={16} /> Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
