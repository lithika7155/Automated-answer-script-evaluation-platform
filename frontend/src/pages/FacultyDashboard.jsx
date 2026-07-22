import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function FacultyDashboard() {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(null)
  const [evalForm, setEvalForm] = useState({ script_id: '', model_answer: '', exam_id: '', max_marks: 100 })
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    api.get('/answer-scripts')
      .then((res) => setScripts(res.data || []))
      .catch(() => setScripts([]))
      .finally(() => setLoading(false))
  }, [])

  const openEval = (script) => {
    setEvalForm({ script_id: script.id, model_answer: '', exam_id: script.exam_id, max_marks: 100 })
    setShowEvalModal(true)
    setSuccessMsg('')
    setErrorMsg('')
  }

  const submitEval = async (e) => {
    e.preventDefault()
    setEvaluating(true)
    setErrorMsg('')
    try {
      await api.post('/evaluations/evaluate', {
        answer_script_id: evalForm.script_id,
        model_answer: evalForm.model_answer,
        exam_id: evalForm.exam_id,
        max_marks: Number(evalForm.max_marks),
      })
      setSuccessMsg('✅ Evaluation submitted successfully!')
      setTimeout(() => { setShowEvalModal(false); setSuccessMsg('') }, 1800)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Evaluation failed.')
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Faculty Dashboard</h1>
          <p className="text-muted mt-sm">Manage and evaluate student answer scripts</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="badge badge-purple">Faculty</span>
          <span className="badge badge-gray">{scripts.length} scripts</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : scripts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📄</div>
          <h3>No scripts submitted yet</h3>
          <p>Students&apos; answer scripts will appear here once submitted.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Exam ID</th>
                <th>Filename</th>
                <th>Uploaded</th>
                <th>Actions</th>
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
                      <button
                        id={`eval-btn-${s.id}`}
                        className="btn btn-primary btn-sm"
                        onClick={() => openEval(s)}
                      >
                        🤖 Evaluate
                      </button>
                      <a
                        href={`/api/v1/answer-scripts/${s.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        📥 Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvalModal && (
        <div className="modal-overlay" onClick={() => setShowEvalModal(false)}>
          <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🤖 AI Evaluation</h3>
              <button className="btn btn-icon btn-secondary" id="close-modal-btn" onClick={() => setShowEvalModal(false)}>✕</button>
            </div>
            <form onSubmit={submitEval} id="eval-form" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={evalForm.max_marks}
                  onChange={(e) => setEvalForm({ ...evalForm, max_marks: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="model-answer-input">Model Answer / Answer Key</label>
                <textarea
                  id="model-answer-input"
                  className="form-textarea"
                  rows={8}
                  placeholder="Paste the model answer or answer key here..."
                  required
                  value={evalForm.model_answer}
                  onChange={(e) => setEvalForm({ ...evalForm, model_answer: e.target.value })}
                />
              </div>
              {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}
              <button type="submit" id="eval-submit-btn" className="btn btn-primary" disabled={!!evaluating}>
                {evaluating
                  ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Evaluating...</>
                  : '🚀 Run AI Evaluation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
