import type {
  Id,
  IdOrNull,
  OptionalSchemas,
  Queries,
  ResultRowIdsListener,
  ResultRowListener,
} from 'tinybase/with-schemas';
import {
  onWatcherCleanup,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type { MaybeUndefinedResultRow } from './util-types';

export function useResultRowIdsListener<
  TSchemas extends OptionalSchemas
>(args: {
  queryId: MaybeRefOrGetter<IdOrNull>;
  listener: ResultRowIdsListener<TSchemas>;
  queries: Queries<TSchemas>;
}) {
  const { queries, queryId, listener } = args;

  watch(
    [queryId],
    ([newQueryId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultRowIdsListener(
          toValue(newQueryId),
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

export function useResultRowIds<TSchemas extends OptionalSchemas>(args: {
  queryId: MaybeRefOrGetter<string>;
  queries: Queries<TSchemas>;
}) {
  const { queryId, queries } = args;
  const ids = shallowRef(queries.getResultRowIds(toValue(queryId)));
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
    [queryId, rowId],
    ([newQueryId, newRowId]) => {
      let listenerId: Id;

      if (queries) {
        listenerId = queries.addResultRowListener(
          toValue(newQueryId),
          toValue(newRowId),
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
