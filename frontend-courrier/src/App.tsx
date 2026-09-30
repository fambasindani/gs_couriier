import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/stores/auth.store'

export default function App() {
  const logout = useAuthStore((state) => state.logout)
  const fetchMe = useAuthStore((state) => state.fetchMe)

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    void fetchMe()
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [logout, fetchMe])

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
