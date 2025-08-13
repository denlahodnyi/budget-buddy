import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import {
  createTestStore,
  createTestStoreQueries,
  flushPromises,
} from '../test-utils';
import {
  useResultRow,
  useResultRowIds,
  useResultRowIdsListener,
  useResultRowListener,
  useResultSortedRowIdsListener,
  useResultTable,
  useResultTableListener,
} from './query';

describe('The useResultRowIdsListener composable', () => {
  it('calls listener (with queries and result table id) when query changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const listener = vi.fn();

    useResultRowIdsListener({
      queries,
      queryId: () => 'dogSpeciesQuery',
      listener,
    });

    store.setRow('pets', 'felix', { species: 'cat' });
    store.setRow('pets', 'garry', { species: 'dog' }); // this one triggers the query

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'dogSpeciesQuery',
      expect.anything()
    );
  });

  it('registers new listener when query id changes', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('dogSpeciesQuery');
    const listener = vi.fn();

    useResultRowIdsListener({
      queries,
      queryId,
      listener,
    });

    store.setRow('pets', 'felix', { species: 'dog' });
    queryId.value = 'catSpeciesQuery';
    // wait for watcher cleanup
    await flushPromises();
    store.setRow('pets', 'garry', { species: 'cat' });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'catSpeciesQuery',
      expect.anything()
    );
  });
});

describe('The useResultRowIds composable', () => {
  it('returns the current result row ids and updates when they change', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);

    const resultRowIds = useResultRowIds({
      queryId: () => 'dogSpeciesQuery',
      queries,
    });

    expect(resultRowIds.value).toEqual(['fido']);
    store.setRow('pets', 'garry', { species: 'dog' }); // this one triggers the query
    store.setRow('pets', 'felix', { species: 'cat' });
    store.setRow('pets', 'jack', { species: 'dog' }); // this one triggers the query
    expect(resultRowIds.value).toEqual(['fido', 'garry', 'jack']);
  });

  it('returns new ids on query id change', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('dogSpeciesQuery');

    const resultRowIds = useResultRowIds({
      queryId,
      queries,
    });

    expect(resultRowIds.value).toEqual(['fido']);
    store.setRow('pets', 'garry', { species: 'dog' });
    expect(resultRowIds.value).toEqual(['fido', 'garry']);
    store.setRow('pets', 'felix', { species: 'cat' });
    queryId.value = 'catSpeciesQuery';
    await flushPromises();
    expect(resultRowIds.value).toEqual(['felix']);
  });
});

describe('The useResultRowListener composable', () => {
  it('calls listener (with queries, result table id, and row id) when query result row changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const listener = vi.fn();

    useResultRowListener({
      queries,
      queryId: () => 'dogSpeciesQuery',
      rowId: () => 'fido',
      listener,
    });

    store.setCell('pets', 'fido', 'species', 'cat'); // this one triggers the query
    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    store.setRow('pets', 'garry', { species: 'dog' });
    store.setCell('pets', 'garry', 'species', 'cat');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      queries,
      'dogSpeciesQuery',
      'fido',
      expect.anything()
    );
  });

  it('registers new listener when query id or row id changes', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('dogSpeciesQuery');
    const rowId = ref('fido');
    const listener = vi.fn();

    useResultRowListener({
      queries,
      queryId,
      rowId,
      listener,
    });

    store.setRow('pets', 'garry', { species: 'cat' });
    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    store.setCell('pets', 'fido', 'species', 'cat'); // this one triggers the query
    queryId.value = 'catSpeciesQuery';
    rowId.value = 'garry';
    // wait for watcher cleanup
    await flushPromises();
    store.setCell('pets', 'garry', 'species', 'parrot'); // this one triggers the query

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'catSpeciesQuery',
      'garry',
      expect.anything()
    );
  });
});

describe('The useResultRow composable', () => {
  it('returns the current result row and updates when it changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    queries.setQueryDefinition('fullDog', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'dog');
    });

    const resultRow = useResultRow({
      queryId: () => 'fullDog',
      rowId: () => 'fido',
      queries,
    });

    expect(resultRow.value).toEqual({ species: 'dog' });
    store.setCell('pets', 'fido', 'color', 'black'); // this one triggers the query
    expect(resultRow.value).toEqual({ species: 'dog', color: 'black' });
    store.setCell('pets', 'fido', 'species', 'cat'); // this one triggers the query
    expect(resultRow.value).toEqual({});
    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    expect(resultRow.value).toEqual({});
  });

  it('returns updated row when queryId or rowId changes', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('fullDog');
    const rowId = ref('fido');
    queries.setQueryDefinition('fullDog', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'dog');
    });
    queries.setQueryDefinition('fullCat', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'cat');
    });

    const resultRow = useResultRow({
      queryId,
      rowId,
      queries,
    });

    store.setRow('pets', 'felix', { species: 'dog', color: 'red' });
    rowId.value = 'felix';
    await flushPromises();
    expect(resultRow.value).toEqual({ species: 'dog', color: 'red' });
    queryId.value = 'fullCat';
    await flushPromises();
    expect(resultRow.value).toEqual({});
    store.setRow('pets', 'garry', { species: 'cat', color: 'green' });
    rowId.value = 'garry';
    await flushPromises();
    expect(resultRow.value).toEqual({ species: 'cat', color: 'green' });
  });
});

