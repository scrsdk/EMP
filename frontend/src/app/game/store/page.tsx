'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTelegram } from '@/hooks/useTelegram'
import { useNotifications } from '@/components/ui/Notification'
import { BottomNav } from '@/components/navigation/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, GameBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { formatNumber } from '@/lib/format'

interface StoreItem {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: 'gold' | 'gems' | 'ton'
  category: 'resources' | 'boosters' | 'special' | 'heroes'
  discount?: number
  limited?: boolean
  quantity?: number
}

export default function StorePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const { addNotification } = useNotifications()
  
  const [activeCategory, setActiveCategory] = useState<'all' | 'resources' | 'boosters' | 'special' | 'heroes'>('all')
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  const [userBalance] = useState({
    gold: 125430,
    gems: 450,
    ton: 50
  })

  const storeItems: StoreItem[] = [
    {
      id: '1',
      name: 'Сундук золота',
      description: 'Получите 10,000 золота мгновенно',
      icon: '💰',
      price: 100,
      currency: 'gems',
      category: 'resources',
      discount: 20
    },
    {
      id: '2',
      name: 'Набор ресурсов',
      description: '5000 золота, 2000 дерева, 1500 камня',
      icon: '📦',
      price: 150,
      currency: 'gems',
      category: 'resources'
    },
    {
      id: '3',
      name: 'Ускорение x2',
      description: 'Удвойте производство на 24 часа',
      icon: '⚡',
      price: 200,
      currency: 'gems',
      category: 'boosters',
      limited: true
    },
    {
      id: '4',
      name: 'Щит защиты',
      description: 'Защита от атак на 3 дня',
      icon: '🛡️',
      price: 300,
      currency: 'gems',
      category: 'boosters'
    },
    {
      id: '5',
      name: 'VIP статус',
      description: '+50% к производству, эксклюзивные бонусы',
      icon: '👑',
      price: 10,
      currency: 'ton',
      category: 'special',
      limited: true
    },
    {
      id: '6',
      name: 'Легендарный герой',
      description: 'Могущественный воин для вашей армии',
      icon: '🦸',
      price: 500,
      currency: 'gems',
      category: 'heroes',
      discount: 30
    },
    {
      id: '7',
      name: 'Строитель',
      description: 'Дополнительный слот для строительства',
      icon: '👷',
      price: 5,
      currency: 'ton',
      category: 'special'
    },
    {
      id: '8',
      name: 'Мгновенное строительство',
      description: 'Завершить любое строительство',
      icon: '🏗️',
      price: 50,
      currency: 'gems',
      category: 'boosters',
      quantity: 5
    }
  ]

  const categories = [
    { id: 'all' as const, label: 'Все', icon: '🏪' },
    { id: 'resources' as const, label: 'Ресурсы', icon: '💎' },
    { id: 'boosters' as const, label: 'Ускорители', icon: '🚀' },
    { id: 'special' as const, label: 'Особые', icon: '⭐' },
    { id: 'heroes' as const, label: 'Герои', icon: '🦸' }
  ]

  const filteredItems = activeCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === activeCategory)

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'gold': return '💰'
      case 'gems': return '💎'
      case 'ton': return '💎'
      default: return '💰'
    }
  }

  const handlePurchase = (item: StoreItem) => {
    hapticFeedback?.impactOccurred('light')
    setSelectedItem(item)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = () => {
    if (!selectedItem) return

    const balance = userBalance[selectedItem.currency]
    const finalPrice = selectedItem.discount 
      ? Math.floor(selectedItem.price * (100 - selectedItem.discount) / 100)
      : selectedItem.price

    if (balance >= finalPrice) {
      hapticFeedback?.impactOccurred('heavy')
      
      addNotification({
        type: 'success',
        title: 'Покупка успешна!',
        message: `Вы приобрели ${selectedItem.name}`,
        icon: selectedItem.icon,
        sound: true
      })
      
      setShowPurchaseModal(false)
    } else {
      addNotification({
        type: 'error',
        title: 'Недостаточно средств',
        message: `Нужно ${finalPrice} ${getCurrencyIcon(selectedItem.currency)}`,
        icon: '❌'
      })
    }
  }

  return (
    <div className="min-h-screen bg-tg-bg pb-20">
      {/* Хедер */}
      <motion.div 
        className="bg-surface border-b border-surface/20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="w-8 h-8"
                >
                  ←
                </Button>
              </motion.div>
              <h1 className="font-semibold text-lg">Магазин</h1>
            </div>
            
            {/* Баланс */}
            <div className="flex items-center gap-2">
              <Badge variant="glass" size="sm">
                💰 {formatNumber(userBalance.gold)}
              </Badge>
              <Badge variant="glass" size="sm">
                💎 {userBalance.gems}
              </Badge>
              <Badge variant="premium" size="sm">
                💠 {userBalance.ton}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Категории */}
      <div className="px-4 py-3 bg-surface/50">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                hapticFeedback?.impactOccurred('light')
                setActiveCategory(category.id)
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-tg-button text-white'
                  : 'bg-surface text-tg-hint hover:text-tg-text'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Товары */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                variant="outlined" 
                interactive
                onClick={() => handlePurchase(item)}
                className="p-4 relative overflow-hidden"
              >
                {item.discount && (
                  <motion.div 
                    className="absolute -top-1 -right-8 bg-red-500 text-white text-xs px-8 py-1 transform rotate-45"
                    animate={{ rotate: [45, 48, 45] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    -{item.discount}%
                  </motion.div>
                )}
                
                {item.limited && (
                  <Badge variant="warning" size="xs" className="absolute top-2 left-2">
                    Лимит
                  </Badge>
                )}

                <div className="text-center">
                  <motion.div 
                    className="text-4xl mb-2"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [-5, 5, -5]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-tg-hint mb-3 h-8 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1">
                    {item.discount ? (
                      <>
                        <span className="text-xs text-tg-hint line-through">
                          {item.price}
                        </span>
                        <span className="font-bold text-green-600">
                          {Math.floor(item.price * (100 - item.discount) / 100)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">{item.price}</span>
                    )}
                    <span className="text-lg">{getCurrencyIcon(item.currency)}</span>
                  </div>

                  {item.quantity && (
                    <div className="text-xs text-tg-hint mt-1">
                      Осталось: {item.quantity}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Модальное окно покупки */}
      <Modal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Подтвердить покупку"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-2">{selectedItem.icon}</div>
              <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
              <p className="text-sm text-tg-hint mt-1">{selectedItem.description}</p>
            </div>

            <Card variant="outlined" padding="sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-tg-hint">Цена</span>
                <div className="flex items-center gap-1">
                  {selectedItem.discount ? (
                    <>
                      <span className="text-sm text-tg-hint line-through">
                        {selectedItem.price}
                      </span>
                      <span className="font-bold text-lg text-green-600">
                        {Math.floor(selectedItem.price * (100 - selectedItem.discount) / 100)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-lg">{selectedItem.price}</span>
                  )}
                  <span className="text-xl">{getCurrencyIcon(selectedItem.currency)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-tg-hint">Ваш баланс</span>
                <span className="font-medium">
                  {userBalance[selectedItem.currency]} {getCurrencyIcon(selectedItem.currency)}
                </span>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowPurchaseModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={confirmPurchase}
              >
                Купить
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <BottomNav />
    </div>
  )
}