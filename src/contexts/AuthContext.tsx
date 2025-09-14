'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import toast from 'react-hot-toast'
import type { User, AuthTokens, LoginCredentials, RegisterCredentials, AuthState, AuthResponse } from '@/types/auth'

// API Base URL - adjust this based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_REFRESH'; payload: AuthTokens }

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'TOKEN_REFRESH':
      return {
        ...state,
        tokens: action.payload,
        isLoading: false
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = localStorage.getItem('auth_tokens')
      if (tokens) {
        try {
          const parsedTokens = JSON.parse(tokens)
          // Verify token is still valid by fetching profile
          const response = await fetch(`${API_BASE_URL}/accounts/me/`, {
            headers: {
              'Authorization': `Bearer ${parsedTokens.access}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const userData = await response.json()
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: userData.data, tokens: parsedTokens }
            })
          } else {
            // Token invalid, try to refresh
            try {
              const refreshResponse = await fetch(`${API_BASE_URL}/accounts/refresh-token/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: parsedTokens.refresh })
              })

              const refreshData = await refreshResponse.json()

              if (refreshResponse.ok) {
                const newTokens = {
                  access: refreshData.access,
                  refresh: parsedTokens.refresh // Keep the same refresh token
                }
                
                localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
                dispatch({ type: 'TOKEN_REFRESH', payload: newTokens })
              } else {
                throw new Error('Token refresh failed')
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError)
              localStorage.removeItem('auth_tokens')
              dispatch({ type: 'AUTH_FAILURE' })
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('auth_tokens')
          dispatch({ type: 'AUTH_FAILURE' })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    // Don't dispatch AUTH_START to avoid affecting global loading state
    // The modal will handle its own loading state
    
    try {
      // Add timeout to prevent infinite loading
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      const data = await response.json()

      if (response.ok) {
        // Check if we have the required data structure
        if (data.user && data.access && data.refresh) {
          const authData: AuthResponse = {
            user: data.user,
            access: data.access,
            refresh: data.refresh
          }
          
          localStorage.setItem('auth_tokens', JSON.stringify({
            access: authData.access,
            refresh: authData.refresh
          }))
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: authData.user, tokens: { access: authData.access, refresh: authData.refresh } }
          })
          
          toast.success('Login successful!')
        } else {
          // Response is ok but missing required data
          console.error('Login response missing required data:', data)
          toast.error('Invalid Credentials')
          throw new Error('Invalid Credentials')
        }
      } else {
        // Backend returned an error
        console.error('Login failed:', data)
        toast.error('Invalid Credentials')
        throw new Error('Invalid Credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Don't dispatch any state changes - let the modal handle its own loading
      
      // If it's not our custom error, it's a network error
      if (!(error instanceof Error && error.message === 'Invalid Credentials')) {
        console.error('Network error during login:', error)
        toast.error('Invalid Credentials')
        throw new Error('Invalid Credentials')
      }
      
      // Re-throw our custom error
      throw error
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok) {
        const authData: AuthResponse = {
          user: data.data.user,
          access: data.data.access,
          refresh: data.data.refresh
        }
        
        localStorage.setItem('auth_tokens', JSON.stringify({
          access: authData.access,
          refresh: authData.refresh
        }))
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: authData.user, tokens: { access: authData.access, refresh: authData.refresh } }
        })
      } else {
        throw new Error(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }

  const logout = async () => {
    try {
      if (state.tokens?.refresh) {
        await fetch(`${API_BASE_URL}/accounts/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh: state.tokens.refresh })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth_tokens')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshToken = useCallback(async () => {
    if (!state.tokens?.refresh) {
      dispatch({ type: 'AUTH_FAILURE' })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/refresh-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: state.tokens.refresh })
      })

      const data = await response.json()

      if (response.ok) {
        const newTokens = {
          access: data.access,
          refresh: state.tokens.refresh // Keep the same refresh token
        }
        
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
        dispatch({ type: 'TOKEN_REFRESH', payload: newTokens })
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      localStorage.removeItem('auth_tokens')
      dispatch({ type: 'AUTH_FAILURE' })
    }
  }, [state.tokens?.refresh])

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
