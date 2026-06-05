import api from '@/shared/services/api'
import type {
  IotStatus, SensorReadingOut, IotAlert, IotConfigOut, IotConfigUpdate,
} from '@/shared/types/iot'

export const iotService = {
  status: async (): Promise<IotStatus | null> => {
    const { data } = await api.get<IotStatus | null>('/iot/status')
    return data
  },
  history: async (limit = 60): Promise<SensorReadingOut[]> => {
    const { data } = await api.get<SensorReadingOut[]>('/iot/history', { params: { limit } })
    return data
  },
  alerts: async (): Promise<IotAlert[]> => {
    const { data } = await api.get<IotAlert[]>('/iot/alerts')
    return data
  },
  ackAlert: async (id: string): Promise<void> => {
    await api.post(`/iot/alerts/${id}/ack`)
  },
  getConfig: async (): Promise<IotConfigOut> => {
    const { data } = await api.get<IotConfigOut>('/iot/config')
    return data
  },
  updateConfig: async (payload: IotConfigUpdate): Promise<IotConfigOut> => {
    const { data } = await api.patch<IotConfigOut>('/iot/config', payload)
    return data
  },
}
