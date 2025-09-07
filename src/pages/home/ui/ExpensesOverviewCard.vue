<script setup lang="ts">
import { ArcElement, Chart, Legend, Tooltip, type ChartData } from 'chart.js';
import { computed, toValue } from 'vue';
import { Doughnut } from 'vue-chartjs';

import { useCurrentUserId } from '~/entities/user';
import { useUserExpenseByCategories } from '~/entities/wallet';

Chart.register(ArcElement, Tooltip, Legend);

const userId = useCurrentUserId();
const dataRef = useUserExpenseByCategories(userId);

const chartData = computed<ChartData<'doughnut', number[], unknown>>(() => {
  const data = toValue(dataRef);
  return {
    labels: data ? data.map((item) => item.category) : [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: data as unknown as number[],
        parsing: {
          key: 'total',
        },
        backgroundColor: data ? data.map((item) => item.colorId) : [],
        borderWidth: 2,
        borderRadius: 10,
        offset: 15,
      },
    ],
  };
});
const chartOptions: InstanceType<typeof Doughnut>['$props']['options'] = {
  cutout: '60%',
  radius: '60%',
  aspectRatio: 2,
  maintainAspectRatio: false,
  layout: {
    padding: 0,
  },
  plugins: {
    tooltip: {
      callbacks: {
        label({ raw, dataset }) {
          return `${dataset.label}: ${
            (raw as NonNullable<typeof dataRef.value>[number]).formattedTotal
          }`;
        },
      },
    },
    legend: {
      position: 'bottom',
      align: 'start',
      labels: {
        boxWidth: 50,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
  },
};
</script>

<template>
  <section class="card expense-overview">
    <div class="card__header">
      <h2 class="card__title">Spending Recap</h2>
      <p class="expense-overview__subtitle">Last 3 months</p>
    </div>
    <div
      v-if="dataRef"
      :style="{
        position: 'relative',
        // increase height considering number of legend items
        minHeight: dataRef ? `${300 + dataRef.length * 10}px` : 'auto',
      }"
    >
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="empty-content">No expenses recorded yet</p>
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.expense-overview__subtitle {
  color: var(t.get-color-var('muted-foreground'));
}

.empty-content {
  padding: 20px 0;
  color: var(t.get-color-var('muted-foreground'));
  text-align: center;
}
</style>
