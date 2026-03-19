create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  anchor_id text not null unique,
  label text not null,
  layout_type text not null default 'card_grid' check (layout_type in ('card_grid', 'faq')),
  kicker text,
  title text not null,
  description text,
  items jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_sections_items_is_array check (jsonb_typeof(items) = 'array')
);

drop trigger if exists site_sections_set_updated_at on public.site_sections;
create trigger site_sections_set_updated_at
before update on public.site_sections
for each row
execute function public.set_updated_at();

create index if not exists site_sections_display_order_idx
on public.site_sections (display_order, created_at);

alter table public.site_sections enable row level security;
alter table public.site_sections force row level security;

drop policy if exists "Public can read visible site sections" on public.site_sections;
create policy "Public can read visible site sections"
on public.site_sections
for select
to anon, authenticated
using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage site sections" on public.site_sections;
create policy "Admins can manage site sections"
on public.site_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.site_sections (
  section_key,
  anchor_id,
  label,
  layout_type,
  kicker,
  title,
  description,
  items,
  display_order,
  is_visible
)
values
(
  'how_we_build',
  'about',
  'How We Build',
  'card_grid',
  'About Us',
  'How we build',
  'A small team learning big things and building what we wish existed.',
  '[
    {
      "id": "how-we-build-1",
      "title": "Idea to MVP",
      "subtitle": "Product Direction",
      "description": "We turn rough ideas into usable builds fast and skip the long slide decks.",
      "display_order": 0,
      "is_visible": true
    },
    {
      "id": "how-we-build-2",
      "title": "Full-Stack Builds",
      "subtitle": "Engineering",
      "description": "From frontend polish to backend APIs, we ship complete features end to end.",
      "display_order": 1,
      "is_visible": true
    },
    {
      "id": "how-we-build-3",
      "title": "Work Like a Squad",
      "subtitle": "Team Workflow",
      "description": "Small groups, clear owners, fast check-ins, and demo-first delivery.",
      "display_order": 2,
      "is_visible": true
    },
    {
      "id": "how-we-build-4",
      "title": "Design That Feels Right",
      "subtitle": "Design Quality",
      "description": "Clean UI and clear flows are built in from day one, not added later.",
      "display_order": 3,
      "is_visible": true
    }
  ]'::jsonb,
  0,
  true
),
(
  'faq',
  'faq',
  'FAQ',
  'faq',
  'FAQ',
  'Questions Before You Apply',
  'A few quick answers about joining the team, the application flow, and what we look for.',
  '[
    {
      "id": "faq-1",
      "title": "Who can apply to Code Catalysts?",
      "description": "Anyone who is curious, consistent, and excited to build. We care more about your energy, willingness to learn, and ability to collaborate than having a perfect resume.",
      "display_order": 0,
      "is_visible": true
    },
    {
      "id": "faq-2",
      "title": "Do I need to be highly experienced already?",
      "description": "No. Strong fundamentals help, but we also welcome learners who show initiative through projects, experiments, design work, writing, or thoughtful problem-solving.",
      "display_order": 1,
      "is_visible": true
    },
    {
      "id": "faq-3",
      "title": "How much time should I expect to commit?",
      "description": "The expectation is reasonable and student-friendly. We look for steady contribution and communication rather than unrealistic weekly hours.",
      "display_order": 2,
      "is_visible": true
    },
    {
      "id": "faq-4",
      "title": "What happens after I submit the application?",
      "description": "We review your application, reach out if there is a fit, and usually follow up within 1 to 3 days. Some applicants may be asked for a short conversation or project discussion.",
      "display_order": 3,
      "is_visible": true
    },
    {
      "id": "faq-5",
      "title": "What kinds of roles can I grow into here?",
      "description": "Depending on your strengths, you can contribute across development, design, product thinking, AI/ML, content, research, and team initiatives. Growth here is hands-on and collaborative.",
      "display_order": 4,
      "is_visible": true
    }
  ]'::jsonb,
  1,
  true
)
on conflict (section_key) do nothing;
