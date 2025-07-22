'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { ProgressBar } from '@/components/ui/ProgressBar'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const { webApp } = useTelegram()
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Запуск TON Empire...')

  useEffect(() => {
    const loadingSteps = [
      { progress: 20, text: 'Подключение к Telegram...' },
      { progress: 40, text: 'Инициализация блокчейна...' },
      { progress: 60, text: 'Загрузка игровых данных...' },
      { progress: 80, text: 'Настройка интерфейса...' },
      { progress: 100, text: 'Готово!' }
    ]

    let stepIndex = 0
    const interval = setInterval(() => {
      if (stepIndex < loadingSteps.length) {
        const step = loadingSteps[stepIndex]
        setLoadingProgress(step.progress)
        setLoadingText(step.text)
        stepIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          if (!isLoading) {
            if (isAuthenticated) {
              router.push('/game')
            } else {
              router.push('/auth')
            }
          }
        }, 500)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Telegram WebApp инициализация
    if (webApp) {
      webApp.ready()
      webApp.expand()
    }
  }, [webApp])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-ping" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Логотип */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            TON Empire
          </h1>
          <p className="text-blue-200 text-lg">
            Блокчейн-империя будущего
          </p>
        </motion.div>

        {/* Прогресс загрузки */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-4"
        >
          <ProgressBar
            value={loadingProgress}
            max={100}
            variant="gradient"
            size="lg"
            className="mb-4"
            animated
          />
          
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-blue-100 font-medium"
          >
            {loadingText}
          </motion.p>
        </motion.div>

        {/* Анимированные иконки */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex justify-center space-x-4 mt-8"
        >
          {['🏗️', '⚔️', '💎', '🌟'].map((emoji, index) => (
            <motion.div
              key={emoji}
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2
              }}
              className="text-2xl"
            >
              {emoji}
            </motion.div>
          ))}
        </motion.div>

        {/* Версия */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 text-xs text-blue-300"
        >
          v1.0.0 Beta • Powered by TON
        </motion.div>
      </motion.div>
    </div>
  )
}