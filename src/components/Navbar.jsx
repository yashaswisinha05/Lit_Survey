import React from 'react'
import { useAuth } from '../context/AuthContext'
import { BookOpen, LogOut, Plus } from 'lucide-react'

export default function Navbar({ onAddPaper }) {
  const { user, signOut, isDemoMode, isAdmin } = useAuth()

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <BookOpen size={18} color="white" />
        </div>
        <span>LitSurvey</span>
        {isDemoMode && (
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: 20,
            background: 'rgba(245,158,11,0.15)',
            color: '#f59e0b',
            fontWeight: 600
          }}>DEMO</span>
        )}
        {isAdmin && (
          <span style={{
            fontSize: '0.65rem',
            padding: '2px 8px',
            borderRadius: 20,
            background: 'rgba(139,92,246,0.15)',
            color: '#8b5cf6',
            fontWeight: 600
          }}>ADMIN</span>
        )}
      </div>

      <div className="navbar-actions">
        <button className="btn btn-primary btn-sm" onClick={onAddPaper}>
          <Plus size={16} />
          Add Paper
        </button>

        <div className="navbar-user">
          <div className="avatar">{initial}</div>
          <span>{displayName}</span>
        </div>

        <button className="btn btn-ghost btn-icon" onClick={signOut} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  )
}
