import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080'
process.env.NEXT_PUBLIC_WS_URL = 'ws://localhost:8080'
process.env.NEXT_PUBLIC_TON_NETWORK = 'testnet'
process.env.NEXT_PUBLIC_TON_RPC_URL = 'https://testnet.toncenter.com/api/v2/jsonRPC'
process.env.NODE_ENV = 'test'

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Telegram WebApp
global.window = Object.create(window)
Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      ready: jest.fn(),
      expand: jest.fn(),
      close: jest.fn(),
      MainButton: {
        setText: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
      },
      BackButton: {
        show: jest.fn(),
        hide: jest.fn(),
      },
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
        },
      },
    },
  },
  writable: true,
})