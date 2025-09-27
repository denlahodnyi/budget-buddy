<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineElement,
  PointElement,
  type ChartData,
} from 'chart.js';
import { ChartLineIcon, ChevronDownIcon } from 'lucide-vue-next';
import { computed, ref, toValue, useTemplateRef } from 'vue';
import { Line, type ChartProps } from 'vue-chartjs';

import { useCurrentUserId } from '~/entities/user';
import {
  useUserTotalExpenseByDates,
  useUserTotalIncomeByDates,
} from '~/entities/wallet';
import { getDatesInterval } from '~/shared/lib/dates';
import ChartDatesFilterDropdown, {
  type FilterValue,
} from './ChartDatesFilterDropdown.vue';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

const userId = useCurrentUserId();
const selectedDatesFilter = ref<FilterValue>('30d');
const datesInterval = computed(() => {
  const [start, end] = getDatesInterval(selectedDatesFilter.value);
  return { startDate: start.getTime(), endDate: end.getTime() };
});
const incomeDataRef = useUserTotalIncomeByDates(userId, datesInterval);
const expenseDataRef = useUserTotalExpenseByDates(userId, datesInterval);
const expenseColorKeeper = useTemplateRef('expense-color-holder');
const incomeColorKeeper = useTemplateRef('income-color-holder');

type DatasetDataItem = { total: number; formattedTotal: string; date: number };

const labels = computed(() => {
  const incomeData = toValue(incomeDataRef);
  const expenseData = toValue(expenseDataRef);
  const labels = [
    ...(incomeData || []).map((d) => d.date),
    ...(expenseData || []).map((d) => d.date),
  ];
  const sortedUniqueLabels = Array.from(new Set(labels)).sort((a, b) =>
    a > b ? 1 : -1
  );
  return sortedUniqueLabels;
});

const chartData = computed<ChartData<'line', DatasetDataItem[], unknown>>(
  () => {
    const incomeData = toValue(incomeDataRef);
    const expenseData = toValue(expenseDataRef);
    const expenseColor = expenseColorKeeper.value
      ? getComputedStyle(expenseColorKeeper.value).color
      : 'red';
    const incomeColor = incomeColorKeeper.value
      ? getComputedStyle(incomeColorKeeper.value).color
      : 'green';

    return {
      labels: labels.value,
      datasets: [
        {
          label: 'Income',
          data: incomeData ?? [],
          parsing: {
            xAxisKey: 'date',
            yAxisKey: 'total',
          },
          borderColor: incomeColor,
          pointBackgroundColor: incomeColor,
        },
        {
          label: 'Expenses',
          data: expenseData ?? [],
          parsing: {
            xAxisKey: 'date',
            yAxisKey: 'total',
          },
          borderColor: expenseColor,
          pointBackgroundColor: expenseColor,
        },
      ],
    };
  }
);
const chartOptions: ChartProps<'line'>['options'] = {
  datasets: {
    line: {
      tension: 0.25,
      borderJoinStyle: 'round',
      borderCapStyle: 'round',
      borderWidth: 1,
      pointRadius: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        callback(tickValue, index, ticks) {
          if (index !== 0 && index !== ticks.length - 1) return;
          return formatTimestamp(
            this.getLabelForValue(tickValue as number) as unknown as number
          );
        },
      },
    },
    y: {
      grid: {
        drawTicks: false,
        color(ctx) {
          if (ctx.tick.value === 0) return 'transparent';
          return Chart.defaults.scale.grid.color?.toString();
        },
      },
      border: {
        dash: [10],
        dashOffset: 10,
      },
    },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label({ raw, dataset }) {
          return `${dataset.label}: ${(raw as DatasetDataItem).formattedTotal}`;
        },
        title(tooltipItems) {
          return formatTimestamp((tooltipItems[0].raw as DatasetDataItem).date);
        },
      },
    },
    legend: {
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 50,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
  },
};

function formatTimestamp(date: number) {
  return new Date(date).toLocaleDateString();
}
</script>

<template>
  <section class="card stats">
    <div class="card__header stats__header">
      <h2 class="card__title card__title--with-icon">
        <ChartLineIcon :size="30" aria-hidden />
        <span>Statistics</span>
      </h2>
      <ChartDatesFilterDropdown
        v-slot="{ selectedValue }"
        v-model="selectedDatesFilter"
      >
        <button class="btn" data-variant="outline">
          <ChevronDownIcon :size="18" />
          {{ selectedValue.label }}
        </button>
      </ChartDatesFilterDropdown>
    </div>
    <div v-if="incomeDataRef || expenseDataRef" class="chart">
      <Line
        :data="chartData as unknown as ChartData<'line', (number)[], unknown>"
        :options="chartOptions"
      />
    </div>
    <p v-else class="empty-content">No activity yet</p>
    <span
      ref="expense-color-holder"
      hidden
      :style="{ color: 'var(--clr-danger)' }"
    />
    <span
      ref="income-color-holder"
      hidden
      :style="{ color: 'var(--clr-success)' }"
    />
  </section>
</template>

<style lang="scss" scoped>
@use '@globals/tools' as t;

.stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.empty-content {
  padding: 20px 0;
  color: var(t.get-color-var('muted-foreground'));
  text-align: center;
}
.chart {
  position: relative;
  aspect-ratio: 3 / 2;
  @include t.screen(md) {
    aspect-ratio: unset;
  }
}
</style>
