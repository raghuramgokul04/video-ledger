import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import TeamPage from './pages/TeamPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MyLedgerPage from './pages/MyLedgerPage'
import MyProfilePage from './pages/MyProfilePage'
import PublicLedgerPage from './pages/PublicLedgerPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-ledger-bg text-ledger-text">
          <Navbar />
          <Routes>
            <Route path="/" element={<TeamPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/my-ledger"
              element={
                <ProtectedRoute>
                  <MyLedgerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/team/:userId" element={<PublicLedgerPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

