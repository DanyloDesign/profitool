/** Слов'янські числівники: 1 позиція, 2 позиції, 5 позицій. */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

/** English numerals: 1 item, 2 items. */
export function pluralEn(n: number, forms: [string, string]): string {
  return n === 1 ? forms[0] : forms[1];
}
