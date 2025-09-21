<script setup lang="ts">
import { ArcElement, Chart, Legend, Tooltip, type ChartData } from 'chart.js';
import { computed, toValue } from 'vue';
import { Doughnut, type ChartProps } from 'vue-chartjs';

import { useCurrentUserId } from '~/entities/user';
import { useUserExpenseByCategories } from '~/entities/wallet';
import { CATEGORY_COLORS } from '~/store';

Chart.register(ArcElement, Tooltip, Legend);

const userId = useCurrentUserId();
const dataRef = useUserExpenseByCategories(userId);

type DatasetDataItem = {
  total: number;
  formattedTotal: string;
  category: string;
  colorId: string;
};

const chartData = computed<ChartData<'doughnut', DatasetDataItem[], unknown>>(
  () => {
    const data = toValue(dataRef);
    return {
      labels: data ? data.map((item) => item.category) : [],
      datasets: [
        {
          label: 'Expenses by Category',
          data: data ?? [],
          parsing: {
            key: 'total',
          },
          backgroundColor: data
            ? data.map(
                (item) =>
                  CATEGORY_COLORS[item.colorId as keyof typeof CATEGORY_COLORS]
              )
            : [],
          borderWidth: 2,
          borderRadius: 10,
          offset: 15,
        },
      ],
    };
  }
);
const chartOptions: ChartProps<'doughnut'>['options'] = {
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
          return `${dataset.label}: ${(raw as DatasetDataItem).formattedTotal}`;
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
      <Doughnut
        :data="chartData as unknown as ChartData<'doughnut', number[], unknown>"
        :options="chartOptions"
      />
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
