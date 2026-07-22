import { useState, useEffect } from 'react'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/users'),
    ])
      .then(([s, u]) => {
        setStats(s.data)
        setUsers(u.data || [])
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const toggleStatus = async (userId, current) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { is_active: !current })
      loadData()
    } catch {
      alert('Failed to update user status.')
    }
  }

  if (loading) return <AppLayout><div className="loading-center"><div className="spinner" /></div></AppLayout>

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>🛡️ Admin Dashboard</h1>
          <p className="text-muted mt-sm">Platform overview and user management</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className={`badge ${stats?.system_status === 'Healthy' ? 'badge-green' : 'badge-red'}`}>
            ● {stats?.system_status}
          </span>
        </div>
      </div>

      {error && <div className="alert alert-error mb-lg">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{stats.total_users}</div><div className="stat-label">Total Users</div></div>
          <div className="stat-card"><div className="stat-icon">🎓</div><div className="stat-value">{stats.total_students}</div><div className="stat-label">Students</div></div>
          <div className="stat-card"><div className="stat-icon">👩‍🏫</div><div className="stat-value">{stats.total_faculty}</div><div className="stat-label">Faculty</div></div>
          <div className="stat-card"><div className="stat-icon">📄</div><div className="stat-value">{stats.total_answer_scripts}</div><div className="stat-label">Answer Scripts</div></div>
          <div className="stat-card"><div className="stat-icon">🤖</div><div className="stat-value">{stats.total_evaluations}</div><div className="stat-label">Evaluations</div></div>
          <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{stats.overall_pass_rate?.toFixed(1)}%</div><div className="stat-label">Pass Rate</div></div>
        </div>
      )}

      <div className="section-header mt-lg" style={{ marginTop: 'var(--space-xl)' }}>
        <h2>User Management</h2>
        <span className="badge badge-gray">{users.length} users</span>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-sm">
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>
                      {u.full_name?.[0]}
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.full_name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                <td>
                  <span className={`badge badge-${roleColor(u.role)}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    id={`toggle-${u.id}`}
                    className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleStatus(u.id, u.is_active)}
                  >
                    {u.is_active ? '🔴 Deactivate' : '🟢 Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}

function roleColor(role) {
  return { admin: 'red', faculty: 'purple', student: 'cyan' }[role] || 'gray'
}
