"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/context";
import { THEME_KEY } from "@/lib/theme";
import { IconMoon, IconSun } from "@/components/ui/icons";

type Theme = "dark" | "light";

/** Тема живёт в атрибуте data-theme на <html>: его до отрисовки ставит скрипт из layout. */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // приватный режим: тема сменится до перезагрузки, этого достаточно
    }
  };

  return [theme, toggle];
}

/**
 * Кнопка-иконка для шапки. Подпись описывает действие: куда переключит нажатие.
 * Квадратна `ghost-btn btn-sm` (006 review #2): та сама рамка/висота/перехід, що й у
 * city/support/lang поруч у шарі 1, лише без тексту — паддінг обнулений, ширина фіксована
 * під квадрат, щоб не розтягувалась текстовою шириною ghost-btn за замовчуванням.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dict } = useI18n();
  const [theme, toggle] = useTheme();
  const label = theme === "light" ? dict.nav.themeToDark : dict.nav.themeToLight;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`bar-btn w-11 shrink-0 !px-0 ${className}`}
    >
      {theme === "light" ? <IconMoon className="h-[22px] w-[22px]" /> : <IconSun className="h-[22px] w-[22px]" />}
    </button>
  );
}

/** Строка для мобильного меню: значок и подпись. */
export function ThemeRow() {
  const { dict } = useI18n();
  const [theme, toggle] = useTheme();
  const label = theme === "light" ? dict.nav.themeToDark : dict.nav.themeToLight;

  return (
    <button type="button" onClick={toggle} className="flex h-12 items-center gap-4 text-[17px] text-bone">
      <span className="text-bone-dim">
        {theme === "light" ? <IconMoon className="h-5 w-5" /> : <IconSun className="h-5 w-5" />}
      </span>
      {label}
    </button>
  );
}
