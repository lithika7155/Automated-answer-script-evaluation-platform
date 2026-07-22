import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { questionsAPI, usersAPI } from '../api/client'
import QuestionCard from '../components/QuestionCard'
import FilterSidebar from '../components/FilterSidebar'
import { SkeletonCard } from '../components/SkeletonCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const DEFAULT_FILTERS = {
  topics: [],
  difficulty: [],
  sort_by: 'frequency_score',
  companies: [],
  tags: [],
}

export default function QuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [bookmarks, setBookmarks] = useState([])
  const [filters, setFilters] = useState(() => {
    const topic = searchParams.get('topic')
    return { ...DEFAULT_FILTERS, topics: topic ? [topic] : [] }
  })
  const [showSidebar, setShowSidebar] = useState(true)
  const searchTimeout = useRef(null)
  const LIMIT = 20

  // Load bookmarks from profile
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) return
    usersAPI.getProfile().then(({ data }) => {
      setBookmarks(data.bookmarked_slugs || [])
    }).catch(() => {})
  }, [])

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: LIMIT,
        sort_by: filters.sort_by,
      }
      if (filters.topics?.length) params.topics = filters.topics
      if (filters.difficulty?.length) params.difficulty = filters.difficulty
      if (filters.companies?.length) params.companies = filters.companies
      if (filters.tags?.length) params.tags = filters.tags

      const { data } = searchActive && query.length >= 2
        ? await questionsAPI.search(query, page, LIMIT)
        : await questionsAPI.list(params)

      setQuestions(data.items || [])
      setTotal(data.total || 0)
    } catch {
      setQuestions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, filters, query, searchActive])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // Debounced search
  function handleSearch(val) {
    setQuery(val)
    clearTimeout(searchTimeout.current)
    if (val.length < 2) {
      setSearchActive(false)
      return
    }
    searchTimeout.current = setTimeout(() => {
      setSearchActive(true)
      setPage(1)
    }, 400)
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
    setPage(1)
    setSearchActive(false)
    setQuery('')
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    setSearchActive(false)
    setQuery('')
  }

  async function handleBookmark(slug) {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      alert('Please set your User ID in the top navbar first.')
      return
    }
    try {
      const { data } = await usersAPI.toggleBookmark(slug)
      setBookmarks(data.bookmarked_slugs || [])
    } catch {}
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="container">
      <div className="questions-layout">
        {/* ── Sidebar ────────────────────────────────── */}
        {showSidebar && (
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />
        )}

        {/* ── Main Content ────────────────────────────── */}
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingTop: 24 }}>
            <div className="search-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <Search className="search-icon" size={16} />
              <input
                id="questions-search"
                className="search-input"
                placeholder="Search problems..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {query && (
                <button
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  onClick={() => { setQuery(''); setSearchActive(false); }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              className={`btn btn-secondary btn-icon`}
              title="Toggle filters"
              onClick={() => setShowSidebar((v) => !v)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* Count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p className="text-sm text-muted">
              {loading ? 'Loading...' : `${total.toLocaleString()} problem${total !== 1 ? 's' : ''} found`}
            </p>
            {searchActive && (
              <span className="badge badge-ai">Search: "{query}"</span>
            )}
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : questions.length === 0
              ? (
                <div className="empty-state">
                  <div className="empty-icon"><Search size={26} /></div>
                  <p className="empty-title">No problems found</p>
                  <p className="empty-sub">Try adjusting your filters or search query.</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleReset}>Clear Filters</button>
                </div>
              )
              : questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={(page - 1) * LIMIT + i + 1}
                  onBookmark={handleBookmark}
                  isBookmarked={bookmarks.includes(q.slug)}
                />
              ))
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p
                if (totalPages <= 7) p = i + 1
                else if (page <= 4) p = i + 1
                else if (page >= totalPages - 3) p = totalPages - 6 + i
                else p = page - 3 + i
                return (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                    id={`page-btn-${p}`}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                className="page-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
