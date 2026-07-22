import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import AppLayout from '../components/AppLayout'
import './Dashboard.css'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({ student_id: '', exam_id: '' })
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(f.type)) {
      setError('Only PDF, JPG, JPEG, and PNG files are allowed.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    setLoading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('student_id', form.student_id)
      data.append('exam_id', form.exam_id)
      const res = await api.post('/answer-scripts/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Script uploaded successfully!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1>Upload Answer Script</h1>
          <p className="text-muted mt-sm">Submit your PDF or image for AI evaluation</p>
        </div>
      </div>

      <form className="upload-form" onSubmit={handleSubmit} id="upload-form">
        <div
          className={`drop-zone ${dragging ? 'drag-over' : ''}`}
          id="drop-zone"
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className="drop-zone-icon">{file ? '✅' : '📤'}</span>
          {file ? (
            <>
              <strong style={{ color: 'var(--text-primary)' }}>{file.name}</strong>
              <p className="drop-zone-hint">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)' }}>Drag & drop or click to select a file</p>
              <p className="drop-zone-hint">Supports PDF, JPG, JPEG, PNG · Max 10 MB</p>
            </>
          )}
          <input
            ref={fileRef}
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="student-id-input">Student ID</label>
          <input
            id="student-id-input"
            type="text"
            className="form-input"
            placeholder="e.g. STU-2024-001"
            required
            value={form.student_id}
            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="exam-id-input">Exam ID</label>
          <input
            id="exam-id-input"
            type="text"
            className="form-input"
            placeholder="e.g. EXAM-CS101-2024"
            required
            value={form.exam_id}
            onChange={(e) => setForm({ ...form, exam_id: e.target.value })}
          />
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <button
          type="submit"
          id="upload-submit-btn"
          className="btn btn-primary btn-lg"
          disabled={loading}
        >
          {loading
            ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Uploading...</>
            : '🚀 Upload Script'}
        </button>
      </form>
    </AppLayout>
  )
}
