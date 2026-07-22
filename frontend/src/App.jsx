import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import EvaluationDetailPage from './pages/EvaluationDetailPage'
import './App.css'

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: '4rem' }}>🔍</div>
      <h2 className="grad-text" style={{ fontFamily: 'var(--font-display)' }}>404 — Page Not Found</h2>
      <a href="/" className="btn btn-primary">Go Home</a>
    </div>
  )
}

function Unauthorized() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: '4rem' }}>🚫</div>
      <h2 className="grad-text" style={{ fontFamily: 'var(--font-display)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-muted)' }}>You don't have permission to view this page.</p>
      <a href="/" className="btn btn-secondary">Go Back</a>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Student routes */}
        <Route path="/dashboard" element={
          <PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>
        } />
        <Route path="/upload" element={
          <PrivateRoute roles={['student']}><UploadPage /></PrivateRoute>
        } />
        <Route path="/results" element={
          <PrivateRoute roles={['student']}><ResultsPage /></PrivateRoute>
        } />
        <Route path="/leaderboard" element={
          <PrivateRoute roles={['student']}><LeaderboardPage /></PrivateRoute>
        } />
        <Route path="/evaluation/:id" element={
          <PrivateRoute roles={['student', 'faculty', 'admin']}><EvaluationDetailPage /></PrivateRoute>
        } />

        {/* Faculty routes */}
        <Route path="/faculty" element={
          <PrivateRoute roles={['faculty']}><FacultyDashboard /></PrivateRoute>
        } />
        <Route path="/faculty/scripts" element={
          <PrivateRoute roles={['faculty']}><FacultyDashboard /></PrivateRoute>
        } />
        <Route path="/faculty/analytics" element={
          <PrivateRoute roles={['faculty']}><AnalyticsPage /></PrivateRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin/scripts" element={
          <PrivateRoute roles={['admin', 'faculty']}><FacultyDashboard /></PrivateRoute>
        } />
        <Route path="/admin/evaluations" element={
          <PrivateRoute roles={['admin']}><AnalyticsPage /></PrivateRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
