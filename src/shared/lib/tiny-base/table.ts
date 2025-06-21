import type {
  Id,
  OptionalSchemas,
  Store,
  Table,
  TableListener,
} from 'tinybase/with-schemas';
import {
  onWatcherCleanup,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type { TableIdFromSchema } from './util-types';

export function useTableListener<TSchemas extends OptionalSchemas>(args: {
  tableId: MaybeRefOrGetter<TableIdFromSchema<TSchemas[0]>>;
  listener: TableListener<
    TSchemas,
    TableIdFromSchema<TSchemas[0]>,
    Store<TSchemas>
  >;
  store: Store<TSchemas>;
  mutator?: MaybeRefOrGetter<boolean>;
}) {
  const { tableId, listener, store, mutator } = args;

  watch(
    [tableId, mutator],
    ([newTableId, newMutator]) => {
      let listenerId: Id;

      if (store) {
        listenerId = store.addTableListener(
          toValue(
            newTableId as MaybeRefOrGetter<TableIdFromSchema<TSchemas[0]>>
          ),
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

export function useTable<
  TSchemas extends OptionalSchemas,
  TTableId extends TableIdFromSchema<TSchemas[0]>
>(args: { tableId: MaybeRefOrGetter<TTableId>; store: Store<TSchemas> }) {
  const { store, tableId } = args;
  const table = shallowRef<Table<TSchemas[0], TTableId>>(
    store.getTable(toValue(tableId))
  );

  useTableListener({
    tableId,
    store,
    listener: (store, tid) => {
      table.value = store.getTable(tid as unknown as TTableId);
    },
    mutator: () => true,
  });

  return table;
}
