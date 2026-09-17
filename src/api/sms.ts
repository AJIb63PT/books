import axios from 'axios'

const DEFAULT_ENDPOINT = '/sms-pilot/api.php'

export interface SmsSendResult {
  id?: string
  to?: string
  server?: string
  cost?: number
  status?: string
}

/**
 * Отправка SMS напрямую через smspilot.ru.
 * Формат: https://smspilot.ru/api.php?send=<text>&to=<phone>&apikey=<key>&format=json
 * В dev-режиме запрос проксируется через Vite (/sms-pilot -> smspilot.ru).
 * Тестовый ключ не производит реальной отправки.
 */
export async function sendSms(to: string, text: string): Promise<SmsSendResult> {
  const endpoint = import.meta.env.VITE_SMSPILOT_ENDPOINT || DEFAULT_ENDPOINT
  const apiKey = import.meta.env.VITE_SMSPILOT_API_KEY || ''

  const phone = to.replace(/[^\d]/g, '').replace(/^8(?=\d{10}$)/, '7')

  const body = new URLSearchParams()
  body.append('apikey', apiKey)
  body.append('format', 'json')
  body.append('send', text)
  body.append('to', phone)

  const response = await axios.post(endpoint, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (response.data?.error) {
    throw new Error(`SMS: ${response.data.error}`)
  }
  return (response.data?.send?.[0] ?? {}) as SmsSendResult
}