import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

interface Modal {
  id: string
  component: string
  props?: any
}

interface UIState {
  notifications: Notification[]
  modals: Modal[]
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'auto'
  soundEnabled: boolean
  musicEnabled: boolean
}

const initialState: UIState = {
  notifications: [],
  modals: [],
  sidebarOpen: false,
  theme: 'auto',
  soundEnabled: true,
  musicEnabled: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action: PayloadAction<Modal>) => {
      state.modals.push(action.payload)
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload)
    },
    closeAllModals: (state) => {
      state.modals = []
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload
    },
    toggleSound: (state) => {
      state.soundEnabled = !state.soundEnabled
    },
    toggleMusic: (state) => {
      state.musicEnabled = !state.musicEnabled
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleSound,
  toggleMusic,
} = uiSlice.actions

export default uiSlice.reducer