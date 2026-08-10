"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { customerRegister } from "@/lib/api/customer-auth";
import { COUNTRIES } from "@/lib/data/countries";
import { CURRENCIES } from "@/lib/data/currencies";
import { formatApiError, useRateLimit } from "@/lib/hooks/use-rate-limit";
import { useAuthStore } from "@/lib/stores/auth-store";
import { zodFieldErrors } from "@/lib/utils/form-errors";
import { customerRegisterSchema } from "@/lib/validators/customer-auth";

export function RegisterForm() {
  const router = useRouter();
  const setCustomerSession = useAuthStore((s) => s.setCustomerSession);
  const rateLimit = useRateLimit();
  const [countryCode, setCountryCode] = useState("NG");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    variant: "error" | "success" | "info" | "warning";
    title: string;
    items?: string[];
  } | null>(null);
  const [pending, setPending] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode),
    [countryCode],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAlert(null);
    setErrors({});
    if (rateLimit.isLimited) {
      setAlert({
        variant: "warning",
        title: `Too many attempts. Retry in ${rateLimit.secondsLeft}s.`,
      });
      return;
    }

    const form = new FormData(e.currentTarget);
    const parsed = customerRegisterSchema.safeParse({
      firstname: form.get("firstname"),
      lastname: form.get("lastname"),
      email: form.get("email"),
      mobile: form.get("mobile"),
      password: form.get("password"),
      password_confirmation: form.get("password_confirmation"),
      country_code: form.get("country_code"),
      country: selectedCountry?.country,
      currency_code: form.get("currency_code"),
      agree: form.get("agree") === "on",
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setPending(true);
    try {
      const data = await customerRegister({
        ...parsed.data,
        agree: 1,
      });
      setCustomerSession(data);
      setAlert({
        variant: "success",
        title: "Registration successful",
        items: ["Verify your email and mobile codes to activate your account."],
      });
      router.push(
        `/register/verify?email=${encodeURIComponent(parsed.data.email)}&mobile=${encodeURIComponent(parsed.data.mobile)}`,
      );
    } catch (error) {
      rateLimit.applyFromError(error);
      const formatted = formatApiError(error);
      setAlert({
        variant: "error",
        title: formatted.message,
        items: formatted.errors,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {alert ? (
        <Alert variant={alert.variant} title={alert.title} items={alert.items} />
      ) : null}
      {rateLimit.isLimited ? (
        <Alert variant="warning" title={`Rate limited · wait ${rateLimit.secondsLeft}s`} />
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="firstname" label="First name" error={errors.firstname} />
          <Input name="lastname" label="Last name" error={errors.lastname} />
        </div>
        <Input
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email}
        />
        <Input
          name="mobile"
          label="Mobile"
          placeholder="8012345678"
          error={errors.mobile}
        />
        <Select
          name="country_code"
          label="Country"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          error={errors.country_code || errors.country}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.country} (+{country.dial_code})
            </option>
          ))}
        </Select>
        <Select
          name="currency_code"
          label="Currency"
          defaultValue="NGN"
          error={errors.currency_code}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.label}
            </option>
          ))}
        </Select>
        <Input
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          error={errors.password}
        />
        <Input
          name="password_confirmation"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          error={errors.password_confirmation}
        />
        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="agree"
            className="mt-1 size-4 rounded border-border"
          />
          <span>
            I agree to the terms of service and privacy policy.
            {errors.agree ? (
              <span className="mt-1 block text-xs text-danger">{errors.agree}</span>
            ) : null}
          </span>
        </label>
        <Button
          type="submit"
          className="w-full"
          disabled={pending || rateLimit.isLimited}
        >
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
