import React from 'react'

export function SkeletonCard() {
  return (
    <div className="q-card" style={{ cursor: 'default', pointerEvents: 'none' }}>
      <div className="skeleton" style={{ width: 24, height: 16, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '65%', height: 16, marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 20 }} />
          <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 20 }} />
          <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 20 }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: 60, height: 12, flexShrink: 0 }} />
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ width: '50%', height: 28 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 20 }} />
        <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 20 }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 12 }} />
      <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 16 }} />
    </div>
  )
}

export function SkeletonText({ lines = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ width: i % 3 === 2 ? '70%' : '100%', height: 14 }}
        />
      ))}
    </div>
  )
}
