import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LedgerView from '../components/LedgerView'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeft, UserX } from 'lucide-react'

export default function PublicLedgerPage() {
  const { userId } = useParams()
  const { user }   = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error || !data) setError('Profile not found or removed.')
      else setProfile(data)
      setLoading(false)
    }
    if (userId) load()
  }, [userId])

  if (loading) return <LoadingSpinner text="Loading ledger…"/>

  if (!profile) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-12 h-12 rounded-2xl bg-vl-elevated border border-vl-border flex items-center justify-center text-vl-muted mx-auto mb-4">
        <UserX size={22}/>
      </div>
      <h2 className="text-base font-bold text-vl-text2 mb-1 font-mono">Profile Not Found</h2>
      <p className="text-xs text-vl-muted mb-6">{error}</p>
      <Link to="/" className="vl-btn-primary text-xs py-2 px-4 rounded-lg">
        <ArrowLeft size={14}/> Back to Team
      </Link>
    </div>
  )

  const isOwner = user?.id === userId

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-vl-muted hover:text-vl-green transition-colors py-1">
          <ArrowLeft size={13}/> Back to Team
        </Link>
      </div>
      <LedgerView profileId={userId} profile={profile} isOwner={isOwner} currentUser={user}/>
    </div>
  )
}
