import type {
  Id,
  IdOrNull,
  OptionalSchemas,
  Row,
  RowIdsListener,
  RowListener,
  Store,
} from 'tinybase/with-schemas';
import {
  onWatcherCleanup,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type { TableIdFromSchema } from './util-types';

export function useAddRowCallback<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(args: {
  tableId: TTableId;
  store: Store<TSchemas>;
  then?: (thenArgs: {
    rowId: undefined | string;
    store: Store<TSchemas>;
    row: Row<TSchemas[0], TTableId>;
  }) => void;
  reuseRowIds?: boolean;
}) {
  return (row: Row<TSchemas[0], TTableId>) => {
    const { tableId, store, reuseRowIds, then } = args;
    const rowId = store.addRow(tableId, row, reuseRowIds);
    if (then) then({ rowId, store, row });
    return { rowId };
  };
}

export function useSetRowCallback<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(args: {
  tableId: TTableId;
  rowId: Id;
  then?: (thenArgs: {
    rowId: undefined | string;
    store: Store<TSchemas>;
    row: Row<TSchemas[0], TTableId>;
  }) => void;
  store: Store<TSchemas>;
}) {
  return (row: Row<TSchemas[0], TTableId>) => {
    const { tableId, rowId, then, store } = args;
    store.setRow(tableId, rowId, row);
    if (then) then({ rowId, store, row });
  };
}

export function useSetPartialRowCallback<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(args: {
  tableId: TableIdFromSchema<TSchemas[0]>;
  rowId: Id;
  then?: (thenArgs: {
    rowId: undefined | string;
    store: Store<TSchemas>;
    row: Row<TSchemas[0], TTableId>;
  }) => void;
  store: Store<TSchemas>;
}) {
  return (row: Row<TSchemas[0], TTableId>) => {
    const { tableId, rowId, then, store } = args;
    store.setPartialRow(tableId, rowId, row);
    if (then) then({ rowId, store, row });
  };
}

export function useRowIdsListener<TSchemas extends OptionalSchemas>(args: {
  tableId: MaybeRefOrGetter<TableIdFromSchema<TSchemas[0]> | null>;
  listener: RowIdsListener<TSchemas, TableIdFromSchema<TSchemas[0]> | null>;
  mutator?: MaybeRefOrGetter<boolean>;
  store: Store<TSchemas>;
}) {
  const { tableId, listener, mutator, store } = args;

  watch(
    [tableId, mutator],
    ([newTableId, newMutator]) => {
      let listenerId: Id;

      if (store) {
        listenerId = store.addRowIdsListener(
          toValue(
            newTableId as MaybeRefOrGetter<TableIdFromSchema<
              TSchemas[0]
            > | null>
          ),
          listener,
          toValue(newMutator as MaybeRefOrGetter<boolean>)
        );
      }

      onWatcherCleanup(() => {
        if (store && listenerId) store.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useRowIds<TSchemas extends OptionalSchemas>(args: {
  tableId: MaybeRefOrGetter<TableIdFromSchema<TSchemas[0]>>;
  store: Store<TSchemas>;
}) {
  const { tableId, store } = args;
  const ids = shallowRef(store.getRowIds(toValue(tableId)));

  useRowIdsListener({
    tableId,
    store,
    listener: (store, tableId) => {
      ids.value = store.getRowIds(tableId);
    },
    mutator: () => true,
  });

  return ids;
}

export function useRowListener<TSchemas extends OptionalSchemas>(args: {
  tableId: MaybeRefOrGetter<TableIdFromSchema<TSchemas[0]> | null>;
  rowId: MaybeRefOrGetter<IdOrNull>;
  listener: RowListener<
    TSchemas,
    TableIdFromSchema<TSchemas[0]> | null,
    IdOrNull
  >;
  mutator?: MaybeRefOrGetter<boolean>;
  store: Store<TSchemas>;
}) {
  const { store, tableId, rowId, listener, mutator } = args;

  watch(
    [tableId, rowId, mutator],
    ([newTableId, newRowId, newMutator]) => {
      let listenerId: Id;

      if (store) {
        listenerId = store.addRowListener(
          toValue(
            newTableId as MaybeRefOrGetter<TableIdFromSchema<
              TSchemas[0]
            > | null>
          ),
          toValue(newRowId as MaybeRefOrGetter<IdOrNull>),
          listener,
          toValue(newMutator as MaybeRefOrGetter<boolean>)
        );
      }

      onWatcherCleanup(() => {
        store.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useRow<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(args: {
  tableId: MaybeRefOrGetter<TTableId>;
  rowId: MaybeRefOrGetter<Id>;
  store: Store<TSchemas>;
}) {
  const { store, tableId, rowId } = args;
  const row = shallowRef<Row<TSchemas[0], TTableId>>(
    store.getRow(toValue(tableId), toValue(rowId))
  );
  useRowListener({
    tableId,
    rowId,
    store,
    listener: (store, tableId) => {
      row.value = store.getRow(tableId, toValue(rowId));
    },
    mutator: () => true,
  });

  return row;
}
