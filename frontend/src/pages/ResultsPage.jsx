import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function ResultsPage() {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/analytics/student/${user.id}`)
      .then((res) => setResults(res.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>My Results</h1>
          <p className="text-muted mt-sm">All your evaluation results in one place</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : results.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📊</div>
          <h3>No results yet</h3>
          <p>Your evaluation results will appear here once graded.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Exam ID</th>
                <th>Total Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.evaluation_id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td><code style={{ color: 'var(--accent-cyan-light)', fontSize: '0.82rem' }}>{r.exam_id}</code></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{r.total_marks}</strong></td>
                  <td>
                    <div>{r.percentage?.toFixed(1)}%</div>
                    <div className="score-bar-track" style={{ width: 80, marginTop: 4 }}>
                      <div className="score-bar-fill" style={{ width: `${r.percentage || 0}%` }} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${gradeColor(r.grade)}`}>{r.grade}</span>
                  </td>
                  <td>
                    <span className={`badge ${r.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`}>
                      {r.pass_fail_status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/evaluation/${r.evaluation_id}`} className="btn btn-secondary btn-sm">
                      View Details →
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
