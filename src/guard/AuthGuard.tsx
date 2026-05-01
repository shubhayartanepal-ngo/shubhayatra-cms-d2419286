import { Navigate, Outlet } from 'react-router'

const AuthGuard = () => {
  const token = localStorage.getItem('token') // or your auth storage

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default AuthGuard