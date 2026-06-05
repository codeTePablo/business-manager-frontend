import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'
import { AppRouter } from './router'

export default function App() {
  return (
    <Providers>
      <AppRouter />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize: '13px',
            background: '#111827',
            color: '#f9fafb',
            borderRadius: '6px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: {
              primary: '#15803d',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#b91c1c',
              secondary: '#fff',
            },
          },
        }}
      />
    </Providers>
  )
}