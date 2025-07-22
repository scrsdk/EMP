import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { logout as logoutAction } from '@/store/slices/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  
  const logout = () => {
    dispatch(logoutAction())
  }
  
  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  }
}