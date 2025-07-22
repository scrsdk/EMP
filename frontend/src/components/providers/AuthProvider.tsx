'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useDispatch } from 'react-redux'
import { useTelegram } from './TelegramProvider'
import { useLoginWithTelegramMutation } from '@/store/api/apiSlice'
import { setCredentials, setLoading } from '@/store/slices/authSlice'
import { User } from '@/types/user'
import { AppDispatch } from '@/store/store'

interface AuthContextType {
  login: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { initDataUnsafe, isReady } = useTelegram()
  const [loginWithTelegram, { isLoading }] = useLoginWithTelegramMutation()

  const login = async () => {
    if (!initDataUnsafe) {
      console.error('No Telegram init data available')
      return
    }

    try {
      // In development mode, use mock authentication
      if (process.env.NODE_ENV === 'development' && !initDataUnsafe.auth_date) {
        console.log('Using mock authentication for development')
        
        // Mock user data for development
        const mockUser: User = {
          id: '123456789',
          telegram_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          level: 5,
          experience: 1250,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        }

        dispatch(setCredentials({
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }))
        return
      }

      // Real Telegram authentication
      const result = await loginWithTelegram(initDataUnsafe).unwrap()
      dispatch(setCredentials({
        user: result.user,
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
      }))
    } catch (error) {
      console.error('Login failed:', error)
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Authentication failed, falling back to mock data')
        const mockUser: User = {
          id: '123456789',
          telegram_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          level: 5,
          experience: 1250,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        }

        dispatch(setCredentials({
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }))
      } else {
        dispatch(setLoading(false))
      }
    }
  }

  useEffect(() => {
    if (isReady && initDataUnsafe) {
      // Auto-login when Telegram is ready
      login()
    } else if (isReady && process.env.NODE_ENV === 'development') {
      // In development, login even without real Telegram data
      login()
    } else {
      dispatch(setLoading(false))
    }
  }, [isReady, initDataUnsafe])

  return (
    <AuthContext.Provider value={{ login, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}