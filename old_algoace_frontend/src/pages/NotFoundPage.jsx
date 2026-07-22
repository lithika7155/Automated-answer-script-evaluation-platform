import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Zap } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', textAlign: 'center', padding: '0 24px'
    }}>
      <div style={{
        fontSize: 120, fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: 16
      }}>
        404
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Page Not Found</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 360, marginBottom: 32, lineHeight: 1.7 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Go Home
        </Link>
        <Link to="/questions" className="btn btn-secondary">
          <Zap size={16} /> Browse Questions
        </Link>
      </div>
    </div>
  )
}
