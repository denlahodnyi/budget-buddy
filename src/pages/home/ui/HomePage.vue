<script setup lang="ts">
import BalanceCard from './BalanceCard.vue';
import ExpenseCard from './ExpenseCard.vue';
import ExpensesOverviewCard from './ExpensesOverviewCard.vue';
import IncomeCard from './IncomeCard.vue';
import RecentTransactions from './RecentTransactions.vue';
import WalletsCard from './WalletsCard.vue';
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
  grid-template-columns: repeat(3, 1fr) 250px;
  grid-template-rows: min-content min-content 1fr;
  grid-template-areas:
    'title title title title'
    'income expense balance wallets'
    'expenseOverview . . wallets'
    'transactions transactions transactions wallets';
  gap: 16px;
}

.main-title {
  margin-block-end: t.px-to-rem(20px);
}
.grid-block[data-area='title'] {
  grid-area: title;
}
.grid-block[data-area='balance'] {
  grid-area: balance;
}
.grid-block[data-area='income'] {
  grid-area: income;
}
.grid-block[data-area='expense'] {
  grid-area: expense;
}
.grid-block[data-area='expenseOverview'] {
  grid-area: expenseOverview;
}
.grid-block[data-area='transactions'] {
  grid-area: transactions;
  max-height: max-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.grid-block[data-area='wallets'] {
  grid-area: wallets;
  max-height: max-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
