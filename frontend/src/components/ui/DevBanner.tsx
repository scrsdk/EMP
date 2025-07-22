'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function DevBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (process.env.NODE_ENV !== 'development' || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 text-sm font-medium"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <span>🚧</span>
            <span>Development Mode - Using Mock Data</span>
            <span className="text-xs opacity-75">
              (Telegram authentication and API calls are mocked)
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-black hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}