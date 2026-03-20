# Code Catalysts

Code Catalysts is a student builder community focused on learning fast, building real projects, and growing together through hands-on work.

## What We Do

- Build web, app, AI, and design projects together
- Learn by shipping instead of only studying theory
- Collaborate in small teams on practical ideas
- Grow skills in frontend, backend, AI/ML, design, and product thinking

## Current Members

- Rudraksh Pandey
- Sarthak Saini
- Tanishka Agarwal
- Ansh Aditya
- Radhika Maheshwari
- Ananya Khatri
- Prakhar Saxena
- Sparsh Raj
- Somya Purohit
- Shatakshi Bajpai
- Shambhavi

## Clone The Repo

```bash
git clone https://github.com/sarthaksaini041/CodeCatalysts.git
cd CodeCatalysts
npm install
npm run dev
```

## Applications Page Wiring

The `/apply` page submits to `/api/apply`.

- In production on Vercel, this is handled by `api/apply.js`.
- In local development (`npm run dev`), Vite proxies `/api/*` to `VITE_DEV_API_TARGET`.
	- If `VITE_DEV_API_TARGET` is not set, it falls back to `VITE_API_BASE_URL`, then `https://code-catalysts.vercel.app`.

### Required server env for applications API

Set these in Vercel (and in your local `vercel env` setup if running serverless locally):

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`)

Optional:

- `APPLY_ALLOWED_ORIGINS` (comma-separated extra origins)
- `VITE_API_BASE_URL` (frontend API base override)
- `VITE_DEV_API_TARGET` (local dev proxy target for `/api`)

## Supabase Setup

The admin portal expects the SQL files in `supabase/migrations` to be applied to your connected Supabase project before you open `/admin-portal`.

Run the migrations in filename order in the Supabase SQL Editor or with the Supabase CLI. This includes:

- `supabase/migrations/20260319_admin_portal.sql`
- `supabase/migrations/20260319_admin_portal_extensions.sql`
- `supabase/migrations/20260319_admin_portal_hardening.sql`
- `supabase/migrations/20260319_site_sections.sql`

If `public.site_sections` has not been created yet, the FAQ/sections admin screen will stay unavailable until `20260319_site_sections.sql` is applied.

If you want the legacy website images from `assets/` to appear in `/admin-portal/media` and be stored in Supabase like newer admin uploads, run:

```bash
npm run sync:site-media
```
