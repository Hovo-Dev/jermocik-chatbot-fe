export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}
