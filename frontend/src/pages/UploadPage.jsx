import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_MB  = 10

function validateFile(f) {
  if (!ALLOWED.includes(f.type)) return `"${f.name}" is not a PDF, JPG, or PNG.`
  if (f.size > MAX_MB * 1024 * 1024) return `"${f.name}" exceeds the ${MAX_MB} MB limit.`
  return null
}

export default function UploadPage() {
  const [isBatch, setIsBatch]         = useState(false)
  const [examId, setExamId]           = useState('')
  const [studentId, setStudentId]     = useState('')    // single mode
  const [studentIds, setStudentIds]   = useState('')    // batch mode (comma-separated)
  const [questionPaper, setQP]        = useState(null)
  const [answerKey, setAK]            = useState(null)
  const [singleScript, setSingle]     = useState(null)
  const [batchScripts, setBatch]      = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  const qpRef     = useRef()
  const akRef     = useRef()
  const scriptRef = useRef()
  const batchRef  = useRef()
  const navigate  = useNavigate()

  /* ── file pickers ── */
  const pickFile = (setter) => (e) => {
    const f = e.target.files[0]
    if (!f) return
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError(''); setter(f)
  }

  const pickBatch = (e) => {
    const files = Array.from(e.target.files)
    for (const f of files) {
      const err = validateFile(f)
      if (err) { setError(err); return }
    }
    setError(''); setBatch(files)
  }

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!examId.trim()) { setError('Exam ID is required.'); return }

    if (!isBatch) {
      if (!studentId.trim()) { setError('Student ID is required.'); return }
      if (!singleScript)     { setError('Please select a student answer sheet.'); return }

      setLoading(true)
      try {
        const fd = new FormData()
        fd.append('exam_id', examId.trim())
        fd.append('student_id', studentId.trim())
        fd.append('file', singleScript)
        if (questionPaper) fd.append('question_paper', questionPaper)
        if (answerKey)     fd.append('answer_key', answerKey)
        await api.post('/answer-scripts/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSuccess('✅ Script uploaded successfully!')
        setTimeout(() => navigate('/faculty'), 1500)
      } catch (err) {
        setError(err.response?.data?.detail || 'Upload failed.')
      } finally {
        setLoading(false)
      }
    } else {
      if (!batchScripts.length) { setError('Please select at least one answer sheet.'); return }
      const sids = studentIds.split(',').map((s) => s.trim()).filter(Boolean)
      if (sids.length !== batchScripts.length) {
        setError(`Student IDs count (${sids.length}) must match files count (${batchScripts.length}).`)
        return
      }

      setLoading(true)
      try {
        const fd = new FormData()
        fd.append('exam_id', examId.trim())
        fd.append('student_ids', studentIds.trim())
        batchScripts.forEach((f) => fd.append('files', f))
        if (questionPaper) fd.append('question_paper', questionPaper)
        if (answerKey)     fd.append('answer_key', answerKey)
        await api.post('/answer-scripts/batch-upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setSuccess(`✅ Batch of ${batchScripts.length} scripts uploaded successfully!`)
        setTimeout(() => navigate('/faculty'), 1500)
      } catch (err) {
        setError(err.response?.data?.detail || 'Batch upload failed.')
      } finally {
        setLoading(false)
      }
    }
  }

  /* ── reusable file drop zone ── */
  const DropZone = ({ label, file, fileRef, onChange, id, required = false }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && ' *'}</label>
      <div
        className="drop-zone"
        id={id}
        onClick={() => fileRef.current.click()}
        style={{ padding: 'var(--space-md)', cursor: 'pointer' }}
      >
        <span className="drop-zone-icon">{file ? '✅' : '📁'}</span>
        {file ? (
          <>
            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{file.name}</strong>
            <p className="drop-zone-hint">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Click to select (PDF, JPG, PNG · max {MAX_MB} MB)
          </p>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }} onChange={onChange} />
      </div>
    </div>
  )

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Faculty Upload Portal</h1>
          <p className="text-muted mt-sm">Upload exam materials and student answer sheets for AI grading</p>
        </div>
        <div className="flex gap-sm">
          <button
            type="button"
            className={`btn ${!isBatch ? 'btn-primary' : 'btn-secondary'}`}
            id="mode-single"
            onClick={() => { setIsBatch(false); setError('') }}
          >
            📄 Single Student
          </button>
          <button
            type="button"
            className={`btn ${isBatch ? 'btn-primary' : 'btn-secondary'}`}
            id="mode-batch"
            onClick={() => { setIsBatch(true); setError('') }}
          >
            📚 Batch Upload
          </button>
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit} id="upload-form">

        {/* Exam ID */}
        <div className="form-group">
          <label className="form-label" htmlFor="exam-id-input">Exam / Course ID *</label>
          <input
            id="exam-id-input" type="text" className="form-input"
            placeholder="e.g. EXAM-CS101-2026" required
            value={examId} onChange={(e) => setExamId(e.target.value)}
          />
        </div>

        {/* Student ID(s) */}
        {!isBatch ? (
          <div className="form-group">
            <label className="form-label" htmlFor="student-id-input">Student ID / Roll Number *</label>
            <input
              id="student-id-input" type="text" className="form-input"
              placeholder="e.g. STU-2026-001" required
              value={studentId} onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="student-ids-input">
              Student IDs (comma-separated, same order as uploaded files) *
            </label>
            <input
              id="student-ids-input" type="text" className="form-input"
              placeholder="e.g. STU-001, STU-002, STU-003" required
              value={studentIds} onChange={(e) => setStudentIds(e.target.value)}
            />
          </div>
        )}

        {/* Question Paper */}
        <DropZone
          label="📝 Scanned Question Paper"
          file={questionPaper}
          fileRef={qpRef}
          id="qp-drop-zone"
          onChange={pickFile(setQP)}
          required
        />

        {/* Answer Key */}
        <DropZone
          label="🔑 Model Answer Key (Optional)"
          file={answerKey}
          fileRef={akRef}
          id="ak-drop-zone"
          onChange={pickFile(setAK)}
        />

        {/* Answer Sheet(s) */}
        {!isBatch ? (
          <DropZone
            label="📄 Student Answer Sheet"
            file={singleScript}
            fileRef={scriptRef}
            id="script-drop-zone"
            onChange={pickFile(setSingle)}
            required
          />
        ) : (
          <div className="form-group">
            <label className="form-label">📚 Student Answer Sheets (Multiple Files) *</label>
            <div
              className="drop-zone"
              id="batch-drop-zone"
              onClick={() => batchRef.current.click()}
              style={{ padding: 'var(--space-md)', cursor: 'pointer' }}
            >
              <span className="drop-zone-icon">{batchScripts.length ? '✅' : '📦'}</span>
              {batchScripts.length ? (
                <>
                  <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                    {batchScripts.length} file{batchScripts.length !== 1 ? 's' : ''} selected
                  </strong>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {batchScripts.map((f, i) => <li key={i}>{i + 1}. {f.name}</li>)}
                  </ul>
                  <p className="drop-zone-hint">Click to replace</p>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  Click to select multiple files (PDF, JPG, PNG)
                </p>
              )}
              <input ref={batchRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }} onChange={pickBatch} />
            </div>
          </div>
        )}

        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" id="upload-submit-btn" className="btn btn-primary btn-lg" disabled={loading}>
          {loading
            ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Uploading…</>
            : isBatch ? '🚀 Upload Batch Scripts' : '🚀 Upload Script'}
        </button>
      </form>
    </AppLayout>
  )
}
