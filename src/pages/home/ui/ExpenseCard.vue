<script setup lang="ts">
import { useCurrentWalletId, useTotalExpenseByWallet } from '~/entities/wallet';

const walletId = useCurrentWalletId();
const expense = useTotalExpenseByWallet(walletId);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Expense</h2>
    </div>
    <p>{{ expense.formattedTotalExpense }}</p>
  </section>
</template>
