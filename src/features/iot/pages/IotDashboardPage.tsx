import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { iotService } from '@/shared/services/iotService'
import {
  PageHeader, StatCard, Button, Badge, EmptyState, Spinner, Modal, Input,
} from '@/shared/components'
import { cn } from '@/shared/utils'
import type { IotConfigUpdate } from '@/shared/types/iot'

// ── helpers ───────────────────────────────────────────────────────────────────
const LED_COLOR = {
  green:  { ring: 'bg-success', bg: 'bg-success-light', text: 'text-success', label: 'Normal' },
  yellow: { ring: 'bg-warning', bg: 'bg-warning-light', text: 'text-warning', label: 'Advertencia' },
  red:    { ring: 'bg-danger',  bg: 'bg-danger-light',  text: 'text-danger',  label: 'Critico'    },
}

function LiveDot({ color }: { color: 'green' | 'yellow' | 'red' }) {
  const c = LED_COLOR[color]
  return (
    <span className="relative flex h-4 w-4">
      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-50', c.ring)} />
      <span className={cn('relative inline-flex rounded-full h-4 w-4', c.ring)} />
    </span>
  )
}

function formatTime(iso: string) {
  return format(parseISO(iso), 'HH:mm')
}
function formatDateTime(iso: string) {
  return format(parseISO(iso), 'dd MMM HH:mm')
}

// ── hooks ─────────────────────────────────────────────────────────────────────
function useIotStatus() {
  return useQuery({
    queryKey: ['iot', 'status'],
    queryFn: iotService.status,
    refetchInterval: 30_000,   // actualiza cada 30 segundos
  })
}

function useIotHistory() {
  return useQuery({
    queryKey: ['iot', 'history'],
    queryFn: () => iotService.history(60),
    refetchInterval: 60_000,
  })
}

function useIotAlerts() {
  return useQuery({
    queryKey: ['iot', 'alerts'],
    queryFn: iotService.alerts,
    refetchInterval: 30_000,
  })
}

function useIotConfig() {
  return useQuery({
    queryKey: ['iot', 'config'],
    queryFn: iotService.getConfig,
  })
}

