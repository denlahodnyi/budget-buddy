<script setup lang="ts">
import { useCurrentUserId } from '~/entities/user';
import { useUserIncome } from '~/entities/wallet';

const userId = useCurrentUserId();
const income = useUserIncome(userId);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Income</h2>
    </div>
    <p>{{ income.formattedTotalIncome }}</p>
  </section>
</template>
