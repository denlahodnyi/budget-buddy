<script setup lang="ts">
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-vue-next';

import { useCurrentUserId } from '~/entities/user';
import { useUserExpense, useUserExpenseTrend } from '~/entities/wallet';

const userId = useCurrentUserId();
const expense = useUserExpense(userId);
const trend = useUserExpenseTrend(userId);
</script>

<template>
  <section class="card expense-card">
    <div class="card__header">
      <h2 class="card__title">Expense</h2>
    </div>
    <p>{{ expense.formattedTotalExpense }}</p>
    <p v-if="trend.change !== 0" class="expense-card__trend">
      <span
        :class="[
          'expense-card__trend-value',
          trend.change < 0
            ? 'expense-card__trend--positive'
            : 'expense-card__trend--negative',
        ]"
      >
        <TrendingUpIcon v-if="trend.change >= 0" :size="20" />
        <TrendingDownIcon v-else :size="20" />
        {{ trend.formattedChange }}
      </span>
      compared to last month
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;
$success: t.get-color-var('success');
$danger: t.get-color-var('danger');
$muted-foreground: t.get-color-var('muted-foreground');

.expense-card__trend {
  margin-block: 10px;
  color: var($muted-foreground);
}
.expense-card__trend-value {
  font-weight: 600;
  & svg {
    display: inline;
    vertical-align: text-top;
  }
}
.expense-card__trend--positive {
  color: var($success);
}
.expense-card__trend--negative {
  color: var($danger);
}
</style>
