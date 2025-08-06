<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { onBeforeMount, ref } from 'vue';

import LoaderOverlay from './app/LoaderOverlay.vue';
import { exchangeRateQuery, useExchangeRates } from './entities/currency';
import { initiateStorePersister } from './store';

const client = useQueryClient();
const isStoreReady = ref(false);

// Active observable to keep prefetched data
useExchangeRates();

onBeforeMount(() => {
  settleInitialData();
});

const settleInitialData = async () => {
  await initiateStorePersister();
  await client.prefetchQuery(exchangeRateQuery);
  isStoreReady.value = true;
};
</script>

<template>
  <RouterView v-show="isStoreReady" :inert="!isStoreReady" />

  <LoaderOverlay :is-visible="!isStoreReady">
    <span class="overlay-title">Budget Buddy</span>
    <div style="min-height: 20px; line-height: 0">
      <Transition name="txt-fade">
        <span v-show="!isStoreReady">Preparing data</span>
      </Transition>
    </div>
  </LoaderOverlay>

  <VueQueryDevtools style="position: absolute" />
</template>

<style lang="scss">
@use '@globals/tools' as t;

body {
  overscroll-behavior: none;
}
#app {
  min-height: 100vh;
  display: grid;
}
.overlay-title {
  font-size: 80px;
  font-family: MsMadi, cursive;
  color: var(t.get-color-var('primary'));
}
.txt-fade-leave-active {
  transition: opacity 0.6s linear;
}
.txt-fade-leave-to {
  opacity: 0;
}
</style>
