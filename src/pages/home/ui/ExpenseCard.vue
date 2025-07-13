<script setup lang="ts">
import { useCurrentUserId } from '~/entities/user';
import { useUserExpense } from '~/entities/wallet';

const userId = useCurrentUserId();
const expense = useUserExpense(userId);
</script>

<template>
  <section class="card">
    <div class="card__header">
      <h2 class="card__title">Expense</h2>
    </div>
    <p>{{ expense.formattedTotalExpense }}</p>
  </section>
</template>
