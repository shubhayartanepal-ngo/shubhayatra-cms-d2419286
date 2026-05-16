import React from 'react'

interface AlertBoxProps {
  message: string | null
  type?: 'error' | 'info' | 'success'
}

const AlertBox: React.FC<AlertBoxProps> = ({ message, type = 'error' }) => {
  if (!message) return null

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
      case 'success':
        return 'rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'
      case 'info':
        return 'rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700'
      default:
        return 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
    }
  }

  return <div className={getStyles()}>{message}</div>
}

export default AlertBox
