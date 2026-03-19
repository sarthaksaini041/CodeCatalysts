# Admin Portal Migration Plan

## What Was Found

- Frontend entry point is [`website/src/main.jsx`](/e:/CodeCatalysts/website/src/main.jsx), which renders [`website/src/App.jsx`](/e:/CodeCatalysts/website/src/App.jsx).
- Routing already exists in [`website/src/App.jsx`](/e:/CodeCatalysts/website/src/App.jsx) with:
  - `/` for the main landing page
  - `/apply` for the application flow
- The existing public website is composed from:
  - [`website/src/components/Hero.jsx`](/e:/CodeCatalysts/website/src/components/Hero.jsx)
  - [`website/src/components/About.jsx`](/e:/CodeCatalysts/website/src/components/About.jsx)
  - [`website/src/components/Team.jsx`](/e:/CodeCatalysts/website/src/components/Team.jsx)
  - [`website/src/components/Projects.jsx`](/e:/CodeCatalysts/website/src/components/Projects.jsx)
  - [`website/src/components/Journey.jsx`](/e:/CodeCatalysts/website/src/components/Journey.jsx)
  - [`website/src/components/Join.jsx`](/e:/CodeCatalysts/website/src/components/Join.jsx)
- Static content currently lives in [`website/src/data.js`](/e:/CodeCatalysts/website/src/data.js).
- Current static data usage:
  - `teamData` is used by `Hero.jsx` and `Team.jsx`
  - `journeyTimeline` is used by `Journey.jsx`
  - `howWeBuild` is used by `About.jsx`
  - `Projects.jsx` is currently a static placeholder section and does not read project data yet
- Existing Supabase browser setup already exists in [`website/src/utils/supabase.js`](/e:/CodeCatalysts/website/src/utils/supabase.js).
- Existing Vercel serverless submission flow exists in [`api/apply.js`](/e:/CodeCatalysts/api/apply.js) and must remain intact.
- Team images are currently served from the Vite public assets directory at [`assets/team`](/e:/CodeCatalysts/assets/team).

## What Is Being Changed

- Add a protected admin portal inside the existing React Router app.
- Replace hardcoded member, project, and journey content with Supabase-backed content.
- Add Supabase Auth login for admin access.
- Add Supabase Storage-backed uploads for member and project images.
- Keep the current public site design and section structure largely intact.
- Keep the `/apply` route and `api/apply.js` flow unchanged.

## Static Sections Becoming Dynamic

- `teamData` -> Supabase `members`
- project content -> Supabase `projects`
- `journeyTimeline` -> Supabase `journey_entries`
- core hero/footer/contact settings -> Supabase `site_settings`

## Static Sections Staying Static For Now

- `howWeBuild` remains in `website/src/data.js` for now
- FAQ content in `Join.jsx` remains local/static for now

These are being left in place to avoid unnecessary churn, but the new data/service structure will make them easy to migrate later.

## Assumptions

- Supabase Auth will be used with a small `admin_users` table to explicitly mark which authenticated users are allowed into the admin portal.
- Public website reads will use the browser client with RLS-safe public read policies.
- Admin CRUD and uploads will use the browser client plus RLS and storage policies, not service-role credentials in the frontend.
- Existing uncommitted changes in `App.jsx`, `ParallaxBG.jsx`, `Preloader.jsx`, and `website/src/utils/` are intentional and should be preserved while integrating the admin work.
