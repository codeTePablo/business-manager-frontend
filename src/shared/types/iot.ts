export interface IotStatus {
  device_id:      string
  temperature_c:  number
  humidity_pct:   number | null
  fan_active:     boolean
  led_state:      'green' | 'yellow' | 'red'
  last_seen:      string
  is_online:      boolean
  pending_alerts: number
}

export interface SensorReadingOut {
  id:             string
  device_id:      string
  temperature_c:  number
  humidity_pct:   number | null
  fan_active:     boolean
  led_state:      string
  recorded_at:    string
}

export interface IotAlert {
  id:             string
  device_id:      string
  alert_type:     string
  severity:       'warning' | 'critical'
  temperature_c:  number | null
  humidity_pct:   number | null
  message:        string
  email_sent:     boolean
  acknowledged:   boolean
  created_at:     string
}

export interface IotConfigOut {
  device_id:              string
  temp_warning_c:         number
  temp_critical_c:        number
  humidity_warning_pct:   number
  alert_email:            string | null
  alert_cooldown_minutes: number
}

export interface IotConfigUpdate {
  temp_warning_c?:         number
  temp_critical_c?:        number
  humidity_warning_pct?:   number
  alert_email?:            string
  alert_cooldown_minutes?: number
}
