export const THEME_KEY = "profitool-theme";

/**
 * Ставит data-theme на <html> до первой отрисовки. Базовая тема светлая (решение владельца 2026-09-21):
 * layout рендерит data-theme="light", скрипт меняет его только на сохранённый выбор.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
