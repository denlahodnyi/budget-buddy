<script setup lang="ts" generic="TSchemas extends OptionalSchemas">
import type { OptionalSchemas, Queries } from 'tinybase/with-schemas';
import { toRef } from 'vue';

import { useResultRow } from '../query';

export interface ResultRowViewProps<TSchemas extends OptionalSchemas> {
  queries: Queries<TSchemas>;
  queryId: string;
  rowId: string;
}

const props = defineProps<ResultRowViewProps<TSchemas>>();
const row = useResultRow({
  queries: props.queries,
  queryId: toRef(() => props.queryId),
  rowId: toRef(() => props.rowId),
  disableQueryCleanup: true,
});
</script>

<template>
  <slot :row="row" />
</template>
