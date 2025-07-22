'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTonConnect } from '@/hooks/useTonConnect'

export function BlockchainStatus() {
  const { isConnected, address, balance } = useTonConnect()
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_TON_RPC_URL || 'https://testnet.toncenter.com/api/v2/jsonRPC',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: '1',
              jsonrpc: '2.0',
              method: 'getMasterchainInfo',
            }),
          }
        )
        
        if (response.ok) {
          setNetworkStatus('online')
        } else {
          setNetworkStatus('offline')
        }
      } catch (error) {
        setNetworkStatus('offline')
      }
    }

    checkNetworkStatus()
    const interval = setInterval(checkNetworkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (networkStatus) {
      case 'online':
        return 'text-green-600 dark:text-green-400'
      case 'offline':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-yellow-600 dark:text-yellow-400'
    }
  }

  const getStatusIcon = () => {
    switch (networkStatus) {
      case 'online':
        return '🟢'
      case 'offline':
        return '🔴'
      default:
        return '🟡'
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 text-sm z-40"
      >
        <div className="flex items-center space-x-2 mb-2">
          <span>{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            TON {process.env.NEXT_PUBLIC_TON_NETWORK?.toUpperCase()} Network
          </span>
        </div>
        
        {isConnected && address && (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>
              Wallet: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div>
              Balance: {parseFloat(balance).toFixed(4)} TON
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          Blockchain Status
        </div>
      </motion.div>
    )
  }

  return null // Don't show in production
}