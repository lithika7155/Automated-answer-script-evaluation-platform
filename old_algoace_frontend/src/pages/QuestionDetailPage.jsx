import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { questionsAPI, aiAPI, usersAPI, exportAPI } from '../api/client'
import DifficultyBadge from '../components/DifficultyBadge'
import MarkdownRenderer from '../components/MarkdownRenderer'
import HintPanel from '../components/HintPanel'
import { SkeletonDetail, SkeletonText } from '../components/SkeletonCard'
import {
  FileText, Sparkles, Lightbulb, MessageSquare, Code2, Bookmark,
  Download, ArrowLeft, Eye, ExternalLink, Copy, Check, Zap
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'solution',    label: 'Solution',    icon: Code2 },
  { id: 'ai',         label: 'AI Explain',  icon: Sparkles, cls: 'ai' },
  { id: 'hints',      label: 'Hints',       icon: Lightbulb, cls: 'hint' },
  { id: 'review',     label: 'Review',      icon: MessageSquare, cls: 'review' },
]

const codeStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#0d1117',
    margin: 0,
    padding: '20px',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono','Fira Code',monospace",
  },
}

function formatTopic(t) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function ExampleBlock({ example, index }) {
  return (
    <div className="example-block">
      <div className="example-label">Example {index + 1}</div>
      <div className="example-io">Input: <span>{example.input}</span></div>
      <div className="example-io">Output: <span>{example.output}</span></div>
      {example.explanation && (
        <div className="example-explanation">Explanation: {example.explanation}</div>
      )}
    </div>
  )
}

