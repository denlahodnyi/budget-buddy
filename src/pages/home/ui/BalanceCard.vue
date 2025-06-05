<script setup lang="ts">
import { computed } from 'vue';

import { store } from './store';

const balance = computed(() => {
  const income = store.transactions
    .filter((t) => t.type === 'income')
    .reduce((prev, t) => prev + t.amount, 0);
  const expense = store.transactions
    .filter((t) => t.type === 'expense')
    .reduce((prev, t) => prev + t.amount, 0);
  return income - expense;
});
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Your balance</h2>
    </div>
    <p>{{ balance }}</p>
  </section>
</template>
