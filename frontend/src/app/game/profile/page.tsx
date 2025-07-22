'use client'

import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { webApp, hapticFeedback } = useTelegram()

  const handleLogout = () => {
    hapticFeedback?.impactOccurred('medium')
    logout()
    webApp?.close()
  }

  const handleMenuClick = () => {
    hapticFeedback?.impactOccurred('light')
  }

  return (
    <div className="page-container pb-nav">
      {/* Header */}
      <div className="app-header header-gradient">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Профиль</h1>
            <p className="text-white/80 text-sm">
              Управляйте своей империей
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <div className="premium-card space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg flex items-center justify-center text-3xl border border-white/20">
                {user?.username?.[0]?.toUpperCase() || '👤'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-warning flex items-center justify-center text-xs font-bold text-white">
                {user?.level || 1}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.username || 'Император'}</h2>
              <p className="text-white/80">Уровень {user?.level || 1} • 2,450 XP</p>
              <div className="mt-2">
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-gradient-warning rounded-full" style={{width: '65%'}} />
                </div>
                <p className="text-xs text-white/60 mt-1">До следующего уровня: 550 XP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card text-center space-y-2">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="text-lg font-bold text-gradient">47</div>
              <div className="text-xs text-secondary">Достижения</div>
            </div>
          </div>
          <div className="glass-card text-center space-y-2">
            <div className="text-2xl">👥</div>
            <div>
              <div className="text-lg font-bold text-gradient">1,234</div>
              <div className="text-xs text-secondary">Население</div>
            </div>
          </div>
          <div className="glass-card text-center space-y-2">
            <div className="text-2xl">💎</div>
            <div>
              <div className="text-lg font-bold text-gradient">8,905</div>
              <div className="text-xs text-secondary">Богатство</div>
            </div>
          </div>
          <div className="glass-card text-center space-y-2">
            <div className="text-2xl">⚔️</div>
            <div>
              <div className="text-lg font-bold text-gradient">156</div>
              <div className="text-xs text-secondary">Победы</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <div className="glass-card">
            <button 
              onClick={handleMenuClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-xl">
                  🏆
                </div>
                <div className="text-left">
                  <div className="font-semibold">Достижения</div>
                  <div className="text-sm text-secondary">47 из 120 получено</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>

          <div className="glass-card">
            <button 
              onClick={handleMenuClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-xl">
                  📊
                </div>
                <div className="text-left">
                  <div className="font-semibold">Статистика</div>
                  <div className="text-sm text-secondary">Подробная аналитика игры</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>

          <div className="glass-card">
            <button 
              onClick={handleMenuClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-warning flex items-center justify-center text-xl">
                  💎
                </div>
                <div className="text-left">
                  <div className="font-semibold">Премиум</div>
                  <div className="text-sm text-secondary">Улучшите свой опыт игры</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>

          <div className="glass-card">
            <button 
              onClick={handleMenuClick}
              className="w-full flex items-center justify-between p-2 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center text-xl">
                  ⚙️
                </div>
                <div className="text-left">
                  <div className="font-semibold">Настройки</div>
                  <div className="text-sm text-secondary">Звук, уведомления, язык</div>
                </div>
              </div>
              <div className="text-accent text-lg">→</div>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="btn-danger"
          >
            Выйти из игры
          </button>
        </div>
      </div>
    </div>
  )
}