'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

interface GameSettings {
  notifications: {
    sound: boolean
    push: boolean
    battles: boolean
    resources: boolean
    guild: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    animations: boolean
    vibration: boolean
  }
  privacy: {
    showOnlineStatus: boolean
    allowFriendRequests: boolean
    showInLeaderboards: boolean
  }
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [settings, setSettings] = useState<GameSettings>({
    notifications: {
      sound: true,
      push: true,
      battles: true,
      resources: true,
      guild: true,
    },
    display: {
      theme: 'auto',
      language: 'en',
      animations: true,
      vibration: true,
    },
    privacy: {
      showOnlineStatus: true,
      allowFriendRequests: true,
      showInLeaderboards: true,
    },
  })

  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'display' | 'privacy' | 'about'>('account')

  const updateSetting = (section: keyof GameSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const saveSettings = async () => {
    try {
      // API call to save settings
      console.log('Saving settings:', settings)
      // Show success notification
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const sections = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your game experience and account preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-64"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {activeSection === 'account' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Account Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        @{user?.username || 'username'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Level {user?.level || 1} • {user?.experience || 0} XP
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telegram ID
                      </label>
                      <input
                        type="text"
                        value={user?.telegram_id || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Account Actions
                    </h4>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        📊 Export Account Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                        onClick={logout}
                      >
                        🚪 Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Notification Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      General Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sound Effects
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Play sound effects for game actions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.sound}
                          onChange={(e) => updateSetting('notifications', 'sound', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Push Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Receive notifications when app is closed
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Game Events
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Battle Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Notify when attacked or battles end
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.battles}
                          onChange={(e) => updateSetting('notifications', 'battles', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Resource Ready
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Notify when resources are ready to collect
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.resources}
                          onChange={(e) => updateSetting('notifications', 'resources', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Guild Activities
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Notify about guild events and messages
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.guild}
                          onChange={(e) => updateSetting('notifications', 'guild', e.target.checked)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Display Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) => updateSetting('display', 'theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="auto">Auto (System)</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.display.language}
                      onChange={(e) => updateSetting('display', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Animations
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Enable smooth animations and transitions
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.display.animations}
                        onChange={(e) => updateSetting('display', 'animations', e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Vibration
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Enable haptic feedback on supported devices
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.display.vibration}
                        onChange={(e) => updateSetting('display', 'vibration', e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Privacy Settings
                </h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show Online Status
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Allow other players to see when you're online
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.showOnlineStatus}
                        onChange={(e) => updateSetting('privacy', 'showOnlineStatus', e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow Friend Requests
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Let other players send you friend requests
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.allowFriendRequests}
                        onChange={(e) => updateSetting('privacy', 'allowFriendRequests', e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Show in Leaderboards
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Display your profile in public leaderboards
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.privacy.showInLeaderboards}
                        onChange={(e) => updateSetting('privacy', 'showInLeaderboards', e.target.checked)}
                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  About TON Empire
                </h2>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏛️</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      TON Empire
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Build, Battle, Conquer on the TON Blockchain
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      Version 1.0.0 Beta
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      📖 Help & FAQ
                    </Button>
                    <Button variant="outline" className="justify-start">
                      💬 Community Discord
                    </Button>
                    <Button variant="outline" className="justify-start">
                      🐛 Report Bug
                    </Button>
                    <Button variant="outline" className="justify-start">
                      ⭐ Rate on App Store
                    </Button>
                  </div>

                  <div className="text-center text-xs text-gray-500 dark:text-gray-500">
                    <p>© 2024 TON Empire. All rights reserved.</p>
                    <p className="mt-1">
                      <a href="#" className="hover:text-primary-600">Privacy Policy</a> • 
                      <a href="#" className="hover:text-primary-600 ml-1">Terms of Service</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection !== 'about' && activeSection !== 'account' && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={saveSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}