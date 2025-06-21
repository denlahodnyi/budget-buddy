import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import {
  useAddRowCallback,
  useRow,
  useRowIds,
  useRowIdsListener,
  useRowListener,
  useSetPartialRowCallback,
  useSetRowCallback,
} from './row';
import { createTestStore, flushPromises } from '../test-utils';

describe('The useRowIdsListener composable', () => {
  it('calls listener with store and changed table id when row ids change', () => {
    const store = createTestStore();
    const listener = vi.fn();

    useRowIdsListener({
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

    useRowIdsListener({
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

describe('The useRowListener', () => {
  it('calls listener with store, table id and row id when row changes', () => {
    const store = createTestStore();
    const listener = vi.fn();

    useRowListener({
      store,
      tableId: () => 'pets',
      rowId: () => 'fido',
      listener,
      mutator: () => false,
    });

    store.setCell('pets', 'fido', 'species', 'cat');

    expect(listener).toHaveBeenCalledWith(
      store,
      'pets',
      'fido',
      expect.anything()
    );
  });

  it('registers new listener when table id or row id changes', async () => {
    const store = createTestStore();
    const tableId = ref('pets');
    const rowId = ref('fido');
    const listener = vi.fn();

    useRowListener({
      store,
      tableId,
      rowId,
      listener,
      mutator: () => false,
    });

    store.setCell('pets', 'fido', 'species', 'cat');
    tableId.value = 'species';
    rowId.value = 'dog';
    // wait for watcher cleanup
    await flushPromises();
    store.setCell('species', 'dog', 'price', 10);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      store,
      'species',
      'dog',
      expect.anything()
    );
  });
});

describe('The useRowIds composable', () => {
  it('returns row ids from the store', () => {
    const store = createTestStore();
    const ids = useRowIds({ store, tableId: () => 'pets' });

    expect(ids.value).toEqual(['fido']);
  });

  it('listens to changes in the row ids', async () => {
    const store = createTestStore();
    const ids = useRowIds({ store, tableId: () => 'pets' });

    store.setRow('pets', 'felix', { species: 'cat' });
    await flushPromises();
    expect(ids.value).toEqual(['fido', 'felix']);
  });
});

describe('The useRow composable', () => {
  it('returns a row from the store', () => {
    const store = createTestStore();
    const row = useRow({
      store,
      tableId: () => 'pets',
      rowId: () => 'fido',
    });

    expect(row.value).toEqual({ species: 'dog' });
  });

  it('listens to changes in the row', () => {
    const store = createTestStore();
    const row = useRow({
      store,
      tableId: () => 'pets',
      rowId: () => 'fido',
    });

    store.setCell('pets', 'fido', 'species', 'cat');
    expect(row.value).toEqual({ species: 'cat' });
  });
});

describe('The useAddRowCallback composable', () => {
  it('returns a callback to add a row', () => {
    const store = createTestStore();

    const addRowCallback = useAddRowCallback({
      store,
      tableId: 'pets',
    });

    const result = addRowCallback({ species: 'rabbit' });
    expect(result).toHaveProperty('rowId');
    expect(store.getRow('pets', result.rowId!)).toEqual({ species: 'rabbit' });
  });

  it('calls "then" callback after adding a row', () => {
    const store = createTestStore();
    const thenCb = vi.fn();

    const addRowCallback = useAddRowCallback({
      store,
      tableId: 'pets',
      then: thenCb,
    });

    const result = addRowCallback({ species: 'rabbit' });
    expect(thenCb).toHaveBeenCalledWith({
      rowId: result.rowId,
      row: { species: 'rabbit' },
      store,
    });
  });
});

describe('The useSetRowCallback composable', () => {
  it('returns a callback to set a row', () => {
    const store = createTestStore();

    const setRowCallback = useSetRowCallback({
      store,
      tableId: 'pets',
      rowId: 'fido',
    });

    setRowCallback({ species: 'cat' });
    expect(store.getRow('pets', 'fido')).toEqual({ species: 'cat' });
  });

  it('calls "then" callback after setting a row', () => {
    const store = createTestStore();
    const thenCb = vi.fn();

    const setRowCallback = useSetRowCallback({
      store,
      tableId: 'pets',
      rowId: 'fido',
      then: thenCb,
    });

    setRowCallback({ species: 'cat' });
    expect(thenCb).toHaveBeenCalledWith({
      rowId: 'fido',
      row: { species: 'cat' },
      store,
    });
  });
});

describe('The useSetPartialRowCallback composable', () => {
  it('returns a callback to set partial row', () => {
    const store = createTestStore();

    const setPartialRowCallback = useSetPartialRowCallback({
      store,
      tableId: 'pets',
      rowId: 'fido',
    });

    setPartialRowCallback({ species: 'cat' });
    expect(store.getRow('pets', 'fido')).toEqual({ species: 'cat' });
  });

  it('calls "then" callback after setting a partial row', () => {
    const store = createTestStore();
    const thenCb = vi.fn();

    const setPartialRowCallback = useSetPartialRowCallback({
      store,
      tableId: 'pets',
      rowId: 'fido',
      then: thenCb,
    });

    setPartialRowCallback({ species: 'cat' });
    expect(thenCb).toHaveBeenCalledWith({
      rowId: 'fido',
      row: { species: 'cat' },
      store,
    });
  });
});
