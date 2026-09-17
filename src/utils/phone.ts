export function extractDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

/** Приводит телефон к международному виду без «+»: 79087964781 */
export function normalizePhone(value: string): string {
  return extractDigits(value).replace(/^8(?=\d{10}$)/, "7");
}

/** Валидный телефон: 11 цифр, начинается с 7 или 8 */
export function isValidPhone(value: string): boolean {
  return /^[78]\d{10}$/.test(extractDigits(value));
}
