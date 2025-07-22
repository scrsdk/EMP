'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io, Socket } from 'socket.io-client'
import { RootState, AppDispatch } from '@/store/store'
import { updateResources, updateBuilding } from '@/store/slices/gameSlice'
import { addNotification } from '@/store/slices/uiSlice'

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (type: string, data: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Connect to WebSocket
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
      const newSocket = io(wsUrl, {
        auth: {
          token: accessToken,
        },
        transports: ['websocket'],
      })

      socketRef.current = newSocket

      // Connection events
      newSocket.on('connect', () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      })

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error)
      })

      // Game events
      newSocket.on('resource_update', (data) => {
        dispatch(updateResources(data.resources))
      })

      newSocket.on('building_update', (data) => {
        dispatch(updateBuilding(data.building))
      })

      newSocket.on('notification', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          duration: 5000,
        }))
      })

      setSocket(newSocket)

      // Cleanup
      return () => {
        newSocket.close()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, accessToken, dispatch])

  const sendMessage = (type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data)
    }
  }

  return (
    <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }
  return context
}