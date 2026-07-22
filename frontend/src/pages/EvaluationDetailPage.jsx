import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

function GradeBadge({ grade }) {
  const key = grade === 'A+' ? 'A-plus' : grade
  return (
    <div className={`grade-badge grade-${key}`}>
      {grade}
    </div>
  )
}

export default function EvaluationDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/evaluations/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load evaluation details.'))
      .finally(() => setLoading(false))
  }, [id])

  const downloadPDF = () => {
    window.open(`/api/v1/analytics/export/pdf/${id}`, '_blank')
  }
  const downloadJSON = () => {
    window.open(`/api/v1/analytics/export/json/${id}`, '_blank')
  }

  if (loading) return <AppLayout><div className="loading-center"><div className="spinner" /></div></AppLayout>
  if (error) return <AppLayout><div className="alert alert-error">{error}</div></AppLayout>
  if (!data) return null

  const grade = data.grade || 'F'
  const gradeKey = grade === 'A+' ? 'A-plus' : grade

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Evaluation Result</h1>
          <p className="text-muted mt-sm">Exam ID: <code style={{ color: 'var(--accent-cyan-light)' }}>{data.exam_id}</code></p>
        </div>
        <div className="flex gap-sm">
          <button id="download-pdf-btn" className="btn btn-secondary btn-sm" onClick={downloadPDF}>📥 PDF</button>
          <button id="download-json-btn" className="btn btn-secondary btn-sm" onClick={downloadJSON}>📥 JSON</button>
        </div>
      </div>

      {/* Score Summary */}
      <div className="card card-body mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
          <div className={`grade-badge grade-${gradeKey}`}>{grade}</div>
          <div>
            <div className="stat-value">{data.total_marks} pts</div>
            <div className="stat-label">Total Score · {data.percentage?.toFixed(1)}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="score-bar-track" style={{ height: 10 }}>
              <div className="score-bar-fill" style={{ width: `${data.percentage || 0}%` }} />
            </div>
          </div>
          <span className={`badge ${data.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
            {data.pass_fail_status}
          </span>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h2 className="mb-lg">Question-wise Breakdown</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {(data.question_results || []).map((q, i) => (
          <div className="question-card" key={i}>
            <div className="question-number">{i + 1}</div>
            <div className="question-content">
              <h4>Question {i + 1}</h4>
              {q.feedback && <p style={{ marginTop: 'var(--space-sm)' }}><strong style={{ color: 'var(--text-accent)' }}>Feedback:</strong> {q.feedback}</p>}
              {q.missing_concepts?.length > 0 && (
                <p style={{ marginTop: 'var(--space-xs)' }}>
                  <strong style={{ color: '#f87171' }}>Missing:</strong>{' '}
                  {q.missing_concepts.join(', ')}
                </p>
              )}
              <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
                {q.relevance_score !== undefined && (
                  <span className="badge badge-cyan">Relevance: {q.relevance_score}/10</span>
                )}
                {q.completeness_score !== undefined && (
                  <span className="badge badge-purple">Completeness: {q.completeness_score}/10</span>
                )}
              </div>
            </div>
            <div className="question-score">
              <div className="score-val">{q.marks_awarded}</div>
              <div className="score-max">/ {q.max_marks}</div>
              <div className="score-bar-track" style={{ width: 60, marginTop: 6 }}>
                <div className="score-bar-fill" style={{ width: `${q.max_marks ? (q.marks_awarded / q.max_marks) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-lg">
        <Link to="/results" className="btn btn-secondary">← Back to Results</Link>
      </div>
    </AppLayout>
  )
}
