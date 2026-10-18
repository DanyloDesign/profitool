import type { Localized } from "@/data/types";
import { DELIVERY_COST, FREE_DELIVERY_FROM, price } from "@/lib/shop";

/**
 * Information pages (023): delivery, payment, returns, warranty, privacy.
 * Text may hold the tokens {phone}, {address} and {hours}; the page fills them from the
 * dictionary so the contacts live in one place. Numbers come from shop.ts, so a page and
 * the checkout cannot disagree. Unknown company data stays as visible [placeholders].
 */
export type InfoSlug = "delivery" | "payment" | "returns" | "warranty" | "privacy";

/** Title and lead feed the nav, breadcrumbs, footer and metadata; each page body is its own component. */
export type InfoPage = {
  slug: InfoSlug;
  title: Localized;
  lead: Localized;
};

const both = (ua: string, en: string): Localized => ({ ua, en });

const cost = `${price(DELIVERY_COST)} ₴`;
const threshold = `${price(FREE_DELIVERY_FROM)} ₴`;

export const infoPages: InfoPage[] = [
  {
    slug: "delivery",
    title: both("Доставка", "Delivery"),
    lead: both(
      "Відправляємо Новою поштою по всій Україні або віддаємо в магазині в Софіївці.",
      "We ship with Nova Poshta across Ukraine or hand your order over at the store in Sofiivka.",
    ),
  },
  {
    slug: "payment",
    title: both("Оплата", "Payment"),
    lead: both(
      "Плати карткою на сайті, під час отримання або за рахунком для компанії.",
      "Pay by card on the site, on delivery, or by invoice for a company.",
    ),
  },
  {
    slug: "returns",
    title: both("Повернення", "Returns"),
    lead: both(
      "Справний товар можна повернути протягом 14 днів з дня отримання.",
      "A working item can be returned within 14 days of receiving it.",
    ),
  },
  {
    slug: "warranty",
    title: both("Гарантія", "Warranty"),
    lead: both(
      "На інструмент діє офіційна гарантія виробника.",
      "Every tool carries the manufacturer's official warranty.",
    ),
  },
  {
    slug: "privacy",
    title: both("Особисті дані", "Personal data"),
    lead: both(
      "Збираємо тільки те, що потрібно для доставки замовлення.",
      "We collect only what we need to deliver your order.",
    ),
  },
];

export const infoBySlug = new Map<string, InfoPage>(infoPages.map((page) => [page.slug, page]));

/** Delivery page, direction B (calculator). Contacts come from the dictionary, numbers from shop.ts. */
export const deliveryCalc = {
  intro: both(
    "Порахуй свою доставку: обери спосіб і суму замовлення.",
    "Work out your delivery: pick a method and an order total.",
  ),
  sectionLabel: both("Розрахунок доставки", "Delivery calculator"),
  methodLabel: both("Спосіб отримання", "How you get it"),
  novapost: both("Нова пошта", "Nova Poshta"),
  pickup: both("Самовивіз", "Pickup"),
  sumLabel: both("Сума замовлення", "Order total"),
  resultNovapost: both("Доставка Новою поштою", "Delivery by Nova Poshta"),
  resultPickup: both("Самовивіз у Софіївці", "Pickup in Sofiivka"),
  noteFree: both("Доставка безкоштовна", "Delivery is free"),
  notePickup: both("Самовивіз завжди безкоштовний", "Pickup is always free"),
  noteLeft: both("Ще {sum} до безкоштовної доставки", "{sum} more for free delivery"),
  termNovapost: both("1–2 дні у відділення або поштомат", "1–2 days to a branch or parcel locker"),
  novapostFacts: [
    both("У відділення або поштомат у будь-якому місті.", "To a branch or parcel locker in any city."),
    both("1–2 дні після відправки.", "1–2 days after dispatch."),
    both(`${cost}, від ${threshold} безкоштовно.`, `${cost}, free from ${threshold}.`),
  ],
  mapLabel: both("Схема: магазин у Софіївці", "Map: the store in Sofiivka"),
  mapLink: both("Відкрити на карті", "Open on the map"),
  mapUrl: "https://maps.app.goo.gl/4GPKpEsfU2VBjeDz8",
};

/** Returns page, direction B (check). Return window is 14 days; copy avoids gendered verb forms. */
export const RETURN_DAYS = 14;

export type ReturnChannelKey = "online" | "store";
export type ReturnStateKey = "fine" | "broken" | "damaged";
export type ReturnVerdictKey = "okOnline" | "okStore" | "expiredOnline" | "expiredStore" | "broken" | "damaged";

