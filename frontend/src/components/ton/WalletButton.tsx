'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTonConnect } from '@/hooks/useTonConnect'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'

interface WalletButtonProps {
  variant?: 'default' | 'compact' | 'minimal'
  showBalance?: boolean
}

export function WalletButton({ variant = 'default', showBalance = true }: WalletButtonProps) {
  const {
    isConnected,
    isConnecting,
    shortAddress,
    balance,
    connect,
    disconnect,
  } = useTonConnect()
  
  const [showDropdown, setShowDropdown] = useState(false)

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        isLoading={isConnecting}
        variant={variant === 'minimal' ? 'outline' : 'primary'}
        size={variant === 'compact' ? 'sm' : 'md'}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
      </Button>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="text-blue-600 dark:text-blue-400"
        >
          💎 {shortAddress}
        </Button>
        
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-48 z-50"
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Balance: {balance} TON
              </div>
              <Button
                onClick={disconnect}
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white font-medium">
            💎 {shortAddress}
          </div>
          {showBalance && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {balance} TON
            </div>
          )}
        </div>
        <Button
          onClick={disconnect}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          ×
        </Button>
      </div>
    )
  }

  // Default variant
  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        <div className="flex items-center space-x-2">
          <span>💎</span>
          <div className="text-left">
            <div className="text-sm font-medium">{shortAddress}</div>
            {showBalance && (
              <div className="text-xs opacity-90">{formatNumber(parseFloat(balance))} TON</div>
            )}
          </div>
        </div>
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-64 z-50"
          >
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                TON Wallet
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {shortAddress}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {balance} TON
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Available Balance
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Add purchase tokens functionality
                  console.log('Purchase tokens clicked')
                }}
              >
                💰 Purchase Game Tokens
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  // Add claim rewards functionality
                  console.log('Claim rewards clicked')
                }}
              >
                🎁 Claim Rewards
              </Button>
              
              <Button
                onClick={disconnect}
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🚪 Disconnect Wallet
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}