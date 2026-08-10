# Tiny Store

Frontend ecommerce UI with storefront, user dashboard, and admin panel. Data currently comes from an in-browser mock API (localStorage-backed) shaped like future Laravel REST endpoints.

## Stack

- Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- Zustand (auth session)
- TanStack React Query (products / admin data)
- Zod (form validation)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | `admin@tinystore.com` | `admin123` |
| User  | `user@tinystore.com`  | `user123`  |

- Users can register at `/register`.
- Password reset is demo-only: `/forgot-password` returns a token (no email).

## Routes

| Area       | Paths |
|------------|-------|
| Storefront | `/`, `/products/[id]` |
| Auth       | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| User       | `/dashboard`, `/dashboard/profile`, `/dashboard/security` |
| Admin      | `/admin`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/users` |

## Swapping to Laravel later

1. Set `NEXT_PUBLIC_API_URL` to your Laravel API base (e.g. `http://localhost:8000/api`).
2. Keep the helpers in `lib/api/*` — they already branch on mock vs real `fetch`.
3. Match the mock contract: auth, products, admin products CRUD, admin users, user profile / change-password.

Mock handlers live in `lib/mock/handlers.ts`. Seed data is in `lib/mock/seed.ts`.
