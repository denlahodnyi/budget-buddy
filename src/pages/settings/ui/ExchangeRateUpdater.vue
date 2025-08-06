<script setup lang="ts">
import { RefreshCwIcon } from 'lucide-vue-next';

import { useExchangeRates } from '~/entities/currency';

const { dataUpdatedAt, isFetching, refetch } = useExchangeRates();

const handleUpdaterClick = () => {
  if (isFetching.value) return;
  refetch();
};
</script>

<template>
  <p class="upd-label">
    Last updated: {{ new Date(dataUpdatedAt).toLocaleString() }}
  </p>
  <button
    class="btn upd-btn"
    data-variant="outline"
    :aria-disabled="isFetching"
    :aria-busy="isFetching"
    @click="handleUpdaterClick"
  >
    <RefreshCwIcon
      :class="['upd-btn__icon', { active: isFetching }]"
      :size="18"
    />
    Refresh exchange rates
  </button>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.upd-label {
  margin-block-end: 10px;
}

.upd-btn__icon {
  &.active {
    animation-name: spin;
    animation-duration: 2s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