/** Rules follow returns-logic.md (consumer law of 1991): window of 14 days, store pays shipping. */
export const returnsCheck = {
  intro: both("Три відповіді, і ти знатимеш, що робити.", "Three answers, and you will know what to do."),
  sectionLabel: both("Перевірка повернення", "Returns check"),
  channelLabel: both("Як купили", "How you bought it"),
  channels: [
    { key: "online" as ReturnChannelKey, label: both("Онлайн: пошта або самовивіз", "Online: post or pickup") },
    { key: "store" as ReturnChannelKey, label: both("У магазині на місці", "In the store") },
  ],
  stateLabel: both("Що з товаром", "What is wrong with the item"),
  states: [
    { key: "fine" as ReturnStateKey, label: both("Не підійшов", "Does not suit me") },
    { key: "broken" as ReturnStateKey, label: both("Зламався або з браком", "Broke or is defective") },
    { key: "damaged" as ReturnStateKey, label: both("Пошкодили самі або знос", "Damaged by me or worn out") },
  ],
  daysLabelOnline: both("Скільки днів минуло від отримання", "Days since you received it"),
  daysLabelStore: both("Скільки днів минуло від покупки", "Days since you bought it"),
  daysUnit: both("дн.", "days"),
  answerLabel: both("Відповідь", "Answer"),
  verdicts: {
    okOnline: {
      title: both("Можна повернути", "You can return it"),
      facts: [
        both(
          "Залишилось {left} дн. Встигни надіслати заяву, посилку можна відправити й пізніше.",
          "{left} days left. Send the claim in time; the parcel itself can go later.",
        ),
        both(
          "Розпакувати й перевірити товар можна. Відмовимо, лише якщо ним працювали або пошкодили.",
          "You may unpack and check the item. We refuse only if it was used or damaged.",
        ),
        both("Відправку Новою поштою оплачуємо ми.", "We pay for shipping with Nova Poshta."),
        both(
          "Гроші тим самим способом, що й оплата: до 7 днів після того, як отримаємо товар, і не пізніше 30 днів від заяви.",
          "The money goes back the way you paid: within 7 days after we receive the item, and no later than 30 days after your claim.",
        ),
      ],
    },
    okStore: {
      title: both("Можна обміняти", "You can exchange it"),
      facts: [
        both("Залишилось {left} дн.", "{left} days left."),
        both(
          "Принеси товар без слідів використання, з ярликами і чеком у магазин у Софіївці.",
          "Bring the item to the store in Sofiivka, unused, with tags and the receipt.",
        ),
        both(
          "Немає такого ж товару на заміну: повернемо гроші в той самий день або протягом 7 днів.",
          "If we have no identical item to swap in, we refund you the same day or within 7 days.",
        ),
      ],
    },
    expiredOnline: {
      title: both("Строк минув", "Time is up"),
      facts: [
        both("14 днів рахуються від дня отримання посилки.", "The 14 days count from the day you received the parcel."),
        both("Якщо інструмент зламається, діє гарантія.", "If the tool breaks, the warranty applies."),
      ],
    },
    expiredStore: {
      title: both("Строк минув", "Time is up"),
      facts: [
        both(
          "14 днів рахуються від покупки, день покупки не враховуємо.",
          "The 14 days count from the purchase; the day of purchase is not included.",
        ),
        both("Якщо інструмент зламається, діє гарантія.", "If the tool breaks, the warranty applies."),
      ],
    },
    broken: {
      title: both("Це гарантія", "This is a warranty case"),
      facts: [
        both(
          "Строки не залежать від того, скільки днів минуло.",
          "The terms do not depend on how many days have passed.",
        ),
        both(
          "Ремонт до 14 днів. Пересилку в сервіс і назад оплачуємо ми.",
          "Repair takes up to 14 days. We pay shipping to the service center and back.",
        ),
        both(
          "Якщо поломка істотна, можна вимагати заміну або гроші.",
          "If the defect is substantial, you can demand a replacement or a refund.",
        ),
      ],
    },
    damaged: {
      title: both("Не гарантійний випадок", "Not a warranty case"),
      facts: [
        both(
          "Удар, падіння, вода і знос щіток, дисків, оснастки гарантія не покриває.",
          "The warranty does not cover impact, drops, water, or wear of brushes, discs and accessories.",
        ),
        both(
          "Можемо полагодити платно або підібрати витратні частини в каталозі.",
          "We can repair it for a fee, or you can pick consumables in the catalog.",
        ),
      ],
    },
  },
  claim: both("Заповнити заяву", "Fill in the claim"),
  warrantyLink: both("Перейти до гарантії", "Go to the warranty"),
  form: {
    title: both("Заява на повернення", "Return claim"),
    order: both("Номер замовлення", "Order number"),
    orderPlaceholder: "PT-10482",
    phone: both("Телефон *", "Phone *"),
    reason: both("Що повертаєш і чому *", "What you are returning and why *"),
    reasonPlaceholder: both("Наприклад: дриль не підійшла за вагою", "For example: the drill is too heavy for me"),
    card: both(
      "Картка для повернення, якщо платили при отриманні",
      "Card for the refund, if you paid on delivery",
    ),
    cardPlaceholder: "0000 0000 0000 0000",
    send: both("Надіслати заяву", "Send the claim"),
    back: both("Назад", "Back"),
    errReason: both("Напиши, що повертаєш і чому", "Tell us what you are returning and why"),
    errCard: both("Картка: 16 цифр", "Card: 16 digits"),
  },
  sent: {
    kicker: both("Заяву отримали", "Claim received"),
    title: both("Що далі", "What happens next"),
    steps: [
      both(
        "Сьогодні або наступного робочого дня підтвердимо заяву і надішлемо номер для відправки за наш рахунок.",
        "Today or the next working day we confirm the claim and send you a number for shipping at our expense.",
      ),
      both(
        "Запакуй товар і віддай у будь-якому відділенні Нової пошти.",
        "Pack the item and hand it in at any Nova Poshta branch.",
      ),
      both("Отримаємо посилку і перевіримо комплект.", "We receive the parcel and check the contents."),
      both(
        "Повернемо гроші до 7 днів після отримання, не пізніше 30 днів від заяви.",
        "We refund you within 7 days after receipt, no later than 30 days after your claim.",
      ),
    ],
    demo: both(
      "Сайт демонстраційний: заява лежить тільки в цьому браузері й нікуди не йде.",
      "This site is a demo: the claim stays in this browser only and goes nowhere.",
    ),
  },
  seller: both(
    "Продавець: [назва ФОП або ТОВ], [ЄДРПОУ], [юридична адреса]. Претензії: [пошта для звернень] або {phone}.",
    "Seller: [sole proprietor (FOP) or LLC name], [EDRPOU code], [legal address]. Complaints: [contact email] or {phone}.",
  ),
};

