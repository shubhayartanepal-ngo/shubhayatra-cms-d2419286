import axios from 'axios'
import { getStoredAuthToken } from './authStorage'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isFormData) {
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }

  return config
})

export default apiClient
