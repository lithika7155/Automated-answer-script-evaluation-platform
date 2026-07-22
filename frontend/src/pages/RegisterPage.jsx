import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

const ROLES = [
  { value: 'student', icon: '🎓', label: 'Student' },
  { value: 'faculty', icon: '👩‍🏫', label: 'Faculty' },
  { value: 'admin', icon: '🛡️', label: 'Admin' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="auth-card card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">🎓</div>
          <h1 className="auth-title grad-text">EvalAI</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Jane Doe"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Role</label>
            <div className="role-picker">
              {ROLES.map(({ value, icon, label }) => (
                <button
                  type="button"
                  key={value}
                  id={`role-${value}`}
                  className={`role-option ${form.role === value ? 'role-option--active' : ''}`}
                  onClick={() => setForm({ ...form, role: value })}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account...</> : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" id="go-login-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
