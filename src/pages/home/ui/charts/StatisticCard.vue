<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineElement,
  PointElement,
  type ChartData,
} from 'chart.js';
import { ChevronDownIcon } from 'lucide-vue-next';
import { computed, ref, toValue } from 'vue';
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

type DatasetDataItem = { total: number; formattedTotal: string; date: number };

const chartData = computed<ChartData<'line', DatasetDataItem[], unknown>>(
  () => {
    const incomeData = toValue(incomeDataRef);
    const expenseData = toValue(expenseDataRef);
    const labels = [
      ...(incomeData || []).map((d) => d.date),
      ...(expenseData || []).map((d) => d.date),
    ];
    const sortedUniqueLabels = Array.from(new Set(labels)).sort((a, b) =>
      a > b ? 1 : -1
    );
    const style = getComputedStyle(document.documentElement);
    const incomeColor = style.getPropertyValue('--clr-success');
    const expenseColor = style.getPropertyValue('--clr-danger');

    return {
      labels: sortedUniqueLabels,
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
      <h2 class="card__title">Statistics</h2>
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
    <div
      v-if="incomeDataRef || expenseDataRef"
      :style="{ position: 'relative' }"
    >
      <Line
        :data="chartData as unknown as ChartData<'line', (number)[], unknown>"
        :options="chartOptions"
      />
    </div>
    <p v-else class="empty-content">No activity yet</p>
  </section>
</template>

<style lang="scss" scoped>
.stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
