import { requireSupabaseBrowserClient } from '../lib/supabase';

function getClient() {
  return requireSupabaseBrowserClient();
}

async function listOrdered(table) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
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
    throw error;
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
    throw error;
  }

  return data;
}

async function removeRecord(table, id) {
  const client = getClient();
  const { error } = await client.from(table).delete().eq('id', id);

  if (error) {
    throw error;
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
    throw error;
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
      throw error;
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
      throw error;
    }

    return data;
  },
};
