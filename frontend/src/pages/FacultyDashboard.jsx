import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

/* ── helpers ──────────────────────────────────────────────────────────────── */
function gradeColor(g) {
  return { 'A+': 'green', A: 'green', B: 'cyan', C: 'orange', D: 'orange', F: 'red' }[g] || 'gray'
}

function exportCSV(rows, filename) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv  = [keys.join(','), ...rows.map((r) =>
    keys.map((k) => {
      const v = String(r[k] ?? '')
      return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
    }).join(',')
  )].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = filename
  a.click()
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function FacultyDashboard() {
  const [tab, setTab] = useState('scripts')   // 'scripts' | 'matrix'

  /* ── scripts tab ── */
  const [scripts,  setScripts]  = useState([])
  const [scrLoad,  setScrLoad]  = useState(true)

  /* ── eval modal ── */
  const [showModal,  setShowModal]  = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [evalForm,   setEvalForm]   = useState({ script_id: '', model_answer: '', exam_id: '', max_marks: 100 })
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg,   setErrorMsg]   = useState('')

  /* ── matrix tab ── */
  const [matrix,      setMatrix]      = useState([])
  const [matrixLoad,  setMatrixLoad]  = useState(false)
  const [matrixErr,   setMatrixErr]   = useState('')
  const [examFilter,  setExamFilter]  = useState('')
  const [searchQ,     setSearchQ]     = useState('')

  /* load scripts */
  useEffect(() => {
    api.get('/answer-scripts')
      .then((r) => setScripts(r.data || []))
      .catch(() => setScripts([]))
      .finally(() => setScrLoad(false))
  }, [])

  /* load matrix when tab opens or exam filter changes */
  useEffect(() => {
    if (tab !== 'matrix') return
    setMatrixLoad(true); setMatrixErr('')
    const qs = examFilter ? `?exam_id=${encodeURIComponent(examFilter)}` : ''
    api.get(`/analytics/marks-matrix${qs}`)
      .then((r) => setMatrix(r.data || []))
      .catch(() => setMatrixErr('Could not load marks matrix. Ensure evaluations exist.'))
      .finally(() => setMatrixLoad(false))
  }, [tab, examFilter])

  /* eval modal handlers */
  const openEval = (s) => {
    setEvalForm({ script_id: s.id, model_answer: '', exam_id: s.exam_id, max_marks: 100 })
    setShowModal(true); setSuccessMsg(''); setErrorMsg('')
  }
  const submitEval = async (e) => {
    e.preventDefault(); setEvaluating(true); setErrorMsg('')
    try {
      await api.post('/evaluations/evaluate', {
        answer_script_id: evalForm.script_id,
        model_answer: evalForm.model_answer,
        exam_id: evalForm.exam_id,
        max_marks: Number(evalForm.max_marks),
      })
      setSuccessMsg('✅ Evaluation submitted!')
      setTimeout(() => { setShowModal(false); setSuccessMsg('') }, 1800)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Evaluation failed.')
    } finally {
      setEvaluating(false)
    }
  }

  /* derived matrix data */
  const examIds   = useMemo(() => [...new Set(matrix.map((r) => r.exam_id).filter(Boolean))], [matrix])
  const maxQCount = useMemo(() => Math.max(0, ...matrix.map((r) => (r.question_marks || []).length)), [matrix])

  /* derive section-wise totals from question_marks */
  const withSections = useMemo(() => matrix.map((r) => {
    const secMap = {}
    ;(r.question_marks || []).forEach((q) => {
      const sec = q.section || 'General'
      if (!secMap[sec]) secMap[sec] = { awarded: 0, max: 0 }
      secMap[sec].awarded += q.marks_obtained || 0
      secMap[sec].max     += q.max_marks      || 0
    })
    return { ...r, sections: secMap }
  }), [matrix])

  /* all unique section names */
  const allSections = useMemo(() => {
    const set = new Set()
    withSections.forEach((r) => Object.keys(r.sections).forEach((s) => set.add(s)))
    return [...set]
  }, [withSections])

  const filtered = useMemo(() => {
    const q = searchQ.toLowerCase()
    return withSections.filter((r) =>
      !q ||
      (r.student_name || '').toLowerCase().includes(q) ||
      (r.student_id   || '').toLowerCase().includes(q)
    )
  }, [withSections, searchQ])

  /* CSV export */
  const handleCSV = () => {
    const rows = filtered.map((r) => {
      const row = {
        student_name:     r.student_name || r.student_id,
        roll_number:      r.student_id,
        exam_id:          r.exam_id,
      }
      ;(r.question_marks || []).forEach((q) => { row[`Q${q.question_number}`] = q.marks_obtained })
      Object.entries(r.sections || {}).forEach(([sec, v]) => { row[`${sec}_total`] = v.awarded })
      row.total_marks  = r.total_score
      row.max_marks    = r.total_max_marks
      row.percentage   = r.percentage?.toFixed(1)
      row.grade        = r.grade
      row.pass_fail    = r.pass_fail_status
      return row
    })
    exportCSV(rows, `marks_matrix_${examFilter || 'all'}.csv`)
  }

  /* TAB style helper */
  const tabStyle = (key) => ({
    background: 'none', border: 'none',
    borderBottom: tab === key ? '2px solid var(--accent-purple)' : '2px solid transparent',
    color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
    fontWeight: tab === key ? 700 : 400,
    fontSize: '0.9rem', padding: '8px 18px',
    cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1,
  })

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <AppLayout>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="text-muted mt-sm">Manage and evaluate student answer scripts</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="badge badge-purple">Faculty</span>
          <span className="badge badge-gray">{scripts.length} scripts</span>
          <Link to="/upload" className="btn btn-primary" id="faculty-upload-btn">
            📤 Upload &amp; Grade Scripts
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-glass)', marginBottom: 'var(--space-lg)' }}>
        <button id="tab-scripts" style={tabStyle('scripts')} onClick={() => setTab('scripts')}>
          📄 Submitted Scripts
        </button>
        <button id="tab-matrix" style={tabStyle('matrix')} onClick={() => setTab('matrix')}>
          📊 Marks Matrix
        </button>
      </div>

      {/* ── TAB: Scripts ── */}
      {tab === 'scripts' && (
        scrLoad ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : scripts.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📄</div>
            <h3>No scripts uploaded yet</h3>
            <p>Use the "Upload &amp; Grade Scripts" button to upload student answer sheets.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student ID</th><th>Exam ID</th><th>Filename</th><th>Uploaded</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scripts.map((s) => (
                  <tr key={s.id}>
                    <td><code style={{ color: 'var(--accent-cyan-light)', fontSize: '0.82rem' }}>{s.student_id}</code></td>
                    <td><code style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.exam_id}</code></td>
                    <td style={{ fontSize: '0.85rem' }}>{s.filename}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(s.upload_time).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <button id={`eval-btn-${s.id}`} className="btn btn-primary btn-sm" onClick={() => openEval(s)}>
                          🤖 Evaluate
                        </button>
                        <a href={`/api/v1/answer-scripts/${s.id}/download`} target="_blank" rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm">
                          📥 Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── TAB: Marks Matrix ── */}
      {tab === 'matrix' && (
        <>
          {/* Controls */}
          <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              id="matrix-search" type="text" className="form-input"
              style={{ maxWidth: 240, margin: 0 }}
              placeholder="🔍 Search by name or ID…"
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            />
            <select
              id="matrix-exam-filter" className="form-input"
              style={{ maxWidth: 220, margin: 0 }}
              value={examFilter} onChange={(e) => setExamFilter(e.target.value)}
            >
              <option value="">All Exams</option>
              {examIds.map((eid) => <option key={eid} value={eid}>{eid}</option>)}
            </select>
            <div style={{ flex: 1 }} />
            <button id="export-csv-btn" className="btn btn-secondary btn-sm"
              onClick={handleCSV} disabled={!filtered.length}>
              📥 Export CSV
            </button>
            <button id="export-pdf-btn" className="btn btn-secondary btn-sm"
              onClick={() => filtered.forEach((r) => window.open(`/api/v1/analytics/export/pdf/${r.evaluation_id}`, '_blank'))}
              disabled={!filtered.length}>
              📥 Export PDF Reports
            </button>
          </div>

          {matrixLoad ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : matrixErr ? (
            <div className="alert alert-error">{matrixErr}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📊</div>
              <h3>No evaluated results found</h3>
              <p>{searchQ || examFilter
                ? 'No results match your search. Try adjusting the filters.'
                : 'Once evaluations are complete, the marks matrix will appear here.'}</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {matrix.length} students
              </div>
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="table" id="marks-matrix-table" style={{ minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2 }}>
                        Student Name
                      </th>
                      <th>Roll Number</th>
                      <th>Exam</th>
                      {/* Q columns */}
                      {Array.from({ length: maxQCount }, (_, i) => <th key={i}>Q{i + 1}</th>)}
                      {/* Section columns */}
                      {allSections.filter((s) => s !== 'General').map((s) => (
                        <th key={s}>{s}</th>
                      ))}
                      <th>Total</th>
                      <th>%</th>
                      <th>Grade</th>
                      <th>Pass/Fail</th>
                      <th>Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.evaluation_id}>
                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.student_name || r.student_id}
                        </td>
                        <td><code style={{ fontSize: '0.78rem', color: 'var(--accent-cyan-light)' }}>{r.student_id}</code></td>
                        <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.exam_id}</code></td>
                        {/* Question mark cells */}
                        {Array.from({ length: maxQCount }, (_, i) => {
                          const qm = (r.question_marks || []).find((q) => q.question_number === i + 1)
                          return (
                            <td key={i} style={{ textAlign: 'center' }}>
                              {qm
                                ? <span title={`Max: ${qm.max_marks}`} style={{ fontWeight: 600 }}>
                                    {qm.marks_obtained}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{qm.max_marks}</span>
                                  </span>
                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                          )
                        })}
                        {/* Section cells */}
                        {allSections.filter((s) => s !== 'General').map((sec) => {
                          const v = r.sections?.[sec]
                          return (
                            <td key={sec} style={{ textAlign: 'center' }}>
                              {v
                                ? <span style={{ fontWeight: 600 }}>
                                    {v.awarded}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/{v.max}</span>
                                  </span>
                                : '—'}
                            </td>
                          )
                        })}
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {r.total_score}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{r.total_max_marks}</span>
                        </td>
                        <td>{r.percentage?.toFixed(1)}%</td>
                        <td><span className={`badge badge-${gradeColor(r.grade)}`}>{r.grade}</span></td>
                        <td>
                          <span className={`badge ${r.pass_fail_status === 'Pass' ? 'badge-green' : 'badge-red'}`}>
                            {r.pass_fail_status}
                          </span>
                        </td>
                        <td>
                          <a href={`/api/v1/analytics/export/pdf/${r.evaluation_id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm" id={`pdf-${r.evaluation_id}`}>
                            📄 PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Evaluation Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Evaluation</h3>
              <button className="btn btn-icon btn-secondary" id="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={submitEval} id="eval-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input type="number" className="form-input" min={1}
                  value={evalForm.max_marks}
                  onChange={(e) => setEvalForm({ ...evalForm, max_marks: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="model-answer-input">Model Answer / Answer Key</label>
                <textarea id="model-answer-input" className="form-textarea" rows={8}
                  placeholder="Paste the model answer or answer key here…" required
                  value={evalForm.model_answer}
                  onChange={(e) => setEvalForm({ ...evalForm, model_answer: e.target.value })} />
              </div>
              {errorMsg  && <div className="alert alert-error">{errorMsg}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}
              <button type="submit" id="eval-submit-btn" className="btn btn-primary" disabled={!!evaluating}>
                {evaluating
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating…</>
                  : '🚀 Run AI Evaluation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
