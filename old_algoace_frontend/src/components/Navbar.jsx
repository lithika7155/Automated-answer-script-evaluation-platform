import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Zap, BookOpen, Map, User } from 'lucide-react'

export default function Navbar({ userId, setUserId }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Zap size={18} color="white" />
          </div>
          <span className="navbar-logo-text">AlgoAce</span>
        </Link>

        <div className="navbar-nav">
          <NavLink to="/questions" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <BookOpen size={15} />
            Questions
          </NavLink>
          <NavLink to="/roadmap" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <Map size={15} />
            Roadmap
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            <User size={15} />
            Profile
          </NavLink>
        </div>

        <div className="navbar-right">
          <input
            id="user-id-input"
            className="navbar-user-input"
            placeholder="Your User ID..."
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value)
              localStorage.setItem('userId', e.target.value)
            }}
            title="Set your User ID for bookmarks & history"
          />
        </div>
      </div>
    </nav>
  )
}
