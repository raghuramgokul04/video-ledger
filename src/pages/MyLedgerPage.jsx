import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LedgerView from '../components/LedgerView'
import LoadingSpinner from '../components/LoadingSpinner'

export default function MyLedgerPage() {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner text="Loading your ledger..." />

  if (!user) return <Navigate to="/login" replace />

  return (
    <LedgerView
      profileId={user.id}
      profile={profile}
      isOwner={true}
      currentUser={user}
    />
  )
}

