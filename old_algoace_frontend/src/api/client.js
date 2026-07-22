import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach X-User-ID from localStorage if available
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId')
  if (userId) config.headers['X-User-ID'] = userId
  return config
})

// ── Questions API ─────────────────────────────────────────────
export const questionsAPI = {
  list: (params) => api.get('/questions', { params }),
  get: (slug) => api.get(`/questions/${slug}`),
  search: (q, page = 1, limit = 20) => api.get('/questions/search', { params: { q, page, limit } }),
  random: (count = 1, difficulty, topics) =>
    api.get('/questions/random', { params: { count, difficulty, topics } }),
  create: (data) => api.post('/questions', data),
  update: (slug, data) => api.put(`/questions/${slug}`, data),
  delete: (slug) => api.delete(`/questions/${slug}`),
}

// ── AI API ────────────────────────────────────────────────────
export const aiAPI = {
  explain: (slug) => api.get(`/ai/explain/${slug}`),
  hint: (slug, level) => api.get(`/ai/hint/${slug}`, { params: { level } }),
  review: (slug, user_text) => api.post(`/ai/review/${slug}`, { user_text }),
  recommend: (params) => api.get('/ai/recommend', { params }),
  roadmap: (company) => api.get('/ai/roadmap', { params: { company } }),
}

// ── Users API ─────────────────────────────────────────────────
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  toggleBookmark: (slug) => api.post(`/users/bookmarks/${slug}`),
}

// ── Export API ────────────────────────────────────────────────
export const exportAPI = {
  single: (slug) => api.get(`/export/json/${slug}`, { responseType: 'blob' }),
  bulk: (slugs) => api.post('/export/json/bulk', { slugs }, { responseType: 'blob' }),
  filtered: (params) => api.get('/export/json', { params, responseType: 'blob' }),
}

// ── Health ────────────────────────────────────────────────────
export const healthAPI = {
  check: () => axios.get('/health'),
}

export default api
