import type {
  Id,
  IdOrNull,
  OptionalSchemas,
  Queries,
  ResultRowIdsListener,
  ResultRowListener,
  ResultSortedRowIdsListener,
  ResultTableListener,
} from 'tinybase/with-schemas';
import {
  onWatcherCleanup,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type {
  MaybeEmptyResultTable,
  MaybeUndefinedResultRow,
} from './util-types';

export function useResultRowIdsListener<
  TSchemas extends OptionalSchemas
>(args: {
  queryId: MaybeRefOrGetter<IdOrNull>;
  listener: ResultRowIdsListener<TSchemas>;
  queries: Queries<TSchemas>;
}) {
  const { queries, queryId, listener } = args;

  watch(
    [() => toValue(queryId)],
    ([newQueryId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultRowIdsListener(newQueryId, listener);
      }

      onWatcherCleanup(() => {
        queries.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useResultRowIds<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<string>;
  queries: Queries<TSchemas>;
}) {
  const { queryId, queries } = args;
  const ids = shallowRef(queries.getResultRowIds(toValue(queryId)));

  watch(
    () => toValue(queryId),
    (newQueryId) => {
      ids.value = queries.getResultRowIds(newQueryId);

      onWatcherCleanup(() => {
        queries.delQueryDefinition(newQueryId);
      });
    },
    { immediate: true }
  );

  useResultRowIdsListener({
    queries,
    queryId,
    listener: (queries) => {
      ids.value = queries.getResultRowIds(toValue(queryId));
    },
  });

  return ids;
}

export function useResultRowListener<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<IdOrNull>;
  rowId: MaybeRefOrGetter<IdOrNull>;
  listener: ResultRowListener<TSchemas>;
  queries: Queries<TSchemas>;
}) {
  const { queries, queryId, rowId, listener } = args;

  watch(
    [() => toValue(queryId), () => toValue(rowId)],
    ([newQueryId, newRowId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultRowListener(
          newQueryId,
          newRowId,
          listener
        );
      }

      onWatcherCleanup(() => {
        queries.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useResultRow<
  TResultRow extends MaybeUndefinedResultRow,
  TSchemas extends OptionalSchemas
>(args: {
  queryId: MaybeRefOrGetter<string>;
  rowId: MaybeRefOrGetter<Id>;
  queries: Queries<TSchemas>;
}) {
  const { queryId, rowId, queries } = args;
  const row = shallowRef(
    queries.getResultRow(toValue(queryId), toValue(rowId)) as TResultRow
  );

  watch(
    [() => toValue(queryId), () => toValue(rowId)],
    ([newQueryId, newRowId]) => {
      row.value = queries.getResultRow(newQueryId, newRowId);

      onWatcherCleanup(() => {
        queries.delQueryDefinition(newQueryId);
      });
    },
    { immediate: true }
  );

  useResultRowListener({
    queries,
    queryId,
    rowId,
    listener: (queries) => {
      row.value = queries.getResultRow(toValue(queryId), toValue(rowId));
    },
  });

  return row;
}

export function useResultTableListener<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<IdOrNull>;
  listener: ResultTableListener<TSchemas>;
  queries: Queries<TSchemas>;
}) {
  const { queries, queryId, listener } = args;

  watch(
    [() => toValue(queryId)],
    ([newQueryId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultTableListener(newQueryId, listener);
      }

      onWatcherCleanup(() => {
        queries.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useResultTable<
  TResultTable extends MaybeEmptyResultTable,
  TSchemas extends OptionalSchemas
>(args: { queryId: MaybeRefOrGetter<string>; queries: Queries<TSchemas> }) {
  const { queryId, queries } = args;
  const resultTable = shallowRef(
    queries.getResultTable(toValue(queryId)) as TResultTable
  );

  watch(
    [() => toValue(queryId)],
    ([newQueryId]) => {
      resultTable.value = queries.getResultTable(newQueryId);

      onWatcherCleanup(() => {
        queries.delQueryDefinition(newQueryId);
      });
    },
    { immediate: true }
  );

  useResultTableListener({
    queries,
    queryId,
    listener: (queries) => {
      resultTable.value = queries.getResultTable(toValue(queryId));
    },
  });

  return resultTable;
}

export function useResultSortedRowIdsListener<
  TSchemas extends OptionalSchemas
>(args: {
  queries: Queries<TSchemas>;
  queryId: MaybeRefOrGetter<Id>;
  descending: MaybeRefOrGetter<boolean>;
  offset: MaybeRefOrGetter<number>;
  listener: ResultSortedRowIdsListener<TSchemas>;
  limit?: MaybeRefOrGetter<number>;
  cellId?: MaybeRefOrGetter<Id>;
}) {
  const { queries, queryId, listener, cellId, descending, offset, limit } =
    args;

  watch(
    [
      () => toValue(queryId),
      () => toValue(cellId),
      () => toValue(descending),
      () => toValue(offset),
      () => toValue(limit),
    ],
    ([newQueryId, newCellId, newDescending, newOffset, newLimit]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultSortedRowIdsListener(
          newQueryId,
          newCellId,
          newDescending,
          newOffset,
          newLimit,
          listener
        );
      }

      onWatcherCleanup(() => {
        queries.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useResultSortedRowIds<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<Id>;
  queries: Queries<TSchemas>;
  descending?: MaybeRefOrGetter<boolean>;
  offset?: MaybeRefOrGetter<number>;
  cellId?: MaybeRefOrGetter<Id>;
  limit?: MaybeRefOrGetter<number>;
}) {
  const { queryId, queries, cellId, descending, offset, limit } = args;
  const ids = shallowRef(
    queries.getResultSortedRowIds(
      toValue(queryId),
      toValue(cellId),
      toValue(descending),
      toValue(offset),
      toValue(limit)
    )
  );

  watch(
    [
      () => toValue(queryId),
      () => toValue(cellId),
      () => toValue(descending),
      () => toValue(offset),
      () => toValue(limit),
    ],
    ([newQueryId, newCellId, newDescending, newOffset, newLimit]) => {
      ids.value = queries.getResultSortedRowIds(
        newQueryId,
        newCellId,
        newDescending,
        newOffset,
        newLimit
      );
    }
  );

  useResultSortedRowIdsListener({
    queries,
    queryId,
    limit,
    cellId,
    descending: descending ?? false,
    offset: offset ?? 10,
    listener: (
      _queries,
      _tableId,
      _cellId,
      _descendeing,
      _offset,
      _limit,
      sortedIds
    ) => {
      ids.value = sortedIds;
    },
  });

  return ids;
}

export function useResultRowCountListener<
  TSchemas extends OptionalSchemas
>(args: {
  queryId: MaybeRefOrGetter<IdOrNull>;
  listener: ResultRowIdsListener<TSchemas>;
  queries: Queries<TSchemas>;
}) {
  const { queries, queryId, listener } = args;

  watch(
    [() => toValue(queryId)],
    ([newQueryId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultRowIdsListener(newQueryId, listener);
      }

      onWatcherCleanup(() => {
        queries.delListener(listenerId);
      });
    },
    { immediate: true }
  );
}

export function useResultRowCount<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<Id>;
  queries: Queries<TSchemas>;
}) {
  const { queryId, queries } = args;
  const count = shallowRef(queries.getResultRowCount(toValue(queryId)));

  watch(
    () => toValue(queryId),
    (newQueryId) => {
      count.value = queries.getResultRowCount(newQueryId);
    }
  );

  useResultRowCountListener({
    queries,
    queryId,
    listener: (queries) => {
      count.value = queries.getResultRowCount(toValue(queryId));
    },
  });

  return count;
}
