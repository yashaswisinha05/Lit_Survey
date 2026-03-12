import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

// Error Boundary — catches any render-time crash and shows a message instead of a blank page
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[LitSurvey] Render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f10',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ margin: 0, color: '#94a3b8', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.5rem',
              padding: '8px 20px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
