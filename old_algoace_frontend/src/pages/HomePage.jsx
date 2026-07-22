import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { questionsAPI } from '../api/client'
import QuestionCard from '../components/QuestionCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { Zap, Shuffle, ArrowRight, BookOpen, Brain, Target, TrendingUp, Sparkles } from 'lucide-react'

const TOPIC_SHORTCUTS = [
  { label: 'Arrays', value: 'arrays' },
  { label: 'DP', value: 'dynamic_programming' },
  { label: 'Graphs', value: 'graphs' },
  { label: 'Trees', value: 'trees' },
  { label: 'Two Pointers', value: 'two_pointers' },
  { label: 'Greedy', value: 'greedy' },
  { label: 'Strings', value: 'strings' },
  { label: 'Backtracking', value: 'backtracking' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [trending, setTrending] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [randomLoading, setRandomLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [trendRes] = await Promise.all([
          questionsAPI.list({ page: 1, limit: 6, sort_by: 'frequency_score' }),
        ])
        setTrending(trendRes.data.items || [])
        setStats({ total: trendRes.data.total })
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRandom = useCallback(async () => {
    setRandomLoading(true)
    try {
      const { data } = await questionsAPI.random(1)
      if (data?.[0]) navigate(`/questions/${data[0].slug}`)
    } catch {
      // ignore
    } finally {
      setRandomLoading(false)
    }
  }, [navigate])

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-eyebrow">
            <Sparkles size={12} />
            Powered by Google Gemini AI
          </div>

          <h1 className="hero-title">
            Crack Every Interview
            <br />
            <span className="hero-gradient-text">with AI on Your Side</span>
          </h1>

          <p className="hero-subtitle">
            Practice DSA problems, get instant AI explanations, progressive hints,
            and personalized company roadmaps — all in one platform.
          </p>

          <div className="hero-actions">
            <Link to="/questions" className="btn btn-primary btn-lg">
              <BookOpen size={18} />
              Browse Questions
              <ArrowRight size={16} />
            </Link>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleRandom}
              disabled={randomLoading}
              id="random-question-btn"
            >
              {randomLoading
                ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Loading...</>
                : <><Shuffle size={16} /> Random Problem</>}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{stats?.total ?? '—'}</div>
              <div className="hero-stat-label">DSA Problems</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">3</div>
              <div className="hero-stat-label">Hint Levels</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">30+</div>
              <div className="hero-stat-label">Companies</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">AI</div>
              <div className="hero-stat-label">Powered Review</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Stats ──────────────────────────────── */}
      <div className="container">
        <div className="stats-row animate-fade-up">
          {[
            { icon: <BookOpen size={20} />, cls: 'stat-icon-accent', num: stats?.total ?? '...', label: 'Total Problems' },
            { icon: <Brain size={20} />, cls: 'stat-icon-ai', num: 'Explain', label: 'AI Explanations' },
            { icon: <Target size={20} />, cls: 'stat-icon-green', num: '3', label: 'Hint Levels' },
            { icon: <TrendingUp size={20} />, cls: 'stat-icon-amber', num: 'Roadmap', label: 'Company Prep' },
          ].map(({ icon, cls, num, label }) => (
            <div className="stat-card" key={label}>
              <div className={`stat-icon ${cls}`}>{icon}</div>
              <div>
                <div className="stat-number">{num}</div>
                <div className="stat-name">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Topic Filter ──────────────────────── */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-title-dot" />
              Browse by Topic
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {TOPIC_SHORTCUTS.map(({ label, value }) => (
              <Link
                key={value}
                to={`/questions?topic=${value}`}
                className="company-pill"
                id={`topic-${value}`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Trending ────────────────────────────────── */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-title-dot" />
              🔥 Trending Problems
            </h2>
            <Link to="/questions" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : trending.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i + 1} />
                ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────── */}
        <div
          className="glass"
          style={{ padding: '48px 40px', textAlign: 'center', marginBottom: 48 }}
        >
          <Zap size={36} color="var(--accent-2)" style={{ marginBottom: 16 }} />
          <h2 className="text-2xl font-bold" style={{ marginBottom: 12 }}>
            Ready to ace your next interview?
          </h2>
          <p className="text-secondary" style={{ marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            Get a personalized 4-week preparation roadmap for your target company — powered by Gemini AI.
          </p>
          <Link to="/roadmap" className="btn btn-primary btn-lg">
            Generate My Roadmap
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
