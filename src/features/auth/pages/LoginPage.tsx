import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button } from '@/shared/components'
import { useLogin } from '../hooks/useLogin'

const schema = z.object({
  email:    z.string().email('Correo no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(d => login.mutate(d))} className="space-y-4">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-text">Iniciar sesión</h2>
        <p className="text-xs text-text-muted mt-0.5">Ingresa con tu correo y contraseña</p>
      </div>
      <Input label="Correo electrónico" type="email" placeholder="correo@ejemplo.com"
        autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Contraseña" type="password" placeholder="••••••••"
        autoComplete="current-password" error={errors.password?.message} {...register('password')} />
      <Button type="submit" className="w-full mt-2" loading={login.isPending}>
        Entrar
      </Button>
    </form>
  )
}
