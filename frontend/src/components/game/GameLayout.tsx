'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { NotificationContainer } from '@/components/ui/NotificationContainer'

interface GameLayoutProps {
  children: ReactNode
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <NotificationContainer />
    </div>
  )
}