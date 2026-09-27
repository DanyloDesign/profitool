/**
 * Нижний отступ body под fixed-панели. Панель сравнения и липкая панель покупки могут
 * стоять одновременно, поэтому каждая регистрирует свою высоту, а отступ равен сумме.
 */
const insets = new Map<string, number>();

export function setBodyInset(key: string, px: number) {
  if (px > 0) insets.set(key, px);
  else insets.delete(key);
  const total = [...insets.values()].reduce((sum, value) => sum + value, 0);
  document.body.style.paddingBottom = total ? `${total}px` : "";
}