// ══════════════════════════════════════════════════════════════════════════════
//  IoT DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function IotDashboardPage() {
  const qc = useQueryClient()
  const [showConfig, setShowConfig] = useState(false)

  const { data: status, isLoading: loadingStatus } = useIotStatus()
  const { data: history = [], isLoading: loadingHistory } = useIotHistory()
  const { data: alerts = [] }  = useIotAlerts()
  const { data: config }       = useIotConfig()

  const ackAlert = useMutation({
    mutationFn: iotService.ackAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iot', 'alerts'] })
      qc.invalidateQueries({ queryKey: ['iot', 'status'] })
      toast.success('Alerta reconocida')
    },
  })

  const updateConfig = useMutation({
    mutationFn: (data: IotConfigUpdate) => iotService.updateConfig(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['iot', 'config'] })
      setShowConfig(false)
      toast.success('Configuracion guardada')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { register, handleSubmit } = useForm<IotConfigUpdate>({
    values: config ? {
      temp_warning_c:         config.temp_warning_c,
      temp_critical_c:        config.temp_critical_c,
      humidity_warning_pct:   config.humidity_warning_pct,
      alert_email:            config.alert_email ?? '',
      alert_cooldown_minutes: config.alert_cooldown_minutes,
    } : undefined,
  })

  // Preparar datos para la gráfica
  const chartData = history.map(r => ({
    time:  formatTime(r.recorded_at),
    temp:  r.temperature_c,
    hum:   r.humidity_pct ?? null,
    fan:   r.fan_active ? 1 : 0,
  }))

  const pendingAlerts = alerts.filter(a => !a.acknowledged)
  const ledColor = (status?.led_state as 'green' | 'yellow' | 'red') ?? 'green'

  return (
    <div className="space-y-5">
      <PageHeader
        title="Monitor IoT"
        subtitle={`Camara de refrigeracion — ${config?.device_id ?? 'esp32-cold-room-01'}`}
        action={
          <div className="flex gap-2">
            {pendingAlerts.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-danger-light text-danger border border-danger-border">
                {pendingAlerts.length} alerta(s) activa(s)
              </span>
            )}
            <Button variant="secondary" onClick={() => setShowConfig(true)}>
              Configurar
            </Button>
          </div>
        }
      />

      {/* ── Estado actual ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loadingStatus ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="card-padded h-24 flex items-center justify-center">
              <Spinner size="sm" />
            </div>
          ))
        ) : !status ? (
          <div className="col-span-4">
            <EmptyState
              title="Sin datos del sensor"
              description="El ESP32 aun no ha enviado ninguna lectura. Verifica que este encendido y conectado a WiFi."
            />
          </div>
        ) : (
          <>
            {/* Temperatura */}
            <div className={cn('card-padded', LED_COLOR[ledColor].bg)}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Temperatura</p>
              <p className={cn('text-3xl font-bold tabular-nums mt-1', LED_COLOR[ledColor].text)}>
                {status.temperature_c.toFixed(1)}°C
              </p>
              <div className="flex items-center gap-2 mt-2">
                <LiveDot color={ledColor} />
                <span className={cn('text-xs font-medium', LED_COLOR[ledColor].text)}>
                  {LED_COLOR[ledColor].label}
                </span>
              </div>
            </div>

            {/* Humedad */}
            <div className="card-padded">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Humedad</p>
              <p className="text-3xl font-bold tabular-nums mt-1 text-text">
                {status.humidity_pct != null ? `${status.humidity_pct.toFixed(0)}%` : '—'}
              </p>
              <p className="text-xs text-text-muted mt-2 font-mono">humedad relativa</p>
            </div>

            {/* Ventilador */}
            <div className={cn('card-padded', status.fan_active ? 'bg-accent-light border-accent/40' : '')}>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Ventilador</p>
              <p className={cn('text-3xl font-bold mt-1', status.fan_active ? 'text-accent' : 'text-text-muted')}>
                {status.fan_active ? 'ON' : 'OFF'}
              </p>
              <p className="text-xs text-text-muted mt-2 font-mono">
                {status.fan_active ? 'enfriando activamente' : 'en reposo'}
              </p>
            </div>

            {/* Online / Offline */}
            <div className="card-padded">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Dispositivo</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  status.is_online ? 'bg-success' : 'bg-danger'
                )} />
                <p className={cn('text-sm font-semibold', status.is_online ? 'text-success' : 'text-danger')}>
                  {status.is_online ? 'En linea' : 'Sin conexion'}
                </p>
              </div>
              <p className="text-xs text-text-muted mt-2 font-mono">
                ultima lectura:<br />
                {formatDateTime(status.last_seen)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Gráfica histórica ────────────────────────────────────────────── */}
      <div className="card-padded">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Historico — ultima hora
          </p>
          {loadingHistory && <Spinner size="sm" />}
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-text-muted text-sm">
            Esperando datos...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="temp"
                tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}°`}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="hum"
                orientation="right"
                tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
                formatter={(v: number, name: string) => [
                  name === 'temp' ? `${v}°C` : `${v}%`,
                  name === 'temp' ? 'Temperatura' : 'Humedad',
                ]}
              />
              <Legend
                formatter={(v) => v === 'temp' ? 'Temperatura (°C)' : 'Humedad (%)'}
                wrapperStyle={{ fontSize: 12 }}
              />
              {/* Líneas de umbral */}
              {config && (
                <>
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey={() => config.temp_warning_c}
                    stroke="#b45309"
                    strokeDasharray="4 2"
                    strokeWidth={1}
                    dot={false}
                    name="Umbral advertencia"
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey={() => config.temp_critical_c}
                    stroke="#b91c1c"
                    strokeDasharray="4 2"
                    strokeWidth={1}
                    dot={false}
                    name="Umbral critico"
                  />
                </>
              )}
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="hum"
                type="monotone"
                dataKey="hum"
                stroke="#0d7377"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 1"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Alertas ──────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-raised">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Alertas recientes
          </p>
          {pendingAlerts.length > 0 && (
            <Badge color="red">{pendingAlerts.length} sin reconocer</Badge>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Sin alertas" description="Las alertas de temperatura y humedad apareceran aqui." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map(alert => (
              <div key={alert.id} className={cn(
                'flex items-start gap-3 px-4 py-3',
                !alert.acknowledged && 'bg-danger-light/30',
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={alert.severity === 'critical' ? 'red' : 'orange'}>
                      {alert.severity === 'critical' ? 'Critica' : 'Advertencia'}
                    </Badge>
                    {alert.email_sent && (
                      <span className="text-xs text-text-subtle font-mono">correo enviado</span>
                    )}
                    {alert.acknowledged && (
                      <span className="text-xs text-success font-mono">reconocida</span>
                    )}
                  </div>
                  <p className="text-sm text-text leading-snug">{alert.message}</p>
                  <p className="text-xs text-text-muted font-mono mt-1">
                    {formatDateTime(alert.created_at)}
                    {alert.temperature_c != null && ` — ${alert.temperature_c.toFixed(1)}°C`}
                  </p>
                </div>
                {!alert.acknowledged && (
                  <Button
                    variant="ghost"
                    className="text-xs flex-shrink-0"
                    loading={ackAlert.isPending && ackAlert.variables === alert.id}
                    onClick={() => ackAlert.mutate(alert.id)}
                  >
                    Reconocer
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de configuración ───────────────────────────────────────── */}
      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="Configuracion de umbrales">
        <form
          onSubmit={handleSubmit(data => updateConfig.mutate(data))}
          className="space-y-4"
        >
          <p className="text-xs text-text-muted">
            Define los umbrales de temperatura y el correo donde recibiras las alertas.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Umbral advertencia (°C)"
              type="number"
              step="0.5"
              placeholder="5.0"
              {...register('temp_warning_c', { valueAsNumber: true })}
            />
            <Input
              label="Umbral critico (°C)"
              type="number"
              step="0.5"
              placeholder="8.0"
              {...register('temp_critical_c', { valueAsNumber: true })}
            />
          </div>

          <Input
            label="Umbral humedad (%)"
            type="number"
            step="1"
            placeholder="85"
            {...register('humidity_warning_pct', { valueAsNumber: true })}
          />

          <Input
            label="Correo para alertas"
            type="email"
            placeholder="dueno@ejemplo.com"
            hint="Recibiras un correo cuando se supere el umbral critico"
            {...register('alert_email')}
          />

          <Input
            label="Cooldown entre correos (minutos)"
            type="number"
            step="5"
            placeholder="30"
            hint="Tiempo minimo entre correos del mismo tipo para no saturar tu bandeja"
            {...register('alert_cooldown_minutes', { valueAsNumber: true })}
          />

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={() => setShowConfig(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={updateConfig.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
