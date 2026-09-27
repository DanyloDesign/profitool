"use client";

import Image from "next/image";
import { useMounted } from "@/lib/use-mounted";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/i18n/context";
import { brandBySlug } from "@/data/taxonomy";
import { DELIVERY_COST, FREE_DELIVERY_FROM, href, imageOf, orderTotals, price, type DeliveryMethod } from "@/lib/shop";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { useCart, useLastOrder } from "@/store/shop";
import { useAccount, useOrders, type OrderLine, type Payment } from "@/store/account";
import { cityName, useLocation } from "@/store/location";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCart, IconCheck } from "@/components/ui/icons";

/** Номер демонстрационного заказа. Настоящий выдаст бэкенд. */
function makeOrderNumber(): string {
  return `PT-${Math.floor(100000 + Math.random() * 899999)}`;
}

type Method = DeliveryMethod;
type BuyerType = "person" | "fop" | "company";
/** Снимок заказа на экране «Замовлення прийнято»: корзину уже очистили, строки берём из этого. */
type ConfirmedOrder = {
  lines: ReturnType<typeof orderTotals>["lines"];
  delivery: number;
  total: number;
  method: Method;
  payment: Payment;
};

export function CheckoutForm() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const [method, setMethod] = useState<Method>("novapost");
  const [payment, setPayment] = useState<Payment>("card");
  const [buyerType, setBuyerType] = useState<BuyerType>("person");
  const [recipientDifferent, setRecipientDifferent] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null);

  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const saveLastOrder = useLastOrder((state) => state.save);

  // Демо-сесія (016): якщо покупець уже «увійшов», підставляємо контакти й записуємо
  // підтверджене замовлення в його історію — бекенду немає, все живе в цьому браузері.
  const session = useAccount((state) => state.session);
  const addOrder = useOrders((state) => state.add);
  const updateSession = useAccount((state) => state.update);

  const citySlug = useLocation((state) => state.citySlug);
  const customCity = useLocation((state) => state.customCity);
  const locationCity = mounted ? cityName(locale, { citySlug, customCity }) : "";

  // Підпис рахунку залежить від типу покупця (review round 2, #18) — рахуємо тут, до ранніх
  // return'ів, бо цей лейбл потрібен і на екрані підтвердження (обраний спосіб оплати).
  const invoiceLabel =
    buyerType === "fop"
      ? dict.checkout.payInvoiceFop
      : buyerType === "company"
        ? dict.checkout.payInvoiceCompany
        : dict.checkout.payInvoice;

  const schema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .trim()
            .min(3, dict.checkout.errName)
            .refine((value) => value.split(/\s+/).length >= 2, dict.checkout.errName),
          phone: z.string().trim(),
          email: z.string().trim().optional(),
          city: z.string().trim().optional(),
          branch: z.string().trim().optional(),
          edrpou: z.string().trim().optional(),
          recipientName: z.string().trim().optional(),
          recipientPhone: z.string().trim().optional(),
          comment: z.string().trim().optional(),
        })
        .superRefine((values, ctx) => {
          if (!normalizePhone(values.phone)) {
            ctx.addIssue({ code: "custom", path: ["phone"], message: dict.checkout.errPhone });
          }
          const email = values.email ?? "";
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            ctx.addIssue({ code: "custom", path: ["email"], message: dict.checkout.errEmail });
          }
          // Самовивіз не питає місто й адресу (proposal 013, C.2) — поля сховані в розмітці,
          // тут просто не валідуємо їх для цього методу.
          if (method !== "pickup") {
            if ((values.city ?? "").trim().length < 2) {
              ctx.addIssue({ code: "custom", path: ["city"], message: dict.checkout.errCity });
            }
            const branchMessage = method === "novapost" ? dict.checkout.errBranch : dict.checkout.errAddress;
            if ((values.branch ?? "").trim().length < 1) {
              ctx.addIssue({ code: "custom", path: ["branch"], message: branchMessage });
            }
          }
          if (buyerType !== "person" && !/^\d{8}$|^\d{10}$/.test(values.edrpou ?? "")) {
            ctx.addIssue({ code: "custom", path: ["edrpou"], message: dict.checkout.errEdrpou });
          }
          if (recipientDifferent) {
            if ((values.recipientName ?? "").trim().length < 3) {
              ctx.addIssue({ code: "custom", path: ["recipientName"], message: dict.checkout.errName });
            }
            if (!normalizePhone(values.recipientPhone ?? "")) {
              ctx.addIssue({ code: "custom", path: ["recipientPhone"], message: dict.checkout.errPhone });
            }
          }
        }),
    [dict, buyerType, recipientDifferent, method],
  );

  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur" });

  // Подставляем город из шапки один раз, когда стор гидратировался: дальше покупатель волен его сменить.
  const cityPreset = useRef(false);
  useEffect(() => {
    if (mounted && !cityPreset.current && locationCity) {
      setValue("city", locationCity);
      cityPreset.current = true;
    }
  }, [mounted, locationCity, setValue]);

  // Те саме для контактів із демо-сесії: підставляємо один раз, покупець може змінити перед відправкою.
  const contactPreset = useRef(false);
  useEffect(() => {
    if (mounted && !contactPreset.current && session) {
      if (session.name) setValue("name", session.name);
      if (session.phone) setValue("phone", formatPhone(session.phone));
      if (session.email) setValue("email", session.email);
      contactPreset.current = true;
    }
  }, [mounted, session, setValue]);

  // orderTotals(items, method) — єдина функція підсумків (proposal 013, workstream B): з обраним
  // методом вона додає доставку до суми (самовивіз — безкоштовно).
  const { lines, gross, discount, subtotal, delivery, total, pieces } = orderTotals(items, method);

  // Прокрутка нагору й фокус на заголовку підтвердження одразу після сабміту (proposal 013, C.1):
  // покупач на 390px інакше лишається внизу сторінки, дивлячись у футер.
  useEffect(() => {
    if (!orderNumber) return;
    window.scrollTo(0, 0);
    confirmationHeadingRef.current?.focus({ preventScroll: true });
  }, [orderNumber]);

  if (!mounted) {
    return (
      <>
        <h1 className="t-h1 text-bone">{dict.checkout.title}</h1>
        <div className="mt-9 min-h-[40vh]" role="status" aria-busy="true" />
      </>
    );
  }

  if (orderNumber && confirmedOrder) {
    const deliveryLabel =
      confirmedOrder.method === "novapost"
        ? dict.checkout.methodNovaPost
        : confirmedOrder.method === "courier"
          ? dict.checkout.methodCourier
          : dict.checkout.methodPickup;
    const paymentLabel =
      confirmedOrder.payment === "card"
        ? dict.checkout.payCard
        : confirmedOrder.payment === "delivery"
          ? dict.checkout.payOnDelivery
          : invoiceLabel;

    return (
      // «Оформлення» тут навмисно немає (proposal 013, C.1): єдиний заголовок екрана — h1 нижче,
      // на нього переходить фокус, щоб покупець на телефоні не лишався дивитись у футер.
      <div className="flex flex-col items-center border-t border-[var(--hair)] px-2 py-20 text-center md:py-28">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-signal text-black">
          <IconCheck className="h-8 w-8" strokeWidth={2.2} />
        </span>
        <h1 ref={confirmationHeadingRef} tabIndex={-1} className="t-section mt-8 text-bone outline-none">
          {dict.checkout.doneTitle}
        </h1>
        <p className="mt-4 max-w-md text-base text-bone-dim" role="status">
          {dict.checkout.doneText(orderNumber)}
        </p>

        <div className="mt-8 w-full max-w-md border-t border-[var(--hair)] pt-6 text-left">
          <h2 className="text-base font-medium text-bone">{dict.cart.summary}</h2>
          <ul className="mt-3 divide-y divide-[var(--hair)]">
            {confirmedOrder.lines.map(({ product, qty, sum }) => (
              <li key={product.slug} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                <span className="min-w-0 flex-1 truncate text-bone-dim">
                  {brandBySlug.get(product.brand)?.name} {product.model} × {qty}
                </span>
                <span className="t-price shrink-0 text-bone">{price(sum)} ₴</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-bone-dim">{dict.cart.delivery}</dt>
              <dd className="text-right text-bone">
                {deliveryLabel}
                {confirmedOrder.delivery > 0 ? ` · ${price(confirmedOrder.delivery)} ₴` : ` · ${dict.cart.deliveryFree}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-bone-dim">{dict.checkout.payment}</dt>
              <dd className="text-right text-bone">{paymentLabel}</dd>
            </div>
            <div className="flex justify-between text-base font-medium text-bone">
              <dt>{dict.cart.total}</dt>
              <dd className="t-price">{price(confirmedOrder.total)} ₴</dd>
            </div>
          </dl>
        </div>

        <Link href={href(locale, "/catalog")} className="signal-btn mt-9">
          {dict.checkout.doneCta}
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <h1 className="t-h1 text-bone">{dict.checkout.title}</h1>
        <div className="mt-9">
          <EmptyState
            icon={<IconCart className="h-12 w-12" strokeWidth={1.2} />}
            title={dict.cart.empty}
            text={dict.cart.emptyText}
            cta={{ href: href(locale, "/catalog"), label: dict.cart.emptyCta }}
          />
        </div>
      </>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    // Бэкенда нет: подтверждаем заказ локально, сохраняем его как «последний» (для «Повторити
    // замовлення» в пустой корзине) и чистим корзину. Снимок строк снимаем до clear(), иначе
    // экран підтвердження лишиться без товарів (items стане порожнім одразу після очищення).
    const summary: ConfirmedOrder = { lines, delivery, total, method, payment };
    const number = makeOrderNumber();
    // Кабінет (016): у історію замовлень пишемо тільки slug і ціни на момент покупки,
    // не весь товар — він може змінитись або зникнути з каталогу.
    const orderLines: OrderLine[] = lines.map(({ product, qty }) => ({
      slug: product.slug,
      qty,
      price: product.price,
      ...(product.oldPrice ? { oldPrice: product.oldPrice } : {}),
    }));
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    saveLastOrder(items, number);
    addOrder({ number, date: new Date().toISOString(), lines: orderLines, total, delivery, method, payment });
    // Кабінет (016): після входу через пошту телефону в профілі немає — беремо його з першого замовлення.
    if (session && !session.phone) updateSession({ phone: normalizePhone(values.phone) ?? "" });
    clear();
    setConfirmedOrder(summary);
    setOrderNumber(number);
  });

  const shipCost = subtotal >= FREE_DELIVERY_FROM ? dict.cart.deliveryFree : `${dict.common.from} ${price(DELIVERY_COST)} ₴`;

  return (
    <>
      <h1 className="t-h1 text-bone">{dict.checkout.title}</h1>
      <form
        onSubmit={onSubmit}
        className="mt-9 grid gap-x-[72px] gap-y-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
        noValidate
      >
        <div className="space-y-12">
          <Step n={1} title={dict.checkout.contacts}>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Field label={`${dict.checkout.name} *`} error={errors.name?.message} id="name">
                <input
                  {...register("name")}
                  id="name"
                  autoComplete="name"
                  className="field"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </Field>
              <Field label={`${dict.checkout.phone} *`} error={errors.phone?.message} id="phone">
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+380 67 123 45 67"
                  className="field"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={dict.checkout.email} error={errors.email?.message} id="email">
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="field"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </Field>
              </div>

              <Field label={dict.checkout.buyerType} id="buyerType">
                <select
                  id="buyerType"
                  value={buyerType}
                  onChange={(event) => setBuyerType(event.target.value as BuyerType)}
                  className="field"
                >
                  <option value="person">{dict.checkout.buyerPerson}</option>
                  <option value="fop">{dict.checkout.buyerFop}</option>
                  <option value="company">{dict.checkout.buyerCompany}</option>
                </select>
              </Field>

              {buyerType !== "person" ? (
                <Field label={`${dict.checkout.edrpou} *`} error={errors.edrpou?.message} id="edrpou">
                  <input
                    {...register("edrpou")}
                    id="edrpou"
                    inputMode="numeric"
                    className="field"
                    aria-invalid={!!errors.edrpou}
                    aria-describedby={errors.edrpou ? "edrpou-error" : undefined}
                  />
                </Field>
              ) : null}

              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    checked={recipientDifferent}
                    onChange={(event) => setRecipientDifferent(event.target.checked)}
                    className="check"
                  />
                  <span className="text-[15px] text-bone">{dict.checkout.recipientDifferent}</span>
                </label>
              </div>

              {recipientDifferent ? (
                <>
                  <Field
                    label={`${dict.checkout.recipientName} *`}
                    error={errors.recipientName?.message}
                    id="recipientName"
                  >
                    <input
                      {...register("recipientName")}
                      id="recipientName"
                      autoComplete="name"
                      className="field"
                      aria-invalid={!!errors.recipientName}
                      aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
                    />
                  </Field>
                  <Field
                    label={`${dict.checkout.recipientPhone} *`}
                    error={errors.recipientPhone?.message}
                    id="recipientPhone"
                  >
                    <input
                      {...register("recipientPhone")}
                      id="recipientPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+380 67 123 45 67"
                      className="field"
                      aria-invalid={!!errors.recipientPhone}
                      aria-describedby={errors.recipientPhone ? "recipientPhone-error" : undefined}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </Step>

          <Step n={2} title={dict.checkout.deliveryTitle}>
            <fieldset className="grid gap-3">
              <legend className="sr-only">{dict.checkout.deliveryTitle}</legend>
              <Choice
                name="method"
                checked={method === "novapost"}
                onChange={() => setMethod("novapost")}
                label={dict.checkout.methodNovaPost}
                aside={shipCost}
              />
              <Choice
                name="method"
                checked={method === "courier"}
                onChange={() => setMethod("courier")}
                label={dict.checkout.methodCourier}
                aside={shipCost}
              />
              <Choice
                name="method"
                checked={method === "pickup"}
                onChange={() => setMethod("pickup")}
                label={dict.checkout.methodPickup}
                aside={dict.cart.deliveryFree}
                good
              />
            </fieldset>

            {/* Самовивіз не питає місто й адресу — поля сховано і не валідуються (proposal 013, C.2). */}
            {method !== "pickup" ? (
              <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field label={`${dict.checkout.city} *`} error={errors.city?.message} id="city">
                  <input
                    {...register("city")}
                    id="city"
                    autoComplete="address-level2"
                    className="field"
                    aria-invalid={!!errors.city}
                    aria-describedby={errors.city ? "city-error" : undefined}
                  />
                </Field>
                <Field
                  label={`${method === "novapost" ? dict.checkout.branch : dict.checkout.address} *`}
                  error={errors.branch?.message}
                  id="branch"
                >
                  <input
                    {...register("branch")}
                    id="branch"
                    autoComplete="street-address"
                    className="field"
                    aria-invalid={!!errors.branch}
                    aria-describedby={errors.branch ? "branch-error" : undefined}
                  />
                </Field>
              </div>
            ) : null}
          </Step>

          <Step n={3} title={dict.checkout.payment}>
            <fieldset className="grid gap-3">
              <legend className="sr-only">{dict.checkout.payment}</legend>
              <Choice
                name="payment"
                checked={payment === "card"}
                onChange={() => setPayment("card")}
                label={dict.checkout.payCard}
              />
              <Choice
                name="payment"
                checked={payment === "delivery"}
                onChange={() => setPayment("delivery")}
                label={dict.checkout.payOnDelivery}
              />
              <Choice
                name="payment"
                checked={payment === "invoice"}
                onChange={() => setPayment("invoice")}
                label={invoiceLabel}
              />
            </fieldset>

            <div className="mt-5">
              <Field label={dict.checkout.comment} id="comment">
                <textarea
                  {...register("comment")}
                  id="comment"
                  rows={3}
                  placeholder={dict.checkout.commentPlaceholder}
                  className="field field-area"
                />
              </Field>
            </div>
          </Step>
        </div>

        <aside aria-label={dict.cart.summary} className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-bone-dim">{dict.cart.label}</span>
            <Link href={href(locale, "/cart")} className="text-[14px] text-signal-text hover:underline">
              {dict.checkout.changeCart}
            </Link>
          </div>
          <ul className="mt-3 border-t border-[var(--hair)]">
            {lines.map(({ product, qty, sum }) => (
              <li key={product.slug} className="flex items-center gap-4 border-b border-[var(--hair)] py-4">
                <span className="relative h-14 w-14 shrink-0">
                  <Image src={imageOf(product)} alt="" fill sizes="56px" className="object-contain" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-bone">
                    {brandBySlug.get(product.brand)?.name} {product.model}
                  </span>
                  <span className="text-sm text-bone-dim">
                    {qty} {dict.common.pcs}
                  </span>
                </span>
                <span className="flex items-baseline gap-2 shrink-0">
                  <span className="t-price text-lg">{price(sum)} ₴</span>
                  {product.oldPrice ? (
                    <span className="text-sm text-bone-dim line-through">{price(product.oldPrice * qty)} ₴</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          <dl>
            <div className="flex justify-between border-b border-[var(--hair)] py-3.5">
              <dt className="text-base text-bone-dim">{dict.cart.items(pieces)}</dt>
              <dd className="t-price text-lg text-bone">{price(gross)} ₴</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between border-b border-[var(--hair)] py-3.5">
                <dt className="text-base text-bone-dim">{dict.common.discount}</dt>
                <dd className="t-price text-lg text-signal-text">−{price(discount)} ₴</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-b border-[var(--hair)] py-3.5">
              <dt className="text-base text-bone-dim">{dict.cart.delivery}</dt>
              <dd className={`text-base ${delivery === 0 ? "text-stock" : "text-bone"}`}>
                {delivery === 0 ? dict.cart.deliveryFree : `${price(delivery)} ₴`}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-xl font-medium">{dict.cart.total}</span>
            <span className="t-price text-3xl lg:text-[34px]">{price(total)} ₴</span>
          </div>

          <button type="submit" disabled={isSubmitting} className="signal-btn btn-lg mt-6 w-full">
            {dict.checkout.submit}
          </button>
          <p className="mt-4 text-sm leading-normal text-bone-dim">{dict.checkout.demo}</p>
        </aside>
      </form>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-4">
        <span
          aria-hidden
          className="t-price grid h-[34px] w-[34px] place-items-center rounded-full bg-signal text-[15px] text-black"
        >
          {n}
        </span>
        <span className="t-h2 text-bone">{title}</span>
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  id,
  children,
}: {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] text-bone-dim">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-warn">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  name,
  checked,
  onChange,
  label,
  aside,
  good,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  aside?: string;
  good?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-[20px] border px-5 py-4 transition-colors ${
        checked ? "border-signal" : "border-[var(--hair-strong)] hover:border-bone-dim"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="radio" />
      <span className="min-w-0 flex-1 text-base font-medium leading-snug text-bone">{label}</span>
      {aside ? <span className={`shrink-0 text-[15px] ${good ? "text-stock" : "text-bone-dim"}`}>{aside}</span> : null}
    </label>
  );
}
