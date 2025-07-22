import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store'
import { addNotification, removeNotification } from '@/store/slices/uiSlice'

export function useNotifications() {
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector((state: RootState) => state.ui.notifications)

  const notify = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString()
    
    // Update Redux store
    dispatch(addNotification({
      id,
      type,
      title,
      message,
      duration,
    }))

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(id))
      }, duration)
    }
  }, [dispatch])

  const success = useCallback((title: string, message?: string) => {
    notify('success', title, message)
  }, [notify])

  const error = useCallback((title: string, message?: string) => {
    notify('error', title, message)
  }, [notify])

  const info = useCallback((title: string, message?: string) => {
    notify('info', title, message)
  }, [notify])

  const warning = useCallback((title: string, message?: string) => {
    notify('warning', title, message)
  }, [notify])

  const remove = useCallback((id: string) => {
    dispatch(removeNotification(id))
  }, [dispatch])

  return {
    notifications,
    notify,
    success,
    error,
    info,
    warning,
    remove,
  }
}