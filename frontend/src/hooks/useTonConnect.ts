'use client'

import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react'
import { useCallback, useEffect, useState } from 'react'
import { useNotifications } from './useNotifications'

export interface TonTransaction {
  to: string
  value: string
  body?: string
  stateInit?: string
}

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const address = useTonAddress()
  const wallet = useTonWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [balance, setBalance] = useState<string>('0')
  const { success, error } = useNotifications()

  const isConnected = !!wallet
  const shortAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TON_RPC_URL}/getAddressBalance?address=${address}`
      )
      const data = await response.json()
      
      if (data.ok) {
        // Convert nanograms to TON (1 TON = 10^9 nanograms)
        const balanceInTon = (parseInt(data.result) / 1e9).toFixed(4)
        setBalance(balanceInTon)
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err)
    }
  }, [address])

  // Connect wallet
  const connect = useCallback(async () => {
    if (isConnected) return

    setIsConnecting(true)
    try {
      await tonConnectUI.connectWallet()
      success('Wallet Connected', 'Your TON wallet has been connected successfully!')
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      error('Connection Failed', 'Failed to connect your TON wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }, [tonConnectUI, isConnected, success, error])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    if (!isConnected) return

    try {
      await tonConnectUI.disconnect()
      setBalance('0')
      success('Wallet Disconnected', 'Your TON wallet has been disconnected.')
    } catch (err) {
      console.error('Failed to disconnect wallet:', err)
      error('Disconnection Failed', 'Failed to disconnect your wallet.')
    }
  }, [tonConnectUI, isConnected, success, error])

  // Send transaction
  const sendTransaction = useCallback(async (transaction: TonTransaction) => {
    if (!isConnected) {
      error('Wallet Not Connected', 'Please connect your TON wallet first.')
      return null
    }

    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60, // 1 minute
        messages: [
          {
            address: transaction.to,
            amount: transaction.value,
            payload: transaction.body,
            stateInit: transaction.stateInit,
          },
        ],
      })

      success('Transaction Sent', 'Your transaction has been submitted to the TON network.')
      return result
    } catch (err) {
      console.error('Failed to send transaction:', err)
      error('Transaction Failed', 'Failed to send transaction. Please try again.')
      return null
    }
  }, [tonConnectUI, isConnected, success, error])

  // Purchase game tokens with TON
  const purchaseGameTokens = useCallback(async (tonAmount: number) => {
    if (!isConnected) {
      await connect()
      return
    }

    const transaction: TonTransaction = {
      to: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || 'EQD__NOT_SET__',
      value: (tonAmount * 1e9).toString(), // Convert TON to nanograms
      body: 'te6cckEBAQEADgAAGB==', // Base64 encoded "purchase_tokens" command
    }

    const result = await sendTransaction(transaction)
    if (result) {
      // Refresh balance after transaction
      setTimeout(fetchBalance, 3000)
    }
    return result
  }, [isConnected, connect, sendTransaction, fetchBalance])

  // Claim rewards from smart contract
  const claimRewards = useCallback(async () => {
    if (!isConnected) {
      error('Wallet Not Connected', 'Please connect your TON wallet to claim rewards.')
      return
    }

    const transaction: TonTransaction = {
      to: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || 'EQD__NOT_SET__',
      value: '10000000', // 0.01 TON for gas
      body: 'te6cckEBAQEADgAAGB==', // Base64 encoded "claim_rewards" command
    }

    return await sendTransaction(transaction)
  }, [isConnected, sendTransaction, error])

  // Effects
  useEffect(() => {
    if (address) {
      fetchBalance()
    }
  }, [address, fetchBalance])

  // Listen to wallet connection status changes
  useEffect(() => {
    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      if (walletInfo) {
        console.log('Wallet connected:', walletInfo)
      } else {
        console.log('Wallet disconnected')
        setBalance('0')
      }
    })

    return unsubscribe
  }, [tonConnectUI])

  return {
    // Wallet state
    isConnected,
    isConnecting,
    address,
    shortAddress,
    balance,
    wallet,
    
    // Wallet actions
    connect,
    disconnect,
    sendTransaction,
    
    // Game-specific actions
    purchaseGameTokens,
    claimRewards,
    
    // Utilities
    fetchBalance,
  }
}