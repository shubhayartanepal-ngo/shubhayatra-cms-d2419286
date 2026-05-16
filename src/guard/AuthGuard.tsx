import { Navigate, Outlet } from 'react-router'
import { getStoredAuthToken } from '../common/authStorage'

const AuthGuard = () => {
  const token = getStoredAuthToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthGuard