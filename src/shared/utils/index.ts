import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)

export const formatDate = (iso: string) =>
  format(parseISO(iso), 'dd MMM yyyy', { locale: es })

export const formatDateTime = (iso: string) =>
  format(parseISO(iso), 'dd MMM yyyy HH:mm', { locale: es })

export const formatTime = (iso: string) =>
  format(parseISO(iso), 'HH:mm', { locale: es })
