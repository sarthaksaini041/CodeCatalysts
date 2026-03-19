import { requireSupabaseBrowserClient } from '../lib/supabase';

const TABLE_MIGRATION_HINTS = {
  admin_users: 'supabase/migrations/20260319_admin_portal.sql',
  members: 'supabase/migrations/20260319_admin_portal.sql',
  projects: 'supabase/migrations/20260319_admin_portal.sql',
  journey_entries: 'supabase/migrations/20260319_admin_portal.sql',
  site_settings: 'supabase/migrations/20260319_admin_portal.sql',
  site_sections: 'supabase/migrations/20260319_site_sections.sql',
};

function getClient() {
  return requireSupabaseBrowserClient();
}

function isMissingTableError(error, table) {
  const message = error?.message || '';
  return message.includes(`'public.${table}'`) && message.includes('schema cache');
}

function normalizeTableError(table, error) {
  if (!isMissingTableError(error, table)) {
    return error;
  }

  const migrationPath = TABLE_MIGRATION_HINTS[table];
  const normalizedError = new Error(
    migrationPath
      ? `The Supabase table "${table}" is not available in the connected project yet. Apply "${migrationPath}" and reload the admin portal.`
      : `The Supabase table "${table}" is not available in the connected project yet. Apply the required database migration and reload the admin portal.`,
  );

  normalizedError.code = error?.code;
  normalizedError.cause = error;
  return normalizedError;
}

async function listOrdered(table) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw normalizeTableError(table, error);
  }

  return data || [];
}

async function createRecord(table, payload) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw normalizeTableError(table, error);
  }

  return data;
}

async function updateRecord(table, id, payload) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw normalizeTableError(table, error);
  }

  return data;
}

async function removeRecord(table, id) {
  const client = getClient();
  const { error } = await client.from(table).delete().eq('id', id);

  if (error) {
    throw normalizeTableError(table, error);
  }
}

async function persistDisplayOrder(table, orderedItems) {
  const client = getClient();

  if (!orderedItems.length) {
    return;
  }

  const updates = orderedItems.map((item, index) => ({
    id: item.id,
    display_order: index,
  }));

  const { error } = await client.from(table).upsert(updates, { onConflict: 'id' });

  if (error) {
    throw normalizeTableError(table, error);
  }
}

export const membersAdminService = {
  list: () => listOrdered('members'),
  create: (payload) => createRecord('members', payload),
  update: (id, payload) => updateRecord('members', id, payload),
  remove: (id) => removeRecord('members', id),
  reorder: (orderedItems) => persistDisplayOrder('members', orderedItems),
};

export const projectsAdminService = {
  list: () => listOrdered('projects'),
  create: (payload) => createRecord('projects', payload),
  update: (id, payload) => updateRecord('projects', id, payload),
  remove: (id) => removeRecord('projects', id),
  reorder: (orderedItems) => persistDisplayOrder('projects', orderedItems),
};

export const journeyAdminService = {
  list: () => listOrdered('journey_entries'),
  create: (payload) => createRecord('journey_entries', payload),
  update: (id, payload) => updateRecord('journey_entries', id, payload),
  remove: (id) => removeRecord('journey_entries', id),
  reorder: (orderedItems) => persistDisplayOrder('journey_entries', orderedItems),
};

export const siteSettingsAdminService = {
  async get() {
    const client = getClient();
    const { data, error } = await client
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      throw normalizeTableError('site_settings', error);
    }

    return data;
  },
  async update(payload) {
    const client = getClient();
    const { data, error } = await client
      .from('site_settings')
      .upsert([{ id: 1, ...payload }], { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw normalizeTableError('site_settings', error);
    }

    return data;
  },
};

export const siteSectionsAdminService = {
  list: () => listOrdered('site_sections'),
  create: (payload) => createRecord('site_sections', payload),
  update: (id, payload) => updateRecord('site_sections', id, payload),
  remove: (id) => removeRecord('site_sections', id),
  reorder: (orderedItems) => persistDisplayOrder('site_sections', orderedItems),
};
