import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast           from 'react-hot-toast'
import { authService, businessService } from '@/shared/services'
import { useAuthStore }     from '@/shared/store/authStore'
import { useBusinessStore } from '@/shared/store/businessStore'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const { setActiveBusiness } = useBusinessStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),

    onSuccess: async (tokenData) => {
      useAuthStore.setState({ token: tokenData.access_token })
      const user = await authService.me()
      setAuth(tokenData.access_token, user)

      const businesses = await businessService.list()
      if (businesses.length === 0) { toast.error('Sin negocios registrados.'); return }

      if (businesses.length === 1) {
        setActiveBusiness(businesses[0])
        navigate(user.role === 'dueno' ? '/dashboard' : '/register-sale')
      } else {
        navigate('/select-business')
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
