'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface TelegramContextType {
  webApp: any
  user: TelegramUser | null
  initDataUnsafe: any
  colorScheme: 'light' | 'dark'
  isExpanded: boolean
  viewportHeight: number
  isReady: boolean
  isTelegramEnvironment: boolean
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  } | null
}

const TelegramContext = createContext<TelegramContextType | null>(null)

// Mock user data for development/testing
const mockUser: TelegramUser = {
  id: 123456789,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en',
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 600)
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light')
  const [isExpanded, setIsExpanded] = useState(true)
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in Telegram environment
        const isTelegram = typeof window !== 'undefined' && 
          (window as any).Telegram?.WebApp !== undefined

        setIsTelegramEnvironment(isTelegram)

        if (isTelegram) {
          // Use Telegram WebApp directly instead of SDK
          const tg = (window as any).Telegram.WebApp
          
          // Get user data from Telegram
          if (tg.initDataUnsafe?.user) {
            const tgUser = tg.initDataUnsafe.user
            setTelegramUser({
              id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
              photo_url: tgUser.photo_url,
            })
          } else {
            setTelegramUser(mockUser)
          }

          // Set up viewport
          try {
            tg.expand()
            setViewportHeight(tg.viewportHeight)
            setIsExpanded(tg.isExpanded)
            
            // Listen to viewport changes
            tg.onEvent('viewportChanged', (eventData: any) => {
              setViewportHeight(eventData.viewportHeight)
              setIsExpanded(eventData.isExpanded)
            })
          } catch (error) {
            console.warn('Failed to initialize viewport:', error)
          }

          // Set up theme
          const scheme = tg.colorScheme || 'light'
          setColorScheme(scheme)
          document.documentElement.setAttribute('data-theme', scheme)
          
          // Listen to theme changes
          tg.onEvent('themeChanged', () => {
            const newScheme = tg.colorScheme || 'light'
            setColorScheme(newScheme)
            document.documentElement.setAttribute('data-theme', newScheme)
          })

          // Set ready state
          tg.ready()
        } else {
          // Development mode - use mock data
          console.log('Running in development mode with mock Telegram data')
          setTelegramUser(mockUser)
          
          // Listen to system theme changes
          if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            setColorScheme(mediaQuery.matches ? 'dark' : 'light')
            
            mediaQuery.addEventListener('change', (e) => {
              setColorScheme(e.matches ? 'dark' : 'light')
            })
          }
        }

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize Telegram Mini App:', error)
        // Fallback to mock data
        setTelegramUser(mockUser)
        setIsReady(true)
      }
    }

    init()
  }, [])

  const webApp = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null

  const hapticFeedback = webApp?.HapticFeedback ? {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => webApp.HapticFeedback.impactOccurred(style),
    notificationOccurred: (type: 'error' | 'success' | 'warning') => webApp.HapticFeedback.notificationOccurred(type),
    selectionChanged: () => webApp.HapticFeedback.selectionChanged(),
  } : null

  const contextValue: TelegramContextType = {
    webApp,
    user: telegramUser,
    initDataUnsafe: isTelegramEnvironment ? {} : { user: mockUser },
    colorScheme,
    isExpanded,
    viewportHeight,
    isReady,
    isTelegramEnvironment,
    hapticFeedback,
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}