import axios from 'axios'

const DEFAULT_ENDPOINT = '/sms-pilot/api2.php'

export interface SmsSendResult {
  id?: string
  to?: string
  server?: string
  cost?: number
}

/**
 * Отправка SMS напрямую через smspilot.ru.
 * В dev-режиме запрос проксируется через Vite (/sms-pilot -> smspilot.ru).
 * Ключ-эмулятор (EMULATOR) не производит реальной отправки.
 */
export async function sendSms(to: string, text: string): Promise<SmsSendResult> {
  const endpoint = import.meta.env.VITE_SMSPILOT_ENDPOINT || DEFAULT_ENDPOINT
  const apiKey = import.meta.env.VITE_SMSPILOT_API_KEY || 'EMULATOR'

  const body = new URLSearchParams()
  body.append('apikey', apiKey)
  body.append('format', 'json')
  body.append('send', JSON.stringify([{ to, text }]))

  const response = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (response.data?.error) {
    throw new Error(`SMS: ${response.data.error}`)
  }
  return (response.data?.send?.[0] ?? {}) as SmsSendResult
}