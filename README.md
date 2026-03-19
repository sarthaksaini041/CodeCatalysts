# Code Catalysts

Code Catalysts is the official website for the team, plus the existing `/apply` onboarding flow and a new Supabase-backed admin portal for managing public content.

## What is in this repo

- Public React + Vite website
- Existing Vercel serverless `/api/apply` submission flow
- Protected admin portal at `/admin`
- Supabase-backed content for members, projects, journey entries, and basic site settings

## Routes

- `/` public landing page
- `/apply` application form
- `/admin/login` admin sign-in
- `/admin` admin dashboard
- `/admin/members` manage team cards
- `/admin/projects` manage project cards
- `/admin/journey` manage timeline cards
- `/admin/settings` manage hero/footer/contact settings

## Content flow

1. Admin signs in with Supabase Auth.
2. Admin portal writes content to Supabase tables and uploads images to Supabase Storage.
3. Public website reads visible content from Supabase with RLS-safe browser queries.
4. If browser Supabase config is missing or public reads fail, the public site falls back to `website/src/data.js`.

`/apply` still uses [`api/apply.js`](/e:/CodeCatalysts/api/apply.js) and is intentionally kept separate from the new admin content system.

## Tech stack

- React 19
- Vite 7
- React Router
- Framer Motion
- Lucide React
- Supabase Auth, Database, and Storage
- Vercel Serverless Functions

## Environment variables

Copy `.env.example` and fill in the values you need.

Frontend:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_STORAGE_BUCKET=content-media
VITE_API_BASE_URL=https://your-deployed-site.vercel.app
```

Serverless / seed script:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_or_service_role_key
SUPABASE_SERVICE_ROLE_KEY=optional_alias_for_service_role
APPLY_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Notes:

- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is also supported if you want to keep the previous variable name.
- `VITE_API_BASE_URL` is only needed if the frontend and API are running on different origins during local development.
- `APPLY_ALLOWED_ORIGINS` is optional and lets you explicitly restrict which browser origins can call `/api/apply`.
- Never expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

## Local development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Supabase setup

### 1. Run the migration

Run the SQL in:

- [`supabase/migrations/20260319_admin_portal.sql`](/e:/CodeCatalysts/supabase/migrations/20260319_admin_portal.sql)
- If you already applied the original admin migration before the hardening pass, also run [`supabase/migrations/20260319_admin_portal_hardening.sql`](/e:/CodeCatalysts/supabase/migrations/20260319_admin_portal_hardening.sql)

This creates:

- `admin_users`
- `members`
- `projects`
- `journey_entries`
- `site_settings`
- `content-media` public storage bucket
- RLS and storage policies

### 2. Create the first admin user

Create a user in Supabase Auth using the dashboard or an invite flow.

Then add that user's UUID to `admin_users`:

```sql
insert into public.admin_users (user_id, email)
values ('YOUR_AUTH_USER_UUID', 'owner@example.com');
```

Recommended:

- Disable open public sign-ups if you do not need them.
- Keep admin access limited to users explicitly inserted into `admin_users`.

### 3. Confirm storage

The migration creates a public bucket named `content-media`.

If you change the bucket name, also update:

- `VITE_SUPABASE_STORAGE_BUCKET`
- the storage policies if you changed the SQL before applying it

## Seed the initial content

The current static content can be seeded into Supabase from `website/src/data.js`.

Run:

```bash
npm run seed:content
```

The seed script reads variables from the repo root `.env` file if present, or from your current shell environment.

This script:

- seeds `members` if the table is empty
- seeds `projects` if local fallback project data exists and the table is empty
- seeds `journey_entries` if the table is empty
- upserts `site_settings`

Seed script file:

- [`scripts/seed-content.mjs`](/e:/CodeCatalysts/scripts/seed-content.mjs)

## Apply flow

The application flow still works through:

- [`website/src/pages/Apply.jsx`](/e:/CodeCatalysts/website/src/pages/Apply.jsx)
- [`api/apply.js`](/e:/CodeCatalysts/api/apply.js)

Required backend table for applications remains whatever your current `/api/apply` setup expects, currently `Applications`.

Security notes:

- `/api/apply` now accepts only JSON POSTs.
- Optional origin allowlisting is controlled by `APPLY_ALLOWED_ORIGINS`.
- Request payloads are length-limited server-side before insertion.

## Project structure

```text
.
|-- api/
|-- assets/
|-- scripts/
|-- supabase/
|   `-- migrations/
|-- website/
|   |-- src/
|   |   |-- components/
|   |   |   `-- admin/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |   `-- admin/
|   |   |-- services/
|   |   `-- data.js
|-- package.json
`-- vercel.json
```

## Migration notes

The repo inspection and migration assumptions are documented in:

- [`ADMIN_MIGRATION_PLAN.md`](/e:/CodeCatalysts/ADMIN_MIGRATION_PLAN.md)
