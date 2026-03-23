import { useCallback, useEffect, useRef, useState } from 'react';
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
  const itemsRef = useRef(items);

  const setItemsState = useCallback((nextItemsOrUpdater) => {
    setItems((current) => {
      const nextItems = typeof nextItemsOrUpdater === 'function'
        ? nextItemsOrUpdater(current)
        : nextItemsOrUpdater;

      itemsRef.current = nextItems;
      return nextItems;
    });
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const records = await service.list();
      setItemsState(sortByDisplayOrder(records));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load records.');
    } finally {
      setLoading(false);
    }
  }, [service, setItemsState]);

  const createItem = useCallback(async (payload) => {
    const created = await service.create(payload);
    const nextItems = sortByDisplayOrder([...itemsRef.current, created]).map((item, index) => ({
      ...item,
      display_order: index,
    }));

    setItemsState(nextItems);

    try {
      await service.reorder(nextItems);
    } catch (reorderError) {
      await loadItems().catch(() => undefined);
      throw reorderError;
    }

    return nextItems.find((item) => item.id === created.id) || created;
  }, [loadItems, service, setItemsState]);

  const updateItem = useCallback(async (id, payload) => {
    const updated = await service.update(id, payload);
    setItemsState((current) => sortByDisplayOrder(
      current.map((item) => (item.id === id ? updated : item)),
    ));
    return updated;
  }, [service, setItemsState]);

  const removeItem = useCallback(async (id) => {
    await service.remove(id);

    const nextItems = itemsRef.current
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        display_order: index,
      }));

    setItemsState(nextItems);

    try {
      await service.reorder(nextItems);
    } catch (reorderError) {
      await loadItems().catch(() => undefined);
      throw reorderError;
    }
  }, [loadItems, service, setItemsState]);

  const reorderItems = useCallback(async (index, direction) => {
    const previousItems = itemsRef.current;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= previousItems.length) {
      return false;
    }

    const reordered = moveItem(previousItems, index, targetIndex).map((item, orderIndex) => ({
      ...item,
      display_order: orderIndex,
    }));

    setItemsState(reordered);

    try {
      await service.reorder(reordered);
      return true;
    } catch (reorderError) {
      setItemsState(previousItems);
      throw reorderError;
    }
  }, [service, setItemsState]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    setItems: setItemsState,
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
