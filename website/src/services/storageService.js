import { requireSupabaseBrowserClient, storageBucket } from '../lib/supabase';
import { slugify } from '../utils/content';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
