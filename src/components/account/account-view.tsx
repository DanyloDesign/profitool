"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useI18n } from "@/i18n/context";
import { href } from "@/lib/shop";
import { IconAlert, IconCheck } from "@/components/ui/icons";

type Mode = "login" | "register";

/**
 * Экран входа и регистрации: одна форма за раз, регистрация по умолчанию.
 * Режим живёт в query `?mode=login`, поэтому «назад» и прямые ссылки работают
 * без полной перезагрузки. Учётных записей на сервере пока нет: формы
 * проверяют ввод и честно сообщают, что кабинет не работает.
 */
export function AccountView() {
  const { dict } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode: Mode = searchParams.get("mode") === "login" ? "login" : "register";

  const firstFieldRef = useRef<HTMLInputElement>(null);
  // Фокус только при смене режима. Флаг «уже смонтирован» ломается в StrictMode:
  // эффект запускается дважды и поле получает фокус сразу при открытии страницы.
  const prevMode = useRef(mode);

  useEffect(() => {
    if (prevMode.current !== mode) {
      prevMode.current = mode;
      firstFieldRef.current?.focus();
    }
  }, [mode]);

  const loginHref = `${pathname}?mode=login`;
  const registerHref = pathname;

  return (
    <div className="mx-auto max-w-[440px]">
      <Panel title={mode === "login" ? dict.account.login : dict.account.register}>
        {mode === "login" ? (
          <LoginForm firstFieldRef={firstFieldRef} switchHref={registerHref} />
        ) : (
          <RegisterForm firstFieldRef={firstFieldRef} switchHref={loginHref} />
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  // Одна рамка для обоих режимов: акцент остался от раскладки «две формы рядом»
  return (
    <section className="rounded-[32px] border border-[var(--hair-strong)] p-6 sm:p-8">
      <h2 className="t-h2 text-bone" aria-live="polite">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
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
        <p role="alert" className="mt-1.5 text-sm text-warn">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SwitchLink({ toLogin, targetHref }: { toLogin: boolean; targetHref: string }) {
  const { dict } = useI18n();
  return (
    <p className="text-[15px] text-bone-dim">
      {toLogin ? dict.account.toLoginLead : dict.account.toRegisterLead}{" "}
      <Link href={targetHref} scroll={false} className="text-signal-text hover:underline">
        {toLogin ? dict.account.toLoginAction : dict.account.toRegisterAction}
      </Link>
    </p>
  );
}

function Notice() {
  const { locale, dict } = useI18n();
  return (
    <div role="status" className="mt-5 flex items-start gap-3 rounded-[20px] border border-signal p-4">
      <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-signal-text" />
      <div>
        <p className="text-[15px] leading-normal text-bone">{dict.account.unavailable}</p>
        <Link href={href(locale, "/catalog")} className="mt-2 inline-block text-[15px] text-signal-text hover:underline">
          {dict.account.toCatalog}
        </Link>
      </div>
    </div>
  );
}

function LoginForm({
  firstFieldRef,
  switchHref,
}: {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  switchHref: string;
}) {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!z.string().email().safeParse(email.trim()).success) next.email = dict.account.errEmail;
    if (!password) next.password = dict.account.errLoginPassword;
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field id="login-email" label={dict.account.email} error={errors.email}>
          <input
            ref={firstFieldRef}
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!errors.email}
            className="field"
          />
        </Field>
        <Field id="login-password" label={dict.account.password} error={errors.password}>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!errors.password}
            className="field"
          />
        </Field>
        <p className="text-[15px] text-bone-dim">{dict.account.forgot}</p>
        <button type="submit" className="signal-btn w-full">
          {dict.account.submitLogin}
        </button>
        <SwitchLink toLogin={false} targetHref={switchHref} />
      </form>
      {done ? <Notice /> : null}
    </>
  );
}

function RegisterForm({
  firstFieldRef,
  switchHref,
}: {
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  switchHref: string;
}) {
  const { dict } = useI18n();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  const rules = [
    { ok: password.length >= 8, label: dict.account.ruleLength },
    { ok: /\d/.test(password), label: dict.account.ruleDigit },
    { ok: /\p{Lu}/u.test(password), label: dict.account.ruleUpper },
  ];
  const score = rules.filter((rule) => rule.ok).length;
  const strength =
    score === 3
      ? dict.account.strengthStrong
      : score === 2
        ? dict.account.strengthMedium
        : dict.account.strengthWeak;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!z.string().email().safeParse(email.trim()).success) next.email = dict.account.errEmail;
    if (score < 3) next.password = dict.account.errPassword;
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="grid gap-5">
        <Field id="reg-email" label={`${dict.account.email} *`} error={errors.email}>
          <input
            ref={firstFieldRef}
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={!!errors.email}
            className="field"
          />
        </Field>
        <Field id="reg-phone" label={dict.account.phone}>
          <input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+380"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field"
          />
        </Field>
        <Field id="reg-password" label={`${dict.account.password} *`} error={errors.password}>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            className="field"
          />
        </Field>

        <div id="password-rules" className="-mt-1">
          <div className="flex items-center gap-4">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={`h-1 flex-1 rounded-full ${step <= score ? "bg-signal" : "bg-ink-600"}`}
                />
              ))}
            </div>
            <span className="text-sm text-bone-dim" aria-live="polite">
              {password ? strength : ""}
            </span>
          </div>
          <ul className="mt-3 grid gap-1.5">
            {rules.map((rule) => (
              <li key={rule.label} className={`flex items-center gap-2.5 text-[15px] ${rule.ok ? "text-bone" : "text-bone-dim"}`}>
                {rule.ok ? (
                  <IconCheck className="h-4 w-4 text-signal-text" />
                ) : (
                  <span className="ml-0.5 mr-0.5 h-3 w-3 rounded-full border border-bone-dim" aria-hidden />
                )}
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="signal-btn w-full">
          {dict.account.submitRegister}
        </button>
        <p className="text-sm leading-normal text-bone-dim">{dict.account.consent}</p>
        <SwitchLink toLogin={true} targetHref={switchHref} />
      </form>
      {done ? <Notice /> : null}
    </>
  );
}
