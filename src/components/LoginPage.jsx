import React, { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp, isDemoMode } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = isSignUp
      ? await signUp(email, password, fullName)
      : await signIn(email, password)

    if (result.error) {
      setError(result.error.message)
    }
    setLoading(false)
  }

  // In demo mode, auto-sign in
  const handleDemoSignIn = () => {
    signIn('demo@litsurvey.app', 'demo')
  }

  return (
    <div className="login-page">
      <div className="login-card slide-up">
        <div className="brand-icon-large">
          <BookOpen size={28} color="white" />
        </div>
        <h1>LitSurvey</h1>
        <p className="login-subtitle">
          Private collaborative literature survey
        </p>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!isDemoMode}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isDemoMode}
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}

        <div className="login-toggle">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {isDemoMode && (
          <div className="demo-banner">
            <strong>Demo Mode</strong> — Supabase not configured.
            <br />
            <button
              onClick={handleDemoSignIn}
              style={{
                marginTop: 8,
                background: 'var(--accent-indigo)',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 500
              }}
            >
              Enter Demo Mode
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
