import { useCallback, useEffect, useState } from 'react';
import { moveItem } from '../utils/content';

function sortByDisplayOrder(items) {
  return [...items].sort((left, right) => {
    const orderDifference = (left.display_order ?? 0) - (right.display_order ?? 0);
    if (orderDifference !== 0) {
      return orderDifference;
    }

    return new Date(left.created_at || 0).getTime() - new Date(right.created_at || 0).getTime();
  });
}

export function useAdminCollection(service) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const records = await service.list();
      setItems(sortByDisplayOrder(records));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load records.');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const createItem = useCallback(async (payload) => {
    const created = await service.create(payload);
    const nextItems = sortByDisplayOrder([...items, created]).map((item, index) => ({
      ...item,
      display_order: index,
    }));
    setItems(nextItems);
    await service.reorder(nextItems);
    return created;
  }, [items, service]);

  const updateItem = useCallback(async (id, payload) => {
    const updated = await service.update(id, payload);
    setItems((current) => sortByDisplayOrder(
      current.map((item) => (item.id === id ? updated : item)),
    ));
    return updated;
  }, [service]);

  const removeItem = useCallback(async (id) => {
    await service.remove(id);
    const nextItems = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        display_order: index,
      }));
    setItems(nextItems);
    await service.reorder(nextItems);
  }, [items, service]);

  const reorderItems = useCallback(async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) {
      return false;
    }

    const reordered = moveItem(items, index, targetIndex).map((item, orderIndex) => ({
      ...item,
      display_order: orderIndex,
    }));

    setItems(reordered);

    try {
      await service.reorder(reordered);
      return true;
    } catch (reorderError) {
      setItems(items);
      throw reorderError;
    }
  }, [items, service]);

  return {
    items,
    setItems,
    loading,
    error,
    setError,
    loadItems,
    createItem,
    updateItem,
    removeItem,
    reorderItems,
  };
}
