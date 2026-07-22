import React, { useEffect, useState } from 'react'
import { usersAPI } from '../api/client'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { User, Bookmark, Clock, AlertCircle } from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ProfilePage() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('bookmarks')

  async function loadProfile(uid) {
    if (!uid) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await usersAPI.getProfile()
      setProfile(data)
    } catch (err) {
      setError(err.response?.status === 401 ? 'Please set your User ID in the navbar.' : 'Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const uid = localStorage.getItem('userId')
    if (uid) {
      setUserId(uid)
      loadProfile(uid)
    }
  }, [])

  if (!localStorage.getItem('userId')) {
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="empty-state">
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="var(--text-muted)" />
          </div>
          <p className="empty-title">No User ID Set</p>
          <p className="empty-sub">
            Enter your User ID in the navbar at the top to track your bookmarks and history.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, padding: '10px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--medium)' }}>
            <AlertCircle size={15} />
            You can use any string as your User ID — it's stored locally.
          </div>
        </div>
      </div>
    )
  }

  const bookmarks = profile?.bookmarked_slugs || []
  const history = profile?.viewed_slugs || []

  const displayName = userId.slice(0, 1).toUpperCase() + (userId.length > 1 ? '...' : '')

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{displayName}</div>
        <div style={{ flex: 1 }}>
          <div className="profile-name">{userId}</div>
          <div className="profile-id">User ID: {userId}</div>
          <div className="profile-stats">
            <div className="profile-stat-item">
              <div className="profile-stat-num" style={{ color: 'var(--accent-2)' }}>{bookmarks.length}</div>
              <div className="profile-stat-lab">Bookmarks</div>
            </div>
            <div className="profile-stat-item">
              <div className="profile-stat-num" style={{ color: 'var(--ai-color)' }}>{history.length}</div>
              <div className="profile-stat-lab">Problems Viewed</div>
            </div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => loadProfile(userId)}>
          Refresh
        </button>
      </div>

      {/* Section Tabs */}
      <div className="tabs" style={{ marginBottom: 24, maxWidth: 360 }}>
        <button
          className={`tab${activeSection === 'bookmarks' ? ' active' : ''}`}
          onClick={() => setActiveSection('bookmarks')}
          id="tab-bookmarks"
        >
          <Bookmark size={14} /> Bookmarks ({bookmarks.length})
        </button>
        <button
          className={`tab${activeSection === 'history' ? ' active' : ''}`}
          onClick={() => setActiveSection('history')}
          id="tab-history"
        >
          <Clock size={14} /> History ({history.length})
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && (
        <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: 'var(--hard)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && !error && profile && (
        <>
          {activeSection === 'bookmarks' && (
            <div className="tab-panel">
              {bookmarks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Bookmark size={26} /></div>
                  <p className="empty-title">No bookmarks yet</p>
                  <p className="empty-sub">Bookmark problems while practicing to save them here.</p>
                  <Link to="/questions" className="btn btn-primary btn-sm">Browse Questions</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bookmarks.map((slug, i) => (
                    <Link
                      key={slug}
                      to={`/questions/${slug}`}
                      className="q-card"
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="q-card-index">#{i + 1}</span>
                      <div className="q-card-body">
                        <span className="q-card-title">{slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      </div>
                      <Bookmark size={14} color="var(--accent-2)" fill="var(--accent-2)" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'history' && (
            <div className="tab-panel">
              {history.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Clock size={26} /></div>
                  <p className="empty-title">No history yet</p>
                  <p className="empty-sub">Questions you view will appear here.</p>
                  <Link to="/questions" className="btn btn-primary btn-sm">Start Practicing</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[...history].reverse().map((slug, i) => (
                    <Link
                      key={slug}
                      to={`/questions/${slug}`}
                      className="q-card"
                      style={{ textDecoration: 'none' }}
                    >
                      <span className="q-card-index">#{i + 1}</span>
                      <div className="q-card-body">
                        <span className="q-card-title">{slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                      </div>
                      <Clock size={14} color="var(--text-muted)" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
