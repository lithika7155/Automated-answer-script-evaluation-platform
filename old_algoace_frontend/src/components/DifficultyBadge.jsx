import React from 'react'

const LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export default function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null
  return (
    <span className={`badge badge-${difficulty.toLowerCase()}`}>
      {LABELS[difficulty.toLowerCase()] || difficulty}
    </span>
  )
}
