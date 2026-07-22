import { useState, useEffect } from 'react'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([])
  const [examId, setExamId] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    const params = examId ? { exam_id: examId } : {}
    api.get('/analytics/leaderboard', { params })
      .then((res) => setLeaders(res.data || []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>🏆 Leaderboard</h1>
          <p className="text-muted mt-sm">Top students ranked by total score</p>
        </div>
      </div>

      <div className="flex gap-md mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
        <input
          id="exam-filter-input"
          type="text"
          className="form-input"
          placeholder="Filter by Exam ID (optional)"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <button id="filter-btn" className="btn btn-primary" onClick={load}>Apply Filter</button>
        {examId && (
          <button className="btn btn-secondary" onClick={() => { setExamId(''); setTimeout(load, 0) }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : leaders.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🏆</div>
          <h3>No data yet</h3>
          <p>Leaderboard will appear once evaluations are completed.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student ID</th>
                <th>Exam ID</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l) => (
                <tr key={`${l.student_id}-${l.exam_id}`}>
                  <td>
                    <div className={`rank-badge rank-${l.rank <= 3 ? l.rank : 'n'}`}>
                      {l.rank <= 3 ? ['🥇','🥈','🥉'][l.rank - 1] : l.rank}
                    </div>
                  </td>
                  <td><code style={{ color: 'var(--accent-cyan-light)', fontSize: '0.82rem' }}>{l.student_id}</code></td>
                  <td><code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.exam_id}</code></td>
                  <td><strong style={{ color: 'var(--text-primary)' }}>{l.total_marks}</strong></td>
                  <td>
                    <div>{l.percentage?.toFixed(1)}%</div>
                    <div className="score-bar-track" style={{ width: 80, marginTop: 4 }}>
                      <div className="score-bar-fill" style={{ width: `${l.percentage || 0}%` }} />
                    </div>
                  </td>
                  <td><span className={`badge badge-${gradeColor(l.grade)}`}>{l.grade}</span></td>
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
