import { requireSupabaseBrowserClient } from '../lib/supabase';

const TABLE_MIGRATION_HINTS = {
  admin_users: 'supabase/migrations/20260319_admin_portal.sql',
  Applications: 'supabase/migrations/20260319_admin_portal_extensions.sql',
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

function extractMissingColumnError(error) {
  const message = String(error?.message || '');
  const match = message.match(/Could not find the '([^']+)' column of '([^']+)' in the schema cache/i);

  if (!match) {
    return null;
  }

  return {
    column: match[1],
    table: match[2],
  };
}

function isMissingColumnError(error, table, column) {
  const missingColumn = extractMissingColumnError(error);

  if (!missingColumn) {
    return false;
  }

  return missingColumn.table === table && missingColumn.column === column;
}

function normalizeTableError(table, error) {
  const message = String(error?.message || '').toLowerCase();

  if (message.includes('row-level security') || error?.code === '42501') {
    const permissionError = new Error(
      'Your account is signed in but is not allowed to manage admin content yet. Add this user to public.admin_users, then sign out and sign back in.',
    );
    permissionError.code = error?.code;
    permissionError.cause = error;
    return permissionError;
  }

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

function normalizeAdminUserMutationError(error) {
  const message = String(error?.message || '').toLowerCase();

  if (error?.code === '23505') {
    const duplicateError = new Error('This user already has admin access.');
    duplicateError.code = error.code;
    duplicateError.cause = error;
    return duplicateError;
  }

  if (message.includes('invalid input syntax for type uuid')) {
    const invalidIdError = new Error('Enter a valid Auth user ID (UUID format).');
    invalidIdError.code = error?.code;
    invalidIdError.cause = error;
    return invalidIdError;
  }

  return null;
}

async function listOrdered(table) {
  const client = getClient();
  const { data, error } = await client
    .from(table)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (isMissingColumnError(error, table, 'display_order')) {
    const fallback = await client
      .from(table)
      .select('*')
      .order('created_at', { ascending: true });

    if (fallback.error) {
      throw normalizeTableError(table, fallback.error);
    }

    return fallback.data || [];
  }

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

  if (isMissingColumnError(error, table, 'display_order') && Object.prototype.hasOwnProperty.call(payload, 'display_order')) {
    const { display_order: _ignoredDisplayOrder, ...fallbackPayload } = payload;
    const fallback = await client
      .from(table)
      .insert([fallbackPayload])
      .select()
      .single();

    if (fallback.error) {
      throw normalizeTableError(table, fallback.error);
    }

    return fallback.data;
  }

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

  if (isMissingColumnError(error, table, 'display_order') && Object.prototype.hasOwnProperty.call(payload, 'display_order')) {
    const { display_order: _ignoredDisplayOrder, ...fallbackPayload } = payload;
    const fallback = await client
      .from(table)
      .update(fallbackPayload)
      .eq('id', id)
      .select()
      .single();

    if (fallback.error) {
      throw normalizeTableError(table, fallback.error);
    }

    return fallback.data;
  }

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

  if (isMissingColumnError(error, table, 'display_order')) {
    return;
  }

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

export const adminUsersAdminService = {
  async list() {
    const client = getClient();
    const { data, error } = await client
      .from('admin_users')
      .select('id, user_id, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw normalizeTableError('admin_users', error);
    }

    return data || [];
  },

  async create(payload) {
    const userId = String(payload?.user_id || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();

    if (!userId) {
      throw new Error('Auth user ID is required.');
    }

    const insertPayload = {
      user_id: userId,
    };

    if (email) {
      insertPayload.email = email;
    }

    const client = getClient();
    const { data, error } = await client
      .from('admin_users')
      .insert([insertPayload])
      .select('id, user_id, email, created_at')
      .single();

    if (error) {
      const normalizedMutationError = normalizeAdminUserMutationError(error);

      if (normalizedMutationError) {
        throw normalizedMutationError;
      }

      throw normalizeTableError('admin_users', error);
    }

    return data;
  },
};

const APPLICATIONS_TABLE = 'Applications';

export const applicationsAdminService = {
  async list() {
    const client = getClient();
    const { data, error } = await client
      .from(APPLICATIONS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw normalizeTableError(APPLICATIONS_TABLE, error);
    }

    return data || [];
  },

  async update(id, payload) {
    const client = getClient();
    const { data, error } = await client
      .from(APPLICATIONS_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw normalizeTableError(APPLICATIONS_TABLE, error);
    }

    return data;
  },

  async remove(id) {
    const client = getClient();
    const { error } = await client
      .from(APPLICATIONS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw normalizeTableError(APPLICATIONS_TABLE, error);
    }
  },
};