/** localStorage key for submitted claims (an array); the privacy page's delete flow clears it. */
export const RETURN_CLAIMS_KEY = "profitool-return-claims";

/** Warranty page, direction B (check). Terms are the ones that exist in products.ts. */
export const WARRANTY_TERMS = [12, 24, 36] as const;
export type WarrantyIssueKey = "fault" | "damage" | "wear";
export type WarrantyRouteKey = "post" | "store" | "maker";

export const warrantyCheck = {
  intro: both(
    "Офіційна гарантія виробника. Перевір свій випадок і обери, як звернутись.",
    "The manufacturer's official warranty. Check your case and choose how to apply.",
  ),
  sectionLabel: both("Перевірка гарантії", "Warranty check"),
  termLabel: both("Строк гарантії, вказаний на сторінці товару", "Warranty term shown on the product page"),
  monthsLabel: both("Скільки місяців тому купили", "Months since you bought it"),
  monthsUnit: both("міс.", "mo."),
  issueLabel: both("Що сталося", "What happened"),
  issues: [
    { key: "fault" as WarrantyIssueKey, label: both("Перестав працювати", "Stopped working") },
    { key: "damage" as WarrantyIssueKey, label: both("Впав або розбився", "Dropped or broken") },
    { key: "wear" as WarrantyIssueKey, label: both("Зносились щітки чи диск", "Brushes or disc worn out") },
  ],
  kickerExpired: both("Строк {term} міс. минув", "The {term}-month term has ended"),
  kickerLeft: both("Ще {left} міс. гарантії", "{left} months of warranty left"),
  verdicts: {
    expired: {
      title: both("Гарантія закінчилась", "The warranty has ended"),
      detail: both(
        "Якщо поломка з вини виробника, безкоштовний ремонт можливий і після гарантії, протягом строку служби інструмента. Зателефонуй {phone}, перевіримо.",
        "If the fault is the manufacturer's, a free repair is possible even after the warranty, within the tool's service life. Call {phone} and we will check.",
      ),
    },
    damage: {
      title: both("Не гарантійний випадок", "Not a warranty case"),
      detail: both(
        "Удари, падіння і вода гарантією не покриваються. Можемо полагодити платно: зателефонуй {phone}.",
        "Impact, drops and water are not covered by the warranty. We can repair it for a fee: call {phone}.",
      ),
    },
    wear: {
      title: both("Це витратні частини", "These are consumables"),
      detail: both(
        "Щітки, диски й оснастку міняють за свій рахунок. Підбери їх у каталозі.",
        "Brushes, discs and accessories are replaced at your own cost. Pick them in the catalog.",
      ),
    },
    covered: {
      title: both("Гарантія діє", "The warranty applies"),
    },
  },
  catalogLink: both("Перейти до каталогу", "Go to the catalog"),
  figures: [
    { value: both("14 дн.", "14 days"), label: both("ремонт", "repair") },
    { value: both("0 ₴", "0 ₴"), label: both("пересилка туди й назад", "shipping there and back") },
    { value: both("7 дн.", "7 days"), label: both("гроші, якщо поломка істотна", "refund if the defect is substantial") },
  ],
  routeLabel: both("Як звернутись", "How to apply"),
  routes: [
    {
      key: "post" as WarrantyRouteKey,
      label: both("Новою поштою", "By Nova Poshta"),
      steps: [
        both(
          "Надішли заяву з номером замовлення і фото або відео поломки.",
          "Send a claim with your order number and a photo or video of the fault.",
        ),
        both(
          "Ми дамо номер для відправки Новою поштою за наш рахунок.",
          "We give you a number to ship with Nova Poshta at our expense.",
        ),
        both(
          "Ремонт до 14 днів, інструмент повернемо так само безкоштовно.",
          "Repair takes up to 14 days; we return the tool free of charge too.",
        ),
      ],
    },
    {
      key: "store" as WarrantyRouteKey,
      label: both("У сервіс у Софіївці", "To the service center in Sofiivka"),
      steps: [
        both(
          "Привези інструмент, чек і гарантійний талон у сервіс: {address}, {hours}.",
          "Bring the tool, the receipt and the warranty card to the service center: {address}, {hours}.",
        ),
        both("Оформимо прийом і дамо квитанцію.", "We register it and give you a receipt."),
        both(
          "Ремонт до 14 днів, повідомимо, коли можна забрати.",
          "Repair takes up to 14 days; we will tell you when to pick it up.",
        ),
      ],
    },
    {
      key: "maker" as WarrantyRouteKey,
      label: both("У сервіс виробника", "To the manufacturer's service center"),
      steps: [
        both(
          "Звернись в авторизований сервіс виробника поруч з тобою.",
          "Go to an authorized manufacturer service center near you.",
        ),
        both(
          "Візьми чек або номер замовлення і гарантійний талон.",
          "Take the receipt or order number and the warranty card.",
        ),
        both(
          "Сервіс ремонтує за правилами виробника. Не допомогли, звертайся до нас.",
          "The service center repairs by the manufacturer's rules. If that does not help, contact us.",
        ),
      ],
    },
  ],
  footnote: both(
    "Знадобиться номер замовлення або чек і гарантійний талон. Не покривається: удари, падіння, вода, знос щіток, дисків і оснастки.",
    "You will need the order number or receipt and the warranty card. Not covered: impact, drops, water, wear of brushes, discs and accessories.",
  ),
};

