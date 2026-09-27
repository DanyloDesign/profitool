"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/context";
import { href, imageOf, price } from "@/lib/shop";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { productBySlug } from "@/data/products";
import { brandBySlug } from "@/data/taxonomy";
import { useAccount, useOrders, type Order, type OrderLine, type Session } from "@/store/account";
import { cityName, useLocation } from "@/store/location";
import { useMounted } from "@/lib/use-mounted";
import { EmptyState } from "@/components/ui/empty-state";
import { IconCart, IconChevron } from "@/components/ui/icons";

/**
 * Демо-кабінет (016): один стовпець без панелей, розділювачі — волосяні лінії. Без сесії
 * веде назад на форму входу; дані профілю й замовлень живуть лише в цьому браузері.
 */
export function ProfileView() {
  const { locale } = useI18n();
  const router = useRouter();
  const mounted = useMounted();
  const session = useAccount((state) => state.session);
  const orders = useOrders((state) => state.orders);

  useEffect(() => {
    if (mounted && !session) router.replace(href(locale, "/account?mode=login"));
  }, [mounted, session, locale, router]);

  if (!mounted || !session) {
    return <div className="min-h-[60vh]" role="status" aria-busy="true" />;
  }

  const firstName = session.name.trim().split(/\s+/)[0] || session.name;

  return (
    <div className="mx-auto max-w-[640px]">
      <ProfileHeader firstName={firstName} />
      <OrdersSection orders={orders} />
      <ProfileSection session={session} />
    </div>
  );
}

function ProfileHeader({ firstName }: { firstName: string }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const logout = useAccount((state) => state.logout);

  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--hair)] pb-8">
      <div>
        <h1 className="t-h1 text-bone">{dict.account.profile.hello(firstName)}</h1>
        <p className="mt-2 text-[15px] text-bone-dim">{dict.account.profile.demo}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push(href(locale, "/account"));
        }}
        className="ghost-btn btn-sm shrink-0"
      >
        {dict.account.profile.logout}
      </button>
    </div>
  );
}

