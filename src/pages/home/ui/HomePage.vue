<script setup lang="ts">
import BalanceCard from './BalanceCard.vue';
import ExpenseCard from './ExpenseCard.vue';
import IncomeCard from './IncomeCard.vue';
import RecentTransactions from './RecentTransactions.vue';
</script>

<template>
  <div class="dashboard">
    <h1 class="main-title grid-block" data-area="title">
      Welcome back, buddy!
    </h1>
    <BalanceCard class="grid-block" data-area="balance" />
    <IncomeCard class="grid-block" data-area="income" />
    <ExpenseCard class="grid-block" data-area="expense" />
    <RecentTransactions class="grid-block" data-area="transactions" />
  </div>
</template>

<style scoped lang="scss">
@use '@globals/tools' as t;

.dashboard {
  display: grid;
  grid-template-areas:
    'title title title'
    'balance income expense'
    'transactions transactions transactions';
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
.grid-block[data-area='transactions'] {
  grid-area: transactions;
}
</style>
