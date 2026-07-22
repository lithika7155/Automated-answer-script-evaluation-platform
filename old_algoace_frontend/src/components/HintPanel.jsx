import React, { useState } from 'react'
import { aiAPI } from '../api/client'
import MarkdownRenderer from './MarkdownRenderer'
import { Lightbulb, ChevronRight, Sparkles } from 'lucide-react'
import { SkeletonText } from './SkeletonCard'

const HINT_LEVELS = [
  { level: 1, label: 'Nudge', desc: 'A gentle push' },
  { level: 2, label: 'Clue',  desc: 'Algorithmic clue' },
  { level: 3, label: 'Skeleton', desc: 'Concrete steps' },
]

export default function HintPanel({ slug }) {
  const [activeLevel, setActiveLevel] = useState(null)
  const [hints, setHints] = useState({})
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  async function fetchHint(level) {
    if (hints[level]) {
      setActiveLevel(level)
      return
    }
    setActiveLevel(level)
    setLoading(level)
    setError(null)
    try {
      const { data } = await aiAPI.hint(slug, level)
      setHints((prev) => ({ ...prev, [level]: data.hint_markdown }))
    } catch (err) {
      setError('Failed to load hint. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="hint-level-row">
        {HINT_LEVELS.map(({ level, label, desc }) => (
          <button
            key={level}
            className={`hint-level-btn${activeLevel === level ? ' active' : ''}`}
            onClick={() => fetchHint(level)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={14} />
              Level {level}
            </div>
            <span className="hint-level-label">{label}</span>
          </button>
        ))}
      </div>

      {!activeLevel && (
        <div className="empty-state" style={{ padding: 40 }}>
          <div className="empty-icon">
            <Lightbulb size={26} />
          </div>
          <p className="empty-title">Need a hint?</p>
          <p className="empty-sub">Select a level above — start with Level 1 to preserve the challenge.</p>
        </div>
      )}

      {activeLevel && (
        <div className="hint-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={14} color="var(--accent-3)" />
            <span className="text-sm font-semibold" style={{ color: 'var(--accent-3)' }}>
              Hint Level {activeLevel} — {HINT_LEVELS[activeLevel - 1].label}
            </span>
          </div>
          {loading === activeLevel ? (
            <SkeletonText lines={3} />
          ) : error ? (
            <p className="text-sm" style={{ color: 'var(--hard)' }}>{error}</p>
          ) : hints[activeLevel] ? (
            <MarkdownRenderer>{hints[activeLevel]}</MarkdownRenderer>
          ) : null}
        </div>
      )}

      {activeLevel && activeLevel < 3 && hints[activeLevel] && !loading && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 12 }}
          onClick={() => fetchHint(activeLevel + 1)}
        >
          <ChevronRight size={14} />
          Next Hint Level
        </button>
      )}
    </div>
  )
}
