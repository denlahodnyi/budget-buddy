<script setup lang="ts" generic="TSchemas extends OptionalSchemas">
import type { OptionalSchemas, Queries } from 'tinybase/with-schemas';
import { toRef } from 'vue';

import { useResultSortedRowIds } from '../query';
import ResultRowView from './ResultRowView.vue';

export interface ResultSortedTableViewProps<TSchemas extends OptionalSchemas> {
  queries: Queries<TSchemas>;
  queryId: string;
  cellId?: string;
  descending?: boolean;
  offset?: number;
  limit?: number;
}

const props = defineProps<ResultSortedTableViewProps<TSchemas>>();
const ids = useResultSortedRowIds({
  queries: props.queries,
  queryId: toRef(() => props.queryId),
  descending: toRef(() => props.descending),
  cellId: toRef(() => props.cellId!),
  offset: toRef(() => props.offset!),
  limit: toRef(() => props.limit!),
});
</script>

<template>
  <template v-for="id in ids" :key="id">
    <ResultRowView
      v-slot="rowProps"
      :queries="props.queries"
      :query-id="props.queryId"
      :row-id="id"
    >
      <slot :row="rowProps.row" :row-id="id" />
    </ResultRowView>
  </template>
</template>
