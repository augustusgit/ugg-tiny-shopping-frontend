# Tiny Store

Frontend ecommerce UI with storefront, customer dashboard, and admin panel.

Authentication talks to the Laravel backend. Catalog CRUD still uses a local mock until product APIs are wired.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Zustand (auth session)
- TanStack React Query (catalog data)
- Zod (form validation)

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_ACCESS_KEY=73647874537947434
```

`x-access-key` must match Laravel `APP_ACCESS_KEY`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Auth routes

| Realm    | Paths |
|----------|-------|
| Customer | `/login`, `/register`, `/register/verify`, `/forgot-password`, `/reset-password` |
| Admin    | `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` |

### Customer API

- `POST /customer/login` `{ username, password }`
- `POST /customer/register` + verify/resend
- `POST /customer/password/email|verify-code|reset`

### Admin API

- `POST /admin/login/verify` `{ username, password }` → OTP email
- `POST /admin/login` `{ username, password, code }`
- `POST /admin/password/email|verify-code|reset`

Laravel rate limits (`password-email`, `password-verify`, `password-reset`) return HTTP `429` with `Retry-After`. The UI surfaces countdown alerts and disables submit while limited.

## Other routes

| Area       | Paths |
|------------|-------|
| Storefront | `/`, `/products/[id]` |
| Customer   | `/dashboard`, `/dashboard/profile`, `/dashboard/security` |
| Admin panel| `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/users` |
