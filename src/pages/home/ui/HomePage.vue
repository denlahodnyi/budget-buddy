<script setup lang="ts">
import BalanceCard from './BalanceCard.vue';
import ExpensesOverviewCard from './charts/ExpensesOverviewCard.vue';
import StatisticCard from './charts/StatisticCard.vue';
import ExpenseCard from './ExpenseCard.vue';
import IncomeCard from './IncomeCard.vue';
import RecentTransactions from './transactions/RecentTransactions.vue';
import WalletsCard from './wallets/WalletsCard.vue';
</script>

<template>
  <div class="dashboard">
    <h1 class="main-title grid-block" data-area="title">
      Welcome back, buddy!
    </h1>
    <BalanceCard class="grid-block" data-area="balance" />
    <IncomeCard class="grid-block" data-area="income" />
    <ExpenseCard class="grid-block" data-area="expense" />
    <ExpensesOverviewCard class="grid-block" data-area="expenseOverview" />
    <StatisticCard class="grid-block" data-area="statistics" />
    <WalletsCard class="grid-block" data-area="wallets" />
    <RecentTransactions class="grid-block" data-area="transactions" />
  </div>
</template>

<style scoped lang="scss">
@use '@globals/tools' as t;

.dashboard {
  max-height: inherit;
  overflow: inherit;
  padding-block: 30px 40px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;

  @include t.screen(md) {
    grid-template-rows: repeat(3, min-content) 1fr;
  }
}

.main-title {
  margin-block-end: t.px-to-rem(20px);
}
.grid-block[data-area='title'] {
  grid-area: title;
  grid-column: 1 / -1;
  grid-row: 1 / span 1;
}
.grid-block[data-area='balance'] {
  grid-area: balance;
  grid-column: 1 / -1;
  grid-row: 2 / span 1;

  @include t.screen(sm2) {
    grid-column: 9 / -1;
    grid-row: 2 / span 1;
  }
}
.grid-block[data-area='income'] {
  grid-area: income;
  grid-column: 1 / -1;
  grid-row: 3 / span 1;

  @include t.screen(sm2) {
    grid-column: 1 / span 4;
    grid-row: 2 / span 1;
  }
}
.grid-block[data-area='expense'] {
  grid-area: expense;
  grid-column: 1 / -1;
  grid-row: 4 / span 1;

  @include t.screen(sm2) {
    grid-column: 5 / span 4;
    grid-row: 2 / span 1;
  }
}
.grid-block[data-area='expenseOverview'] {
  grid-area: expenseOverview;
  grid-column: 1 / -1;
  grid-row: 7 / span 1;

  @include t.screen(sm2) {
    grid-column: 1 / span 5;
    grid-row: 3 / span 1;
  }
}
.grid-block[data-area='statistics'] {
  grid-area: statistics;
  grid-column: 1 / -1;
  grid-row: 8 / span 1;

  @include t.screen(sm2) {
    grid-column: 6 / -1;
    grid-row: 3 / span 1;
  }
}
.grid-block[data-area='transactions'] {
  grid-area: transactions;
  max-height: max-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
  grid-row: 6 / span 1;

  @include t.screen(md) {
    grid-column: 1 / -4;
    grid-row: 4 / span 1;
  }
}
.grid-block[data-area='wallets'] {
  grid-area: wallets;
  max-height: max-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
  grid-row: 5 / span 1;

  @include t.screen(md) {
    grid-column: -4 / -1;
    grid-row: 4 / span 1;
  }
}
</style>
