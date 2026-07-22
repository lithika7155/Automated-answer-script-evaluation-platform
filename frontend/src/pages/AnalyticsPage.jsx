import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AnalyticsPage() {
  const [examId, setExamId] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
    if (!examId.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/analytics/exam/${examId}`)
      setAnalytics(res.data)
    } catch {
      setError('Could not load analytics for this exam ID.')
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }

  const chartData = analytics?.question_distribution
    ? {
        labels: analytics.question_distribution.map((q) => `Q${q.question_number}`),
        datasets: [
          {
            label: 'Avg Marks',
            data: analytics.question_distribution.map((q) => q.average_marks_awarded),
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderColor: '#8b5cf6',
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      }
    : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>📈 Exam Analytics</h1>
          <p className="text-muted mt-sm">Detailed performance insights for any exam</p>
        </div>
      </div>

      <div className="flex gap-md" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <input
          id="analytics-exam-input"
          type="text"
          className="form-input"
          placeholder="Enter Exam ID"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadAnalytics()}
          style={{ maxWidth: 320 }}
        />
        <button id="analytics-load-btn" className="btn btn-primary" onClick={loadAnalytics} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Loading...</> : '🔍 Load Analytics'}
        </button>
      </div>

      {error && <div className="alert alert-error mb-lg">{error}</div>}

      {analytics && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{analytics.total_students}</div><div className="stat-label">Students Evaluated</div></div>
            <div className="stat-card"><div className="stat-icon">⬆️</div><div className="stat-value">{analytics.highest_score}</div><div className="stat-label">Highest Score</div></div>
            <div className="stat-card"><div className="stat-icon">⬇️</div><div className="stat-value">{analytics.lowest_score}</div><div className="stat-label">Lowest Score</div></div>
            <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{analytics.average_percentage?.toFixed(1)}%</div><div className="stat-label">Average %</div></div>
            <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{analytics.pass_rate?.toFixed(1)}%</div><div className="stat-label">Pass Rate</div></div>
            <div className="stat-card"><div className="stat-icon">❌</div><div className="stat-value">{analytics.fail_count}</div><div className="stat-label">Failed</div></div>
          </div>

          {chartData && (
            <div className="card card-body mt-lg">
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>Question-wise Average Marks</h3>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          {analytics.question_distribution?.length > 0 && (
            <>
              <h2 style={{ margin: 'var(--space-xl) 0 var(--space-md)' }}>Question Performance Breakdown</h2>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Avg Marks</th>
                      <th>Avg Relevance</th>
                      <th>Avg Completeness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.question_distribution.map((q) => (
                      <tr key={q.question_number}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>Q{q.question_number}</strong></td>
                        <td>{q.average_marks_awarded?.toFixed(2)}</td>
                        <td><span className="badge badge-cyan">{q.average_relevance?.toFixed(1)}/10</span></td>
                        <td><span className="badge badge-purple">{q.average_completeness?.toFixed(1)}/10</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {!analytics && !loading && !error && (
        <div className="empty-state card">
          <div className="empty-icon">📈</div>
          <h3>Enter an Exam ID to view analytics</h3>
          <p>Get detailed score distributions, pass rates, and question-level insights.</p>
        </div>
      )}
    </AppLayout>
  )
}
