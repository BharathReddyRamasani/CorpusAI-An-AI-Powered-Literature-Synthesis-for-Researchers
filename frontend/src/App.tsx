import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PapersPage from './pages/PapersPage'
import PaperDetailPage from './pages/PaperDetailPage'
import ProfilePage from './pages/ProfilePage'
import GlobalResearchPage from './pages/GlobalResearchPage'
import { useAuthStore } from './store/authStore'
import { Spinner } from './components/ui/Spinner'

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isHydrated } = useAuthStore()

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isHydrated } = useAuthStore()

  if (!isHydrated) return null

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}

const AnimatedRoutes = () => {
  const location = useLocation()
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <PageWrapper><LoginPage /></PageWrapper>
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <PageWrapper><RegisterPage /></PageWrapper>
            </PublicRoute>
          } 
        />

        {/* Protected Routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
          <Route path="papers" element={<PageWrapper><PapersPage /></PageWrapper>} />
          <Route path="papers/:paperId" element={<PageWrapper><PaperDetailPage /></PageWrapper>} />
          <Route path="global-research" element={<PageWrapper><GlobalResearchPage /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  const { hydrate } = useAuthStore()

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
