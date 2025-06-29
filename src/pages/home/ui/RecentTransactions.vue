<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';

import { useTransactions } from '~/entities/transaction';
import { useCurrentWalletId } from '~/entities/wallet';
import TransactionDialog from './TransactionDialog.vue';
import Transaction from './Transaction.vue';

const walletId = useCurrentWalletId();
const ids = useTransactions(walletId);
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

.transactions-list > :not(:last-child) {
  margin-block-end: t.px-to-rem(12px);
}
</style>
