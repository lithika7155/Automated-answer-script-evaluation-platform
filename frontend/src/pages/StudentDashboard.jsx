import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/analytics/student/${user.id}`).catch(() => ({ data: [] })),
      api.get('/answer-scripts').catch(() => ({ data: [] })),
    ]).then(([res1, res2]) => {
      setResults(res1.data || [])
      setScripts(res2.data || [])
    }).finally(() => setLoading(false))
  }, [user.id])

  const totalScore = results.reduce((sum, r) => sum + (r.total_marks || 0), 0)
  const avgPct = results.length
    ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length)
    : 0

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Welcome back, <span className="grad-text">{user?.full_name?.split(' ')[0]}</span> 👋</h1>
          <p className="text-muted mt-sm">Here&apos;s your evaluation overview</p>
        </div>
        <Link to="/upload" id="upload-cta-btn" className="btn btn-primary">📤 Upload Script</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{scripts.length}</div>
          <div className="stat-label">Scripts Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{results.length}</div>
          <div className="stat-label">Evaluations Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{avgPct}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{totalScore}</div>
          <div className="stat-label">Total Marks Earned</div>
        </div>
      </div>

      <div className="section-header mt-lg">
        <h2>Recent Evaluations</h2>
        <Link to="/results" className="btn btn-secondary btn-sm">View all →</Link>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : results.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📋</div>
          <h3>No evaluations yet</h3>
          <p>Upload your first answer script to get AI-powered feedback.</p>
          <Link to="/upload" className="btn btn-primary mt-md">📤 Upload Now</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Exam ID</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 5).map((r) => (
                <tr key={r.evaluation_id}>
                  <td><code style={{ color: 'var(--accent-cyan-light)', fontSize: '0.8rem' }}>{r.exam_id}</code></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{r.total_marks}</strong></td>
                  <td>{r.percentage?.toFixed(1)}%</td>
                  <td><span className={`badge badge-${gradeColor(r.grade)}`}>{r.grade}</span></td>
                  <td><span className={`badge ${r.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`}>{r.pass_fail_status}</span></td>
                  <td>
                    <Link to={`/evaluation/${r.evaluation_id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}

function gradeColor(grade) {
  const map = { 'A+': 'green', A: 'cyan', B: 'cyan', C: 'orange', D: 'orange', F: 'red' }
  return map[grade] || 'gray'
}
