import axios, { AxiosError } from 'axios'
import { useAuthStore }     from '@/shared/store/authStore'
import { useBusinessStore } from '@/shared/store/businessStore'
import type { ApiError }    from '@/shared/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token      = useAuthStore.getState().token
  const businessId = useBusinessStore.getState().activeBusiness?.id
  if (token)      config.headers.Authorization    = `Bearer ${token}`
  if (businessId) config.headers['X-Business-ID'] = businessId
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.log('HTTP ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      useBusinessStore.getState().clearBusiness()
      window.location.href = '/login'
    }

    const message = error.response?.data?.detail ?? error.message ?? 'Error desconocido'
    return Promise.reject(new Error(message))
  }
)

export default api
