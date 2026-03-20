import { requireSupabaseBrowserClient, storageBucket } from '../lib/supabase';
import { slugify } from '../utils/content';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MEDIA_PREFIXES = ['members', 'projects', 'site-assets'];
const STATIC_SITE_MEDIA_PATHS = ['site-assets/logo.png'];
const IMAGE_PATH_PATTERN = /\.(avif|gif|ico|jpe?g|png|svg|webp)$/i;

function isStorageFolderEntry(item) {
  return !item?.id;
}

function isSupportedMediaEntry(path, contentType) {
  if (String(contentType || '').toLowerCase().startsWith('image/')) {
    return true;
  }

  return IMAGE_PATH_PATTERN.test(String(path || ''));
}

function getMediaCollection(path) {
  const [collection = 'library'] = String(path || '').split('/');
  return collection;
}

function getFileExtension(file) {
  const [, extension = 'jpg'] = String(file.name || '').split(/\.(?=[^.]+$)/);
  return extension.toLowerCase();
}

export function validateImageFile(file) {
  if (!file) {
    return '';
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Use a JPG, PNG, WEBP, or GIF image.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Images must be 5 MB or smaller.';
  }

  return '';
}

export async function uploadContentImage({
  file,
  entityType,
  name,
  existingPath,
}) {
  if (!file) {
    return {
      imageUrl: null,
      imagePath: existingPath || null,
    };
  }

  const client = requireSupabaseBrowserClient();
  const fileExtension = getFileExtension(file);
  const safeBaseName = slugify(name) || entityType;
  const path = `${entityType}/${Date.now()}-${safeBaseName}.${fileExtension}`;

  const { error: uploadError } = await client.storage
    .from(storageBucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = client.storage.from(storageBucket).getPublicUrl(path);

  if (existingPath && existingPath !== path) {
    await deleteContentImage(existingPath).catch(() => null);
  }

  return {
    imageUrl: data.publicUrl,
    imagePath: path,
  };
}

export async function deleteContentImage(path) {
  if (!path) {
    return;
  }

  const client = requireSupabaseBrowserClient();
  const { error } = await client.storage.from(storageBucket).remove([path]);

  if (error) {
    throw error;
  }
}

async function listMediaPrefix(prefix) {
  const client = requireSupabaseBrowserClient();
  const { data, error } = await client.storage.from(storageBucket).list(prefix, {
    limit: 200,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error) {
    throw error;
  }

  const nestedItems = await Promise.all((data || []).map(async (item) => {
    const path = prefix ? `${prefix}/${item.name}` : item.name;

    if (isStorageFolderEntry(item)) {
      return listMediaPrefix(path);
    }

    if (!isSupportedMediaEntry(path, item.metadata?.mimetype)) {
      return [];
    }

    const { data: publicUrlData } = client.storage.from(storageBucket).getPublicUrl(path);

    return [{
      id: item.id,
      name: item.name,
      path,
      publicUrl: publicUrlData.publicUrl,
      createdAt: item.created_at || '',
      updatedAt: item.updated_at || item.created_at || '',
      size: item.metadata?.size || 0,
      contentType: item.metadata?.mimetype || '',
      collection: getMediaCollection(path),
    }];
  }));

  return nestedItems.flat();
}

export async function listContentMedia() {
  const collections = await Promise.all(
    MEDIA_PREFIXES.map((prefix) => listMediaPrefix(prefix)),
  );

  return Array.from(
    collections
      .flat()
      .reduce((lookup, item) => lookup.set(item.path, item), new Map())
      .values(),
  )
    .sort((left, right) => {
      const timeDifference = new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
      if (timeDifference !== 0) {
        return timeDifference;
      }

      return left.path.localeCompare(right.path);
    });
}

export async function getReferencedContentImagePaths() {
  const client = requireSupabaseBrowserClient();
  const [membersResult, projectsResult] = await Promise.all([
    client.from('members').select('image_path'),
    client.from('projects').select('image_path'),
  ]);

  const firstError = [membersResult.error, projectsResult.error].find(Boolean);
  if (firstError) {
    throw firstError;
  }

  return Array.from(new Set([
    ...(membersResult.data || []).map((item) => item.image_path).filter(Boolean),
    ...(projectsResult.data || []).map((item) => item.image_path).filter(Boolean),
    ...STATIC_SITE_MEDIA_PATHS,
  ]));
}
