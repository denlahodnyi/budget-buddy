<script setup lang="ts">
import { useCurrentWalletId, useTotalIncomeByWallet } from '~/entities/wallet';

const walletId = useCurrentWalletId();
const income = useTotalIncomeByWallet(walletId);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Income</h2>
    </div>
    <p>{{ income.formattedTotalIncome }}</p>
  </section>
</template>
