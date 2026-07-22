import React from 'react'
import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'
import { Bookmark, Eye, Lock } from 'lucide-react'

function formatTopic(t) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function QuestionCard({ question, index, onBookmark, isBookmarked }) {
  const freq = question.frequency_score ?? 0

  return (
    <Link to={`/questions/${question.slug}`} className="q-card animate-fade-in">
      <span className="q-card-index">#{index}</span>

      <div className="q-card-body">
        <div className="q-card-header">
          <span className="q-card-title">{question.title}</span>
          <DifficultyBadge difficulty={question.difficulty} />
          {question.is_premium && (
            <span className="badge badge-premium"><Lock size={9} />Pro</span>
          )}
        </div>

        <div className="q-card-meta">
          {(question.topics || []).slice(0, 3).map((t) => (
            <span key={t} className="badge badge-topic">{formatTopic(t)}</span>
          ))}
          {(question.companies || []).slice(0, 2).map((c) => (
            <span key={c} className="badge badge-company">{c}</span>
          ))}
          {(question.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="q-card-freq">
        <div>
          <div className="q-card-freq-label">Freq</div>
          <div className="q-card-freq-bar">
            <div className="q-card-freq-fill" style={{ width: `${freq * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="q-card-actions" onClick={(e) => e.preventDefault()}>
        {onBookmark && (
          <button
            className="btn btn-ghost btn-icon"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            onClick={(e) => { e.preventDefault(); onBookmark(question.slug) }}
          >
            <Bookmark
              size={15}
              fill={isBookmarked ? 'currentColor' : 'none'}
              color={isBookmarked ? '#818cf8' : 'currentColor'}
            />
          </button>
        )}
        <span className="flex items-center gap-1 text-muted text-xs">
          <Eye size={13} />
          {question.view_count ?? 0}
        </span>
      </div>
    </Link>
  )
}
