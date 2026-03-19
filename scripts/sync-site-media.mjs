import {
  createSupabaseServiceClient,
  loadDotEnvFile,
  resolvePublicAssetReference,
  uploadSiteAssets,
} from './lib/siteMediaSync.mjs';

loadDotEnvFile();

const { supabase, bucket } = createSupabaseServiceClient();

async function syncImageTable(table, labelField, assetMap) {
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${labelField}, image_url, image_path`)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const record of data || []) {
    const publicPath = String(record.image_url || '').trim();
    const asset = resolvePublicAssetReference(assetMap, publicPath);

    if (!publicPath.startsWith('/')) {
      skipped += 1;
      continue;
    }

    if (!asset) {
      missing += 1;
      continue;
    }

    if (record.image_url === asset.publicUrl && record.image_path === asset.storagePath) {
      skipped += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({
        image_url: asset.publicUrl,
        image_path: asset.storagePath,
      })
      .eq('id', record.id);

    if (updateError) {
      throw updateError;
    }

    updated += 1;
  }

  return {
    table,
    rows: (data || []).length,
    updated,
    skipped,
    missing,
  };
}

async function main() {
  const { assetMap, assetCount } = await uploadSiteAssets(supabase, { bucket });
  const [membersSummary, projectsSummary] = await Promise.all([
    syncImageTable('members', 'name', assetMap),
    syncImageTable('projects', 'title', assetMap),
  ]);

  console.log(JSON.stringify({
    bucket,
    uploadedSiteAssets: assetCount,
    syncedTables: [membersSummary, projectsSummary],
  }, null, 2));
}

main().catch((error) => {
  console.error('Site media sync failed:', error.message || error);
  process.exit(1);
});
