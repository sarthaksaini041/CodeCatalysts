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

## Supabase Setup

The admin portal expects the SQL files in `supabase/migrations` to be applied to your connected Supabase project before you open `/admin`.

Run the migrations in filename order in the Supabase SQL Editor or with the Supabase CLI. This includes:

- `supabase/migrations/20260319_admin_portal.sql`
- `supabase/migrations/20260319_admin_portal_extensions.sql`
- `supabase/migrations/20260319_admin_portal_hardening.sql`
- `supabase/migrations/20260319_site_sections.sql`

If `public.site_sections` has not been created yet, the FAQ/sections admin screen will stay unavailable until `20260319_site_sections.sql` is applied.

If you want the legacy website images from `assets/` to appear in `/admin/media` and be stored in Supabase like newer admin uploads, run:

```bash
npm run sync:site-media
```
