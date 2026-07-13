# Supabase — BMP

This folder holds the database schema and local config.

```
supabase/
├── config.toml                 # Supabase CLI local config
└── migrations/
    └── 20260101000000_init.sql # tables, indexes, RLS policies
```

## Local workflow

```bash
supabase start          # boots Postgres + Auth + Studio (Docker)
supabase db reset       # drops & re-applies all migrations
npm run seed            # seeds the products catalog
```

`supabase start` prints the local **API URL**, **anon key** and
**service_role key** — copy them into your project root `.env.local`.

## Create the admin user

Auth users can't be seeded via SQL safely, so create your admin once:

```bash
# via the Studio UI: http://localhost:54323  →  Authentication → Add user
# or via CLI:
supabase auth admin create-user \
  --email triye3@gmail.com \
  --password "choose-a-strong-password" \
  --email-confirm
```

Make sure the same email is listed in `ADMIN_EMAILS` in `.env.local`.

## Deploying schema to hosted Supabase

```bash
supabase link --project-ref <your-project-ref>
supabase db push        # applies migrations to the cloud project
npm run seed            # with .env.local pointing at the hosted project
```
