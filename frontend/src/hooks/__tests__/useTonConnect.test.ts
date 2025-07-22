import { renderHook } from '@testing-library/react'
import { useTonConnect } from '../useTonConnect'

// Mock the TON Connect UI hook
jest.mock('@tonconnect/ui-react', () => ({
  useTonConnectUI: () => [{
    connectWallet: jest.fn(),
    disconnect: jest.fn(),
    sendTransaction: jest.fn(),
    onStatusChange: jest.fn(() => () => {}),
  }],
  useTonAddress: () => '',
  useTonWallet: () => null,
}))

// Mock notifications hook
jest.mock('../useNotifications', () => ({
  useNotifications: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}))

describe('useTonConnect Hook', () => {
  test('initializes with correct default values', () => {
    const { result } = renderHook(() => useTonConnect())
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.isConnecting).toBe(false)
    expect(result.current.balance).toBe('0')
  })

  test('provides connect and disconnect functions', () => {
    const { result } = renderHook(() => useTonConnect())
    
    expect(typeof result.current.connect).toBe('function')
    expect(typeof result.current.disconnect).toBe('function')
    expect(typeof result.current.sendTransaction).toBe('function')
  })

  test('provides game-specific functions', () => {
    const { result } = renderHook(() => useTonConnect())
    
    expect(typeof result.current.purchaseGameTokens).toBe('function')
    expect(typeof result.current.claimRewards).toBe('function')
  })
})