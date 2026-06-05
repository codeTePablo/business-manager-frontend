import api from './api'
import type {
  TokenResponse, User, Business, Member,
  Product, Sale, SaleCreate, DailySummary,
  InventorySummary, Notification,
} from '@/shared/types'

export const authService = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/auth/login', { email, password })
    return data
  },
  me: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
  logout: async (): Promise<void> => { await api.post('/auth/logout') },
}

export const businessService = {
  list: async (): Promise<Business[]> => {
    const { data } = await api.get<Business[]>('/businesses')
    return data
  },
  listMembers: async (): Promise<Member[]> => {
    const { data } = await api.get<Member[]>('/businesses/members')
    return data
  },
  inviteMember: async (email: string, role: string): Promise<Member> => {
    const { data } = await api.post<Member>('/businesses/members', { email, role })
    return data
  },
  removeMember: async (userId: string): Promise<void> => {
    await api.delete(`/businesses/members/${userId}`)
  },
}

export const productService = {
  frequent: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products/frequent')
    return data
  },
  list: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products')
    return data
  },
}

export const salesService = {
  list: async (params?: { date_from?: string; date_to?: string }): Promise<Sale[]> => {
    const { data } = await api.get<Sale[]>('/sales', { params })
    return data
  },
  get: async (id: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/sales/${id}`)
    return data
  },
  create: async (payload: SaleCreate): Promise<Sale> => {
    const { data } = await api.post<Sale>('/sales', payload)
    return data
  },
  cancel: async (id: string, reason: string): Promise<Sale> => {
    const { data } = await api.post<Sale>(`/sales/${id}/cancel`, { reason })
    return data
  },
  summary: async (): Promise<DailySummary> => {
    const { data } = await api.get<DailySummary>('/sales/summary/today')
    return data
  },
}

export const inventoryService = {
  summary: async (): Promise<InventorySummary> => {
    const { data } = await api.get<InventorySummary>('/inventory/summary')
    return data
  },
}

export const notificationService = {
  list: async (): Promise<Notification[]> => {
    const { data } = await api.get<Notification[]>('/notifications')
    return data
  },
  markRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`)
  },
}
