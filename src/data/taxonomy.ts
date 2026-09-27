import type { Brand, Category, Localized, Platform, SpecKey } from "./types";

export const brands: Brand[] = [
  { slug: "makita", name: "Makita", country: { ua: "Японія", ru: "Япония" } },
  { slug: "bosch", name: "Bosch", country: { ua: "Німеччина", ru: "Германия" } },
  { slug: "dewalt", name: "DeWalt", country: { ua: "США", ru: "США" } },
  { slug: "metabo", name: "Metabo", country: { ua: "Німеччина", ru: "Германия" } },
  { slug: "milwaukee", name: "Milwaukee", country: { ua: "США", ru: "США" } },
  { slug: "ryobi", name: "Ryobi", country: { ua: "Японія", ru: "Япония" } },
];

export const platforms: Platform[] = [
  {
    slug: "makita-lxt",
    name: "LXT 18V",
    brand: "makita",
    voltage: 18,
    note: { ua: "Понад 300 інструментів у серії", ru: "Более 300 инструментов в серии" },
  },
  {
    slug: "makita-xgt",
    name: "XGT 40V",
    brand: "makita",
    voltage: 40,
    note: { ua: "Для важких робіт і бетону", ru: "Для тяжёлых работ и бетона" },
  },
  {
    slug: "dewalt-xr",
    name: "XR 18V",
    brand: "dewalt",
    voltage: 18,
    note: { ua: "Сумісна з FlexVolt", ru: "Совместима с FlexVolt" },
  },
  {
    slug: "bosch-pro18",
    name: "Professional 18V",
    brand: "bosch",
    voltage: 18,
    note: { ua: "Сині серії Professional", ru: "Синие серии Professional" },
  },
  {
    slug: "milwaukee-m18",
    name: "M18",
    brand: "milwaukee",
    voltage: 18,
    note: { ua: "RedLink Plus і One-Key", ru: "RedLink Plus и One-Key" },
  },
  {
    slug: "metabo-cas",
    name: "CAS 18V",
    brand: "metabo",
    voltage: 18,
    note: { ua: "Одна батарея на 30+ брендів", ru: "Одна батарея на 30+ брендов" },
  },
  {
    slug: "ryobi-one",
    name: "ONE+ 18V",
    brand: "ryobi",
    voltage: 18,
    note: { ua: "Побутова серія, 280 інструментів", ru: "Бытовая серия, 280 инструментов" },
  },
];

export const categories: Category[] = [
  {
    slug: "rotary-hammers",
    name: { ua: "Перфоратори", ru: "Перфораторы" },
    blurb: { ua: "Бетон, цегла, штроби", ru: "Бетон, кирпич, штробы" },
    tool: "rotary_hammer",
  },
  {
    slug: "drills",
    name: { ua: "Шурупокрути", ru: "Шуруповёрты" },
    blurb: { ua: "Збірка, кріплення, свердління", ru: "Сборка, крепёж, сверление" },
    tool: "drill",
  },
  {
    slug: "grinders",
    name: { ua: "Кутові шліфмашини", ru: "Угловые шлифмашины" },
    blurb: { ua: "Різання металу й каменю", ru: "Резка металла и камня" },
    tool: "grinder",
  },
  {
    slug: "saws",
    name: { ua: "Пили", ru: "Пилы" },
    blurb: { ua: "Дошка, брус, фанера", ru: "Доска, брус, фанера" },
    tool: "circular_saw",
  },
  {
    slug: "sanders",
    name: { ua: "Шліфмашини", ru: "Шлифмашины" },
    blurb: { ua: "Підготовка під фарбу й лак", ru: "Подготовка под краску и лак" },
    tool: "sander",
  },
  {
    slug: "measuring",
    name: { ua: "Вимірювання", ru: "Измерение" },
    blurb: { ua: "Нівеліри й далекоміри", ru: "Нивелиры и дальномеры" },
    tool: "laser_level",
  },
  {
    slug: "accessories",
    name: { ua: "Оснастка", ru: "Оснастка" },
    blurb: { ua: "Біти, свердла, диски", ru: "Биты, свёрла, диски" },
    tool: "bit_set",
  },
  {
    slug: "safety",
    name: { ua: "Захист", ru: "Защита" },
    blurb: { ua: "Каски та спецодяг", ru: "Каски и спецодежда" },
    tool: "helmet",
  },
];

export const specLabels: Record<SpecKey, Localized> = {
  power: { ua: "Потужність", ru: "Мощность" },
  voltage: { ua: "Напруга", ru: "Напряжение" },
  impact: { ua: "Енергія удару", ru: "Энергия удара" },
  chuck: { ua: "Патрон", ru: "Патрон" },
  rpm: { ua: "Обертів", ru: "Оборотов" },
  bpm: { ua: "Ударів", ru: "Ударов" },
  torque: { ua: "Момент", ru: "Момент" },
  disc: { ua: "Диск", ru: "Диск" },
  depth: { ua: "Глибина різу", ru: "Глубина реза" },
  range: { ua: "Дальність", ru: "Дальность" },
  accuracy: { ua: "Точність", ru: "Точность" },
  lines: { ua: "Площини", ru: "Плоскости" },
  orbit: { ua: "Хід ексцентрика", ru: "Ход эксцентрика" },
  pad: { ua: "Підошва", ru: "Подошва" },
  weight: { ua: "Вага", ru: "Вес" },
  battery: { ua: "Акумулятор", ru: "Аккумулятор" },
  pieces: { ua: "Предметів", ru: "Предметов" },
  material: { ua: "Матеріал", ru: "Материал" },
  standard: { ua: "Стандарт", ru: "Стандарт" },
  size: { ua: "Розмір", ru: "Размер" },
};

export const brandBySlug = new Map(brands.map((b) => [b.slug, b]));
export const platformBySlug = new Map(platforms.map((p) => [p.slug, p]));
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
