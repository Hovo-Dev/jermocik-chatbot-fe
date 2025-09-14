'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthButtons } from './AuthButtons'
import { TrendingUp, Lock } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Lock className="h-10 w-10 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to FinBot AI
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Your intelligent financial assistant. Please sign in to access advanced financial analysis, market insights, and personalized investment guidance.
          </p>
          
          <div className="pt-4">
            <AuthButtons />
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Secure • Private • Professional Financial Intelligence
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
