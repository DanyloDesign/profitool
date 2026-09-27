type IconProps = { className?: string; strokeWidth?: number; gradient?: boolean };

/** Тонкая линия 1.6, круглые концы: в тон скруглённым кнопкам и чипам.
    gradient=true меняет обводку на #grad-brand-icon (IconGradientDefs ниже) — активный
    индикатор сравнения/избранного, 006 раунд 2. */
function base(className = "h-5 w-5", strokeWidth = 1.6, gradient = false) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: gradient ? "url(#grad-brand-icon)" : "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

/** Один спрайт-градиент на страницу: id глобальны в документе, url(#grad-brand-icon)
    находит его из любой иконки независимо от того, в каком <svg> она нарисована.
    Рендерится один раз в корневом layout. Берёт brand-a-text/b-text (не brand-a/b),
    поэтому контраст индикатора в светлой теме тот же, что у текста «Каталог». */
export function IconGradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <linearGradient id="grad-brand-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "var(--color-brand-a-text)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-brand-b-text)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconSearch({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  );
}

export function IconCart({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M3 4h3l2.2 10.5h9.3L20 7H7" />
      <circle cx="9.5" cy="19" r="1.4" />
      <circle cx="17.5" cy="19" r="1.4" />
    </svg>
  );
}

export function IconCompare({ className, strokeWidth, gradient }: IconProps) {
  return (
    <svg {...base(className, strokeWidth, gradient)}>
      <path d="M4 20V9M10 20V4M16 20v-8M22 20h-20" />
    </svg>
  );
}

export function IconBattery({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <rect x="2.5" y="7" width="16" height="10" />
      <path d="M18.5 10.5H21v3h-2.5" />
      <path d="M6 9.5v5M9.5 9.5v5M13 9.5v5" />
    </svg>
  );
}

export function IconBurger({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconClose({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function IconArrow({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevron({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconCheck({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  );
}

export function IconShield({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 3 4.5 6v6c0 4.2 3 7.6 7.5 9 4.5-1.4 7.5-4.8 7.5-9V6L12 3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function IconTruck({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M2 6h11v10H2zM13 9h4l3 3.5V16h-7" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="16.5" cy="18" r="1.6" />
    </svg>
  );
}

export function IconWrench({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M15.5 3.5a5 5 0 0 0-4.6 7l-7.2 7.2 2.6 2.6 7.2-7.2a5 5 0 0 0 6-6.7L16.8 8.1l-2.1-2.1 1.8-2.5Z" />
    </svg>
  );
}

export function IconPhone({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M5 3h4l1.5 5L8 9.5a12 12 0 0 0 6.5 6.5L16 14l5 1.5v4a1.5 1.5 0 0 1-1.7 1.5C10.8 20 4 13.2 3.5 4.7A1.5 1.5 0 0 1 5 3Z" />
    </svg>
  );
}

export function IconMapPin({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 21s7-6.7 7-12.2A7 7 0 0 0 5 8.8C5 14.3 12 21 12 21Z" />
      <circle cx="12" cy="8.8" r="2.4" />
    </svg>
  );
}

export function IconClock({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3.3 2" />
    </svg>
  );
}

export function IconFilter({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}

export function IconMinus({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconPlus({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconTrash({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" />
    </svg>
  );
}

export function IconHeart({
  className,
  strokeWidth,
  filled,
  gradient,
}: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base(className, strokeWidth, gradient)}
      fill={filled ? (gradient ? "url(#grad-brand-icon)" : "currentColor") : "none"}
    >
      <path d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20z" />
    </svg>
  );
}

export function IconUser({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" />
    </svg>
  );
}

export function IconAlert({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </svg>
  );
}
export function IconSun({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </svg>
  );
}

export function IconMoon({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}