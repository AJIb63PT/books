function pluralForm(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const mod10 = abs % 10;
  if (mod10 === 1 && abs !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (abs < 12 || abs > 14)) return few;
  return many;
}

export function plural(
  n: number,
  forms: { one: string; few: string; many: string },
): string {
  return pluralForm(n, forms.one, forms.few, forms.many);
}

export function countWords(
  n: number,
  forms: { one: string; few: string; many: string },
): string {
  return `${n} ${plural(n, forms)}`;
}