export default function QuestionDetailPage() {
  const { slug } = useParams()
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [codeLang, setCodeLang] = useState('python')
  const [copied, setCopied] = useState(false)

  // AI states
  const [explanation, setExplanation] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)

  // Review states
  const [userText, setUserText] = useState('')
  const [review, setReview] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  // Bookmark
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await questionsAPI.get(slug)
        setQuestion(data)
        // Check bookmark state
        const userId = localStorage.getItem('userId')
        if (userId) {
          usersAPI.getProfile().then(({ data: profile }) => {
            setIsBookmarked((profile.bookmarked_slugs || []).includes(slug))
          }).catch(() => {})
        }
      } catch (err) {
        setError(err.response?.status === 404 ? 'Question not found.' : 'Failed to load question.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // Reset states when slug changes
    setActiveTab('description')
    setExplanation(null)
    setReview(null)
    setUserText('')
  }, [slug])

  const handleTabChange = useCallback(async (tab) => {
    setActiveTab(tab)
    if (tab === 'ai' && !explanation && !aiLoading) {
      setAiLoading(true)
      setAiError(null)
      try {
        const { data } = await aiAPI.explain(slug)
        setExplanation(data.explanation_markdown)
      } catch {
        setAiError('AI service unavailable. Please try again later.')
      } finally {
        setAiLoading(false)
      }
    }
  }, [slug, explanation, aiLoading])

  async function handleReview() {
    if (!userText.trim()) return
    setReviewLoading(true)
    try {
      const { data } = await aiAPI.review(slug, userText)
      setReview(data.feedback_markdown)
    } catch {
      setReview('> ❌ Failed to get feedback. Please try again.')
    } finally {
      setReviewLoading(false)
    }
  }

  async function handleBookmark() {
    const userId = localStorage.getItem('userId')
    if (!userId) { alert('Set your User ID in the navbar first.'); return }
    setBookmarkLoading(true)
    try {
      const { data } = await usersAPI.toggleBookmark(slug)
      setIsBookmarked((data.bookmarked_slugs || []).includes(slug))
    } catch {} finally {
      setBookmarkLoading(false)
    }
  }

  async function handleExport() {
    try {
      const { data } = await exportAPI.single(slug)
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url; a.download = `question_${slug}.json`; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  function handleCopyCode() {
    const code = codeLang === 'python' ? question?.python_solution : question?.java_solution
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return (
    <div className="detail-layout">
      <div style={{ marginBottom: 16 }}>
        <Link to="/questions" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</Link>
      </div>
      <SkeletonDetail />
    </div>
  )

  if (error) return (
    <div className="detail-layout">
      <Link to="/questions" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</Link>
      <div className="empty-state" style={{ marginTop: 40 }}>
        <div className="empty-icon"><FileText size={28} /></div>
        <p className="empty-title">{error}</p>
        <Link to="/questions" className="btn btn-primary">Browse Questions</Link>
      </div>
    </div>
  )

  const q = question
  const currentCode = codeLang === 'python' ? q.python_solution : q.java_solution

  return (
    <div className="detail-layout">
      {/* Back */}
      <Link to="/questions" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <ArrowLeft size={14} /> Back to Questions
      </Link>

      {/* Header */}
      <div className="detail-header">
        <h1 className="detail-title">{q.title}</h1>
        <div className="detail-meta">
          <DifficultyBadge difficulty={q.difficulty} />
          {(q.topics || []).map((t) => (
            <span key={t} className="badge badge-topic">{formatTopic(t)}</span>
          ))}
          {(q.companies || []).slice(0, 3).map((c) => (
            <span key={c} className="badge badge-company">{c}</span>
          ))}
          <span className="flex items-center gap-1 text-xs text-muted" style={{ marginLeft: 'auto' }}>
            <Eye size={13} /> {q.view_count ?? 0} views
          </span>
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            id="bookmark-btn"
            className={`btn btn-secondary btn-sm${isBookmarked ? '' : ''}`}
            onClick={handleBookmark}
            disabled={bookmarkLoading}
          >
            <Bookmark
              size={14}
              fill={isBookmarked ? 'var(--accent-2)' : 'none'}
              color={isBookmarked ? 'var(--accent-2)' : 'currentColor'}
            />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} id="export-btn">
            <Download size={14} /> Export JSON
          </button>
          {q.source_url && (
            <a href={q.source_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Source
            </a>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <span className="text-xs text-muted">
              Freq: {Math.round((q.frequency_score ?? 0) * 100)}%
              {q.acceptance_rate != null ? ` · Acceptance: ${q.acceptance_rate?.toFixed(1)}%` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {TABS.map(({ id, label, icon: Icon, cls }) => (
          <button
            key={id}
            id={`tab-${id}`}
            className={`detail-tab${activeTab === id ? ` active${cls ? ' ' + cls : ''}` : ''}`}
            onClick={() => handleTabChange(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────── */}
      <div className="detail-content tab-panel">

        {/* Description */}
        {activeTab === 'description' && (
          <div>
            <MarkdownRenderer>{q.description}</MarkdownRenderer>

            {q.examples?.length > 0 && (
              <>
                <div className="divider" />
                <h3 className="font-semibold text-base" style={{ marginBottom: 12, color: 'var(--accent-2)' }}>Examples</h3>
                {q.examples.map((ex, i) => (
                  <ExampleBlock key={i} example={ex} index={i} />
                ))}
              </>
            )}

            {q.constraints && (
              <>
                <div className="divider" />
                <h3 className="font-semibold text-base" style={{ marginBottom: 8, color: 'var(--accent-2)' }}>Constraints</h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  {q.constraints.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </>
            )}

            {(q.tags?.length > 0) && (
              <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {q.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
            )}
          </div>
        )}

        {/* Solution */}
        {activeTab === 'solution' && (
          <div>
            {q.solution_approach && (
              <>
                <h3 className="font-semibold text-base" style={{ marginBottom: 12, color: 'var(--accent-2)' }}>Approach</h3>
                <MarkdownRenderer>{q.solution_approach}</MarkdownRenderer>
                <div className="divider" />
              </>
            )}

            <div className="code-lang-tabs">
              {[{id:'python', label:'Python'},{id:'java', label:'Java'}].map(({id, label}) => (
                <button
                  key={id}
                  id={`lang-tab-${id}`}
                  className={`code-lang-tab${codeLang === id ? ' active' : ''}`}
                  onClick={() => setCodeLang(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {currentCode ? (
              <div className="code-wrapper">
                <div className="code-header">
                  <span className="code-lang-label">{codeLang === 'python' ? 'Python' : 'Java'}</span>
                  <button className="code-copy-btn" onClick={handleCopyCode} id="copy-code-btn">
                    {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={codeStyle}
                  language={codeLang === 'python' ? 'python' : 'java'}
                  PreTag="div"
                >
                  {currentCode}
                </SyntaxHighlighter>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon"><Code2 size={26} /></div>
                <p className="empty-title">No {codeLang === 'python' ? 'Python' : 'Java'} solution yet</p>
                <p className="empty-sub">Switch to the other language or contribute one.</p>
              </div>
            )}
          </div>
        )}

        {/* AI Explain */}
        {activeTab === 'ai' && (
          <div className="ai-panel">
            <div className="ai-panel-header">
              <div className="ai-panel-icon"><Zap size={16} /></div>
              <div>
                <div className="ai-panel-title">Gemini AI Explanation</div>
                <div className="ai-panel-sub">Powered by Google Gemini 1.5 Flash</div>
              </div>
            </div>
            <div className="ai-panel-body">
              {aiLoading ? (
                <div className="loading-state">
                  <div className="spinner spinner-ai spinner-lg" />
                  <p>Generating explanation...</p>
                </div>
              ) : aiError ? (
                <div>
                  <p style={{ color: 'var(--hard)', marginBottom: 12 }}>{aiError}</p>
                  <button className="btn btn-ai btn-sm" onClick={() => {
                    setAiError(null); setExplanation(null); handleTabChange('ai')
                  }}>Retry</button>
                </div>
              ) : explanation ? (
                <MarkdownRenderer>{explanation}</MarkdownRenderer>
              ) : null}
            </div>
          </div>
        )}

        {/* Hints */}
        {activeTab === 'hints' && <HintPanel slug={slug} />}

        {/* Review */}
        {activeTab === 'review' && (
          <div className="review-panel">
            <div style={{ marginBottom: 8 }}>
              <h3 className="font-semibold text-base" style={{ marginBottom: 6 }}>Describe Your Approach</h3>
              <p className="text-sm text-secondary">
                Write your proposed solution or thought process below. Our AI will review it and give detailed feedback.
              </p>
            </div>
            <textarea
              id="approach-textarea"
              className="textarea"
              placeholder="e.g. I would use a sliding window approach. First I'd initialize two pointers at the start...&#10;&#10;Describe your algorithm, data structures, and time/space complexity."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              style={{ minHeight: 160 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="submit-review-btn"
                className="btn btn-ai"
                disabled={!userText.trim() || reviewLoading}
                onClick={handleReview}
              >
                {reviewLoading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--ai-color)' }} /> Reviewing...</>
                  : <><Sparkles size={15} /> Get AI Feedback</>}
              </button>
            </div>
            {review && (
              <div className="review-result">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ai-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={13} color="white" />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--easy)' }}>AI Feedback</span>
                </div>
                <MarkdownRenderer>{review}</MarkdownRenderer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
