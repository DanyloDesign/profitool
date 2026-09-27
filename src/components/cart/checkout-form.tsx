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
import { cartTotals, DELIVERY_COST, FREE_DELIVERY_FROM, href, imageOf, price } from "@/lib/shop";
import { useCart, useLastOrder } from "@/store/shop";
import { cityName, useLocation } from "@/store/location";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCart, IconCheck } from "@/components/ui/icons";

/** Номер демонстрационного заказа. Настоящий выдаст бэкенд. */
function makeOrderNumber(): string {
  return `PT-${Math.floor(100000 + Math.random() * 899999)}`;
}

type Method = "novapost" | "courier" | "pickup";
type Payment = "card" | "delivery" | "invoice";
type BuyerType = "person" | "fop" | "company";

export function CheckoutForm() {
  const { locale, dict } = useI18n();
  const mounted = useMounted();
  const [method, setMethod] = useState<Method>("novapost");
  const [payment, setPayment] = useState<Payment>("card");
  const [buyerType, setBuyerType] = useState<BuyerType>("person");
  const [recipientDifferent, setRecipientDifferent] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const saveLastOrder = useLastOrder((state) => state.save);

  const citySlug = useLocation((state) => state.citySlug);
  const customCity = useLocation((state) => state.customCity);
  const locationCity = mounted ? cityName(locale, { citySlug, customCity }) : "";

  const schema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .trim()
            .min(3, dict.checkout.errName)
            .refine((value) => value.split(/\s+/).length >= 2, dict.checkout.errName),
          phone: z
            .string()
            .trim()
            .regex(/^\+?380\d{9}$/, dict.checkout.errPhone),
          email: z.string().trim().email(dict.checkout.errEmail),
          city: z.string().trim().min(2, dict.checkout.errCity),
          branch: z.string().trim().min(1, dict.checkout.errBranch),
          edrpou: z.string().trim().optional(),
          recipientName: z.string().trim().optional(),
          recipientPhone: z.string().trim().optional(),
          comment: z.string().trim().optional(),
        })
        .superRefine((values, ctx) => {
          if (buyerType !== "person" && !/^\d{8}$|^\d{10}$/.test(values.edrpou ?? "")) {
            ctx.addIssue({ code: "custom", path: ["edrpou"], message: dict.checkout.errEdrpou });
          }
          if (recipientDifferent) {
            if ((values.recipientName ?? "").trim().length < 3) {
              ctx.addIssue({ code: "custom", path: ["recipientName"], message: dict.checkout.errName });
            }
            if (!/^\+?380\d{9}$/.test(values.recipientPhone ?? "")) {
              ctx.addIssue({ code: "custom", path: ["recipientPhone"], message: dict.checkout.errPhone });
            }
          }
        }),
    [dict, buyerType, recipientDifferent],
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

  const { lines, gross, discount, subtotal } = cartTotals(items);
  const delivery = method === "pickup" || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;
  const total = subtotal + delivery;

  if (!mounted) return <div className="min-h-[40vh]" role="status" aria-busy="true" />;

  if (orderNumber) {
    return (
      <div className="flex flex-col items-center border-t border-[var(--hair)] px-2 py-20 text-center md:py-28">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-signal text-black">
          <IconCheck className="h-8 w-8" strokeWidth={2.2} />
        </span>
        <h2 className="t-section mt-8 text-bone">{dict.checkout.doneTitle}</h2>
        <p className="mt-4 max-w-md text-base text-bone-dim" role="status">
          {dict.checkout.doneText(orderNumber)}
        </p>
        <Link href={href(locale, "/catalog")} className="signal-btn mt-9">
          {dict.checkout.doneCta}
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<IconCart className="h-12 w-12" strokeWidth={1.2} />}
        title={dict.cart.empty}
        text={dict.cart.emptyText}
        cta={{ href: href(locale, "/catalog"), label: dict.cart.emptyCta }}
      />
    );
  }

  const onSubmit = handleSubmit(async () => {
    // Бэкенда нет: подтверждаем заказ локально, сохраняем его как «последний» (для «Повторити
    // замовлення» в пустой корзине) и чистим корзину.
    const number = makeOrderNumber();
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    saveLastOrder(items, number);
    clear();
    setOrderNumber(number);
  });

  const shipCost = subtotal >= FREE_DELIVERY_FROM ? dict.cart.deliveryFree : `${dict.common.from} ${price(DELIVERY_COST)} ₴`;

  // Подпись счёта зависит от типа покупателя (review round 2, #18): нейтральная по умолчанию.
  const invoiceLabel =
    buyerType === "fop"
      ? dict.checkout.payInvoiceFop
      : buyerType === "company"
        ? dict.checkout.payInvoiceCompany
        : dict.checkout.payInvoice;

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-x-[72px] gap-y-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
      noValidate
    >
      <div className="space-y-12">
        <Step n={1} title={dict.checkout.contacts}>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field label={dict.checkout.name} error={errors.name?.message} id="name">
              <input {...register("name")} id="name" autoComplete="name" className="field" aria-invalid={!!errors.name} />
            </Field>
            <Field label={dict.checkout.phone} error={errors.phone?.message} id="phone">
              <input
                {...register("phone")}
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+380"
                className="field"
                aria-invalid={!!errors.phone}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={dict.checkout.email} error={errors.email?.message} id="email">
                <input
                  {...register("email")}
                  id="email"
                  inputMode="email"
                  autoComplete="email"
                  className="field"
                  aria-invalid={!!errors.email}
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
              <Field label={dict.checkout.edrpou} error={errors.edrpou?.message} id="edrpou">
                <input
                  {...register("edrpou")}
                  id="edrpou"
                  inputMode="numeric"
                  className="field"
                  aria-invalid={!!errors.edrpou}
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
                <Field label={dict.checkout.recipientName} error={errors.recipientName?.message} id="recipientName">
                  <input
                    {...register("recipientName")}
                    id="recipientName"
                    autoComplete="name"
                    className="field"
                    aria-invalid={!!errors.recipientName}
                  />
                </Field>
                <Field
                  label={dict.checkout.recipientPhone}
                  error={errors.recipientPhone?.message}
                  id="recipientPhone"
                >
                  <input
                    {...register("recipientPhone")}
                    id="recipientPhone"
                    inputMode="tel"
                    placeholder="+380"
                    className="field"
                    aria-invalid={!!errors.recipientPhone}
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

          <div className="mt-5 grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Field label={dict.checkout.city} error={errors.city?.message} id="city">
              <input
                {...register("city")}
                id="city"
                autoComplete="address-level2"
                className="field"
                aria-invalid={!!errors.city}
              />
            </Field>
            <Field
              label={method === "novapost" ? dict.checkout.branch : dict.checkout.address}
              error={errors.branch?.message}
              id="branch"
            >
              <input
                {...register("branch")}
                id="branch"
                autoComplete="street-address"
                className="field"
                aria-invalid={!!errors.branch}
              />
            </Field>
          </div>
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
              <span className="t-price shrink-0 text-lg">{price(sum)} ₴</span>
            </li>
          ))}
        </ul>

        <dl>
          {discount > 0 ? (
            <div className="flex justify-between border-b border-[var(--hair)] py-3.5">
              <dt className="text-base text-bone-dim">{dict.common.discount}</dt>
              <dd className="t-price text-lg text-signal-text">−{price(gross - subtotal)} ₴</dd>
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
        <p role="alert" className="mt-1.5 text-sm text-warn">
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
