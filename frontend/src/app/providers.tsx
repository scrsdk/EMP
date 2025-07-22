'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { TelegramProvider } from '@/components/providers/TelegramProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { WebSocketProvider } from '@/components/providers/WebSocketProvider'
import { TonConnectProvider } from '@/components/providers/TonConnectProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <TelegramProvider>
        <TonConnectProvider>
          <AuthProvider>
            <WebSocketProvider>
              {children}
            </WebSocketProvider>
          </AuthProvider>
        </TonConnectProvider>
      </TelegramProvider>
    </Provider>
  )
}