import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

const GRADE_COLOR = {
  'A+': 'green', A: 'green', B: 'cyan', C: 'orange', D: 'orange', F: 'red',
}

export default function EvaluationDetailPage() {
  const { id } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get(`/evaluations/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load evaluation details.'))
      .finally(() => setLoading(false))
  }, [id])

  const downloadPDF  = () => window.open(`/api/v1/analytics/export/pdf/${id}`, '_blank')
  const downloadJSON = () => window.open(`/api/v1/analytics/export/json/${id}`, '_blank')

  if (loading) return <AppLayout><div className="loading-center"><div className="spinner" /></div></AppLayout>
  if (error)   return <AppLayout><div className="alert alert-error">{error}</div></AppLayout>
  if (!data)   return null

  const grade     = data.grade || 'F'
  const gradeKey  = grade === 'A+' ? 'A-plus' : grade
  const questions = data.question_results || []

  /* derive section-wise totals from question_results */
  const sectionMap = {}
  questions.forEach((q, i) => {
    const sec = q.section || 'General'
    if (!sectionMap[sec]) sectionMap[sec] = { awarded: 0, max: 0, count: 0 }
    sectionMap[sec].awarded += q.marks_awarded || 0
    sectionMap[sec].max     += q.max_marks     || 0
    sectionMap[sec].count   += 1
  })
  const sections = Object.entries(sectionMap)

  /* aggregate all missing concepts */
  const allMissing = [...new Set(questions.flatMap((q) => q.missing_concepts || []))]

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Evaluation Result</h1>
          <p className="text-muted mt-sm">
            Exam: <code style={{ color: 'var(--accent-cyan-light)' }}>{data.exam_id}</code>
            &nbsp;·&nbsp;
            Status:&nbsp;
            <span className={`badge ${data.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`}>
              {data.pass_fail_status || 'Evaluated'}
            </span>
          </p>
        </div>
        <div className="flex gap-sm">
          <button id="download-pdf-btn" className="btn btn-primary btn-sm" onClick={downloadPDF}>
            📥 Download PDF Report
          </button>
          <button id="download-json-btn" className="btn btn-secondary btn-sm" onClick={downloadJSON}>
            📥 JSON
          </button>
        </div>
      </div>

      {/* ── Score Summary ── */}
      <div className="card card-body" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
          <div className={`grade-badge grade-${gradeKey}`}>{grade}</div>
          <div>
            <div className="stat-value">{data.total_marks} pts</div>
            <div className="stat-label">Total Marks · {data.percentage?.toFixed(1)}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div className="score-bar-track" style={{ height: 10 }}>
              <div className="score-bar-fill" style={{ width: `${data.percentage || 0}%` }} />
            </div>
          </div>
          <span
            className={`badge ${data.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`}
            style={{ fontSize: '0.9rem', padding: '6px 16px' }}
          >
            {data.pass_fail_status}
          </span>
        </div>
      </div>

      {/* ── Section-wise Marks ── */}
      {sections.length > 1 && (
        <>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>📂 Section-wise Marks</h2>
          <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
            {sections.map(([sec, v]) => {
              const pct = v.max > 0 ? Math.round((v.awarded / v.max) * 100) : 0
              return (
                <div className="stat-card" key={sec}>
                  <div className="stat-label" style={{ fontWeight: 600, marginBottom: 4 }}>{sec}</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                    {v.awarded}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {' '}/ {v.max}
                    </span>
                  </div>
                  <div className="stat-label">{pct}% · {v.count} question{v.count !== 1 ? 's' : ''}</div>
                  <div className="score-bar-track" style={{ marginTop: 8, height: 6 }}>
                    <div className="score-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Missing Concepts Summary ── */}
      {allMissing.length > 0 && (
        <>
          <h2 style={{ marginBottom: 'var(--space-sm)' }}>⚠️ Missing Concepts</h2>
          <div className="card card-body" style={{ marginBottom: 'var(--space-xl)' }}>
            <p className="text-muted" style={{ marginBottom: 'var(--space-sm)', fontSize: '0.85rem' }}>
              Review these topics to strengthen your understanding:
            </p>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {allMissing.map((c, i) => (
                <span key={i} className="badge badge-red" style={{ fontSize: '0.8rem' }}>{c}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Question-wise Marks & AI Feedback ── */}
      <h2 style={{ marginBottom: 'var(--space-md)' }}>📝 Question-wise Marks &amp; AI Feedback</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        {questions.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📋</div>
            <h3>No question data available</h3>
            <p>Detailed breakdown will appear after the evaluation is complete.</p>
          </div>
        ) : (
          questions.map((q, i) => {
            const pct = q.max_marks ? Math.round((q.marks_awarded / q.max_marks) * 100) : 0
            return (
              <div className="question-card" key={i} id={`q-${i + 1}`}>
                <div className="question-number">{i + 1}</div>
                <div className="question-content">
                  <h4>
                    Question {i + 1}
                    {q.section && (
                      <span className="badge badge-gray" style={{ marginLeft: 8, fontSize: '0.72rem' }}>
                        {q.section}
                      </span>
                    )}
                  </h4>

                  {/* AI Feedback */}
                  {q.feedback && (
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                      <strong style={{ color: 'var(--text-accent)', fontSize: '0.85rem' }}>🤖 AI Feedback:</strong>
                      <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        {q.feedback}
                      </p>
                    </div>
                  )}

                  {/* Per-question missing concepts */}
                  {q.missing_concepts?.length > 0 && (
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                      <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>⚠️ Missing:</strong>{' '}
                      {q.missing_concepts.join(', ')}
                    </div>
                  )}

                  {/* Score badges */}
                  <div className="flex gap-sm" style={{ marginTop: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {q.relevance_score !== undefined && (
                      <span className="badge badge-cyan">Relevance: {q.relevance_score}/10</span>
                    )}
                    {q.completeness_score !== undefined && (
                      <span className="badge badge-purple">Completeness: {q.completeness_score}/10</span>
                    )}
                  </div>
                </div>

                {/* Marks column */}
                <div className="question-score">
                  <div className="score-val">{q.marks_awarded}</div>
                  <div className="score-max">/ {q.max_marks}</div>
                  <div className="score-bar-track" style={{ width: 60, marginTop: 6 }}>
                    <div className="score-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{pct}%</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-lg">
        <Link to="/results" className="btn btn-secondary">← Back to Results</Link>
      </div>
    </AppLayout>
  )
}
