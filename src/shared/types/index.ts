export type Role = 'dueno' | 'empleado'

export interface ApiError { detail: string; code?: string }

export interface User { id: string; name: string; email: string}

export interface Business {
  id: string; name: string; type: string | null; address: string | null
  is_active: boolean; created_at: string; my_role: Role
}

export interface TokenResponse {
  access_token: string; token_type: string; user_id: string; name: string
}

export interface Product {
  id: string; business_id: string; name: string; unit: string
  buy_price: number; sell_price: number; stock: number; min_stock: number
  is_frequent: boolean; sort_order: number; is_active: boolean
  created_at: string; low_stock: boolean
}

export interface SaleItem {
  id: string; product_id: string | null; description: string | null
  product_name: string | null; qty: number; unit_price: number; subtotal: number
}

export interface Sale {
  id: string; business_id: string; user_id: string; registered_by: string | null
  total: number; payment_type: string; notes: string | null
  cancelled: boolean; cancelled_reason: string | null; cancelled_at: string | null
  created_at: string; items: SaleItem[]
}

export interface SaleItemCreate {
  product_id?: string; description?: string; qty: number; unit_price: number
}

export interface SaleCreate { items: SaleItemCreate[]; notes?: string }

export interface DailySummary {
  date: string; total_sales: number; sales_count: number; cancelled_count: number
}

export interface Member {
  user_id: string; name: string; email: string; role: Role
  is_active: boolean; joined_at: string
}

export interface StockStatus {
  product_id: string; product_name: string; sell_unit: string
  current_stock: number; min_stock: number; low_stock: boolean
}

export interface InventorySummary {
  total_products: number; low_stock_count: number; out_of_stock_count: number
  low_stock_products: StockStatus[]
}

export type NotificationType = 'low_stock' | 'sale_cancelled' | 'alert' | 'info'

export interface Notification {
  id: string; type: NotificationType; title: string; body: string
  business_id: string; read: boolean; created_at: string
}
