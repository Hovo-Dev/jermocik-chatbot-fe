'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut } from 'lucide-react'

export function AuthButtons() {
  const { user, logout, isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)


  const handleLogout = async () => {
    await logout()
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">
            {user.first_name} {user.last_name}
          </span>
          <span className="sm:hidden">
            {user.username}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLogin(true)}
          className="px-6"
        >
          Sign In
        </Button>
        <Button
          size="sm"
          onClick={() => setShowRegister(true)}
          className="px-6"
        >
          Sign Up
        </Button>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => setShowRegister(true)}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => setShowLogin(true)}
      />
    </>
  )
}
