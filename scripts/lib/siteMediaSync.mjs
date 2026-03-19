import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const envPath = path.resolve(repoRoot, '.env');
const assetsDir = path.resolve(repoRoot, 'assets');

const MEDIA_MIME_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
]);

function normalizePublicPath(value) {
  const trimmed = String(value || '').trim().replace(/\\/g, '/');
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function loadDotEnvFile() {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, 'utf8');

  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || process.env[key]) {
      return;
    }

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  });
}

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (
    process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
  ).trim();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).');
  }

  return {
    supabase: createClient(supabaseUrl, supabaseKey),
    bucket: process.env.VITE_SUPABASE_STORAGE_BUCKET?.trim() || 'content-media',
  };
}

function listSiteAssetFiles(directory, rootDirectory = directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSiteAssetFiles(absolutePath, rootDirectory);
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!MEDIA_MIME_TYPES.has(extension)) {
      return [];
    }

    const relativePath = path.relative(rootDirectory, absolutePath).replace(/\\/g, '/');

    return [{
      absolutePath,
      relativePath,
      publicPath: normalizePublicPath(relativePath),
      storagePath: `site-assets/${relativePath}`,
      contentType: MEDIA_MIME_TYPES.get(extension),
    }];
  });
}

export async function uploadSiteAssets(supabase, { bucket, publicAssetsDir = assetsDir } = {}) {
  const assetFiles = listSiteAssetFiles(publicAssetsDir);
  const assetMap = new Map();

  for (const asset of assetFiles) {
    const fileBody = fs.readFileSync(asset.absolutePath);
    const { error } = await supabase.storage.from(bucket).upload(asset.storagePath, fileBody, {
      upsert: true,
      contentType: asset.contentType,
      cacheControl: '3600',
    });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(asset.storagePath);
    assetMap.set(asset.publicPath, {
      ...asset,
      publicUrl: data.publicUrl,
    });
  }

  return {
    assetMap,
    assetCount: assetMap.size,
  };
}

export function resolvePublicAssetReference(assetMap, publicPath) {
  return assetMap.get(normalizePublicPath(publicPath)) || null;
}
