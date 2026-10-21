import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/admin/ui'
import Site from '@/pages/Site'

// The admin panel is split out so visitors never download it.
const Admin = lazy(() => import('@/pages/admin/Admin'))
const AdminLogin = lazy(() => import('@/pages/admin/Login'))

/** Auth and toasts only exist under /admin; the public site never touches them. */
function AdminRoot() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/admin" element={<AdminRoot />}>
          <Route index element={<Admin />} />
          <Route path="login" element={<AdminLogin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
