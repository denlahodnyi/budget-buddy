<script setup lang="ts">
import { computed } from 'vue';

import { store } from './store';

const expense = computed(() =>
  store.transactions
    .filter((t) => t.type === 'expense')
    .reduce((prev, t) => prev + t.amount, 0)
);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Expense</h2>
    </div>
    <p>{{ -expense }}</p>
  </section>
</template>
