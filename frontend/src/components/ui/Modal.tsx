'use client'

import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTelegram } from '@/hooks/useTelegram'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const { hapticFeedback } = useTelegram()

  useEffect(() => {
    if (isOpen) {
      hapticFeedback?.impactOccurred('light')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, hapticFeedback])

  const modalSizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed inset-x-0 bottom-0 z-50 ${modalSizes[size]} mx-auto`}
          >
            <div className="modal-sheet">
              <div className="modal-handle" />
              
              {title && (
                <div className="modal-header">
                  <h2 className="text-xl font-bold bg-gradient-empire bg-clip-text text-transparent">{title}</h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-sm flex items-center justify-center hover:bg-surface/70 transition-all"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                </div>
              )}

              <div className="modal-body">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger' | 'success'
}

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  type = 'info',
}: AlertModalProps) {
  const { hapticFeedback } = useTelegram()

  const handleConfirm = () => {
    hapticFeedback?.impactOccurred('medium')
    onConfirm()
  }

  const typeConfigs = {
    info: {
      icon: 'ℹ️',
      buttonClass: 'btn-primary',
    },
    warning: {
      icon: '⚠️',
      buttonClass: 'btn-warning',
    },
    danger: {
      icon: '🚨',
      buttonClass: 'btn-danger',
    },
    success: {
      icon: '✅',
      buttonClass: 'btn-success',
    },
  }

  const config = typeConfigs[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center space-y-6 py-4">
        <div className="text-6xl animate-bounce-custom">
          {config.icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-secondary">{message}</p>
        </div>

        <div className="space-y-3">
          <button onClick={handleConfirm} className={config.buttonClass}>
            {confirmText}
          </button>
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  )
}