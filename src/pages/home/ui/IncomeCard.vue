<script setup lang="ts">
import {
  BanknoteArrowDownIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-vue-next';

import { useCurrentUserId } from '~/entities/user';
import { useUserIncome, useUserIncomeTrend } from '~/entities/wallet';
import MainCardValue from './MainCardValue.vue';

const userId = useCurrentUserId();
const income = useUserIncome(userId);
const trend = useUserIncomeTrend(userId);
</script>

<template>
  <section class="card income-card">
    <div class="card__header">
      <h2 class="card__title card__title--with-icon">
        <BanknoteArrowDownIcon :size="30" aria-hidden />
        <span>Income</span>
      </h2>
    </div>
    <MainCardValue>{{ income.formattedTotalIncome }}</MainCardValue>
    <p
      v-if="!trend.currentMonthIncome && !trend.prevMonthIncome"
      class="income-card__trend"
    >
      No activity
    </p>
    <p v-else-if="trend.change !== 0" class="income-card__trend">
      <span
        :class="[
          'income-card__trend-value',
          trend.change >= 0
            ? 'income-card__trend--positive'
            : 'income-card__trend--negative',
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

.income-card__trend {
  margin-block: 10px;
  color: var($muted-foreground);
}
.income-card__trend-value {
  font-weight: 600;
  & svg {
    display: inline;
    vertical-align: text-top;
  }
}
.income-card__trend--positive {
  color: var($success);
}
.income-card__trend--negative {
  color: var($danger);
}
</style>
