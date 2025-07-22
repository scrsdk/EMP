import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { NotificationProvider } from '@/components/ui/Notification'

export const metadata: Metadata = {
  title: 'TON Empire',
  description: 'Постройте свою блокчейн-империю в TON',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#0088cc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0088cc" />
        <meta name="telegram-miniapp" content="true" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-primary font-inter">
        <div className="app-container">
          <Providers>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </Providers>
        </div>
      </body>
    </html>
  )
}