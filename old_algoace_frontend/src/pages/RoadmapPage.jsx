import React, { useState } from 'react'
import { aiAPI } from '../api/client'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { Map, Search, Sparkles, Building2, ArrowRight } from 'lucide-react'

const KNOWN_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix',
  'Adobe', 'Uber', 'Lyft', 'LinkedIn', 'Salesforce', 'Oracle',
  'Nvidia', 'Airbnb', 'Stripe', 'Atlassian', 'Shopify', 'Databricks',
  'Bloomberg', 'Goldman Sachs', 'Citadel', 'Jane Street', 'Two Sigma',
]

export default function RoadmapPage() {
  const [company, setCompany] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCompany, setSelectedCompany] = useState(null)

  async function handleGenerate(target) {
    const companyName = target || company.trim()
    if (!companyName) return
    setLoading(true)
    setError(null)
    setRoadmap(null)
    setSelectedCompany(companyName)
    try {
      const { data } = await aiAPI.roadmap(companyName)
      setRoadmap(data.roadmap_markdown)
    } catch (err) {
      setError(err.response?.status === 429
        ? 'Rate limit reached. Please wait a minute and try again.'
        : 'Failed to generate roadmap. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      {/* Hero */}
      <div className="roadmap-hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 100, fontSize: 12, fontWeight: 600, color: 'var(--accent-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
          <Sparkles size={12} />
          Gemini AI Powered
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 14, lineHeight: 1.1 }}>
          Company Interview Roadmap
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Get a personalized 4-week study plan tailored to your target company's interview style and focus areas.
        </p>

        {/* Search row */}
        <div className="roadmap-search-row">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} size={16} />
            <input
              id="company-input"
              className="input"
              style={{ paddingLeft: 42 }}
              placeholder="Enter company name..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <button
            id="generate-roadmap-btn"
            className="btn btn-primary"
            disabled={(!company.trim() && !selectedCompany) || loading}
            onClick={() => handleGenerate()}
          >
            {loading
              ? <div className="spinner" style={{ width: 16, height: 16 }} />
              : <><Map size={15} /> Generate</>}
          </button>
        </div>

        {/* Company quick-pick */}
        <div className="company-grid">
          {KNOWN_COMPANIES.map((c) => (
            <button
              key={c}
              id={`company-${c.toLowerCase().replace(/\s+/g, '-')}`}
              className={`company-pill${selectedCompany === c ? ' selected' : ''}`}
              onClick={() => {
                setCompany(c)
                handleGenerate(c)
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state" style={{ marginBottom: 40 }}>
          <div className="spinner spinner-lg spinner-ai animate-pulse-glow" />
          <div>
            <p className="font-semibold" style={{ color: 'var(--ai-color)', marginBottom: 4 }}>
              Generating roadmap for {selectedCompany}...
            </p>
            <p className="text-sm text-muted">Gemini is crafting your personalized 4-week plan</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ maxWidth: 600, margin: '0 auto 32px', padding: '16px 20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: 'var(--hard)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Roadmap Result */}
      {roadmap && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 780, margin: '0 auto 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">{selectedCompany} Interview Roadmap</h2>
              <p className="text-sm text-muted">4-week personalized preparation plan</p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => handleGenerate(selectedCompany)}
            >
              <ArrowRight size={13} /> Regenerate
            </button>
          </div>
          <div className="roadmap-content">
            <MarkdownRenderer>{roadmap}</MarkdownRenderer>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!roadmap && !loading && !error && (
        <div className="empty-state" style={{ paddingBottom: 60 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent-gradient-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>
            <Map size={36} color="var(--accent-2)" />
          </div>
          <p className="empty-title">Select a company to get started</p>
          <p className="empty-sub">Click any company above or type your own to generate a tailored roadmap.</p>
        </div>
      )}
    </div>
  )
}
