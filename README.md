# BMP — Belludi Masala Products 🌶️

> **Pure. Traditional. Karnataka's Finest Masalas.**

A complete, production-ready e-commerce website for a premium Indian masala/spice
brand — built with **Next.js 15 (App Router + Server Actions)**, **TypeScript**,
**Tailwind CSS**, **Supabase (Postgres + Auth + RLS)** and **Zustand**.

---

## ✨ Features

- **Premium storefront** — hero + brand story, bestsellers, "why choose us", testimonials
- **Shop page** with search + filters (name, category, spice level) and sorting
- **Product detail** pages with size (100g / 500g / 1kg) and spice-level selection
- **Floating cart** drawer + full cart page, with quantity & spice controls
- **Cart persistence** via `localStorage` (Zustand `persist`)
- **Checkout** with React Hook Form + Zod validation (name, full address, pincode, city, state, phone, notes)
- **Server Action** order submission → saved to Supabase (money recomputed server-side)
- **Order success** page with order reference
- **Admin dashboard** (protected) — orders table, stats, search/filter, status updates, **CSV export**
- **Supabase Auth** login for admin, with email allow-list
- **Row Level Security** on all tables
- SEO metadata, `sitemap.xml`, `robots.txt`, responsive & accessible UI
- Graceful **offline fallback** — storefront renders from the static catalog even before Supabase is configured

---

## 🧱 Tech Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router, Server Actions, RSC)       |
| Language   | TypeScript                                         |
| Styling    | Tailwind CSS + shadcn/ui-style components           |
| Database   | Supabase (PostgreSQL) with Row Level Security      |
| Auth       | Supabase Auth (email/password)                     |
| Cart state | Zustand (+ persist)                                |
| Forms      | React Hook Form + Zod                              |
| Icons      | Lucide React                                       |
| Toasts     | Sonner                                             |
| Deploy     | Vercel (app) + Supabase (DB)                       |

---

## 📂 Project Structure

```
BMP/
├── app/
│   ├── (store)/                     # public storefront (route group)
│   │   ├── layout.tsx               # navbar + footer wrapper
│   │   ├── page.tsx                 # homepage
│   │   ├── loading.tsx
│   │   ├── shop/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── order-success/[id]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx           # Supabase Auth login
│   │   └── page.tsx                 # protected dashboard
│   ├── actions/                     # server actions
│   │   ├── orders.ts                # createOrder
│   │   ├── admin.ts                 # updateOrderStatus
│   │   └── auth.ts                  # signIn / signOut
│   ├── layout.tsx                   # root layout (fonts, Toaster, metadata)
│   ├── globals.css
│   ├── robots.ts
│   ├── sitemap.ts
│   └── not-found.tsx
├── components/
│   ├── ui/                          # button, input, select, sheet, table, ...
│   ├── admin/                       # dashboard, status select, row details
│   ├── home/                        # testimonials
│   ├── navbar.tsx  footer.tsx  logo.tsx
│   ├── product-card.tsx  shop-grid.tsx  add-to-cart.tsx
│   ├── cart-sheet.tsx  checkout-form.tsx
│   ├── quantity-stepper.tsx  smart-image.tsx
├── lib/
│   ├── supabase/{client,server,admin,middleware}.ts
│   ├── constants.ts  utils.ts  validators.ts  csv.ts
│   ├── products.ts                  # static catalog (source of truth)
│   └── data.ts                      # Supabase fetch + fallback
├── store/cart.ts                    # Zustand cart
├── types/index.ts
├── scripts/seed.ts                  # DB seeder
├── supabase/
│   ├── config.toml
│   └── migrations/20260101000000_init.sql
├── middleware.ts                    # session refresh + /admin guard
├── Dockerfile  docker-compose.yml  .dockerignore
├── .env.local.example
└── README.md
```

---

## 🛍️ Products & Pricing

All 8 products share the same 3 sizes and pricing:

