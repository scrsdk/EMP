'use client'

import { BottomNav } from '@/components/navigation/BottomNav'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="main-content pb-nav">
        {children}
      </main>
      <BottomNav />
    </>
  )
}