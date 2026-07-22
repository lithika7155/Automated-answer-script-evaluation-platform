import React from 'react'
import { Filter, RotateCcw, ChevronDown } from 'lucide-react'

const DSA_TOPICS = [
  'arrays','strings','linked_lists','stacks','queues','trees','graphs',
  'dynamic_programming','greedy','backtracking','divide_and_conquer',
  'two_pointers',
]

const DIFFICULTIES = ['easy','medium','hard']

function formatTopic(t) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function FilterSidebar({ filters, onChange, onReset }) {
  function toggle(key, value) {
    const current = filters[key] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: updated })
  }

  function setDifficulty(val) {
    const current = filters.difficulty || []
    const updated = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val]
    onChange({ ...filters, difficulty: updated })
  }

  const hasFilters =
    (filters.topics?.length > 0) ||
    (filters.difficulty?.length > 0) ||
    (filters.companies?.length > 0)

  return (
    <aside className="sidebar animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="var(--accent-2)" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={onReset} style={{ padding: '4px 8px', gap: 4 }}>
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Difficulty */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <ChevronDown size={11} />
          Difficulty
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`filter-pill filter-pill-${d}${(filters.difficulty || []).includes(d) ? ' selected' : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <ChevronDown size={11} />
          Topics
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
          {DSA_TOPICS.map((t) => (
            <button
              key={t}
              className={`filter-pill${(filters.topics || []).includes(t) ? ' selected' : ''}`}
              onClick={() => toggle('topics', t)}
            >
              {formatTopic(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="sidebar-section">
        <div className="sidebar-label">
          <ChevronDown size={11} />
          Sort By
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { val: 'frequency_score', label: 'Frequency' },
            { val: 'created_at', label: 'Newest' },
            { val: 'difficulty', label: 'Difficulty' },
            { val: 'title', label: 'Title A–Z' },
          ].map(({ val, label }) => (
            <button
              key={val}
              className={`filter-pill${filters.sort_by === val ? ' selected' : ''}`}
              style={{ justifyContent: 'flex-start', margin: 0, borderRadius: 8 }}
              onClick={() => onChange({ ...filters, sort_by: val })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
