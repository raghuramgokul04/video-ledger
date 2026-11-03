import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, X, ArrowRight, Film } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function TeamPage() {
  const [profiles, setProfiles] = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats]     = useState({})

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (profileData) {
      setProfiles(profileData)
      const { data: videoData } = await supabase.from('videos').select('user_id, status')
      const map = {}
      profileData.forEach(p => { map[p.id] = { total: 0, progress: 0, done: 0 } })
      if (videoData) {
        videoData.forEach(v => {
          if (map[v.user_id]) {
            map[v.user_id].total++
            if (v.status === 'progress') map[v.user_id].progress++
            if (v.status === 'done') map[v.user_id].done++
          }
        })
      }
      setStats(map)
    }
    setLoading(false)
  }

  const filtered = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <p className="vl-section-title mb-1">Overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-vl-text tracking-tight">
            Team Roster
          </h1>
          <p className="text-sm text-vl-muted mt-1.5">
            {profiles.length} registered editor{profiles.length !== 1 ? 's' : ''} · Click any card to view their ledger
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-vl-subtle pointer-events-none" />
          <input
            type="text"
            placeholder="Search editor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="vl-input pl-10 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-vl-subtle hover:text-vl-text2 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner text="Loading team..." />
      ) : filtered.length === 0 ? (
        <div className="vl-card py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-vl-elevated border border-vl-border flex items-center justify-center text-vl-subtle mx-auto mb-4">
            <Film size={22} />
          </div>
          <p className="text-sm font-semibold text-vl-text2 mb-1">
            {search ? 'No editors found' : 'No editors yet'}
          </p>
          <p className="text-xs text-vl-muted max-w-xs mx-auto">
            {search
              ? `No profile matches "${search}". Try a different name.`
              : 'Sign up to create the first profile on this ledger.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(profile => {
            const s = stats[profile.id] || { total: 0, progress: 0, done: 0 }
            return (
              <article
                key={profile.id}
                className="vl-card flex flex-col gap-4 hover:border-vl-border2 transition-all duration-200 group"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-11 h-11 rounded-full object-cover border border-vl-border shrink-0"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                  ) : null}
                  <div
                    className="w-11 h-11 rounded-full bg-vl-green/10 border border-vl-green/20 items-center justify-center text-vl-green font-bold font-mono text-sm shrink-0"
                    style={{ display: profile.avatar_url ? 'none' : 'flex' }}
                  >
                    {getInitials(profile.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-vl-text text-sm leading-tight truncate group-hover:text-vl-green transition-colors">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-vl-subtle mt-0.5">Video Editor</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 rounded-xl bg-vl-elevated border border-vl-border text-center divide-x divide-vl-border overflow-hidden">
                  <div className="py-2.5 px-1">
                    <div className="text-base font-bold font-mono text-vl-text">{s.total}</div>
                    <div className="text-[10px] font-medium text-vl-subtle uppercase tracking-wider mt-0.5">Total</div>
                  </div>
                  <div className="py-2.5 px-1">
                    <div className="text-base font-bold font-mono text-vl-amber">{s.progress}</div>
                    <div className="text-[10px] font-medium text-vl-subtle uppercase tracking-wider mt-0.5">Active</div>
                  </div>
                  <div className="py-2.5 px-1">
                    <div className="text-base font-bold font-mono text-vl-green">{s.done}</div>
                    <div className="text-[10px] font-medium text-vl-subtle uppercase tracking-wider mt-0.5">Done</div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={`/team/${profile.id}`}
                  className="vl-btn-secondary text-xs py-2 w-full group-hover:border-vl-green/40 group-hover:text-vl-green group-hover:bg-vl-green/5"
                >
                  View Ledger
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
