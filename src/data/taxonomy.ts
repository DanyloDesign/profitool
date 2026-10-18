import type { Brand, Category, Localized, Platform, SpecKey } from "./types";

export const brands: Brand[] = [
  { slug: "makita", name: "Makita", country: { ua: "Японія", en: "Japan" } },
  { slug: "bosch", name: "Bosch", country: { ua: "Німеччина", en: "Germany" } },
  { slug: "dewalt", name: "DeWalt", country: { ua: "США", en: "USA" } },
  { slug: "metabo", name: "Metabo", country: { ua: "Німеччина", en: "Germany" } },
  { slug: "milwaukee", name: "Milwaukee", country: { ua: "США", en: "USA" } },
  { slug: "ryobi", name: "Ryobi", country: { ua: "Японія", en: "Japan" } },
];

export const platforms: Platform[] = [
  {
    slug: "makita-lxt",
    name: "LXT 18V",
    brand: "makita",
    voltage: 18,
    note: { ua: "Понад 300 інструментів у серії", en: "300+ tools in the range" },
  },
  {
    slug: "makita-xgt",
    name: "XGT 40V",
    brand: "makita",
    voltage: 40,
    note: { ua: "Для важких робіт і бетону", en: "For heavy work and concrete" },
  },
  {
    slug: "dewalt-xr",
    name: "XR 18V",
    brand: "dewalt",
    voltage: 18,
    note: { ua: "Сумісна з FlexVolt", en: "FlexVolt compatible" },
  },
  {
    slug: "bosch-pro18",
    name: "Professional 18V",
    brand: "bosch",
    voltage: 18,
    note: { ua: "Сині серії Professional", en: "Blue Professional series" },
  },
  {
    slug: "milwaukee-m18",
    name: "M18",
    brand: "milwaukee",
    voltage: 18,
    note: { ua: "RedLink Plus і One-Key", en: "RedLink Plus and One-Key" },
  },
  {
    slug: "metabo-cas",
    name: "CAS 18V",
    brand: "metabo",
    voltage: 18,
    note: { ua: "Одна батарея на 30+ брендів", en: "One battery for 30+ brands" },
  },
  {
    slug: "ryobi-one",
    name: "ONE+ 18V",
    brand: "ryobi",
    voltage: 18,
    note: { ua: "Побутова серія, 280 інструментів", en: "Home range, 280 tools" },
  },
];

export const categories: Category[] = [
  {
    slug: "rotary-hammers",
    name: { ua: "Перфоратори", en: "Rotary hammers" },
    blurb: { ua: "Бетон, цегла, штроби", en: "Concrete, brick, chases" },
    tool: "rotary_hammer",
  },
  {
    slug: "drills",
    name: { ua: "Шурупокрути", en: "Drill drivers" },
    blurb: { ua: "Збірка, кріплення, свердління", en: "Assembly, fixing, drilling" },
    tool: "drill",
  },
  {
    slug: "grinders",
    name: { ua: "Кутові шліфмашини", en: "Angle grinders" },
    blurb: { ua: "Різання металу й каменю", en: "Cutting metal and stone" },
    tool: "grinder",
  },
  {
    slug: "saws",
    name: { ua: "Пили", en: "Saws" },
    blurb: { ua: "Дошка, брус, фанера", en: "Boards, timber, plywood" },
    tool: "circular_saw",
  },
  {
    slug: "sanders",
    name: { ua: "Шліфмашини", en: "Sanders" },
    blurb: { ua: "Підготовка під фарбу й лак", en: "Prep for paint and varnish" },
    tool: "sander",
  },
  {
    slug: "measuring",
    name: { ua: "Вимірювання", en: "Measuring" },
    blurb: { ua: "Нівеліри й далекоміри", en: "Levels and rangefinders" },
    tool: "laser_level",
  },
  {
    slug: "accessories",
    name: { ua: "Оснастка", en: "Accessories" },
    blurb: { ua: "Біти, свердла, диски", en: "Bits, drill bits, discs" },
    tool: "bit_set",
  },
  {
    slug: "safety",
    name: { ua: "Захист", en: "Safety" },
    blurb: { ua: "Каски та спецодяг", en: "Helmets and workwear" },
    tool: "helmet",
  },
];

export const specLabels: Record<SpecKey, Localized> = {
  power: { ua: "Потужність", en: "Power" },
  voltage: { ua: "Напруга", en: "Voltage" },
  impact: { ua: "Енергія удару", en: "Impact energy" },
  chuck: { ua: "Патрон", en: "Chuck" },
  rpm: { ua: "Обертів", en: "Speed" },
  bpm: { ua: "Ударів", en: "Impact rate" },
  torque: { ua: "Момент", en: "Torque" },
  disc: { ua: "Диск", en: "Disc" },
  depth: { ua: "Глибина різу", en: "Cutting depth" },
  range: { ua: "Дальність", en: "Range" },
  accuracy: { ua: "Точність", en: "Accuracy" },
  lines: { ua: "Площини", en: "Planes" },
  orbit: { ua: "Хід ексцентрика", en: "Orbit" },
  pad: { ua: "Підошва", en: "Pad" },
  weight: { ua: "Вага", en: "Weight" },
  battery: { ua: "Акумулятор", en: "Battery" },
  pieces: { ua: "Предметів", en: "Pieces" },
  material: { ua: "Матеріал", en: "Material" },
  standard: { ua: "Стандарт", en: "Standard" },
  size: { ua: "Розмір", en: "Size" },
};

export const brandBySlug = new Map(brands.map((b) => [b.slug, b]));
export const platformBySlug = new Map(platforms.map((p) => [p.slug, p]));
export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
