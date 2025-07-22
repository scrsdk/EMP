'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegram } from '@/hooks/useTelegram'
import { useAuth } from '@/hooks/useAuth'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { webApp, user, hapticFeedback, isTelegramEnvironment } = useTelegram()
  const { login, isLoading } = useAuthContext()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/game')
    }
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    hapticFeedback?.impactOccurred('medium')
    await login()
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-primary blur-3xl opacity-20 animate-pulse-custom" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-warning blur-3xl opacity-20 animate-pulse-custom" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-gradient-success blur-2xl opacity-20 animate-bounce-custom" style={{animationDelay: '0.5s'}} />
      
      <div className="w-full max-w-sm space-y-8 relative z-10 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-primary blur-3xl opacity-50" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className="relative w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 shadow-2xl"
            >
              <div className="text-6xl">🏰</div>
            </motion.div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white text-gradient">
              Империя TON
            </h1>
            <p className="text-white/80">
              Постройте свою блокчейн-империю
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {user ? (
            <div className="glass-card text-center space-y-3 p-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl text-white font-bold shadow-lg">
                {user.first_name?.[0]?.toUpperCase() || '👤'}
              </div>
              <div>
                <p className="text-sm text-secondary">Добро пожаловать</p>
                <p className="text-xl font-bold mt-1">
                  {user.first_name} {user.last_name}
                </p>
                {user.username && (
                  <p className="text-sm text-secondary mt-1">@{user.username}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card text-center p-6">
              <p className="text-lg">
                👋 Привет, император!
              </p>
              <p className="text-secondary mt-2">
                Войдите через Telegram для начала игры
              </p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                <span>Подключаемся...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🎮</span>
                <span>Войти в империю</span>
              </>
            )}
          </button>

          {!isTelegramEnvironment && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card text-center p-4 border border-yellow-400/30 bg-yellow-400/10"
            >
              <p className="text-sm font-medium flex items-center justify-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>Откройте приложение в Telegram</span>
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-white/60 text-center">
            Продолжая, вы соглашаетесь с 
            <a href="#" className="text-white/80 underline">условиями использования</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}