function OrdersSection({ orders }: { orders: Order[] }) {
  const { locale, dict } = useI18n();
  // Найновіше замовлення розгорнуте одразу — воно ж перше в списку (add() кладе зверху).
  const [openNumber, setOpenNumber] = useState<string | null>(orders[0]?.number ?? null);

  return (
    <section className="border-b border-[var(--hair)] py-10">
      <h2 className="t-h2 text-bone">{dict.account.profile.ordersTitle}</h2>
      {orders.length === 0 ? (
        // Той самий відступ від заголовка, що й у списку замовлень нижче (mt-5).
        <div className="mt-5">
          <EmptyState
            icon={<IconCart className="h-12 w-12" strokeWidth={1.2} />}
            title={dict.account.profile.ordersEmpty}
            text={dict.account.profile.ordersEmptyText}
            cta={{ href: href(locale, "/catalog"), label: dict.cart.emptyCta }}
          />
        </div>
      ) : (
        <ul className="mt-5 border-t border-[var(--hair)]">
          {orders.map((order) => (
            <OrderRow
              key={order.number}
              order={order}
              open={openNumber === order.number}
              onToggle={() => setOpenNumber((current) => (current === order.number ? null : order.number))}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function OrderRow({ order, open, onToggle }: { order: Order; open: boolean; onToggle: () => void }) {
  const { locale, dict } = useI18n();
  const date = new Intl.DateTimeFormat(locale === "ua" ? "uk-UA" : "ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(order.date));
  const methodShort =
    order.method === "novapost"
      ? dict.account.profile.methodShort.novapost
      : order.method === "courier"
        ? dict.account.profile.methodShort.courier
        : dict.account.profile.methodShort.pickup;
  const panelId = `order-${order.number}`;

  return (
    <li className="border-b border-[var(--hair)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 py-5 text-left"
      >
        {/* IconChevron рисован «›»: поворот на 90° даёт вниз (закрыто) / вверх (открыто), как в product-tabs. */}
        <IconChevron
          className={`h-4 w-4 shrink-0 text-bone-faint transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
        />
        <span className="min-w-0 flex-1 truncate text-[15px] text-bone">
          {order.number} · {date} · {price(order.total)} ₴
        </span>
        <span className="shrink-0 text-[15px] text-bone-dim">{methodShort}</span>
      </button>
      <div id={panelId} hidden={!open} className="pb-6 pl-8">
        <OrderLines lines={order.lines} />
        <OrderTotals order={order} />
      </div>
    </li>
  );
}

function OrderLines({ lines }: { lines: OrderLine[] }) {
  // Товар міг зникнути з каталогу — невідомий slug просто пропускаємо (без плейсхолдера).
  const resolved = lines
    .map((line) => ({ line, product: productBySlug.get(line.slug) }))
    .filter((entry): entry is { line: OrderLine; product: NonNullable<ReturnType<typeof productBySlug.get>> } =>
      Boolean(entry.product),
    );

  if (resolved.length === 0) return null;

  return (
    <ul className="grid gap-4">
      {resolved.map(({ line, product }) => (
        <li key={line.slug} className="flex items-center gap-4">
          <span className="relative h-12 w-12 shrink-0">
            <Image src={imageOf(product)} alt="" fill sizes="48px" className="object-contain" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[15px] text-bone">
            {brandBySlug.get(product.brand)?.name} {product.model} × {line.qty}
          </span>
          <span className="flex shrink-0 items-baseline gap-2">
            <span className="t-price text-base text-bone">{price(line.price * line.qty)} ₴</span>
            {line.oldPrice ? (
              <span className="text-sm text-bone-dim line-through">{price(line.oldPrice * line.qty)} ₴</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function OrderTotals({ order }: { order: Order }) {
  const { dict } = useI18n();
  const deliveryLabel =
    order.method === "novapost"
      ? dict.checkout.methodNovaPost
      : order.method === "courier"
        ? dict.checkout.methodCourier
        : dict.checkout.methodPickup;
  const paymentLabel =
    order.payment === "card"
      ? dict.checkout.payCard
      : order.payment === "delivery"
        ? dict.checkout.payOnDelivery
        : dict.checkout.payInvoice;

  return (
    <dl className="mt-5 space-y-2 border-t border-[var(--hair)] pt-4 text-[15px]">
      <div className="flex justify-between gap-4">
        <dt className="shrink-0 text-bone-dim">{dict.cart.delivery}</dt>
        <dd className="text-right text-bone">
          {deliveryLabel}
          {order.delivery > 0 ? ` · ${price(order.delivery)} ₴` : ` · ${dict.cart.deliveryFree}`}
        </dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="shrink-0 text-bone-dim">{dict.checkout.payment}</dt>
        <dd className="text-right text-bone">{paymentLabel}</dd>
      </div>
      <div className="flex justify-between text-base font-medium text-bone">
        <dt>{dict.cart.total}</dt>
        <dd className="t-price">{price(order.total)} ₴</dd>
      </div>
    </dl>
  );
}

function ProfileSection({ session }: { session: Session }) {
  const { locale, dict } = useI18n();
  const update = useAccount((state) => state.update);
  const citySlug = useLocation((state) => state.citySlug);
  const customCity = useLocation((state) => state.customCity);
  const city = cityName(locale, { citySlug, customCity }) || dict.account.profile.notSpecified;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session.name);
  const [phone, setPhone] = useState(formatPhone(session.phone));
  const [email, setEmail] = useState(session.email);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const startEdit = () => {
    setName(session.name);
    setPhone(formatPhone(session.phone));
    setEmail(session.email);
    setErrors({});
    setEditing(true);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    const normalizedPhone = phone.trim() ? normalizePhone(phone) : "";
    if (name.trim().length < 2) next.name = dict.account.profile.errName;
    if (phone.trim() && normalizedPhone === null) next.phone = dict.checkout.errPhone;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = dict.account.errEmail;
    setErrors(next);
    if (Object.keys(next).length === 0) {
      update({ name: name.trim(), phone: normalizedPhone ?? "", email: email.trim() });
      setEditing(false);
    }
  };

  return (
    <section className="py-10">
      <div className="flex items-center justify-between gap-4">
        <h2 className="t-h2 text-bone">{dict.account.profile.profileTitle}</h2>
        {!editing ? (
          <button type="button" onClick={startEdit} className="ghost-btn btn-sm">
            {dict.account.profile.edit}
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
          <ProfileField id="profile-name" label={dict.account.profile.fieldName} error={errors.name}>
            <input
              id="profile-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "profile-name-error" : undefined}
              className="field"
            />
          </ProfileField>
          <ProfileField id="profile-phone" label={dict.account.profile.fieldPhone} error={errors.phone}>
            <input
              id="profile-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+380"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "profile-phone-error" : undefined}
              className="field"
            />
          </ProfileField>
          <ProfileField id="profile-email" label={dict.account.email} error={errors.email}>
            <input
              id="profile-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "profile-email-error" : undefined}
              className="field"
            />
          </ProfileField>
          <div className="flex gap-3">
            <button type="submit" className="signal-btn btn-sm">
              {dict.account.profile.save}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="ghost-btn btn-sm">
              {dict.account.profile.cancel}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-6">
          <Row label={dict.account.profile.fieldName} value={session.name} />
          <Row label={dict.account.profile.fieldPhone} value={session.phone ? formatPhone(session.phone) : dict.account.profile.notSpecified} />
          <Row label={dict.account.email} value={session.email} />
          <Row label={dict.account.profile.fieldCity} value={city} last />
        </dl>
      )}
    </section>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 text-[15px] ${last ? "" : "border-b border-[var(--hair)]"}`}>
      <dt className="text-bone-dim">{label}</dt>
      <dd className="min-w-0 truncate text-right text-bone">{value}</dd>
    </div>
  );
}

function ProfileField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
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
