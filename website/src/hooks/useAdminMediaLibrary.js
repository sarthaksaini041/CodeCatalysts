import { useCallback, useEffect, useState } from 'react';
import {
  deleteContentImage,
  getReferencedContentImagePaths,
  listContentMedia,
} from '../services/storageService';

function sortMediaItems(items) {
  return [...items].sort((left, right) => {
    if (left.isUsed !== right.isUsed) {
      return left.isUsed ? -1 : 1;
    }

    return new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime();
  });
}

export function useAdminMediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [mediaItems, referencedPaths] = await Promise.all([
        listContentMedia(),
        getReferencedContentImagePaths(),
      ]);

      const usedPaths = new Set(referencedPaths);
      setItems(sortMediaItems(
        mediaItems.map((item) => ({
          ...item,
          isUsed: usedPaths.has(item.path),
        })),
      ));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load media files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const removeMedia = useCallback(async (path) => {
    await deleteContentImage(path);
    setItems((current) => current.filter((item) => item.path !== path));
  }, []);

  return {
    items,
    loading,
    error,
    loadMedia,
    removeMedia,
  };
}
