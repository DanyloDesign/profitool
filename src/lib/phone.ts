/**
 * Телефон: убираем всё, кроме цифр, и приводим к 380XXXXXXXXX — так проходят и «067 123 45 67»,
 * и «0671234567», и «+38 067 123 45 67», и «+380671234567» (proposal 013, C.3). Возвращает null,
 * если после нормализации не получилось 380 + 9 цифр.
 *
 * Перенесено из checkout-form.tsx (016), чтобы форма профиля использовала ту же проверку.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) digits = `38${digits}`;
  else if (digits.startsWith("80") && digits.length === 11) digits = `3${digits}`;
  return /^380\d{9}$/.test(digits) ? digits : null;
}

/** 380671234567 → «+380 67 123 45 67» для показу. Непривычный формат возвращает как есть. */
export function formatPhone(phone: string): string {
  const match = /^380(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return match ? `+380 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}