/** Privacy page, direction B (what is stored). Three toggles, each adds records to the list. */
export type PrivacyUseKey = "browse" | "order" | "account";

export const privacyView = {
  intro: both(
    "Познач, чим ти користуєшся на сайті, і подивись, що ми про тебе зберігаємо.",
    "Mark what you use on the site and see what we store about you.",
  ),
  groupLabel: both("Чим ти користуєшся", "What you use"),
  storedLabel: both("Що зберігається", "What is stored"),
  nothing: both("Нічого", "Nothing"),
  nothingLine: both("Ми нічого про тебе не знаємо.", "We know nothing about you."),
  recordForms: [
    ["запис", "записи", "записів"],
    ["record", "records", "records"],
  ] as [[string, string, string], [string, string, string]],
  uses: [
    {
      key: "browse" as PrivacyUseKey,
      title: both("Перегляд товарів", "Browsing products"),
      sub: both("кошик, обране, порівняння", "cart, wishlist, comparison"),
      items: [
        both("Товари в кошику, обраному і порівнянні.", "Items in your cart, wishlist and comparison."),
        both("Тема сайту і твоя батарея.", "Site theme and your battery platform."),
      ],
    },
    {
      key: "order" as PrivacyUseKey,
      title: both("Замовлення", "Orders"),
      sub: both("контакти і доставка", "contacts and delivery"),
      items: [
        both("Ім’я, телефон і пошта.", "Name, phone and email."),
        both("Місто і відділення Нової пошти.", "City and Nova Poshta branch."),
        both("Коментар до замовлення.", "Order comment."),
        both("ЄДРПОУ, якщо замовляла компанія.", "EDRPOU code, if a company placed the order."),
      ],
    },
    {
      key: "account" as PrivacyUseKey,
      title: both("Кабінет", "Account"),
      sub: both("пошта і пароль", "email and password"),
      items: [both("Пошта і телефон для входу.", "Email and phone for signing in.")],
    },
  ],
  demo: both(
    "Зараз сайт демонстраційний: усе це лежить тільки в твоєму браузері й нікуди не відправляється.",
    "The site is a demo for now: all of this stays in your browser only and is sent nowhere.",
  ),
  delete: both("Видалити мої дані з цього браузера", "Delete my data from this browser"),
  confirmText: both(
    "Точно видалити? Кошик, обране і форми зникнуть.",
    "Delete for sure? Your cart, wishlist and forms will disappear.",
  ),
  confirmYes: both("Видалити", "Delete"),
  confirmNo: both("Скасувати", "Cancel"),
  deleted: both("Дані видалено", "Data deleted"),
  contact: both(
    "Хочеш дізнатись, виправити чи видалити дані: [пошта для звернень]. Відповідає за дані [назва ФОП або ТОВ], [ЄДРПОУ].",
    "Want to find out, correct or delete your data: [contact email]. The data controller is [sole proprietor (FOP) or LLC name], [EDRPOU code].",
  ),
};

