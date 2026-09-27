/**
 * Путь к файлу из public/ с учётом basePath. next/link и роутер добавляют basePath сами,
 * а строковые src у <Image unoptimized> и metadata — нет. Без basePath (dev, обычный деплой)
 * возвращает путь как есть; на GitHub Pages сайт живёт под /profitool.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE}${path}`;
}
