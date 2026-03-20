alter table public.site_settings
  add column if not exists application_form_title text not null default 'Apply to Join Us',
  add column if not exists application_form_subtitle text not null default 'Become a Catalyst',
  add column if not exists application_form_year_options jsonb not null default '["1st", "2nd", "3rd", "4th", "Grad"]'::jsonb,
  add column if not exists application_form_domain_options jsonb not null default '["Frontend Development", "Backend Development", "App Development", "AI/ML", "Cloud", "Cyber Security", "UI/UX"]'::jsonb,
  add column if not exists application_form_success_redirect_seconds integer not null default 10;

update public.site_settings
set
  application_form_title = coalesce(nullif(application_form_title, ''), 'Apply to Join Us'),
  application_form_subtitle = coalesce(nullif(application_form_subtitle, ''), 'Become a Catalyst'),
  application_form_year_options = case
    when jsonb_typeof(application_form_year_options) = 'array' and jsonb_array_length(application_form_year_options) > 0 then application_form_year_options
    else '["1st", "2nd", "3rd", "4th", "Grad"]'::jsonb
  end,
  application_form_domain_options = case
    when jsonb_typeof(application_form_domain_options) = 'array' and jsonb_array_length(application_form_domain_options) > 0 then application_form_domain_options
    else '["Frontend Development", "Backend Development", "App Development", "AI/ML", "Cloud", "Cyber Security", "UI/UX"]'::jsonb
  end,
  application_form_success_redirect_seconds = greatest(3, least(30, coalesce(application_form_success_redirect_seconds, 10)))
where id = 1;