/** Payment page, direction B (picker): three methods, each with a headline and three steps. */
export type PaymentMethodKey = "card" | "cod" | "invoice";

export const paymentPicker = {
  intro: both("Обери спосіб і подивись, як це відбувається.", "Pick a method and see how it works."),
  groupLabel: both("Спосіб оплати", "Payment method"),
  brandsLabel: both("Приймаємо", "We accept"),
  demo: both(
    "Сайт демонстраційний: онлайн-оплата ще не підключена.",
    "This site is a demo: online payment is not connected yet.",
  ),
  brands: ["Visa", "Mastercard", "Apple Pay", "Google Pay"],
  methods: [
    {
      key: "card" as PaymentMethodKey,
      title: both("Карткою онлайн", "Card online"),
      sub: both("Visa, Mastercard, Apple Pay, Google Pay", "Visa, Mastercard, Apple Pay, Google Pay"),
      kicker: both("Оплата на сайті", "Pay on the site"),
      headline: both("Онлайн, під час оформлення", "Online, at checkout"),
      steps: [
        both("Оформлюєш замовлення і обираєш «Карткою онлайн».", "You place the order and choose \"Card online\"."),
        both(
          "Вводиш дані картки або платиш через Apple Pay чи Google Pay.",
          "You enter your card details or pay with Apple Pay or Google Pay.",
        ),
        both("Ми відправляємо замовлення.", "We ship the order."),
      ],
    },
    {
      key: "cod" as PaymentMethodKey,
      title: both("При отриманні", "On delivery"),
      sub: both("у відділенні або в магазині", "at a branch or in the store"),
      kicker: both("Оплата при отриманні", "Pay on delivery"),
      headline: both("Платиш, коли забираєш", "You pay when you pick it up"),
      steps: [
        both("Оформлюєш замовлення і обираєш «При отриманні».", "You place the order and choose \"On delivery\"."),
        both(
          "Забираєш його у відділенні Нової пошти або в магазині в Софіївці.",
          "You pick it up at a Nova Poshta branch or at the store in Sofiivka.",
        ),
        both("Платиш на місці.", "You pay on the spot."),
      ],
    },
    {
      key: "invoice" as PaymentMethodKey,
      title: both("Рахунок", "Invoice"),
      sub: both("для ФОП і компаній", "for sole proprietors (FOP) and companies"),
      kicker: both("Безготівкова оплата", "Cashless payment"),
      headline: both("Рахунок на ФОП або компанію", "Invoice for a sole proprietor (FOP) or a company"),
      steps: [
        both(
          "В оформленні обираєш тип покупця: ФОП або компанія.",
          "At checkout you choose the buyer type: sole proprietor (FOP) or company.",
        ),
        both("Вказуєш ЄДРПОУ або ІПН.", "You enter the EDRPOU code or tax ID."),
        both(
          "Отримуєш рахунок і оплачуєш його з рахунку ФОП або компанії.",
          "You receive the invoice and pay it from the FOP or company account.",
        ),
      ],
    },
  ],
};
