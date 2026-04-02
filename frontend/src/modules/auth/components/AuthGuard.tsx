import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return <LoadingSkeleton />
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