describe('The useResultTableListener composable', () => {
  it('calls listener (with queries) when query result table changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const listener = vi.fn();

    useResultTableListener({
      queries,
      queryId: () => 'dogSpeciesQuery',
      listener,
    });

    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    store.setRow('pets', 'garry', { species: 'dog' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      queries,
      'dogSpeciesQuery',
      expect.anything()
    );
  });

  it('registers new listener when query id changes', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('dogSpeciesQuery');
    const listener = vi.fn();

    useResultTableListener({
      queries,
      queryId,
      listener,
    });

    store.setRow('pets', 'garry', { species: 'cat' }); // this one triggers the query
    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    store.setCell('pets', 'fido', 'species', 'cat'); // this one triggers the query
    queryId.value = 'catSpeciesQuery';
    await flushPromises();
    store.setCell('pets', 'garry', 'species', 'parrot'); // this one triggers the query

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'catSpeciesQuery',
      expect.anything()
    );
  });
});

describe('The useResultTable composable', () => {
  it('returns the current result table and updates when it changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    queries.setQueryDefinition('fullDog', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'dog');
    });

    const resultTable = useResultTable({
      queryId: () => 'fullDog',
      queries,
    });

    expect(resultTable.value).toEqual({ fido: { species: 'dog' } });
    store.setCell('pets', 'fido', 'color', 'black'); // this one triggers the query
    expect(resultTable.value).toEqual({
      fido: { species: 'dog', color: 'black' },
    });
    store.setCell('pets', 'fido', 'species', 'cat'); // this one triggers the query
    expect(resultTable.value).toEqual({});
    store.setCell('pets', 'fido', 'color', 'brown'); // this one doesn't trigger the query
    expect(resultTable.value).toEqual({});
  });

  it('returns updated table when queryId', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('fullDog');
    queries.setQueryDefinition('fullDog', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'dog');
    });
    queries.setQueryDefinition('fullCat', 'pets', ({ select, where }) => {
      select('species');
      select('color');
      where('species', 'cat');
    });

    const resultTable = useResultTable({
      queryId,
      queries,
    });

    store.setRow('pets', 'felix', { species: 'dog', color: 'red' });
    await flushPromises();
    expect(resultTable.value).toEqual({
      fido: { species: 'dog' },
      felix: { species: 'dog', color: 'red' },
    });
    queryId.value = 'fullCat';
    await flushPromises();
    expect(resultTable.value).toEqual({});
    store.setRow('pets', 'garry', { species: 'cat', color: 'green' });
    await flushPromises();
    expect(resultTable.value).toEqual({
      garry: { species: 'cat', color: 'green' },
    });
  });
});

describe('The useResultSortedRowIdsListener composable', () => {
  it('calls listener when query changes', () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const listener = vi.fn();

    useResultSortedRowIdsListener({
      queries,
      queryId: () => 'dogSpeciesQuery',
      descending: false,
      offset: 0,
      listener,
    });

    store.setRow('pets', 'felix', { species: 'cat' });
    store.setRow('pets', 'garry', { species: 'dog' }); // this one triggers the query

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'dogSpeciesQuery',
      undefined,
      false,
      0,
      undefined,
      ['fido', 'garry']
    );
  });

  it('registers new listener when queryId changes', async () => {
    const store = createTestStore();
    const { queries } = createTestStoreQueries(store);
    const queryId = ref('dogSpeciesQuery');
    const listener = vi.fn();

    useResultSortedRowIdsListener({
      queries,
      queryId,
      descending: false,
      offset: 0,
      listener,
    });

    store.setRow('pets', 'felix', { species: 'dog' });
    queryId.value = 'catSpeciesQuery';
    // wait for watcher cleanup
    await flushPromises();
    store.setRow('pets', 'garry', { species: 'cat' });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(
      queries,
      'catSpeciesQuery',
      undefined,
      false,
      0,
      undefined,
      ['garry']
    );
  });
});
