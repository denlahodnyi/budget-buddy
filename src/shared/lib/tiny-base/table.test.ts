import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { createTestStore, flushPromises } from '../test-utils';
import { useTable, useTableListener } from './table';

describe('The useTableListener composable', () => {
  it('calls listener with store and tableId when table changes', () => {
    const store = createTestStore();
    const listener = vi.fn();

    useTableListener({
      store,
      tableId: () => 'pets',
      listener,
      mutator: () => false,
    });

    store.setRow('pets', 'felix', { species: 'cat' });

    expect(listener).toHaveBeenCalledWith(store, 'pets', expect.anything());
  });

  it('registers new listener when table id changes', async () => {
    const store = createTestStore();
    const tableId = ref('pets');
    const listener = vi.fn();

    useTableListener({
      store,
      tableId,
      listener,
      mutator: () => false,
    });

    store.setRow('pets', 'felix', { species: 'cat' });
    tableId.value = 'species';
    // wait for watcher cleanup
    await flushPromises();
    store.setRow('species', 'cat', { price: 12 });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      store,
      'species',
      expect.anything()
    );
  });
});

describe('The useTable composable', () => {
  it('returns the current table and updates when it changes', () => {
    const store = createTestStore();
    const testTable = useTable({
      store,
      tableId: () => 'pets',
    });

    expect(testTable.value).toEqual({ fido: { species: 'dog' } });
    store.setRow('pets', 'felix', { species: 'cat' });
    expect(testTable.value).toEqual({
      fido: { species: 'dog' },
      felix: { species: 'cat' },
    });
  });
});
