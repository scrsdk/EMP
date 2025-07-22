'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTelegram } from '@/hooks/useTelegram'

interface NavItem {
  href: string
  label: string
  icon: string
  activeIcon: string
}

const navItems: NavItem[] = [
  {
    href: '/game',
    label: 'Город',
    icon: '🏰',
    activeIcon: '🏰',
  },
  {
    href: '/game/world',
    label: 'Мир',
    icon: '🌍',
    activeIcon: '🌎',
  },
  {
    href: '/game/guild',
    label: 'Гильдия',
    icon: '⚔️',
    activeIcon: '🛡️',
  },
  {
    href: '/game/market',
    label: 'Рынок',
    icon: '💰',
    activeIcon: '💎',
  },
  {
    href: '/game/profile',
    label: 'Профиль',
    icon: '👤',
    activeIcon: '👑',
  },
]

export function BottomNav() {
  const pathname = usePathname()
  const { hapticFeedback } = useTelegram()

  const handleNavClick = () => {
    hapticFeedback?.impactOccurred('light')
  }

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/game' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item no-select ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <div className="nav-item-icon">
                {isActive ? item.activeIcon : item.icon}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 rounded-full bg-accent glow-accent" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}