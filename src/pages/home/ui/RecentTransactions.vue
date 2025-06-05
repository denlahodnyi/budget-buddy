<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';

import TransactionDialog from './TransactionDialog.vue';
import { store } from './store';
</script>

<template>
  <section class="card">
    <div class="card__header card__header_with-actions">
      <h2 class="card__title">Recent Transactions</h2>
      <TransactionDialog>
        <button class="btn"><PlusIcon :size="20" />Add new</button>
      </TransactionDialog>
    </div>
    <div class="transactions-list">
      <section
        v-for="(t, i) of store.transactions"
        :key="i"
        class="transaction-item"
      >
        <p>{{ t.type }}</p>
        <p>{{ `${t.type === 'expense' ? '-' : ''}${t.amount}` }}</p>
        <p>{{ t.date.toLocaleString() }}</p>
      </section>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transactions-list > :not(:last-child) {
  margin-block-end: t.px-to-rem(12px);
}

.transaction-item {
  padding: 6px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  border: 1px solid
    color-mix(in hsl, var(t.get-color-var('border')), transparent 50%);
  border-radius: t.px-to-rem(8px);
  color: inherit;
  background-color: transparent;
}
</style>