| Size  | Price |
| ----- | ----- |
| 100g  | ₹40   |
| 500g  | ₹200  |
| 1kg   | ₹400  |

Products: Pulihora Powder · Bisi Bele Bath Powder · Sambar Powder ·
Holige Sambar Powder · Kurshani Chutney Powder · Kadle Chutney Powder ·
Shenga Chutney Powder · Vangi Bath Powder.

Each cart/order line has a **Spice Level** (Mild / Medium / High, default Medium).
**Delivery is a flat ₹200**, applied once per order.

---

## 🚀 Getting Started (Local)

### 1. Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm i -g supabase`)
- Docker Desktop (for the local Supabase stack / optional app container)

### 2. Install

```bash
npm install --legacy-peer-deps
```

### 3. Start Supabase locally

```bash
supabase start        # boots Postgres + Auth + Studio in Docker
supabase db reset     # applies migrations in ./supabase/migrations
```

Copy the printed **API URL**, **anon key** and **service_role key**.

### 4. Configure env

```bash
cp .env.local.example .env.local
```

Fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase start>
ADMIN_EMAILS=triye3@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Seed products

```bash
npm run seed
```

### 6. Create your admin user

Studio → `http://localhost:54323` → Authentication → Add user
(email must match one in `ADMIN_EMAILS`, mark email confirmed). Or:

```bash
supabase auth admin create-user --email triye3@gmail.com --password "strong-pass" --email-confirm
```

### 7. Run the app

```bash
npm run dev
```

- Storefront → http://localhost:3000
- Admin → http://localhost:3000/admin (redirects to login)

> **No Supabase yet?** The storefront still works — it falls back to the static
> catalog in `lib/products.ts`, and checkout returns a demo order id. Add
> Supabase to enable real orders and the admin dashboard.

---

## 🐳 Docker

Run the storefront in a container (pair it with `supabase start` for the DB):

```bash
supabase start                 # local DB + auth
# ensure .env.local is filled in
docker compose up --build web  # app at http://localhost:3000
```

See `docker-compose.yml` for details. On Linux the container reaches the host's
Supabase via `host.docker.internal`.

---

## ☁️ Deployment (Vercel + Supabase)

### A. Provision hosted Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Push the schema:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Seed it (point `.env.local` at the hosted URL + keys, then `npm run seed`).
4. Create your admin user in the hosted project (Auth → Add user).

### B. Deploy on Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. Add Environment Variables (Project → Settings → Environment Variables):

   | Name | Value |
   | ---- | ----- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | hosted anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | hosted service_role key (server only) |
   | `ADMIN_EMAILS` | `triye3@gmail.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` |

3. Deploy. Set the Supabase **Auth → URL Configuration → Site URL** to your
   Vercel domain.

> With the [Vercel CLI](https://vercel.com/docs/cli): `vercel` to deploy a
> preview, `vercel --prod` for production, and `vercel env pull` to sync env vars.

---

## 🔐 Environment Variables

| Variable | Scope | Purpose |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Privileged key for seeding & order inserts |
| `ADMIN_EMAILS` | server | Comma-separated allow-list for admin login |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL for metadata/sitemap |

⚠️ **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

---

## 🗄️ Database Schema

- **products** — `id, slug, name, short_description, description, image_url, category, spice_default, is_bestseller, variants (jsonb), created_at`
- **orders** — `id, customer_name, phone, address_line, city, state, pincode, notes, items (jsonb), subtotal, delivery_charge, total_amount, status, created_at`
- **order_items** — normalized copy of each line (optional)

RLS: products are publicly readable; orders are inserted server-side with the
service role and readable/updatable only by authenticated admins.

---

## 🧪 Useful Scripts

```bash
npm run dev        # start dev server
npm run build      # production build
npm run start      # run production build
npm run seed       # seed products into Supabase
npm run lint       # lint
```

---

## 📜 License

Provided for BMP — Belludi Masala Products. Replace placeholder imagery and
copy with your own brand assets before going live.
