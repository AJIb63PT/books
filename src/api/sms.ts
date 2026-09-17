import axios from "axios";
import { normalizePhone } from "../utils/phone";

const DEFAULT_ENDPOINT = "/sms-pilot/api.php";

export interface SmsSendResult {
  id?: string;
  to?: string;
  server?: string;
  cost?: number;
  status?: string;
}

/**
 * Отправка SMS напрямую через smspilot.ru.
 * Формат: https://smspilot.ru/api.php?send=<text>&to=<phone>&apikey=<key>&format=json
 * В dev-режиме запрос проксируется через Vite (/sms-pilot -> smspilot.ru).
 * Тестовый ключ не производит реальной отправки.
 */
export async function sendSms(
  to: string,
  text: string,
): Promise<SmsSendResult> {
  const endpoint = import.meta.env.VITE_SMSPILOT_ENDPOINT || DEFAULT_ENDPOINT;
  const apiKey = import.meta.env.VITE_SMSPILOT_API_KEY || "";

  const body = new URLSearchParams();
  body.append("apikey", apiKey);
  body.append("format", "json");
  body.append("send", text);
  body.append("to", normalizePhone(to));

  const response = await axios.post(endpoint, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15000,
  });

  const data: unknown = response.data;
  if (typeof data !== "object" || data === null) {
    throw new Error("SMS: неожиданный ответ сервера (не JSON)");
  }

  const payload = data as { error?: string; send?: unknown; success?: unknown };
  if (payload.error) {
    throw new Error(`SMS: ${payload.error}`);
  }

  const send = payload.send;
  if (!Array.isArray(send) || send.length === 0) {
    throw new Error("SMS: сервис не вернул результат отправки");
  }

  return send[0] as SmsSendResult;
}
