<script setup lang="ts">
import { computed } from 'vue';

import { store } from './store';

const income = computed(() =>
  store.transactions
    .filter((t) => t.type === 'income')
    .reduce((prev, t) => prev + t.amount, 0)
);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Income</h2>
    </div>
    <p>{{ income }}</p>
  </section>
</template>
