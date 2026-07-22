import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const NAV_ITEMS = {
  student: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/upload', icon: '📤', label: 'Upload Script' },
    { to: '/results', icon: '📊', label: 'My Results' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  ],
  faculty: [
    { to: '/faculty', icon: '🏠', label: 'Dashboard' },
    { to: '/faculty/scripts', icon: '📄', label: 'Answer Scripts' },
    { to: '/faculty/analytics', icon: '📈', label: 'Analytics' },
  ],
  admin: [
    { to: '/admin', icon: '🛡️', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/scripts', icon: '📄', label: 'Scripts' },
    { to: '/admin/evaluations', icon: '🤖', label: 'Evaluations' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_ITEMS[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">🎓</span>
        <span className="logo-text">EvalAI</span>
      </div>

      <nav className="sidebar-nav">
        {items.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
          >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.full_name?.[0] || '?'}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm w-full" id="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
