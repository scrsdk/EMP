'use client'

import { ReactNode } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

const manifestUrl = process.env.NEXT_PUBLIC_TON_CONNECT_MANIFEST_URL || 
  'https://ton-empire.com/tonconnect-manifest.json'

export function TonConnectProvider({ children }: { children: ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  )
}