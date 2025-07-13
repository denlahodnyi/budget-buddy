<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';

import { useTransactions } from '~/entities/transaction';
import { useCurrentUserId } from '~/entities/user';
import Transaction from './Transaction.vue';
import TransactionDialog from './TransactionDialog.vue';

const userId = useCurrentUserId();
const ids = useTransactions(userId);
</script>

<template>
  <section class="card">
    <div class="card__header card__header_with-actions">
      <h2 class="card__title">Recent Transactions</h2>
      <TransactionDialog>
        <button class="btn"><PlusIcon :size="20" />Add new</button>
      </TransactionDialog>
    </div>
    <div role="list" class="transactions-list">
      <Transaction v-for="id in ids" :id="id" :key="id" role="listitem" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.transactions-list {
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
